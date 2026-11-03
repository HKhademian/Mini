import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze } from './analysis.ts';

if (import.meta.main) {
  try {
    const request = JSON.parse(readFileSync(0, 'utf8')) as unknown;
    assert(typeof request === 'object' && request !== null, 'analyze request must be an object');
    const { source, name } = request as { source?: unknown; name?: unknown };
    assert(typeof source === 'string' && typeof name === 'string', 'analyze request needs source and name');
    process.stdout.write(JSON.stringify(analyze(source, name)) + '\n');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
