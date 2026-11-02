import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { caseIdentity, loadCases, verifyScenario } from './cases.ts';
import { root, run, sha256, versions } from './project.ts';

export function benchmark(output: string, filter = ''): void {
  const results = [];
  for (const fixture of loadCases(filter).filter(item => item.definition.benchmark !== undefined)) {
    const settings = fixture.definition.benchmark!;
    for (const scenario of fixture.definition.cases) {
      for (let i = 0; i < settings.warmups; i++) verifyScenario(fixture, scenario);
      const samples = [];
      for (let i = 0; i < settings.samples; i++) {
        const start = performance.now();
        verifyScenario(fixture, scenario);
        samples.push(performance.now() - start);
      }
      const sorted = [...samples].sort((a, b) => a - b);
      results.push({ id: fixture.definition.id, scenario: scenario.name, kind: fixture.definition.kind, identity: caseIdentity(fixture), warmups: settings.warmups, milliseconds: samples, medianMilliseconds: sorted[Math.floor(sorted.length / 2)] });
    }
  }
  assert(results.length > 0, 'no benchmark cases selected');
  const config = JSON.parse(readFileSync(join(root, 'config/bootstrap.json'), 'utf8')) as { compiler: string } | null;
  const commit = existsSync(join(root, '.git')) ? run('git', ['rev-parse', 'HEAD'], root).toString().trim() : null;
  const compiler = config === null ? null : sha256(readFileSync(join(root, config.compiler)));
  mkdirSync(dirname(output), { recursive: true });
  assert(!existsSync(output), 'benchmark output already exists; choose a new report path');
  writeFileSync(output, JSON.stringify({ node: process.version, platform: process.platform, architecture: process.arch, commit, versions: versions(root), compiler, scope: 'fresh-process wall time including startup, IO, verification, and compilation for program cases', results }, null, 2) + '\n');
  console.log(`Wrote ${results.length} benchmark results to ${output}`);
}
