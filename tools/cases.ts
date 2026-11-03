import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { root, run, sha256 } from './project.ts';

export type Stream = ({ text: string } | { bytes: number[] } | { file: string }) & { hash?: string };
export type Scenario = {
  name: string;
  args?: string[];
  stdin: Stream;
  stdout: Stream;
  stderr: Stream;
  exitCode: number;
  artifact?: Stream;
  workspace?: 'clean' | 'dirty';
  tag?: { name: string; annotated: boolean };
  files?: string[];
};
export type Case = {
  id: string;
  pending?: string;
  features: string[];
  cases: Scenario[];
  benchmark?: { warmups: number; samples: number };
} & (
  { kind: 'tool'; tool: string; source?: never } |
  { kind: 'feature' | 'reject' | 'compile' | 'sample' | 'example'; source: string; tool?: never }
);
export type Fixture = { path: string; definition: Case };

export function stream(value: Stream, directory: string): Buffer {
  assert(typeof value === 'object' && value !== null && !Array.isArray(value), 'stream must be an object');
  const keys = Object.keys(value).filter(key => key !== 'hash');
  assert(keys.length === 1, 'one stream representation required');
  let bytes: Buffer;
  if ('text' in value && keys[0] === 'text') {
    assert(typeof value.text === 'string', 'stream text must be a string');
    bytes = Buffer.from(value.text);
  } else if ('bytes' in value && keys[0] === 'bytes') {
    assert(Array.isArray(value.bytes) && value.bytes.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255), 'invalid stream bytes');
    bytes = Buffer.from(value.bytes);
  } else {
    assert(keys[0] === 'file' && 'file' in value && typeof value.file === 'string', 'invalid stream');
    bytes = readFileSync(resolve(directory, value.file));
  }
  if (value.hash !== undefined) assert(value.hash === 'sha256:' + sha256(bytes), 'stream hash differs');
  return bytes;
}

export function loadCase(path: string): Fixture {
  const file = resolve(path);
  const spec = JSON.parse(readFileSync(file, 'utf8')) as Case;
  assert(typeof spec.id === 'string' && spec.id.length > 0, 'case ID required');
  assert(['tool', 'feature', 'reject', 'compile', 'sample', 'example'].includes(spec.kind), 'invalid case kind');
  assert(spec.pending === undefined || (spec.kind !== 'tool' && typeof spec.pending === 'string' && spec.pending.trim().length > 0), 'pending needs a language case and reason');
  if (spec.kind === 'tool') {
    assert(spec.source === undefined, 'tool cases name a tool, not a case executable');
    assert(typeof spec.tool === 'string' && !spec.tool.includes('/') && existsSync(join(root, 'bin', spec.tool)), 'unknown tool');
  } else {
    assert(typeof spec.source === 'string' && spec.source.endsWith('.mini'), 'Mini source must use .mini');
    readFileSync(resolve(dirname(file), spec.source));
  }
  assert(Array.isArray(spec.features) && spec.features.every(feature => typeof feature === 'string'), 'features must be an array');
  assert(Array.isArray(spec.cases) && spec.cases.length > 0, 'case scenarios required');
  const names = new Set<string>();
  for (const scenario of spec.cases) {
    assert(typeof scenario.name === 'string' && scenario.name.length > 0 && !names.has(scenario.name), 'scenario names must be unique');
    names.add(scenario.name);
    assert(Number.isInteger(scenario.exitCode) && scenario.exitCode >= 0 && scenario.exitCode <= 255, 'invalid exit status');
    assert(scenario.args === undefined || (Array.isArray(scenario.args) && scenario.args.every(arg => typeof arg === 'string')), 'invalid arguments');
    for (const key of ['stdin', 'stdout', 'stderr'] as const) stream(scenario[key], dirname(file));
    if (scenario.artifact !== undefined) {
      assert(spec.kind === 'compile', 'only compile cases compare generated artifacts');
      stream(scenario.artifact, dirname(file));
    }
    assert(scenario.workspace === undefined || (spec.kind === 'tool' && ['clean', 'dirty'].includes(scenario.workspace)), 'invalid workspace');
    assert(scenario.tag === undefined || (scenario.workspace !== undefined && typeof scenario.tag.name === 'string' && typeof scenario.tag.annotated === 'boolean'), 'invalid fixture tag');
    assert(scenario.files === undefined || (Array.isArray(scenario.files) && scenario.files.every(file => typeof file === 'string')), 'invalid artifact paths');
  }
  if (spec.benchmark !== undefined) {
    assert(Number.isInteger(spec.benchmark.warmups) && spec.benchmark.warmups >= 0);
    assert(Number.isInteger(spec.benchmark.samples) && spec.benchmark.samples >= 1);
  }
  return { path: file, definition: spec };
}

export function loadCases(filter = '', directory = join(root, 'cases')): Fixture[] {
  const fixtures: Fixture[] = [];
  function visit(path: string): void {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.case.json')) fixtures.push(loadCase(file));
    }
  }
  visit(directory);
  assert(new Set(fixtures.map(item => item.definition.id)).size === fixtures.length, 'duplicate case IDs');
  const selected = fixtures.filter(item => item.definition.id.includes(filter));
  assert(selected.length > 0, 'no cases match: ' + filter);
  return selected;
}

function toolWorkspace(project: string, scenario: Scenario, work: string): string {
  if (scenario.workspace === undefined) return project;
  const directory = join(work, 'project');
  for (const name of readdirSync(project)) {
    if (['.git', 'node_modules', 'dist', '.cache'].includes(name)) continue;
    cpSync(join(project, name), join(directory, name), {
      recursive: true, verbatimSymlinks: true,
      filter: path => basename(path) !== 'node_modules',
    });
  }
  const git = (...args: string[]) => run('git', [
    '-c', 'user.name=Case fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgSign=false', '-c', 'tag.gpgSign=false', ...args,
  ], directory);
  git('init', '-b', 'main');
  git('add', '.');
  git('commit', '-m', 'case fixture');
  if (scenario.tag !== undefined) {
    const args = scenario.tag.annotated ? ['-a', scenario.tag.name, '-m', scenario.tag.name] : [scenario.tag.name];
    git('tag', ...args);
  }
  if (scenario.workspace === 'dirty') writeFileSync(join(directory, 'uncommitted.txt'), 'dirty\n');
  return directory;
}

export function verifyScenario(fixture: Fixture, scenario: Scenario, projectRoot = root, compilerOverride?: string): string | null {
  const { definition: spec, path } = fixture;
  assert(spec.pending === undefined, spec.id + ': pending: ' + spec.pending);
  const directory = dirname(path);
  const work = mkdtempSync(join(tmpdir(), 'mini-case-'));
  const execute = (file: string, args: string[], input: Buffer, cwd = projectRoot) => {
    const result = spawnSync(process.execPath, [file, ...args], { cwd, input, timeout: 30_000, maxBuffer: 32 * 1024 * 1024 });
    if (result.error) throw result.error;
    assert.equal(result.signal, null, spec.id + '/' + scenario.name + ': process terminated by signal');
    return result;
  };
  try {
    const input = stream(scenario.stdin, directory);
    let result;
    let artifact: string | null = null;
    let workspace = projectRoot;
    if (spec.kind === 'tool') {
      workspace = toolWorkspace(projectRoot, scenario, work);
      result = execute(join(workspace, 'bin', spec.tool), scenario.args ?? [], input, workspace);
    } else {
      const config = JSON.parse(readFileSync(join(projectRoot, 'config/bootstrap.json'), 'utf8')) as { compiler: string } | null;
      assert(compilerOverride !== undefined || config !== null, spec.id + ': compiler unavailable; cases are not skipped');
      const output = join(work, 'program.ts');
      const compiled = execute(compilerOverride ?? resolve(projectRoot, config!.compiler), ['compile', resolve(directory, spec.source), output], Buffer.alloc(0));
      if (compiled.status === 0) artifact = sha256(readFileSync(output));
      if (spec.kind === 'compile' && scenario.artifact !== undefined) assert.deepEqual(readFileSync(output), stream(scenario.artifact, directory), 'generated artifact differs');
      if (spec.kind === 'reject') assert(!existsSync(output), 'rejection created an output artifact');
      if (spec.kind === 'reject' || spec.kind === 'compile') result = compiled;
      else {
        assert.equal(compiled.status, 0, compiled.stderr.toString());
        assert.equal(compiled.stderr.length, 0, 'unexpected compiler diagnostics');
        assert.equal(compiled.stdout.length, 0, 'unexpected compiler stdout');
        writeFileSync(join(work, 'package.json'), '{"type":"module"}\n');
        result = execute(output, scenario.args ?? [], input);
      }
    }
    assert.equal(result.status, scenario.exitCode, spec.id + '/' + scenario.name + ': exit status; ' + result.stderr);
    assert.deepEqual(result.stdout, stream(scenario.stdout, directory), spec.id + '/' + scenario.name + ': stdout');
    assert.deepEqual(result.stderr, stream(scenario.stderr, directory), spec.id + '/' + scenario.name + ': stderr');
    if (spec.kind === 'reject') { assert.notEqual(scenario.exitCode, 0); assert.equal(result.stdout.length, 0); }
    for (const file of scenario.files ?? []) assert(existsSync(resolve(workspace, file)), 'missing artifact: ' + file);
    return artifact;
  } finally { rmSync(work, { recursive: true, force: true }); }
}

export function caseIdentity(fixture: Fixture) {
  const base = dirname(fixture.path);
  const spec = fixture.definition;
  const source = spec.kind === 'tool' ? join(root, 'bin', spec.tool) : resolve(base, spec.source);
  return {
    manifest: sha256(readFileSync(fixture.path)),
    source: sha256(readFileSync(source)),
    streams: spec.cases.map(scenario => ({
      name: scenario.name,
      stdin: sha256(stream(scenario.stdin, base)),
      stdout: sha256(stream(scenario.stdout, base)),
      stderr: sha256(stream(scenario.stderr, base)),
      ...(scenario.artifact === undefined ? {} : { artifact: sha256(stream(scenario.artifact, base)) }),
    })),
  };
}
