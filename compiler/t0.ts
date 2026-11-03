import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { tokenize } from './lexer.ts';
import { compile } from './parser.ts';

if (import.meta.main) {
  try {
    const [command, source, output, ...extra] = process.argv.slice(2);
    assert(source !== undefined && source.endsWith('.mini') && extra.length === 0 && (command === 'compile' || command === 'tokens'),
      'usage: T0 compile SOURCE.mini [OUTPUT.ts] | tokens SOURCE.mini');
    const tokens = tokenize(readFileSync(source, 'utf8'), basename(source));
    if (command === 'tokens') process.stdout.write(JSON.stringify(tokens, null, 2) + '\n');
    else writeFileSync(output ?? source + '.ts', compile(tokens));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
