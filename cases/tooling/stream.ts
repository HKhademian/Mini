import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stream } from '../../tools/cases.ts';
const name = readFileSync(0, 'utf8').trim();
try {
  process.stdout.write(stream(fileURLToPath(new URL(name, import.meta.url))));
} catch {
  process.stderr.write('invalid stream\n');
  process.exitCode = 1;
}
