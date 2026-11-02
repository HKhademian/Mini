import assert from 'node:assert/strict';
import { cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { root, run } from '../../tools/project.ts';
import { verifyBootstrap } from '../../tools/verify.ts';
import { fixture } from './support.ts';
const directory = fixture(true);
try {
  cpSync(join(root, 'cases/tooling/different.ts'), join(directory, 'seed.ts'));
  assert.throws(() => verifyBootstrap(directory), /differs from generation 1/);
  run('git', ['restore', 'seed.ts'], directory);
  cpSync(join(root, 'cases/tooling/wrong-output.json'), join(directory, 'example/stdout.json'));
  assert.throws(() => verifyBootstrap(directory), /stdout/);
} finally { rmSync(directory, { recursive: true, force: true }); }

console.log('ok');
