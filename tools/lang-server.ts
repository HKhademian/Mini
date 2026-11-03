import { formatTokens } from './format.ts';
import { analyze } from './analysis.ts';
import { completionsAt, definitionAt, hoverAt, offsetAt, rangeOf } from './language-features.ts';
import { releaseTag, versions, root } from './project.ts';
import type { Diagnostic } from '../compiler/types.ts';

type Message = { jsonrpc: '2.0'; id?: number | string; method?: string; params?: unknown; result?: unknown; error?: unknown };
type Document = { text: string; version: number };

/** Convert a UTF-16 offset to an LSP zero-based line/character position. */
export function positionAt(text: string, offset: number): { line: number; character: number } {
  const before = text.slice(0, offset);
  const line = (before.match(/\n/g) ?? []).length;
  const start = before.lastIndexOf('\n') + 1;
  return { line, character: offset - start };
}

export function diagnosticRange(source: string, diagnostic: Diagnostic) {
  const start = positionAt(source, diagnostic.start);
  const end = diagnostic.end === diagnostic.start
    ? { line: start.line, character: start.character + 1 }
    : positionAt(source, diagnostic.end);
  return { start, end };
}

function documentEnd(source: string) {
  return positionAt(source, source.length);
}

function log(message: string): void {
  process.stderr.write(`mini-lang-server: ${message}\n`);
}

/** LSP 3.17 server with full synchronization, diagnostics, and whole-document formatting. */
export class LanguageServer {
  readonly documents = new Map<string, Document>();
  private output: (message: Message) => void;
  private buffer = Buffer.alloc(0);
  private shuttingDown = false;
  private exited = false;

  constructor(output: (message: Message) => void) {
    this.output = output;
  }

  /** Accept a raw protocol chunk; frames may be split or coalesced. */
  receive(chunk: Buffer | string): void {
    const incoming = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    this.buffer = Buffer.concat([this.buffer, incoming]);
    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      const header = this.buffer.subarray(0, headerEnd).toString('ascii');
      const match = /(?:^|\r\n)Content-Length: *(\d+)/i.exec(header);
      if (!match) {
        log('missing Content-Length');
        this.buffer = Buffer.alloc(0);
        return;
      }
      const length = Number(match[1]);
      const start = headerEnd + 4;
      if (this.buffer.length < start + length) return;
      const body = this.buffer.subarray(start, start + length).toString('utf8');
      this.buffer = this.buffer.subarray(start + length);
      let message: Message;
      try {
        message = JSON.parse(body) as Message;
      } catch {
        log('invalid JSON message');
        continue;
      }
      this.handle(message);
    }
  }

  handle(message: Message): void {
    if (message.method === undefined || message.id === undefined) {
      this.notification(message.method ?? '', message.params);
      return;
    }
    this.request(message.id, message.method, message.params);
  }

  private request(id: number | string, method: string, params: unknown): void {
    if (this.shuttingDown) {
      this.replyError(id, -32600, 'server is shutting down');
      return;
    }
    switch (method) {
      case 'initialize':
        this.reply(id, { capabilities: {
          textDocumentSync: 1,
          documentFormattingProvider: true,
          hoverProvider: true,
          completionProvider: { resolveProvider: false },
          definitionProvider: true,
        }, serverInfo: { name: 'mini-lang-server', version: releaseTag('lsp', versions(root)) } });
        return;
      case 'shutdown':
        this.shuttingDown = true;
        this.reply(id, null);
        return;
      case 'textDocument/formatting':
        this.reply(id, this.formatting(params));
        return;
      case 'textDocument/hover':
        this.reply(id, this.hover(params));
        return;
      case 'textDocument/completion':
        this.reply(id, this.completion(params));
        return;
      case 'textDocument/definition':
        this.reply(id, this.definition(params));
        return;
      default:
        this.replyError(id, -32601, `method not found: ${method}`);
    }
  }

  private notification(method: string, params: unknown): void {
    if (this.shuttingDown) {
      if (method === 'exit') this.exit(0);
      return;
    }
    switch (method) {
      case 'initialized':
        return;
      case 'exit':
        this.exit(this.shuttingDown ? 0 : 1);
        return;
      case 'textDocument/didOpen': {
        const { textDocument } = params as { textDocument: { uri: string; text: string; version: number } };
        this.documents.set(textDocument.uri, { text: textDocument.text, version: textDocument.version });
        this.diagnose(textDocument.uri, textDocument.text, textDocument.version);
        return;
      }
      case 'textDocument/didChange': {
        const { textDocument, contentChanges } = params as {
          textDocument: { uri: string; version: number };
          contentChanges: { text: string }[];
        };
        const document = this.documents.get(textDocument.uri);
        if (document === undefined) return;
        const change = contentChanges.at(-1);
        if (change === undefined) return;
        document.text = change.text;
        document.version = textDocument.version;
        this.diagnose(textDocument.uri, change.text, textDocument.version);
        return;
      }
      case 'textDocument/didClose': {
        const { textDocument } = params as { textDocument: { uri: string } };
        this.documents.delete(textDocument.uri);
        this.publish(textDocument.uri, undefined, []);
        return;
      }
      default:
        return;
    }
  }

  private diagnose(uri: string, text: string, version: number): void {
    const document = this.documents.get(uri);
    if (document === undefined || document.version !== version) return;
    const outcome = analyze(text, uri);
    if (document.version !== version) return;
    this.publish(uri, version, outcome.diagnostics.map(diagnostic => ({
      range: diagnosticRange(text, diagnostic), severity: 1, source: 'mini', message: diagnostic.message,
    })));
  }

  private formatting(params: unknown): { range: unknown; newText: string }[] | null {
    const { textDocument } = params as { textDocument: { uri: string } };
    const document = this.documents.get(textDocument.uri);
    if (document === undefined) return null;
    const outcome = analyze(document.text, textDocument.uri);
    if (outcome.diagnostics.length > 0) return null;
    const text = formatTokens(outcome.tokens);
    if (text === document.text) return null;
    return [{ range: { start: { line: 0, character: 0 }, end: documentEnd(document.text) }, newText: text }];
  }

  private hover(params: unknown): unknown {
    const { textDocument, position } = (params ?? {}) as { textDocument?: { uri: string }; position?: { line: number; character: number } };
    if (textDocument === undefined || position === undefined) return null;
    const document = this.documents.get(textDocument.uri);
    if (document === undefined) return null;
    const outcome = analyze(document.text, textDocument.uri);
    return hoverAt(outcome.tokens, offsetAt(document.text, position));
  }

  private completion(params: unknown): unknown {
    const { textDocument, position } = (params ?? {}) as { textDocument?: { uri: string }; position?: { line: number; character: number } };
    if (textDocument === undefined || position === undefined) return { isIncomplete: false, items: [] };
    const document = this.documents.get(textDocument.uri);
    if (document === undefined) return { isIncomplete: false, items: [] };
    const outcome = analyze(document.text, textDocument.uri);
    return { isIncomplete: false, items: completionsAt(outcome.tokens, document.text, offsetAt(document.text, position)) };
  }

  private definition(params: unknown): unknown {
    const { textDocument, position } = (params ?? {}) as { textDocument?: { uri: string }; position?: { line: number; character: number } };
    if (textDocument === undefined || position === undefined) return null;
    const document = this.documents.get(textDocument.uri);
    if (document === undefined) return null;
    const outcome = analyze(document.text, textDocument.uri);
    const declaration = definitionAt(outcome.tokens, offsetAt(document.text, position));
    if (declaration === null) return null;
    return { uri: textDocument.uri, range: rangeOf(declaration.token) };
  }

  private publish(uri: string, version: number | undefined, diagnostics: unknown[]): void {
    this.send({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics',
      params: { uri, ...(version === undefined ? {} : { version }), diagnostics } });
  }

  private exit(code: number): void {
    if (this.exited) return;
    this.exited = true;
    process.exitCode = code;
    const finish = () => process.exit(code);
    if (process.stdout.writableLength === 0) setImmediate(finish);
    else process.stdout.write('', finish);
  }

  private reply(id: number | string, result: unknown): void {
    this.send({ jsonrpc: '2.0', id, result });
  }

  private replyError(id: number | string, code: number, message: string): void {
    this.send({ jsonrpc: '2.0', id, error: { code, message } });
  }

  private send(message: Message): void {
    this.output(message);
  }

  get done(): boolean {
    return this.exited;
  }

  get shutdown(): boolean {
    return this.shuttingDown;
  }
}

export async function main(): Promise<void> {
  if (process.argv[2] === '--version') {
    process.stdout.write(releaseTag('lsp', versions(root)) + '\n');
    return;
  }
  if (process.argv.length > 2) {
    log('usage: mini-lang-server [--version]');
    process.exitCode = 1;
    return;
  }
  const write = (message: Message) => {
    const body = Buffer.from(JSON.stringify(message));
    process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
    process.stdout.write(body);
  };
  const server = new LanguageServer(write);
  process.stdin.on('data', chunk => server.receive(chunk));
  process.stdin.on('end', () => {
    if (!server.done) process.exitCode = 1;
  });
}
