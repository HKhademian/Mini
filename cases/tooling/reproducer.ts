// Synthetic verifier fixture, not a Mini compiler or Mini source.
import { readFileSync } from 'node:fs';
const source = readFileSync(0, 'utf8');
process.stdout.write(source === 'compiler fixture' ? readFileSync(new URL(import.meta.url)) : 'process.stdout.write("fixture\\n");\n');
