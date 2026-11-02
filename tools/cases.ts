import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { root, sha256 } from './project.ts';

export type Scenario = { name: string; args?: string[]; stdin: string; stdout: string; stderr: string; exitCode: number; artifact?: string };
export type Case = { id: string; kind: 'tool' | 'feature' | 'reject' | 'compile' | 'sample' | 'example'; source: string; features: string[]; cases: Scenario[]; benchmark?: { warmups: number; samples: number } };
export type Fixture = { path: string; definition: Case };

/** Stream JSON files contain exactly one representation, never executable code. */
export function stream(file: string): Buffer {
  const value = JSON.parse(readFileSync(file, 'utf8')) as { text?: string; bytes?: number[]; file?: string; hash?: string };
  const keys = Object.keys(value).filter(key => key !== 'hash');
  assert.equal(keys.length, 1, `one stream representation required: ${file}`);
  let bytes: Buffer;
  if (keys[0] === 'text') {
    assert.equal(typeof value.text, 'string');
    bytes = Buffer.from(value.text!);
  } else if (keys[0] === 'bytes') {
    assert(Array.isArray(value.bytes) && value.bytes.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255));
    bytes = Buffer.from(value.bytes);
  } else {
    assert(keys[0] === 'file' && typeof value.file === 'string', `invalid stream: ${file}`);
    bytes = readFileSync(resolve(dirname(file), value.file));
  }
  if (value.hash !== undefined) assert.equal(value.hash, `sha256:${sha256(bytes)}`, `stream hash differs: ${file}`);
  return bytes;
}

export function loadCases(filter = '', directory = join(root, 'cases')): Fixture[] {
  const fixtures: Fixture[] = [];
  function visit(path: string): void {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.case.json')) {
        const value = JSON.parse(readFileSync(file, 'utf8')) as Case;
        assert(typeof value.id === 'string' && value.id.length > 0);
        assert(['tool', 'feature', 'reject', 'compile', 'sample', 'example'].includes(value.kind));
        assert(typeof value.source === 'string');
        if (value.kind !== 'tool') assert(value.source.endsWith('.mini'), `Mini source must use .mini: ${file}`);
        readFileSync(resolve(dirname(file), value.source));
        assert(Array.isArray(value.features) && value.features.every(feature => typeof feature === 'string'));
        assert(Array.isArray(value.cases) && value.cases.length > 0);
        const names = new Set<string>();
        for (const scenario of value.cases) {
          assert(typeof scenario.name === 'string' && scenario.name.length > 0 && !names.has(scenario.name));
          names.add(scenario.name);
          assert(Number.isInteger(scenario.exitCode) && scenario.exitCode >= 0 && scenario.exitCode <= 255);
          assert(scenario.args === undefined || (Array.isArray(scenario.args) && scenario.args.every(arg => typeof arg === 'string')));
          for (const key of ['stdin', 'stdout', 'stderr'] as const) {
            assert(typeof scenario[key] === 'string' && scenario[key].endsWith('.json'), `${file}: ${key} must reference a separate stream JSON`);
            stream(resolve(dirname(file), scenario[key]));
          }
          assert.equal(new Set([value.source, scenario.stdin, scenario.stdout, scenario.stderr]).size, 4, 'source and streams must be separate files');
          if (value.kind === 'compile') {
            assert(typeof scenario.artifact === 'string', 'compile case needs a separate artifact stream');
            stream(resolve(dirname(file), scenario.artifact));
          }
        }
        if (value.benchmark !== undefined) {
          assert(Number.isInteger(value.benchmark.warmups) && value.benchmark.warmups >= 0);
          assert(Number.isInteger(value.benchmark.samples) && value.benchmark.samples >= 1);
        }
        fixtures.push({ path: file, definition: value });
      }
    }
  }
  visit(directory);
  assert.equal(new Set(fixtures.map(item => item.definition.id)).size, fixtures.length, 'duplicate case IDs');
  const selected = fixtures.filter(item => item.definition.id.includes(filter));
  assert(selected.length > 0, `no cases match: ${filter}`);
  return selected;
}

export function verifyScenario(fixture: Fixture, scenario: Scenario, projectRoot = root, compilerOverride?: string): string | null {
  const { definition: spec, path } = fixture;
  const directory = dirname(path);
  const work = mkdtempSync(join(tmpdir(), 'mini-case-'));
  const execute = (file: string, args: string[], input: Buffer) => {
    const result = spawnSync(process.execPath, [file, ...args], { cwd: projectRoot, input, timeout: 30_000, maxBuffer: 32 * 1024 * 1024 });
    if (result.error) throw result.error;
    assert.equal(result.signal, null, `${spec.id}/${scenario.name}: process terminated by signal`);
    return result;
  };
  try {
    let program = resolve(directory, spec.source);
    const input = stream(resolve(directory, scenario.stdin));
    let result;
    let artifact: string | null = null;
    if (spec.kind === 'tool') result = execute(program, scenario.args ?? [], input);
    else {
      const config = JSON.parse(readFileSync(join(projectRoot, 'config/bootstrap.json'), 'utf8')) as { compiler: string } | null;
      assert(compilerOverride !== undefined || config !== null, `${spec.id}: compiler unavailable; cases are not skipped`);
      const output = join(work, 'program.ts');
      const compiled = execute(compilerOverride ?? resolve(projectRoot, config!.compiler), ['compile', program, output], Buffer.alloc(0));
      if (compiled.status === 0) artifact = sha256(readFileSync(output));
      if (spec.kind === 'compile') {
        assert.deepEqual(readFileSync(output), stream(resolve(directory, scenario.artifact!)), 'generated artifact differs');
      }
      if (spec.kind === 'reject') assert(!existsSync(output), 'rejection created an output artifact');
      if (spec.kind === 'reject' || spec.kind === 'compile') result = compiled;
      else {
        assert.equal(compiled.status, 0, compiled.stderr.toString());
        assert.equal(compiled.stderr.length, 0, 'unexpected compiler diagnostics');
        program = output;
        writeFileSync(join(work, 'package.json'), '{"type":"module"}\n');
        assert.equal(compiled.stdout.length, 0, 'unexpected compiler stdout');
        result = execute(program, scenario.args ?? [], input);
      }
    }
    assert.equal(result.status, scenario.exitCode, `${spec.id}/${scenario.name}: exit status; ${result.stderr}`);
    assert.deepEqual(result.stdout, stream(resolve(directory, scenario.stdout)), `${spec.id}/${scenario.name}: stdout`);
    assert.deepEqual(result.stderr, stream(resolve(directory, scenario.stderr)), `${spec.id}/${scenario.name}: stderr`);
    if (spec.kind === 'reject') { assert.notEqual(scenario.exitCode, 0); assert.equal(result.stdout.length, 0, 'rejection emitted artifact bytes'); }
    return artifact;
  } finally { rmSync(work, { recursive: true, force: true }); }
}

export function caseIdentity(fixture: Fixture) {
  const base = dirname(fixture.path);
  return { manifest: sha256(readFileSync(fixture.path)), source: sha256(readFileSync(resolve(base, fixture.definition.source))), streams: fixture.definition.cases.map(scenario => ({ name: scenario.name, stdin: sha256(stream(resolve(base, scenario.stdin))), stdout: sha256(stream(resolve(base, scenario.stdout))), stderr: sha256(stream(resolve(base, scenario.stderr))) })) };
}

export function loadCase(path: string): Fixture {
  const fixture = loadCases('', dirname(path)).find(item => item.path === path);
  assert(fixture, `case manifest not found: ${path}`);
  return fixture;
}
