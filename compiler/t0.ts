import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { analyze } from './analysis.ts';
import { tokenize } from './lexer.ts';
import { compile } from './parser.ts';

if (import.meta.main) {
  try {
    const [command, source, output, ...extra] = process.argv.slice(2);
    if (command === 'analyze') {
      assert(source === undefined && output === undefined && extra.length === 0, 'usage: T0 analyze < REQUEST.json');
      const request = JSON.parse(readFileSync(0, 'utf8')) as unknown;
      assert(typeof request === 'object' && request !== null, 'analyze request must be an object');
      const { source: text, name } = request as { source?: unknown; name?: unknown };
      assert(typeof text === 'string' && typeof name === 'string', 'analyze request needs source and name');
      process.stdout.write(JSON.stringify(analyze(text, name)) + '\n');
    } else {
      assert(source !== undefined && source.endsWith('.mini') && extra.length === 0 && (command === 'compile' || command === 'tokens'),
        'usage: T0 compile SOURCE.mini [OUTPUT.ts] | tokens SOURCE.mini | analyze');
      const tokens = tokenize(readFileSync(source, 'utf8'), basename(source));
      if (command === 'tokens') process.stdout.write(JSON.stringify(tokens, null, 2) + '\n');
      else writeFileSync(output ?? source + '.ts', compile(tokens));
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
