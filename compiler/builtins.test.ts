import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { tokenize } from './lexer.ts';
import { compile } from './parser.ts';

type StoredValues = {
  items: Map<string, unknown>;
  fresh: Map<string, unknown>;
  nested: unknown[];
};

test('compiled map assignment replaces values and retains collection references', () => {
  const name = '032-002-map-set-values.mini';
  const source = readFileSync(new URL('../cases/language/' + name, import.meta.url), 'utf8');
  const output = compile(tokenize(source, name));
  const state = runInNewContext(output + '\n({ items, fresh, nested });') as StoredValues;
  assert.equal(state.items.size, 5);
  assert.equal(state.items.get('value'), 'replacement');
  assert.equal(state.items.get('number'), 7);
  assert.equal(state.items.get('boolean'), true);
  assert.equal(state.items.get('list'), state.nested);
  assert.equal(state.items.get('map'), state.fresh);
  assert.equal(state.fresh.size, 0);
  assert.deepEqual([...state.nested], ['nested']);
});
