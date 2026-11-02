import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { run } from '../../tools/project.ts';
import { prepareRelease } from '../../tools/release.ts';
import { fixture, annotatedTag } from './support.ts';
const directory = fixture();
try {
  run('git', ['tag', 'test-v0.1.0-alpha.1'], directory);
  assert.throws(() => prepareRelease(directory, join(directory, 'dist'), 'test-v0.1.0-alpha.1'), /annotated/);
  assert.throws(() => prepareRelease(directory, join(directory, 'dist'), 'test-v0.2.0'), /assigned test version/);
  annotatedTag(directory, 'mini-v0.1.0-alpha.1');
  assert.throws(() => prepareRelease(directory, join(directory, 'dist'), 'mini-v0.1.0-alpha.1'), /only individual tool releases/);
} finally { rmSync(directory, { recursive: true, force: true }); }

console.log('ok');
