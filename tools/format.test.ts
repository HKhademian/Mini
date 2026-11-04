import assert from 'node:assert/strict';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import type { Token } from '../compiler/types.ts';
import { compiler, root, run } from './project.ts';

const tool = join(root, 'bin/mini-format');
const work = mkdtempSync(join(tmpdir(), 'mini-format-test-'));
const entry = join(root, compiler().entry);
after(() => rmSync(work, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }));

function runTool(args: string[]): SpawnSyncReturns<string> {
  const result = spawnSync(process.execPath, [tool, ...args], { cwd: root, encoding: 'utf8' });
  if (result.error) throw result.error;
  return result;
}

function format(source: string, name = 'test.mini'): string {
  const file = join(work, name);
  writeFileSync(file, source);
  const result = runTool([file]);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

function tokensOf(file: string): Token[] {
  return JSON.parse(run(process.execPath, [entry, 'tokens', '--comments', file], root).toString()) as Token[];
}

function signature(tokens: Token[]): string {
  return tokens.map(token => `${token.kind}:${token.text}`).join('\u0000');
}

function compiled(file: string): string {
  const output = join(work, 'program.ts');
  run(process.execPath, [entry, 'compile', file, output], root);
  return readFileSync(output, 'utf8');
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

test('preserves a first-line shebang', () => {
  const source = '#!/usr/bin/env -S mini run\nvar value=1;\n';
  const expected = '#!/usr/bin/env -S mini run\nvar value = 1;\n';
  assert.equal(format(source), expected);
  assert.equal(format(format(source)), expected);
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

test('--check reports noncanonical input without writing', () => {
  const result = runTool(['--check', 'cases/tooling/format-unformatted.mini']);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, 'cases/tooling/format-unformatted.mini: not formatted\n');
});

test('invalid source reports the compiler diagnostic instead of text', () => {
  const result = runTool(['cases/tooling/format-invalid.mini']);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr,
    'cases/tooling/format-invalid.mini:1:13: expected expression\nvar value = ;\n            ^\n');
});

test('samples keep tokens and generated code', () => {
  let checked = 0;
  for (const name of readdirSync(join(root, 'samples')).filter(entry => entry.endsWith('.mini')).sort()) {
    const source = readFileSync(join(root, 'samples', name), 'utf8');
    const original = join(work, name);
    const formatted = join(work, `formatted-${name}`);
    writeFileSync(original, source);
    const output = runTool([original]);
    assert.equal(output.status, 0, name + ': ' + output.stderr);
    writeFileSync(formatted, output.stdout);
    const originalTokens = tokensOf(original);
    const formattedTokens = tokensOf(formatted);
    assert.equal(signature(formattedTokens), signature(originalTokens), name + ': tokens');
    assert.equal(compiled(formatted), compiled(original), name + ': generated code');
    assert.equal(runTool([formatted]).stdout, output.stdout, name + ': idempotence');
    checked++;
  }
  assert.ok(checked > 15, 'expected to format the samples');
});
