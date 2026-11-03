// Developer check: run every Mini-source case through a candidate compiler.
// Tool cases stay on the active CLI and are covered by `mini test`.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { CaseKind, loadCases, verifyScenario } from './cases.ts';
import { root } from './project.ts';

export function verifyCandidate(compiler: string, filter = ''): void {
  const override = resolve(compiler);
  let passed = 0;
  let failed = 0;
  let pending = 0;
  let tools = 0;
  for (const fixture of loadCases(filter)) {
    if (fixture.definition.kind === CaseKind.Tool) {
      tools++;
      continue;
    }
    if (fixture.definition.pending !== undefined) {
      pending++;
      continue;
    }
    for (const scenario of fixture.definition.cases) {
      try {
        verifyScenario(fixture, scenario, root, override);
        passed++;
      } catch (error) {
        failed++;
        console.error(`FAIL ${fixture.definition.id}/${scenario.name}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  console.log(`${passed}/${passed + failed} Mini-source scenarios passed`);
  if (pending) console.log(`${pending} cases pending`);
  if (tools) console.log(`${tools} tool cases skipped; run mini test for those`);
  if (failed) process.exitCode = 1;
}

if (import.meta.main) {
  const [compiler, filter, ...extra] = process.argv.slice(2);
  assert(compiler !== undefined && extra.length === 0, 'usage: node tools/candidate.ts COMPILER.ts [FILTER]');
  verifyCandidate(compiler, filter);
}
