import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { run, sha256 } from '../../tools/project.ts';
import { prepareRelease } from '../../tools/release.ts';
import { fixture, annotatedTag } from './support.ts';
const directory = fixture();
try {
  annotatedTag(directory, 'test-v0.1.0-alpha.1');
  mkdirSync(join(directory, '.cache'));
  writeFileSync(join(directory, '.cache', 'untracked.txt'), 'not shipped');
  const output = join(directory, 'dist');
  const manifest = prepareRelease(directory, output, 'test-v0.1.0-alpha.1');
  assert.equal(manifest.bootstrap, null);
  assert.equal(manifest.commit, run('git', ['rev-parse', 'HEAD'], directory).toString().trim());
  const archive = join(output, 'minilang-test-v0.1.0-alpha.1.tar.gz');
  const files = run('tar', ['-tf', archive], directory).toString();
  assert(files.includes('./tools/check.ts'));
  assert(!files.includes('.git/'));
  assert(!files.includes('.cache/'));
  assert(!files.includes('node_modules/'));
  const sums = readFileSync(join(output, 'SHA256SUMS'), 'utf8').trim().split('\n');
  for (const line of sums) {
    const [hash, name] = line.split('  ');
    assert.equal(sha256(readFileSync(join(output, name!))), hash);
  }
  const embedded = run('tar', ['-xOf', archive, './RELEASE.json'], directory).toString();
  assert.deepEqual(JSON.parse(embedded), manifest);
} finally { rmSync(directory, { recursive: true, force: true }); }

console.log('ok');
