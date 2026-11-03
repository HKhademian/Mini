import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import type { Diagnostic, Token } from '../compiler/types.ts';
import { root } from './project.ts';

export type Analysis = { tokens: Token[]; diagnostics: Diagnostic[] };

/** Analyze in-memory text through the dedicated analyzer, independent of the active compiler. */
export function analyze(source: string, name: string): Analysis {
  const result = spawnSync(process.execPath, [join(root, 'compiler/analyze.ts')], {
    cwd: root, input: JSON.stringify({ source, name }), encoding: 'utf8',
    timeout: 120_000, maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr || 'compiler analysis failed');
  const value = JSON.parse(result.stdout) as Analysis;
  assert(Array.isArray(value.tokens) && Array.isArray(value.diagnostics), 'invalid compiler analysis result');
  return value;
}
