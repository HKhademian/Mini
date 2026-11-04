// Developer audit, separate from the fresh-process case benchmark command.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compiler, compilerHash, root, sha256 } from '../support.ts';

const names = ['scalar', 'list', 'state', 'tokens', 'text', 'slices', 'scopes'] as const;
type Name = typeof names[number];
type Variant = 'generated' | 'direct' | 'idiomatic';
type Token = { kind: string; text: string; source: string; start: number; end: number;
  line: number; column: number; context: string };
type Result = number | string | Map<string, string | number>[] | Token[];
type Workload = (count: number, source: string) => Result;
const sourcePath = join(root, 'cases/compiler/runtime-workloads.mini');
const script = fileURLToPath(import.meta.url);
const warmups = 3;
const samples = 7;

function processResult(command: string[], timeout = 120_000) {
  const start = performance.now();
  const child = spawnSync(process.execPath, command,
    { encoding: 'utf8', timeout, maxBuffer: 4 * 1024 * 1024 });
  assert.ifError(child.error);
  return { status: child.status, signal: child.signal,
    milliseconds: performance.now() - start, stdout: child.stdout,
    stderr: child.stderr.slice(-4000) };
}

function compilerProbes(selected: string, directory: string) {
  const results = [];
  for (const name of ['statements', 'long-text', 'expression'] as const) {
    for (const count of name === 'statements' ? [1000, 4000, 16000]
      : name === 'long-text' ? [10000, 40000, 160000] : [100, 1000, 4000]) {
      const source = name === 'statements'
        ? 'var value = 0;\n' + 'value = value + 1;\n'.repeat(count)
          + `if (value != ${count}) { process_exit(1); }\nwrite("ok\\n");\n`
        : name === 'long-text'
          ? `var value = "${'a'.repeat(count)}";\nif (text_length(value) != ${count}) { process_exit(1); }\nwrite("ok\\n");\n`
          : 'var value = ' + Array<string>(count).fill('1').join(' + ')
            + `;\nif (value != ${count}) { process_exit(1); }\nwrite("ok\\n");\n`;
      const input = join(directory, 'compiler-probe.mini');
      const output = join(directory, 'compiler-probe.js');
      writeFileSync(input, source);
      const compilations = Array.from({ length: 3 }, () => {
        const result = processResult([selected, 'compile', input, output]);
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout, '');
        assert.equal(result.stderr, '');
        return result.milliseconds;
      });
      const emitted = readFileSync(output, 'utf8');
      const executions = Array.from({ length: 3 }, () => processResult([output]));
      const passed = executions.every(result => result.status === 0
        && result.stdout === 'ok\n' && result.stderr === '');
      const javascriptPath = join(directory, 'compiler-probe.mjs');
      writeFileSync(javascriptPath, emitted);
      const javascriptExecutions = Array.from({ length: 3 }, () => processResult([javascriptPath]));
      if (name !== 'expression') assert(javascriptExecutions.every(result => result.status === 0
        && result.stdout === 'ok\n' && result.stderr === ''), `JS control failed: ${name} ${count}`);
      // A flat TS expression is a control for excess nesting introduced by emission.
      let flatControl = null;
      if (name === 'expression') {
        const flat = `let value = ${Array<string>(count).fill('1').join(' + ')};\nif (value !== ${count}) process.exit(1);\nprocess.stdout.write("ok\\n");\n`;
        const path = join(directory, 'flat-control.js');
        writeFileSync(path, flat);
        flatControl = processResult([path]);
      } else assert(passed, `compiler probe failed: ${name} ${count}`);
      results.push({ name, count, sourceBytes: Buffer.byteLength(source), sourceHash: sha256(source),
        generatedBytes: Buffer.byteLength(emitted), generatedHash: sha256(emitted),
        compileMilliseconds: compilations, executions, passed, javascriptExecutions, flatControl });
    }
    console.log(`Checked complete compiler output: ${name}.`);
  }
  return results;
}

// Same algorithms and representations, using unchecked native operations.
const direct: Record<Name, Workload> = {
  scalar(count) {
    function step(value: number): number { return value + 1; }
    let result = 0;
    for (let index = 0; index < count; index++) result = step(result);
    return result;
  },
  list(count) {
    const items: number[] = [];
    for (let index = 0; index < count; index++) items[index] = index;
    let result = 0;
    for (let index = 0; index < count; index++) result += items[index]!;
    return result;
  },
  state(count) {
    const state = new Map([['position', 0]]);
    for (let index = 0; index < count; index++) state.set('position', state.get('position')! + 1);
    return state.get('position')!;
  },
  tokens(count, source) {
    const items: Map<string, string | number>[] = [];
    for (let index = 0; index < count; index++) {
      const token = new Map<string, string | number>();
      token.set('kind', 'identifier'); token.set('text', 'name'); token.set('source', 'probe.mini');
      token.set('start', index); token.set('end', index + 1); token.set('line', 1);
      token.set('column', index + 1); token.set('context', source);
      items[index] = token;
    }
    return items;
  },
  text(count, source) {
    let output = '';
    for (let index = 0; index < count; index++) output += source[index];
    return output;
  },
  slices(count, source) {
    let output = '';
    for (let start = 0; start < count;) {
      let part = '';
      let index = start;
      for (; index < start + 24 && index < count; index++) part += source[index];
      output += part;
      start = index;
    }
    return output;
  },
  scopes(count, source) {
    const scope = new Map<string, number>();
    for (let index = 0; index < source.length; index++) scope.set(source[index]!, index);
    let result = 0;
    for (let index = 0; index < count; index++) {
      const inner = new Map<string, number>();
      const keys = [...scope.keys()];
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        const key = keys[keyIndex]!;
        inner.set(key, scope.get(key)!);
      }
      result += [...inner.keys()].length;
    }
    return result;
  },
};

// Alternative host idioms expose representation/library costs separately.
const idiomatic: Partial<Record<Name, Workload>> = {
  state(count) {
    const state = { position: 0 };
    for (let index = 0; index < count; index++) state.position++;
    return state.position;
  },
  tokens(count, source) {
    const items: Token[] = [];
    for (let index = 0; index < count; index++) {
      items.push({ kind: 'identifier', text: 'name', source: 'probe.mini', start: index,
        end: index + 1, line: 1, column: index + 1, context: source });
    }
    return items;
  },
  slices(count, source) {
    let output = '';
    for (let start = 0; start < count; start += 24) output += source.slice(start, start + 24);
    return output;
  },
  scopes(count, source) {
    const scope = new Map<string, number>();
    for (let index = 0; index < source.length; index++) scope.set(source[index]!, index);
    let result = 0;
    for (let index = 0; index < count; index++) result += new Map(scope).size;
    return result;
  },
};

function verify(name: Name, result: Result, count: number, source: string): void {
  if (name === 'tokens') {
    assert(Array.isArray(result));
    assert.equal(result.length, count);
    // Verify every field outside the timed region; retain the whole result for GC.
    for (let index = 0; index < count; index++) {
      const token: Map<string, string | number> | Token = result[index]!;
      const expected: Token = { kind: 'identifier', text: 'name', source: 'probe.mini', start: index,
        end: index + 1, line: 1, column: index + 1, context: source };
      assert.deepEqual(Object.fromEntries(token instanceof Map ? token : Object.entries(token)), expected);
    }
  } else if (name === 'text' || name === 'slices') assert.equal(result, source);
  else if (name === 'list') assert.equal(result, count * (count - 1) / 2);
  else if (name === 'scopes') assert.equal(result, count * source.length);
  else assert.equal(result, count);
}

async function worker(): Promise<void> {
  const [, , , modulePath, variantArg, nameArg, countArg] = process.argv;
  const variant = variantArg as Variant;
  const name = nameArg as Name;
  assert(names.includes(name));
  const count = Number(countArg);
  assert(Number.isSafeInteger(count) && count > 0);
  const generated = await import(pathToFileURL(modulePath!).href) as Record<string, Workload>;
  const fn = variant === 'generated' ? generated['perf_' + name]!
    : variant === 'direct' ? direct[name] : idiomatic[name]!;
  assert(fn);
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
  const source = name === 'scopes' ? alphabet : name === 'text' || name === 'slices'
    ? 'alpha_012345 = beta_value;\n'.repeat(Math.ceil(count / 25)).slice(0, count) : 'var name = 1;';
  assert(global.gc, 'run worker with --expose-gc');
  const execute = (): number => {
    global.gc!();
    const start = performance.now();
    const result = fn(count, source);
    // Force deferred string flattening inside the timer, before verification.
    const lastCharacter = typeof result === 'string' && result.length
      ? result.charCodeAt(result.length - 1) : null;
    const elapsed = performance.now() - start;
    if (lastCharacter !== null) assert.equal(lastCharacter, source.charCodeAt(source.length - 1));
    verify(name, result, count, source);
    return elapsed;
  };
  const firstCallMilliseconds = execute();
  for (let index = 0; index < warmups; index++) execute();
  const milliseconds = Array.from({ length: samples }, execute);
  global.gc();
  const before = process.memoryUsage().heapUsed;
  const retained = fn(count, source);
  const retainedLastCharacter = typeof retained === 'string' && retained.length
    ? retained.charCodeAt(retained.length - 1) : null;
  global.gc();
  const retainedHeapBytes = process.memoryUsage().heapUsed - before;
  if (retainedLastCharacter !== null) assert.equal(retainedLastCharacter, source.charCodeAt(source.length - 1));
  verify(name, retained, count, source);
  const sorted = [...milliseconds].sort((a, b) => a - b);
  console.log(JSON.stringify({ variant, name, count, firstCallMilliseconds,
    milliseconds, medianMilliseconds: sorted[Math.floor(samples / 2)], retainedHeapBytes,
    maximumResidentKiB: process.resourceUsage().maxRSS }));
}

async function audit(): Promise<void> {
  const [, , output, override, ...extra] = process.argv;
  assert(output && extra.length === 0,
    'usage: node test/performance/runtime-performance.ts REPORT.json [COMPILER.js]');
  assert(!existsSync(resolve(output)), 'report already exists; choose a fresh filename');
  const directory = mkdtempSync(join(tmpdir(), 'mini-runtime-performance-'));
  const selected = override ? resolve(override) : join(root, compiler().entry);
  try {
    writeFileSync(join(directory, 'package.json'), '{"type":"module"}\n');
    const generatedPath = join(directory, 'workloads.js');
    const compilation = spawnSync(process.execPath, [selected, 'compile', sourcePath, generatedPath],
      { encoding: 'utf8', timeout: 120_000 });
    assert.ifError(compilation.error);
    assert.equal(compilation.status, 0, compilation.stderr);
    const emitted = readFileSync(generatedPath, 'utf8');
    // Instrument an isolated copy only. Original compiler output is hashed unchanged.
    writeFileSync(generatedPath, emitted + '\nexport { ' + names.map(name => 'perf_' + name).join(', ') + ' };\n');
    const results: unknown[] = [];
    for (const name of names) {
      for (const scale of [1, 4, 16]) {
        const count = (name === 'scalar' ? 1_000_000 : name === 'state' ? 100_000
          : name === 'scopes' ? 100 : 10_000) * scale;
        for (const variant of ['generated', 'direct', ...(idiomatic[name] ? ['idiomatic'] : [])]) {
          const start = performance.now();
          const child = spawnSync(process.execPath,
            ['--expose-gc', script, '--worker', generatedPath, variant, name, String(count)],
            { encoding: 'utf8', timeout: 120_000, maxBuffer: 1024 * 1024 });
          const processWallMilliseconds = performance.now() - start;
          assert.ifError(child.error);
          assert.equal(child.status, 0, child.stderr);
          results.push({ ...JSON.parse(child.stdout), processWallMilliseconds });
        }
      }
      console.log(`Verified and measured ${name}.`);
    }
    const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
    assert.equal(revision.status, 0, revision.stderr);
    const completeCompiler = compilerProbes(selected, directory);
    const report = { schemaVersion: 1, measuredAt: new Date().toISOString(),
      commit: revision.stdout.trim(),
      compilerEntry: selected, compilerHash: override ? sha256(readFileSync(selected)) : compilerHash(),
      compilerHashScope: override ? 'entry file only' : 'configured source files',
      sourceHash: sha256(readFileSync(sourcePath)), generatedHash: sha256(emitted),
      harnessHash: sha256(readFileSync(script)), generatedBytes: Buffer.byteLength(emitted),
      warmups, samples,
      scope: 'Synthetic compiler workloads, not a T1 compiler or self-build. Temporary generated modules use an explicit type:module package scope. Fresh worker per variant/size. Explicit GC before timed calls; first call separate; string flattening included; correctness checks excluded. Heap is a GC-based retained estimate, RSS is whole-worker high-water. Process wall includes all warmups, checks, and samples, not compiler latency. Complete-compiler rows use fresh-process wall times, three runs each; identical emitted bytes in .mjs are loading-path controls.',
      results, completeCompiler };
    mkdirSync(dirname(resolve(output)), { recursive: true });
    writeFileSync(resolve(output), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    console.log(`Wrote ${results.length} measurements to ${output}.`);
    const failures = completeCompiler.filter(result => !result.passed);
    if (failures.length) {
      console.error(`${failures.length} expression stress probes failed; see report. This is not a performance clearance.`);
      process.exitCode = 1;
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  if (process.argv[2] === '--worker') await worker();
  else await audit();
}
