import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { tokenize } from './lexer.ts';
import { compile } from './parser.ts';

type StoredValues = {
  fresh: unknown;
  nested: unknown[];
  count: number;
  value: unknown;
  number: unknown;
  boolean: unknown;
  list: unknown;
  map: unknown;
  freshCount: number;
};

test('compiled map assignment replaces values and retains collection references', () => {
  const name = '032-002-map-set-values.mini';
  const source = readFileSync(new URL('../cases/language/' + name, import.meta.url), 'utf8');
  const observations = '\nvar count = list_length(map_keys(items));\n'
    + 'var value = map_get(items, "value");\nvar number = map_get(items, "number");\n'
    + 'var boolean = map_get(items, "boolean");\nvar list = map_get(items, "list");\n'
    + 'var map = map_get(items, "map");\nvar freshCount = list_length(map_keys(fresh));\n';
  const output = compile(tokenize(source + observations, name));
  const state = runInNewContext(output + '\n({ fresh, nested, count, value, number, boolean, list, map, freshCount });') as StoredValues;
  assert.equal(state.count, 5);
  assert.equal(state.value, 'replacement');
  assert.equal(state.number, 7);
  assert.equal(state.boolean, true);
  assert.equal(state.list, state.nested);
  assert.equal(state.map, state.fresh);
  assert.equal(state.freshCount, 0);
  assert.deepEqual([...state.nested], ['nested']);
});
