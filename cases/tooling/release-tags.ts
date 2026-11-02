import assert from 'node:assert/strict';
import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { run } from '../../tools/project.ts';
import { prepareRelease } from '../../tools/release.ts';
import { fixture, annotatedTag, initial } from './support.ts';
const directory = fixture();
try {
  run('git', ['tag', 'test-v0.1.0-alpha.1'], directory);
  assert.throws(() => prepareRelease(directory, join(directory, 'dist'), 'test-v0.1.0-alpha.1'), /annotated/);
  assert.throws(() => prepareRelease(directory, join(directory, 'dist'), 'test-v0.2.0'), /assigned test version/);
  annotatedTag(directory, 'mini-v0.1.0-alpha.1');
  assert.throws(() => prepareRelease(directory, join(directory, 'dist'), 'mini-v0.1.0-alpha.1'), /requires a verified compiler bootstrap/);
  writeFileSync(join(directory, 'config/versions.json'), JSON.stringify({ ...initial, std: '0.1.0' }));
  run('git', ['add', 'config/versions.json'], directory);
  run('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'library fixture'], directory);
  annotatedTag(directory, 'std-v0.1.0');
  const library = prepareRelease(directory, join(directory, 'dist'), 'std-v0.1.0');
  assert.deepEqual(library.releasedComponent, { component: 'std', version: '0.1.0' });
  assert.equal(library.bootstrap, null);
} finally { rmSync(directory, { recursive: true, force: true }); }

console.log('ok');
