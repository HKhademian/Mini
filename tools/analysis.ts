import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compiler, root } from './project.ts';

export type Token = {
  kind: string; text: string; source: string; start: number; end: number;
  line: number; column: number; context: string;
};
export type Diagnostic = { message: string; source: string; start: number; end: number };
export type Analysis = { tokens: Token[]; diagnostics: Diagnostic[] };

function parseDiagnostic(stderr: string, source: string, name: string, tokens: Token[]): Diagnostic {
  const first = stderr.split('\n')[0] ?? '';
  const match = /^(.*):(\d+):(\d+): (.*)$/.exec(first);
  if (match === null) return { message: first || 'compiler failed', source: name, start: 0, end: 0 };
  const line = Number(match[2]);
  const column = Number(match[3]);
  const message = match[4]!;
  let start = 0;
  let currentLine = 1;
  for (let index = 0; index < source.length && currentLine < line; index++) {
    if (source[index] === '\n') {
      currentLine++;
      start = index + 1;
    }
  }
  start += column - 1;
  let end = Math.min(start + 1, source.length);
  const token = tokens.find(item => item.start === start);
  if (token !== undefined) end = token.end;
  if (message === 'unterminated text') end = source.length;
  if (message === 'unknown text escape') end = Math.min(start + 2, source.length);
  return { message, source: name, start, end };
}

/** Analyze in-memory text through the active compiler's tokens and compile commands. */
export function analyze(source: string, name: string): Analysis {
  const work = mkdtempSync(join(tmpdir(), 'mini-analysis-'));
  const input = join(work, 'source.mini');
  const output = join(work, 'program.ts');
  writeFileSync(input, source);
  const entry = join(root, compiler().entry);
  const options = { cwd: root, encoding: 'utf8' as const, timeout: 120_000, maxBuffer: 32 * 1024 * 1024 };
  try {
    const tokenized = spawnSync(process.execPath, [entry, 'tokens', '--comments', input], options);
    if (tokenized.error) throw tokenized.error;
    if (tokenized.status !== 0) {
      return { tokens: [], diagnostics: [parseDiagnostic(tokenized.stderr, source, name, [])] };
    }
    const tokens = JSON.parse(tokenized.stdout) as Token[];
    for (const token of tokens) token.source = name;
    const compiled = spawnSync(process.execPath, [entry, 'compile', input, output], options);
    if (compiled.error) throw compiled.error;
    if (compiled.status !== 0) {
      return { tokens, diagnostics: [parseDiagnostic(compiled.stderr, source, name, tokens)] };
    }
    assert(Array.isArray(tokens), 'invalid compiler token result');
    return { tokens, diagnostics: [] };
  } finally {
    rmSync(work, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  }
}
