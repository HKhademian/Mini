import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { root } from './project.ts';

/** Developer check: run Mini-source cases through a candidate compiler. */
export function verifyCandidate(compiler: string, filter = ''): void {
  const args = filter === '' ? ['--candidate', resolve(compiler)] : ['--candidate', resolve(compiler), filter];
  const result = spawnSync(process.execPath, [join(root, 'dist/test.ts'), ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (import.meta.main) {
  const [compiler, filter, ...extra] = process.argv.slice(2);
  if (compiler === undefined || extra.length > 0) throw new Error('usage: node tools/candidate.ts COMPILER.ts [FILTER]');
  verifyCandidate(compiler, filter);
}
