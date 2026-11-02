import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { run } from '../../tools/project.ts';
import { prepareRelease } from '../../tools/release.ts';
import { fixture } from './support.ts';
const directory = fixture();
try {
writeFileSync(join(directory, 'README.md'), 'uncommitted');
  assert.throws(() => prepareRelease(directory, join(directory, 'dist')), /clean checkout/);
  run('git', ['restore', 'README.md'], directory);
  mkdirSync(join(directory, 'dist'));
  writeFileSync(join(directory, 'dist', 'keep.txt'), 'keep');
  assert.throws(() => prepareRelease(directory, join(directory, 'dist')), /must be empty/);
  assert.equal(readFileSync(join(directory, 'dist', 'keep.txt'), 'utf8'), 'keep');
} finally { rmSync(directory, { recursive: true, force: true }); }

console.log('ok');
