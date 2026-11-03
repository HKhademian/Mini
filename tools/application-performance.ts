// Paired application audit. Does not modify the compiler or add a runtime dependency.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { applications, dataset, goldens, sharedLexer, type Application, type Fixture } from './application-fixtures.ts';
import { serialized } from './application-worker.ts';
import { compiler, compilerHash, root, sha256, versions } from './project.ts';

type Variant = { name: 'generated' | 'handwritten' | 'T0'; module: string; entry: string };
type Sample = { applicationWallMs: number; applicationUserCpuMs: number; applicationSystemCpuMs: number;
  heapBeforeBytes: number; heapAfterBytes: number; applicationPeakRssBytes: number; lastCharacter: number | null };
type Cold = Sample & { processWallMs: number; processUserCpuMs: number; processSystemCpuMs: number; processPeakRssBytes: number };
const directory = join(root, 'cases/applications');
const worker = join(root, 'tools/application-worker.ts');
const references: Partial<Record<Application, string>> = { tokenize: 'tokenize', 'source-index': 'index', 'compiler-pipeline': 'compile' };
const referenceAvailable = existsSync(join(root, 'compiler/lexer.ts')) && existsSync(join(root, 'compiler/parser.ts'));
const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

function child(args: string[]) {
  const start = performance.now();
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 120_000, maxBuffer: 64 * 1024 * 1024 });
  const milliseconds = performance.now() - start;
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${args.join(' ')}\n${result.stderr}`);
  assert.equal(result.signal, null);
  return { ...result, milliseconds };
}

function measure(variant: Variant, fixture: Fixture, inputPath: string, mode: 'cold'): Cold;
function measure(variant: Variant, fixture: Fixture, inputPath: string, mode: 'warm'): Sample[];
function measure(variant: Variant, fixture: Fixture, inputPath: string, mode: 'cold' | 'warm'): Cold | Sample[] {
  const expected = serialized(fixture.expected);
  const result = child([worker, mode, variant.module, inputPath, sha256(expected), variant.entry]);
  if (mode === 'cold') {
    assert.equal(result.stdout, expected, `result mismatch: ${variant.name}/${fixture.name}`);
    return { ...JSON.parse(result.stderr), processWallMs: result.milliseconds } as Cold;
  }
  assert.equal(result.stderr, '');
  const samples = JSON.parse(result.stdout) as Sample[];
  assert.equal(samples.length, 7);
  return samples;
}

function build(application: Application, assets: string, selected: string) {
  const parts = [...(sharedLexer.has(application) ? ['lexer.mini'] : []), `${application}.mini`];
  const source = parts.map(path => readFileSync(join(directory, path), 'utf8')).join('\n');
  const input = join(assets, `${application}.mini`);
  const output = join(assets, `${application}.generated.ts`);
  writeFileSync(input, source);
  const result = child([selected, 'compile', input, output]);
  assert.equal(result.stdout, ''); assert.equal(result.stderr, '');
  const emitted = readFileSync(output, 'utf8');
  writeFileSync(output, emitted + '\nexport { app_run };\n');
  const nativeFiles = [...(sharedLexer.has(application) ? ['lexer.ts'] : []), `${application}.ts`];
  const variants: Variant[] = [
    { name: 'generated', module: output, entry: 'app_run' },
    { name: 'handwritten', module: join(directory, application + '.ts'), entry: 'app_run' },
  ];
  if (referenceAvailable && references[application]) variants.push({ name: 'T0',
    module: join(root, 'tools/application-reference.ts'), entry: references[application]! });
  return { variants, identity: { application, miniFiles: parts.map(path => ({ path, sha256: sha256(readFileSync(join(directory, path))) })),
    handwrittenFiles: nativeFiles.map(path => ({ path, sha256: sha256(readFileSync(join(directory, path))) })),
    assembledMiniHash: sha256(source), generatedHash: sha256(emitted), generatedBytes: Buffer.byteLength(emitted),
    generatedPath: output, compileWallMs: result.milliseconds } };
}

async function main(): Promise<void> {
  const [, , argument, override, ...extra] = process.argv;
  assert(argument && extra.length === 0, 'usage: node tools/application-performance.ts REPORT.json [COMPILER.ts] | --check [COMPILER.ts]');
  const checkOnly = argument === '--check';
  const selected = override ? resolve(override) : join(root, compiler().entry);
  const output = resolve(argument);
  const assets = checkOnly ? mkdtempSync(join(tmpdir(), 'mini-applications-check-')) : output + '.assets';
  if (!checkOnly) { assert(!existsSync(output), 'report exists; choose a fresh name'); assert(!existsSync(assets), 'assets directory exists'); mkdirSync(assets, { recursive: true }); }
  writeFileSync(join(assets, 'package.json'), '{"type":"module"}\n');
  try {
    const results = []; const sources = []; const emittedProgramChecks = []; let semanticChecks = 0;
    for (const [applicationIndex, application] of applications.entries()) {
      const { variants, identity } = build(application, assets, selected); sources.push(identity);
      const inputPath = join(assets, `${application}.input.txt`);
      for (const fixture of goldens(application)) {
        writeFileSync(inputPath, fixture.input);
        for (const variant of variants) { measure(variant, fixture, inputPath, 'cold'); semanticChecks++; }
      }
      console.log(`Verified semantic fixtures: ${application}.`);
      for (const scale of checkOnly ? [1] : [1, 4, 16]) {
        const fixture = dataset(application, scale); writeFileSync(inputPath, fixture.input);
        if (checkOnly) {
          for (const variant of variants) { measure(variant, fixture, inputPath, 'cold'); semanticChecks++; }
          continue;
        }
        const cold = new Map<string, Cold[]>(variants.map(variant => [variant.name, []]));
        // Rotate order on every round to reduce systematic first-variant bias.
        for (let round = 0; round < 3; round++) {
          const offset = (applicationIndex + scale + round) % variants.length;
          for (let index = 0; index < variants.length; index++) {
            const variant = variants[(index + offset) % variants.length]!;
            cold.get(variant.name)!.push(measure(variant, fixture, inputPath, 'cold'));
          }
        }
        const offset = (applicationIndex + scale) % variants.length;
        for (let index = 0; index < variants.length; index++) {
          const variant = variants[(index + offset) % variants.length]!;
          const warm = measure(variant, fixture, inputPath, 'warm'); const samples = cold.get(variant.name)!;
          results.push({ application, scale, variant: variant.name, fixture: fixture.name,
            inputBytes: Buffer.byteLength(fixture.input), inputHash: sha256(fixture.input),
            expectedHash: sha256(serialized(fixture.expected)), cold: samples, warm,
            summary: { coldWallMs: median(samples.map(sample => sample.processWallMs)),
              coldApplicationWallMs: median(samples.map(sample => sample.applicationWallMs)),
              coldProcessCpuMs: median(samples.map(sample => sample.processUserCpuMs + sample.processSystemCpuMs)),
              warmApplicationWallMs: median(warm.map(sample => sample.applicationWallMs)),
              warmApplicationCpuMs: median(warm.map(sample => sample.applicationUserCpuMs + sample.applicationSystemCpuMs)),
              peakApplicationRssBytes: Math.max(...samples.map(sample => sample.applicationPeakRssBytes)),
              peakProcessRssBytes: Math.max(...samples.map(sample => sample.processPeakRssBytes)),
              heapAfterBytes: median(samples.map(sample => sample.heapAfterBytes)),
              heapIncreaseBytes: median(samples.map(sample => sample.heapAfterBytes - sample.heapBeforeBytes)) } });
        }
        if (application === 'compiler-pipeline') {
          const program = join(assets, `compiled-program-${scale}.ts`); writeFileSync(program, fixture.expected as string);
          const execution = child([program]); assert.equal(execution.stdout, 'ok\n'); assert.equal(execution.stderr, '');
          emittedProgramChecks.push({ scale, outputHash: sha256(fixture.expected as string), milliseconds: execution.milliseconds });
        }
        console.log(`Measured ${application}/${fixture.name}: ${Buffer.byteLength(fixture.input)} input bytes.`);
      }
    }
    if (checkOnly) { console.log(`Verified ${semanticChecks} application/fixture combinations.`); return; }
    const comparisons = [];
    for (const result of results.filter(row => row.variant === 'generated')) {
      for (const baseline of results.filter(row => row.application === result.application && row.scale === result.scale && row.variant !== 'generated')) {
        comparisons.push({ application: result.application, scale: result.scale, baseline: baseline.variant,
          warmWallRatio: result.summary.warmApplicationWallMs / baseline.summary.warmApplicationWallMs,
          warmCpuRatio: result.summary.warmApplicationCpuMs / baseline.summary.warmApplicationCpuMs,
          coldWallRatio: result.summary.coldWallMs / baseline.summary.coldWallMs,
          coldCpuRatio: result.summary.coldProcessCpuMs / baseline.summary.coldProcessCpuMs,
          peakRssRatio: result.summary.peakApplicationRssBytes / baseline.summary.peakApplicationRssBytes });
      }
    }
    const revision = childGit(['rev-parse', 'HEAD']);
    const report = { schemaVersion: 1, measuredAt: new Date().toISOString(),
      commit: revision.trim(),
      versions: versions(root), compilerEntry: selected, compilerHash: override ? sha256(readFileSync(selected)) : compilerHash(),
      compilerHashScope: override ? 'entry file only' : 'configured compiler source set',
      harness: ['tools/application-performance.ts', 'tools/application-worker.ts', 'tools/application-fixtures.ts', 'tools/application-reference.ts']
        .map(path => ({ path, sha256: sha256(readFileSync(join(root, path))) })),
      referenceAvailable, referenceSources: referenceAvailable
        ? ['compiler/types.ts', 'compiler/lexer.ts', 'compiler/parser.ts', 'compiler/builtins.ts']
          .map(path => ({ path, sha256: sha256(readFileSync(join(root, path))) })) : [],
      method: { scales: [1, 4, 16], coldSamples: 3, warmups: 3, warmSamples: 7,
        gc: 'natural; no forced GC', order: 'rotating cold order and warm starting variant; sequential workers',
        coldWall: 'whole worker startup, TS loading, input read, application, serialization, and output',
        coldCpu: 'process user+system CPU through result serialization/output; excludes final metric print and shutdown',
        warm: 'application call and top-level string flattening; excludes import, input read, normalization/hash verification',
        memory: 'maximum of cold per-process RSS high-water before normalization (applicationPeak) and after output (processPeak); includes Node/worker/import/input. Heap is a live snapshot including garbage, not retained or peak JS heap.',
        instrumentation: 'append only export { app_run } to an isolated generated copy; original emitted bytes hashed',
        baseline: 'handwritten matching algorithms/helpers with native Map/list storage; generated representation follows the selected backend. Actual T0 separately includes objects, regex, slice, and its full parser',
        limitations: 'one host; no actual M1, fixed point, OS cold-cache control, I/O durability workload, or concurrency test; checks are outside application timing' },
      semanticChecks, verifiedMeasuredCalls: results.length * 10, sources, results, comparisons, emittedProgramChecks };
    mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    console.log(`Wrote ${results.length} measurements and ${comparisons.length} comparisons to ${output}.`);
  } finally { if (checkOnly) rmSync(assets, { recursive: true, force: true }); }
}

function childGit(args: string[]): string {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); return result.stdout;
}
if (import.meta.main) await main();
