import { loadCase, loadCases, verifyScenario } from './cases.ts';

export function testCases(filter = '', file?: string): void {
  let failures = 0;
  let count = 0;
  let pending = 0;
  for (const fixture of file === undefined ? loadCases(filter) : [loadCase(file)]) {
    for (const scenario of fixture.definition.cases) {
      if (fixture.definition.pending !== undefined) {
        pending++;
        console.log(`PENDING ${fixture.definition.id}/${scenario.name}: ${fixture.definition.pending}`);
        continue;
      }
      count++;
      try {
        verifyScenario(fixture, scenario);
        console.log(`PASS ${fixture.definition.id}/${scenario.name}`);
      } catch (error) {
        failures++;
        console.error(`FAIL ${fixture.definition.id}/${scenario.name}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  console.log(`${count - failures}/${count} scenarios passed`);
  if (pending) console.log(`${pending} scenarios pending`);
  if (failures || (pending > 0 && (file !== undefined || count === 0))) process.exitCode = 1;
}
