import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { compile } from '../compiler/parser.ts';
import { tokenize } from '../compiler/lexer.ts';
import { TokenKind } from '../compiler/types.ts';
import { formatSource } from './format.ts';

function format(source: string, name = 'test.mini'): string {
  const result = formatSource(source, name);
  assert.ok('text' in result, 'unexpected diagnostic: ' + JSON.stringify(result));
  return result.text;
}

function signature(source: string, name = 'test.mini'): string {
  return tokenize(source, name, true).map(token => `${token.kind}:${token.text}`).join('\u0000');
}

const example = 'var value=1;// keep\nif(value==1){write("ok");}else{write("no");}\n';
const canonical = 'var value = 1; // keep\nif (value == 1) {\n    write("ok");\n} else {\n    write("no");\n}\n';

test('formats the documented example', () => {
  assert.equal(format(example), canonical);
});

test('formatting is idempotent', () => {
  assert.equal(format(canonical), canonical);
  assert.equal(format(format(example)), format(example));
});

test('preserves every token, including comments', () => {
  assert.equal(signature(format(example)), signature(example));
  const commented = '/// docs\nvar value=1; // tail\nfn work(a,b){return a+b;}\n';
  assert.equal(signature(format(commented)), signature(commented));
});

test('preserves a first-line shebang', () => {
  const source = '#!/usr/bin/env -S mini run\nvar value=1;\n';
  const expected = '#!/usr/bin/env -S mini run\nvar value = 1;\n';
  assert.equal(format(source), expected);
  assert.equal(format(format(source)), expected);
  assert.equal(signature(format(source)), signature(source));
});

test('empty and whitespace-only input becomes empty', () => {
  assert.equal(format(''), '');
  assert.equal(format(' \n\t\r\n'), '');
});

test('comment-only input keeps its comments and one final newline', () => {
  assert.equal(format('/// only'), '/// only\n');
  assert.equal(format('// a\n\n// b\n'), '// a\n\n// b\n');
});

test('CRLF input becomes LF output', () => {
  assert.equal(format(example.replace(/\n/g, '\r\n')), canonical);
});

test('unary and binary operators keep their spacing', () => {
  assert.equal(format('var a=-1;var b=1+-2;var c=!true;var d=-(1+2);\n'),
    'var a = -1;\nvar b = 1 + -2;\nvar c = !true;\nvar d = -(1 + 2);\n');
});

test('preserves explicit parentheses and evaluation order', () => {
  const source = 'var value=(1+2)+3;\nif((value==6)&&(!false)){write("ok");}\n';
  assert.equal(format(source), 'var value = (1 + 2) + 3;\nif ((value == 6) && (!false)) {\n    write("ok");\n}\n');
});

test('keeps a comment between braces and else inside the else block', () => {
  assert.equal(format('if (true) {\n} // why\nelse {\n}\n'), 'if (true) {\n} else { // why\n}\n');
});

test('removes trailing whitespace from comment lines', () => {
  assert.equal(format('var value = 1;  // tail  \n'), 'var value = 1; // tail\n');
});

test('preserves at most one blank line between constructs', () => {
  assert.equal(format('var a=1;\n\n\n\nvar b=2;\n'), 'var a = 1;\n\nvar b = 2;\n');
  assert.equal(format('var a=1;\nvar b=2;\n'), 'var a = 1;\nvar b = 2;\n');
});

test('invalid source reports the compiler diagnostic instead of text', () => {
  const result = formatSource('var value = ;\n', 'invalid.mini');
  assert.ok('diagnostic' in result);
  assert.equal(result.diagnostic.message, 'expected expression');
  assert.equal(result.diagnostic.source, 'invalid.mini');
});

test('all accepted language fixtures keep their tokens and generated code', () => {
  let checked = 0;
  for (const directory of ['cases/language', 'samples']) {
    for (const file of readdirSync(directory).filter(entry => entry.endsWith('.mini'))) {
      const path = join(directory, file);
      const source = readFileSync(path, 'utf8');
      const result = formatSource(source, path);
      if ('diagnostic' in result) continue;
      assert.equal(signature(result.text, path), signature(source, path), path);
      const formatted = formatSource(result.text, path);
      assert.ok('text' in formatted, path);
      assert.equal(formatted.text, result.text, path);
      assert.equal(compile(tokenize(result.text, path)), compile(tokenize(source, path)), path);
      assert.equal(tokenize(result.text, path, true).filter(token => token.kind === TokenKind.Comment).length,
        tokenize(source, path, true).filter(token => token.kind === TokenKind.Comment).length, path);
      checked++;
    }
  }
  assert.ok(checked > 50, 'expected to format most language fixtures');
});
