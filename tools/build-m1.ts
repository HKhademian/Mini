import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { root } from './project.ts';

export const m1Manifest = 'compiler/m1.json';
export const m1Source = 'compiler/compiler.mini';

/** Concatenate the ordered M1 source parts into the canonical Mini file. */
export function composeM1(directory = root): string {
  const manifestPath = join(directory, m1Manifest);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { parts?: unknown };
  assert(Array.isArray(manifest.parts) && manifest.parts.length > 0 && manifest.parts.every(part => typeof part === 'string'),
    'M1 manifest needs a nonempty parts array');
  const base = dirname(manifestPath);
  return manifest.parts.map(part => readFileSync(resolve(base, part), 'utf8')).join('');
}

if (import.meta.main) {
  const check = process.argv[2] === '--check';
  assert(process.argv.length === (check ? 3 : 2), 'usage: node tools/build-m1.ts [--check]');
  const composed = composeM1(root);
  const target = join(root, m1Source);
  if (check) {
    assert.equal(readFileSync(target, 'utf8'), composed, 'compiler/compiler.mini is stale; run node tools/build-m1.ts');
  } else {
    writeFileSync(target, composed);
  }
}
