#!/usr/bin/env node
/** Verify the C compiler matrix, both test drivers, and native bootstrap. */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function equal(label: string, left: Buffer, right: Buffer): void {
  if (!left.equals(right)) throw new Error(`${label} differs`);
}

if (process.argv[2] === '--test-comparison') {
  equal('same', Buffer.from('same'), Buffer.from('same'));
  let rejected = false;
  try { equal('deliberate mismatch', Buffer.from('a'), Buffer.from('b')); } catch { rejected = true; }
  if (!rejected) throw new Error('comparison accepted a mismatch');
  process.stdout.write('Comparison rejects mismatches.\n');
  process.exit(0);
}
if (process.argv.length !== 2) throw new Error('usage: node tools/c-bootstrap.ts [--test-comparison]');

const work = mkdtempSync(join(tmpdir(), 'mini-c-bootstrap-'));
const project = join(work, 'project');
let success = false;

function run(label: string, command: string, args: string[], extraEnv: NodeJS.ProcessEnv = {}): Buffer {
  process.stdout.write(`${label}\n`);
  const env = { ...process.env, ...extraEnv };
  if (!('MINI_TEST_WORKER' in extraEnv)) delete env.MINI_TEST_WORKER;
  const result = spawnSync(command, args, { cwd: project, env, maxBuffer: 64 * 1024 * 1024 });
  if (result.error || result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(`${label} failed: ${result.error?.message ?? result.signal ?? result.status}`);
  }
  return result.stdout;
}

function compileC(source: string, binary: string): void {
  run(`Build ${basename(binary)}`, 'cc', ['-std=c11', '-Wall', '-Wextra', '-Werror', source, '-o', binary]);
}

try {
  cpSync(root, project, {
    recursive: true,
    verbatimSymlinks: true,
    filter: source => {
      const relative = source.slice(root.length + 1);
      if (source === root) return true;
      if (relative.split('/').some(part => ['.git', '.cache', 'node_modules', 'dist'].includes(part))) return false;
      if (relative.startsWith('bin/') && relative !== 'bin/bootstrap') return false;
      return true;
    },
  });
  run('Build isolated JS bootstrap', './bin/bootstrap', []);
  const seed = join(project, 'dist/compile.js');
  const source = join(project, 'tools/compiler.mini');
  const jsDir = join(work, 'js');
  const cDir = join(work, 'c');
  mkdirSync(jsDir);
  mkdirSync(cDir);
  const jsCompiler = join(jsDir, 'compiler.js');
  const cCompiler = join(cDir, 'compiler.js');
  const firstC = join(jsDir, 'compiler.c');
  const secondC = join(cDir, 'compiler.c');
  const firstBinary = join(jsDir, 'compiler');
  const secondBinary = join(cDir, 'compiler');

  run('JS compiler → JS compiler', 'node', [seed, source, jsCompiler]);
  run('JS compiler → C compiler', 'node', [seed, '--target', 'c', source, firstC]);
  compileC(firstC, firstBinary);
  run('C compiler → JS compiler', firstBinary, [source, cCompiler]);
  run('C compiler → C compiler', firstBinary, ['--target', 'c', source, secondC]);
  compileC(secondC, secondBinary);
  equal('JS compiler generation', readFileSync(seed), readFileSync(jsCompiler));
  equal('cross-target JS compiler', readFileSync(jsCompiler), readFileSync(cCompiler));
  equal('cross-target C compiler', readFileSync(firstC), readFileSync(secondC));
  equal('C compiler header', readFileSync(join(jsDir, 'compiler.h')), readFileSync(join(cDir, 'compiler.h')));

  const sample = join(project, 'cases/language/005-001-bindings-io.mini');
  const compilers: [string, string[]][] = [
    ['node', [jsCompiler]], ['node', [cCompiler]], [firstBinary, []], [secondBinary, []],
  ];
  let sampleOutput: Buffer | undefined;
  for (const [index, [command, prefix]] of compilers.entries()) {
    const output = join(work, `sample-${index}.js`);
    run(`Run compiler generation ${index + 1}`, command, [...prefix, sample, output]);
    const bytes = readFileSync(output);
    if (sampleOutput) equal('sample compiler output', sampleOutput, bytes);
    sampleOutput = bytes;
  }

  const nativeTestC = join(project, 'dist/test-native.c');
  const nativeTest = join(project, 'dist/test-native');
  run('Emit native test driver', 'node', [seed, '--target', 'c', join(project, 'tools/test.mini'), nativeTestC]);
  compileC(nativeTestC, nativeTest);
  const jsResults = run('Run JS test driver and workers', 'node', [join(project, 'dist/test.js'), '--verbose']);
  const cResults = run('Run C test driver and workers', nativeTest, ['--verbose'], { MINI_TEST_WORKER: nativeTest });
  equal('test scenario results', jsResults, cResults);

  const nativeBootstrapC = join(project, 'dist/bootstrap.c');
  const nativeBootstrap = join(project, 'dist/bootstrap-native');
  run('Emit native bootstrap', 'node', [seed, '--target', 'c', join(project, 'tools/bootstrap.mini'), nativeBootstrapC]);
  compileC(nativeBootstrapC, nativeBootstrap);
  const expectedSeed = readFileSync(seed);
  run('Run native bootstrap', nativeBootstrap, []);
  equal('native bootstrap compiler', expectedSeed, readFileSync(seed));
  run('Verify JS bootstrap', join(project, 'bin/mini'), ['verify']);
  process.stdout.write(`C compiler SHA-256: ${createHash('sha256').update(readFileSync(firstC)).digest('hex')}\n`);
  success = true;
} finally {
  if (success) rmSync(work, { recursive: true, force: true });
  else process.stderr.write(`C bootstrap artifacts retained: ${work}\n`);
}
