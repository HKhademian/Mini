import * as path from 'node:path';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import * as vscode from 'vscode';

type Position = { line: number; character: number };
type Range = { start: Position; end: Position };
type TextEdit = { range: Range; newText: string };
type LspDiagnostic = { range: Range; severity?: number; source?: string; message: string };
type Message = { jsonrpc: '2.0'; id?: number; method?: string; params?: unknown; result?: unknown; error?: { code: number; message: string } };

/** Minimal LSP client for the standalone Mini language server. */
class MiniClient implements vscode.Disposable {
  private child: ChildProcessWithoutNullStreams | undefined;
  private buffer = Buffer.alloc(0);
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  private versions = new Map<string, number>();
  private diagnostics = vscode.languages.createDiagnosticCollection('mini');
  private output = vscode.window.createOutputChannel('Mini Language Server');

  async start(): Promise<void> {
    const config = vscode.workspace.getConfiguration('mini');
    const serverPath = config.get<string>('serverPath', '').trim();
    const nodePath = config.get<string>('nodePath', 'node').trim() || 'node';
    const command = serverPath === '' ? 'mini-lang-server' : nodePath;
    const args = serverPath === '' ? [] : [path.resolve(serverPath)];
    this.child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    this.child.stdout.on('data', (chunk: Buffer) => this.receive(chunk));
    this.child.stderr.on('data', (chunk: Buffer) => this.output.append(chunk.toString()));
    this.child.on('error', error => {
      for (const { reject } of this.pending.values()) reject(error);
      this.pending.clear();
    });
    this.child.on('exit', code => {
      this.output.appendLine(`Server exited with code ${code ?? 'null'}.`);
      for (const { reject } of this.pending.values()) reject(new Error('Mini language server exited.'));
      this.pending.clear();
    });
    await this.request('initialize', {
      processId: process.pid,
      rootUri: vscode.workspace.workspaceFolders?.[0]?.uri.toString() ?? null,
      capabilities: { textDocument: { synchronization: {}, formatting: {} } },
    });
    this.notify('initialized', {});
  }

  private receive(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      const header = this.buffer.subarray(0, headerEnd).toString('ascii');
      const match = /Content-Length: *(\d+)/i.exec(header);
      if (!match) {
        this.buffer = Buffer.alloc(0);
        return;
      }
      const length = Number(match[1]);
      const start = headerEnd + 4;
      if (this.buffer.length < start + length) return;
      const body = this.buffer.subarray(start, start + length).toString('utf8');
      this.buffer = this.buffer.subarray(start + length);
      this.handle(JSON.parse(body) as Message);
    }
  }

  private handle(message: Message): void {
    if (message.id !== undefined && message.method === undefined) {
      const pending = this.pending.get(message.id);
      if (pending === undefined) return;
      this.pending.delete(message.id);
      if (message.error !== undefined) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }
    if (message.method === 'textDocument/publishDiagnostics') {
      const { uri, diagnostics } = message.params as { uri: string; diagnostics: LspDiagnostic[] };
      this.diagnostics.set(vscode.Uri.parse(uri), diagnostics.map(item => {
        const range = new vscode.Range(item.range.start.line, item.range.start.character,
          item.range.end.line, item.range.end.character);
        const severity = item.severity === 1 ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;
        const diagnostic = new vscode.Diagnostic(range, item.message, severity);
        diagnostic.source = item.source ?? 'mini';
        return diagnostic;
      }));
    }
  }

  private send(message: Message): void {
    if (this.child === undefined) return;
    const body = Buffer.from(JSON.stringify(message));
    try {
      this.child.stdin.write(`Content-Length: ${body.length}\r\n\r\n`);
      this.child.stdin.write(body);
    } catch {
      // The server exited; pending requests are rejected by the exit handler.
    }
  }

  private notify(method: string, params: unknown): void {
    this.send({ jsonrpc: '2.0', method, params });
  }

  private request(method: string, params: unknown): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.send({ jsonrpc: '2.0', id, method, params });
    });
  }

  didOpen(document: vscode.TextDocument): void {
    const version = 1;
    this.versions.set(document.uri.toString(), version);
    this.notify('textDocument/didOpen', {
      textDocument: { uri: document.uri.toString(), languageId: document.languageId, version, text: document.getText() },
    });
  }

  didChange(document: vscode.TextDocument): void {
    const uri = document.uri.toString();
    const version = (this.versions.get(uri) ?? 0) + 1;
    this.versions.set(uri, version);
    this.notify('textDocument/didChange', {
      textDocument: { uri, version },
      contentChanges: [{ text: document.getText() }],
    });
  }

  didClose(document: vscode.TextDocument): void {
    this.versions.delete(document.uri.toString());
    this.diagnostics.delete(document.uri);
    this.notify('textDocument/didClose', { textDocument: { uri: document.uri.toString() } });
  }

  async format(document: vscode.TextDocument): Promise<vscode.TextEdit[] | null> {
    const edits = await this.request('textDocument/formatting', {
      textDocument: { uri: document.uri.toString() },
      options: { tabSize: 4, insertSpaces: true },
    }) as TextEdit[] | null;
    if (edits === null) return null;
    return edits.map(edit => new vscode.TextEdit(
      new vscode.Range(edit.range.start.line, edit.range.start.character, edit.range.end.line, edit.range.end.character),
      edit.newText,
    ));
  }

  async stop(): Promise<void> {
    if (this.child === undefined) return;
    const child = this.child;
    try {
      await this.request('shutdown', null);
      this.notify('exit', null);
    } catch {
      child.kill();
    }
    this.child = undefined;
    child.stdin.end();
    this.diagnostics.dispose();
    this.output.dispose();
  }

  dispose(): void {
    void this.stop();
  }
}

let client: MiniClient | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const instance = new MiniClient();
  try {
    await instance.start();
  } catch (error) {
    const config = vscode.workspace.getConfiguration('mini');
    const serverPath = config.get<string>('serverPath', '').trim();
    const hint = serverPath === ''
      ? 'Install mini-lang-server on PATH or set mini.serverPath to its script.'
      : `Check mini.serverPath (${serverPath}) and mini.nodePath.`;
    const message = `Mini language server failed to start: ${error instanceof Error ? error.message : error}. ${hint}`;
    void vscode.window.showErrorMessage(message, 'Open Settings').then(choice => {
      if (choice === 'Open Settings') void vscode.commands.executeCommand('workbench.action.openSettings', 'mini.serverPath');
    });
    instance.dispose();
    return;
  }
  client = instance;
  context.subscriptions.push(instance);

  for (const document of vscode.workspace.textDocuments) {
    if (document.languageId === 'mini') instance.didOpen(document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      if (document.languageId === 'mini') instance.didOpen(document);
    }),
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document.languageId === 'mini') instance.didChange(event.document);
    }),
    vscode.workspace.onDidCloseTextDocument(document => {
      if (document.languageId === 'mini') instance.didClose(document);
    }),
    vscode.languages.registerDocumentFormattingEditProvider('mini', {
      provideDocumentFormattingEdits: document => instance.format(document),
    }),
  );
}

export async function deactivate(): Promise<void> {
  if (client !== undefined) {
    await client.stop();
    client = undefined;
  }
}
