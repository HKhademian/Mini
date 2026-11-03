import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { tokenize } from './lexer.ts';
import { compile } from './parser.ts';
import { root } from '../tools/project.ts';

test('Mini compiler source reaches the T0 fixed point', () => {
  const sourcePath = join(root, 'compiler/compiler.mini');
  const source = readFileSync(sourcePath, 'utf8');
  const work = mkdtempSync(join(tmpdir(), 'mini-m1-'));
  try {
    const first = compile(tokenize(source, 'compiler.mini'));
    const firstPath = join(work, 'compiler1.ts');
    const secondPath = join(work, 'compiler2.ts');
    const thirdPath = join(work, 'compiler3.ts');
    writeFileSync(firstPath, first);
    const steps: Array<[string, string]> = [[firstPath, secondPath], [secondPath, thirdPath]];
    for (const [compilerPath, outputPath] of steps) {
      const result = spawnSync(process.execPath, [compilerPath, 'compile', sourcePath, outputPath], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, '');
      assert.equal(result.stderr, '');
    }
    assert.equal(readFileSync(secondPath, 'utf8'), first);
    assert.equal(readFileSync(thirdPath, 'utf8'), first);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});
