import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { adapters } from '../compiler/adapters.ts';
import { root } from './project.ts';

const order: Array<keyof typeof adapters> = [
  'map_runtime', 'map_copy', 'list_copy', 'list_to_text', 'list_get', 'list_set',
  'json_to_text', 'number_to_text', 'process_run', 'text_find', 'text_get', 'text_split', 'text_slice',
];
const variable = (name: keyof typeof adapters) => name === 'map_runtime' ? 'map_runtime' : `${name}_helper`;

/** Return the generated Mini adapter part. */
export function adapterSource(): string {
  return '// Generated from compiler/adapters.ts; do not edit.\n'
    + order.map(name => `var ${variable(name)} = ${JSON.stringify(adapters[name])};`).join('\n') + '\n';
}

if (import.meta.main) {
  const check = process.argv[2] === '--check';
  assert(process.argv.length === (check ? 3 : 2), 'usage: node tools/generate-adapters.ts [--check]');
  const target = join(root, 'compiler/src/00-constants.mini');
  const source = adapterSource();
  if (check) assert.equal(readFileSync(target, 'utf8'), source, 'compiler/src/00-constants.mini is stale; run node tools/generate-adapters.ts');
  else writeFileSync(target, source);
}
