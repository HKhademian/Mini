// Synthetic verifier fixture, not a Mini compiler or Mini source.
import { readFileSync, writeFileSync } from 'node:fs';
const source = readFileSync(process.argv[3]!, 'utf8');
const output = process.argv[4] ?? process.argv[3]!.replace(/\.mini$/, '.ts');
writeFileSync(output, source === 'compiler fixture' ? readFileSync(new URL(import.meta.url)) : 'process.stdout.write("fixture\\n");\n');
