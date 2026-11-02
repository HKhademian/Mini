import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { prepareRelease } from '../../tools/release.ts';
import { verifyBootstrap } from '../../tools/verify.ts';
import { fixture, annotatedTag } from './support.ts';
const directory = fixture(true);
try {
  const report = verifyBootstrap(directory);
  assert.deepEqual(report.generations, [report.compiler, report.compiler, report.compiler]);
  annotatedTag(directory, 'bootstrap-v0.1.0');
  const manifest = prepareRelease(directory, join(directory, 'dist'), 'bootstrap-v0.1.0');
  assert.deepEqual(manifest.bootstrap, report);
} finally { rmSync(directory, { recursive: true, force: true }); }

console.log('ok');
