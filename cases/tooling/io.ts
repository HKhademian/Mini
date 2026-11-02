import { readFileSync } from 'node:fs';
process.stdout.write(readFileSync(0));
process.stderr.write(process.argv[2] ?? '');
process.exitCode = Number(process.argv[3] ?? '0');
