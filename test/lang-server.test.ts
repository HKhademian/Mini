import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { test } from 'node:test';
import { join } from 'node:path';
import { root } from './support.ts';

type Message = { jsonrpc?: string; id?: number | string; method?: string; result?: any; error?: { code: number; message: string }; params?: any };

class Client {
  readonly child: ChildProcessWithoutNullStreams;
  private buffer = Buffer.alloc(0);
  private queue: Message[] = [];
  private waiters: (() => void)[] = [];
  stderr = '';

  constructor() {
    this.child = spawn(process.execPath, [join(root, 'bin/mini-lang-server')], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
    this.child.stdout.on('data', (chunk: Buffer) => this.receive(chunk));
    this.child.stderr.on('data', (chunk: Buffer) => { this.stderr += chunk.toString(); });
  }

  private receive(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      const header = this.buffer.subarray(0, headerEnd).toString('ascii');
      const match = /Content-Length: *(\d+)/i.exec(header);
      assert.ok(match, 'server frame needs Content-Length');
      const length = Number(match[1]);
      const start = headerEnd + 4;
      if (this.buffer.length < start + length) return;
      const body = this.buffer.subarray(start, start + length).toString('utf8');
      this.buffer = this.buffer.subarray(start + length);
      this.queue.push(JSON.parse(body) as Message);
      this.waiters.shift()?.();
    }
  }

  frame(message: Message): Buffer {
    const body = Buffer.from(JSON.stringify(message));
    return Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`), body]);
  }

  send(message: Message): void {
    this.child.stdin.write(this.frame(message));
  }

  write(bytes: Buffer): void {
    this.child.stdin.write(bytes);
  }

  async next(timeout = 10_000): Promise<Message> {
    if (this.queue.length > 0) return this.queue.shift()!;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timed out waiting for a server message; stderr: ' + this.stderr)), timeout);
      this.waiters.push(() => { clearTimeout(timer); resolve(); });
    });
    return this.queue.shift()!;
  }

  async close(): Promise<number> {
    this.child.stdin.end();
    return new Promise(resolve => this.child.on('exit', code => resolve(code ?? -1)));
  }

  kill(): void {
    this.child.kill();
  }
}

async function session(run: (client: Client) => Promise<void>): Promise<void> {
  const client = new Client();
  try {
    await run(client);
  } finally {
    if (client.child.exitCode === null) client.kill();
  }
}

const open = (uri: string, text: string, version = 1) => ({ method: 'textDocument/didOpen', params: { textDocument: { uri, languageId: 'mini', text, version } } });
const change = (uri: string, text: string, version: number) => ({ method: 'textDocument/didChange', params: { textDocument: { uri, version }, contentChanges: [{ text }] } });

test('initializes, shuts down, and exits cleanly', async () => {
  await session(async client => {
    client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { processId: null, rootUri: null, capabilities: {} } });
    const initialized = await client.next();
    assert.equal(initialized.id, 1);
    assert.equal(initialized.result.capabilities.textDocumentSync, 1);
    assert.equal(initialized.result.capabilities.documentFormattingProvider, true);
    assert.equal(initialized.result.capabilities.hoverProvider, true);
    assert.equal(initialized.result.capabilities.completionProvider.resolveProvider, false);
    assert.equal(initialized.result.capabilities.definitionProvider, true);
    assert.equal(initialized.result.serverInfo.name, 'mini-lang-server');
    const versions = JSON.parse(readFileSync(join(root, 'config/versions.json'), 'utf8'));
    assert.equal(initialized.result.serverInfo.version, `lsp-v${versions.group}-v${versions.lsp}`);
    client.send({ jsonrpc: '2.0', method: 'initialized', params: {} });
    client.send({ jsonrpc: '2.0', id: 2, method: 'shutdown' });
    assert.deepEqual((await client.next()).result, null);
    client.send({ jsonrpc: '2.0', method: 'exit' });
    assert.equal(await client.close(), 0);
  });
});

test('publishes diagnostics for unsaved text and clears them after a fix', async () => {
  await session(async client => {
    client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    await client.next();
    client.send(open('file:///workspace/a.mini', 'value := ;\n', 1));
    const first = await client.next();
    assert.equal(first.method, 'textDocument/publishDiagnostics');
    assert.equal(first.params.uri, 'file:///workspace/a.mini');
    assert.equal(first.params.version, 1);
    assert.deepEqual(first.params.diagnostics[0].range, { start: { line: 0, character: 9 }, end: { line: 0, character: 10 } });
    assert.equal(first.params.diagnostics[0].severity, 1);
    assert.equal(first.params.diagnostics[0].source, 'mini');
    assert.equal(first.params.diagnostics[0].message, 'expected expression');

    client.send(change('file:///workspace/a.mini', 'value := 1;\n', 2));
    const second = await client.next();
    assert.equal(second.params.version, 2);
    assert.deepEqual(second.params.diagnostics, []);
  });
});

test('formats only valid documents and returns one whole-document edit', async () => {
  await session(async client => {
    client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    await client.next();
    const uri = 'file:///workspace/format.mini';
    client.send(open(uri, 'value:=1;// keep\n', 1));
    await client.next();
    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/formatting', params: { textDocument: { uri }, options: { tabSize: 2, insertSpaces: true } } });
    const formatted = await client.next();
    assert.deepEqual(formatted.result, [{ range: { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } }, newText: 'value := 1; // keep\n' }]);

    client.send(change(uri, 'value := 1; // keep\n', 2));
    await client.next();
    client.send({ jsonrpc: '2.0', id: 3, method: 'textDocument/formatting', params: { textDocument: { uri } } });
    assert.deepEqual((await client.next()).result, null);

    client.send(change(uri, 'value := ;\n', 3));
    await client.next();
    client.send({ jsonrpc: '2.0', id: 4, method: 'textDocument/formatting', params: { textDocument: { uri } } });
    assert.deepEqual((await client.next()).result, null);
  });
});

test('keeps documents isolated and clears diagnostics on close', async () => {
  await session(async client => {
    client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    await client.next();
    client.send(open('file:///a.mini', 'a := ;\n', 1));
    assert.equal((await client.next()).params.diagnostics.length, 1);
    client.send(open('file:///b.mini', 'b := 1;\n', 1));
    assert.deepEqual((await client.next()).params.diagnostics, []);
    client.send({ jsonrpc: '2.0', method: 'textDocument/didClose', params: { textDocument: { uri: 'file:///a.mini' } } });
    const closed = await client.next();
    assert.equal(closed.params.uri, 'file:///a.mini');
    assert.deepEqual(closed.params.diagnostics, []);
  });
});

test('handles split and coalesced frames', async () => {
  await session(async client => {
    const init = client.frame({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    client.write(init.subarray(0, 12));
    client.write(init.subarray(12));
    assert.equal((await client.next()).id, 1);

    const a = client.frame(open('file:///a.mini', 'a := 1;\n', 1));
    const b = client.frame({ jsonrpc: '2.0', id: 2, method: 'shutdown' });
    client.write(Buffer.concat([a, b]));
    assert.deepEqual((await client.next()).params.diagnostics, []);
    assert.deepEqual((await client.next()).result, null);
  });
});

test('uses UTF-16 offsets for CRLF and astral text', async () => {
  await session(async client => {
    client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    await client.next();
    const text = 'text := "😀";\r\nvalue := ;\r\n';
    client.send(open('file:///emoji.mini', text, 1));
    const published = await client.next();
    assert.deepEqual(published.params.diagnostics[0].range, { start: { line: 1, character: 9 }, end: { line: 1, character: 10 } });
  });
});

test('reports unknown requests and ignores unknown notifications', async () => {
  await session(async client => {
    client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    await client.next();
    client.send({ jsonrpc: '2.0', method: 'textDocument/didSave', params: {} });
    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/references', params: {} });
    const error = await client.next();
    assert.equal(error.id, 2);
    assert.equal(error.error?.code, -32601);
    client.send({ jsonrpc: '2.0', id: 3, method: 'shutdown' });
    assert.deepEqual((await client.next()).result, null);
  });
});

test('exiting without shutdown is an error', async () => {
  await session(async client => {
    client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    await client.next();
    client.send({ jsonrpc: '2.0', method: 'exit' });
    assert.equal(await client.close(), 1);
  });
});

const documented = [
  '/// Adds two numbers.',
  'fn add(a, b) {',
  '    return a + b;',
  '}',
  '',
  '/// The answer.',
  'answer := 1;',
  'value := add(answer, 2);',
  '',
].join('\n');

function positionOf(text: string, needle: string, occurrence = 0): { line: number; character: number } {
  let index = -1;
  for (let count = 0; count <= occurrence; count++) index = text.indexOf(needle, index + 1);
  assert.notEqual(index, -1, 'missing needle: ' + needle);
  const before = text.slice(0, index);
  return { line: (before.match(/\n/g) ?? []).length, character: index - before.lastIndexOf('\n') - 1 };
}

async function openDocument(client: Client, uri: string, text: string): Promise<void> {
  client.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  await client.next();
  client.send(open(uri, text, 1));
  await client.next();
}

test('hovers functions and variables with their documentation', async () => {
  await session(async client => {
    const uri = 'file:///hover.mini';
    await openDocument(client, uri, documented);

    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/hover', params: { textDocument: { uri }, position: positionOf(documented, 'add', 1) } });
    const fn = await client.next();
    assert.match(fn.result.contents.value, /```mini\nfn add\(a, b\)\n```/);
    assert.match(fn.result.contents.value, /Adds two numbers\./);
    assert.deepEqual(fn.result.range, { start: { line: 7, character: 9 }, end: { line: 7, character: 12 } });

    client.send({ jsonrpc: '2.0', id: 3, method: 'textDocument/hover', params: { textDocument: { uri }, position: positionOf(documented, 'answer', 1) } });
    const variable = await client.next();
    assert.match(variable.result.contents.value, /```mini\nanswer :=\n```/);
    assert.match(variable.result.contents.value, /The answer\./);
  });
});

test('blank lines do not split declaration docs and header docs stay file scoped', async () => {
  await session(async client => {
    const uri = 'file:///doc-boundaries.mini';
    const text = [
      '/// File purpose.',
      'include "common/io.mini";',
      '',
      '/// Declaration detail.',
      '',
      'fn documented() { return 1; }',
    ].join('\n');
    await openDocument(client, uri, text);

    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/hover', params: { textDocument: { uri }, position: positionOf(text, 'documented') } });
    const hover = await client.next();
    assert.match(hover.result.contents.value, /Declaration detail\./);
    assert.doesNotMatch(hover.result.contents.value, /File purpose\./);
  });
});

test('hovers builtins and returns null for unknown identifiers', async () => {
  await session(async client => {
    const uri = 'file:///builtin.mini';
    const text = 'io_write("ok");\nvalue := missing;\n';
    await openDocument(client, uri, text);

    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/hover', params: { textDocument: { uri }, position: positionOf(text, 'io_write') } });
    const builtin = await client.next();
    assert.match(builtin.result.contents.value, /io_write\(text\) -> number/);

    client.send({ jsonrpc: '2.0', id: 3, method: 'textDocument/hover', params: { textDocument: { uri }, position: positionOf(text, 'missing') } });
    assert.equal((await client.next()).result, null);
  });
});

test('completes declarations, builtins, and keywords by prefix', async () => {
  await session(async client => {
    const uri = 'file:///complete.mini';
    const text = documented + 'io\n';
    await openDocument(client, uri, text);

    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/completion', params: { textDocument: { uri }, position: { line: 8, character: 2 } } });
    const prefixed = await client.next();
    const prefixedLabels = prefixed.result.items.map((item: { label: string }) => item.label);
    assert.ok(prefixedLabels.includes('io_write'));
    assert.ok(prefixedLabels.includes('io_write_error'));
    assert.ok(!prefixedLabels.includes('add'));
    assert.ok(prefixedLabels.every((label: string) => label.startsWith('io')));

    client.send({ jsonrpc: '2.0', id: 3, method: 'textDocument/completion', params: { textDocument: { uri }, position: { line: 9, character: 0 } } });
    const all = await client.next();
    const labels = all.result.items.map((item: { label: string }) => item.label);
    for (const label of ['add', 'answer', 'io_write', 'include', 'fn', 'while']) assert.ok(labels.includes(label), label);
    assert.ok(!labels.includes('var'));
    const add = all.result.items.find((item: { label: string }) => item.label === 'add');
    assert.equal(add.detail, 'fn add(a, b)');
    assert.match(add.documentation.value, /Adds two numbers\./);
  });
});

test('does not complete inside comments or text', async () => {
  await session(async client => {
    const uri = 'file:///quiet.mini';
    const text = '// wr\nwrite("wr");\n';
    await openDocument(client, uri, text);

    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/completion', params: { textDocument: { uri }, position: positionOf(text, 'wr') } });
    assert.deepEqual((await client.next()).result.items, []);

    client.send({ jsonrpc: '2.0', id: 3, method: 'textDocument/completion', params: { textDocument: { uri }, position: positionOf(text, 'wr', 2) } });
    assert.deepEqual((await client.next()).result.items, []);
  });
});

test('jumps to function and variable declarations', async () => {
  await session(async client => {
    const uri = 'file:///definition.mini';
    await openDocument(client, uri, documented);

    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/definition', params: { textDocument: { uri }, position: positionOf(documented, 'add', 1) } });
    assert.deepEqual((await client.next()).result, {
      uri, range: { start: { line: 1, character: 3 }, end: { line: 1, character: 6 } },
    });

    client.send({ jsonrpc: '2.0', id: 3, method: 'textDocument/definition', params: { textDocument: { uri }, position: positionOf(documented, 'answer', 2) } });
    assert.deepEqual((await client.next()).result, {
      uri, range: { start: { line: 6, character: 0 }, end: { line: 6, character: 6 } },
    });
  });
});

test('returns no definition for builtins or unknown identifiers', async () => {
  await session(async client => {
    const uri = 'file:///no-definition.mini';
    const text = 'io_write("ok");\nvalue := missing;\n';
    await openDocument(client, uri, text);

    client.send({ jsonrpc: '2.0', id: 2, method: 'textDocument/definition', params: { textDocument: { uri }, position: positionOf(text, 'io_write') } });
    assert.equal((await client.next()).result, null);

    client.send({ jsonrpc: '2.0', id: 3, method: 'textDocument/definition', params: { textDocument: { uri }, position: positionOf(text, 'missing') } });
    assert.equal((await client.next()).result, null);
  });
});
