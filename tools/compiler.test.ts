import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { root } from '../tools/project.ts';

test('generated compiler reaches a fixed point', () => {
  const source = join(root, 'tools/compiler.mini');
  const seed = join(root, 'dist/compiler.ts');
  const work = mkdtempSync(join(tmpdir(), 'mini-m1-'));
  try {
    const first = join(work, 'compiler1.ts');
    const second = join(work, 'compiler2.ts');
    const third = join(work, 'compiler3.ts');
    for (const [compiler, output] of [[seed, first], [first, second], [second, third]] as const) {
      const result = spawnSync(process.execPath, [compiler, 'compile', source, output], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, '');
      assert.equal(result.stderr, '');
    }
    const promoted = readFileSync(seed);
    assert.deepEqual(readFileSync(first), promoted);
    assert.deepEqual(readFileSync(second), promoted);
    assert.deepEqual(readFileSync(third), promoted);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});
