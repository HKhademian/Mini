// Lightweight measurement process. Expected results and test validation stay in the parent.
import { createHash } from 'node:crypto';
import { readFileSync, writeSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

/** Normalize maps and objects identically, including keys such as __proto__. */
export function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value instanceof Map) return Object.fromEntries([...value.entries()]
    .sort(([left], [right]) => String(left).localeCompare(String(right)))
    .map(([key, item]) => [key, canonical(item)]));
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, canonical(item)]));
  return value;
}

export function serialized(value: unknown): string { return JSON.stringify(canonical(value)) + '\n'; }

if (import.meta.main) {
  const [, , mode, modulePath, inputPath, expectedHash, entry = 'app_run'] = process.argv;
  if (mode !== 'cold' && mode !== 'warm') throw new Error('worker mode must be cold or warm');
  const module = await import(pathToFileURL(modulePath!).href) as Record<string, (source: string) => unknown>;
  const source = readFileSync(inputPath!, 'utf8');
  const run = module[entry]!;
  const execute = () => {
    const heapBeforeBytes = process.memoryUsage().heapUsed;
    const cpu = process.cpuUsage(); const start = performance.now();
    const result = run(source);
    const lastCharacter = typeof result === 'string' && result.length ? result.charCodeAt(result.length - 1) : null;
    const applicationWallMs = performance.now() - start;
    const applicationCpu = process.cpuUsage(cpu);
    const heapAfterBytes = process.memoryUsage().heapUsed;
    const applicationPeakRssBytes = process.resourceUsage().maxRSS * 1024;
    const output = serialized(result);
    return { output, metrics: { applicationWallMs, applicationUserCpuMs: applicationCpu.user / 1000,
      applicationSystemCpuMs: applicationCpu.system / 1000, heapBeforeBytes, heapAfterBytes,
      applicationPeakRssBytes, lastCharacter } };
  };
  if (mode === 'cold') {
    const { output, metrics } = execute(); writeSync(1, output);
    const cpu = process.cpuUsage();
    writeSync(2, JSON.stringify({ ...metrics, processUserCpuMs: cpu.user / 1000,
      processSystemCpuMs: cpu.system / 1000, processPeakRssBytes: process.resourceUsage().maxRSS * 1024 }) + '\n');
  } else {
    const verify = (output: string): void => {
      if (createHash('sha256').update(output).digest('hex') !== expectedHash) throw new Error('warm application output mismatch');
    };
    for (let index = 0; index < 3; index++) verify(execute().output);
    const samples = [];
    for (let index = 0; index < 7; index++) { const result = execute(); verify(result.output); samples.push(result.metrics); }
    writeSync(1, JSON.stringify(samples) + '\n');
  }
}
