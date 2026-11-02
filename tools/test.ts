import { loadCases, verifyScenario } from './cases.ts';

export function testCases(filter = ''): void {
  let failures = 0;
  let count = 0;
  for (const fixture of loadCases(filter)) {
    for (const scenario of fixture.definition.cases) {
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
  if (failures) process.exitCode = 1;
}
