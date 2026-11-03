import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { root, run, sha256, versions } from './project.ts';
import { CaseKind, caseIdentity, loadCase, verifyScenario } from './cases.ts';

type Bootstrap = { compiler: string; source: string; example: string };

export function verifyBootstrap(directory: string) {
  const config = JSON.parse(readFileSync(join(directory, 'config/bootstrap.json'), 'utf8')) as Bootstrap | null;
  assert(config !== null, 'Self-hosted bootstrap unavailable: finish and promote the Mini-written compiler first.');
  const current = versions(directory);
  for (const component of ['language', 'compiler', 'bootstrap'] as const) {
    assert(current[component] !== null, `assign the ${component} version before verifying the bootstrap`);
  }
  for (const key of ['compiler', 'source', 'example'] as const) {
    assert.equal(typeof config[key], 'string', `bootstrap.json needs ${key}`);
  }
  const source = readFileSync(join(directory, config.source));
  const seed = readFileSync(join(directory, config.compiler));
  const work = mkdtempSync(join(tmpdir(), 'minilang-bootstrap-'));
  try {
    writeFileSync(join(work, 'package.json'), '{"type":"module"}\n');
    let previous = join(work, 'compiler0.ts');
    writeFileSync(previous, seed);
    const input = join(work, 'compiler.mini');
    writeFileSync(input, source);
    const generations: string[] = [];
    for (let stage = 1; stage <= 3; stage++) {
      const next = join(work, `compiler${stage}.ts`);
      run(process.execPath, [previous, 'compile', input, next], work);
      const output = readFileSync(next);
      assert(output.equals(seed), `bootstrap differs from generation ${stage}; regenerate and promote the matching compiler`);
      generations.push(sha256(output));
      previous = next;
    }
    const example = loadCase(resolve(directory, config.example));
    assert.equal(example.definition.kind, CaseKind.Example);
    const artifacts = example.definition.cases.map(scenario => verifyScenario(example, scenario, directory, previous));
    return { source: sha256(source), compiler: sha256(seed), generations, example: caseIdentity(example), artifacts };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

if (import.meta.main) console.log(JSON.stringify(verifyBootstrap(root), null, 2));
