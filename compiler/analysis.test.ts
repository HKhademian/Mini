import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { analyze } from './analysis.ts';
import { tokenize } from './lexer.ts';
import { TokenKind } from './types.ts';

test('valid source analyzes without diagnostics', () => {
  const result = analyze('var value = 1;\nwrite("ok");\n', 'valid.mini');
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.tokens.at(-1)?.kind, TokenKind.End);
});

test('analysis tokens include comments in source order', () => {
  const result = analyze('// leading\nvar value = 1; /// trailing\n', 'comments.mini');
  assert.deepEqual(result.diagnostics, []);
  const comments = result.tokens.filter(token => token.kind === TokenKind.Comment);
  assert.deepEqual(comments.map(comment => comment.text), ['// leading', '/// trailing']);
  assert.deepEqual(comments.map(comment => comment.line), [1, 2]);
});

test('comment-only and comment-separated source remain valid', () => {
  const only = analyze('/// docs', 'only.mini');
  assert.deepEqual(only.diagnostics, []);
  assert.equal(only.tokens[0]?.kind, TokenKind.Comment);
  assert.equal(analyze('fn // between\nname() { return 1; }\nvar value = name();\n', 'between.mini').diagnostics.length, 0);
  assert.equal(analyze('if (true) {\n} // before else\nelse {\n}\n', 'else.mini').diagnostics.length, 0);
});

test('the default tokenizer omits comments while the analysis mode includes them', () => {
  const source = '// comment\nvar value = 1;\n';
  assert.equal(tokenize(source, 'default.mini').some(token => token.kind === TokenKind.Comment), false);
  assert.equal(tokenize(source, 'include.mini', true).some(token => token.kind === TokenKind.Comment), true);
});

test('parser diagnostics carry half-open source ranges', () => {
  const missing = analyze('var value = 1', 'missing.mini').diagnostics[0]!;
  assert.equal(missing.message, 'expected ;');
  assert.equal(missing.start, 13);
  assert.equal(missing.end, 13);

  const unknown = analyze('missing();', 'unknown.mini').diagnostics[0]!;
  assert.equal(unknown.message, 'unknown function missing');
  assert.equal(unknown.start, 0);
  assert.equal(unknown.end, 7);

  const arity = analyze('write();', 'arity.mini').diagnostics[0]!;
  assert.equal(arity.message, 'expected 1 argument');
  assert.equal(arity.start, 0);
  assert.equal(arity.end, 5);
});

test('lexer diagnostics finalize ranges', () => {
  const character = analyze('@', 'character.mini').diagnostics[0]!;
  assert.equal(character.message, 'unexpected character "@"');
  assert.deepEqual([character.start, character.end], [0, 1]);

  const escape = analyze('"\\q"', 'escape.mini').diagnostics[0]!;
  assert.equal(escape.message, 'unknown text escape');
  assert.deepEqual([escape.start, escape.end], [1, 3]);

  const newline = analyze('"a\n', 'newline.mini').diagnostics[0]!;
  assert.equal(newline.message, 'unterminated text');
  assert.deepEqual([newline.start, newline.end], [0, 2]);

  const eof = analyze('"a', 'eof.mini').diagnostics[0]!;
  assert.equal(eof.message, 'unterminated text');
  assert.deepEqual([eof.start, eof.end], [0, 2]);
});

test('CRLF, tabs, and astral text keep UTF-16 offsets', () => {
  const source = 'var text = "😀";\r\n\tvar value = ;\r\n';
  const diagnostic = analyze(source, 'astral.mini').diagnostics[0]!;
  const start = source.lastIndexOf(';');
  assert.equal(diagnostic.message, 'expected expression');
  assert.equal(diagnostic.start, start);
  assert.equal(diagnostic.end, start + 1);
});

test('the compiler analyze command returns one JSON result', () => {
  const entry = fileURLToPath(new URL('./t0.ts', import.meta.url));
  const result = spawnSync(process.execPath, [entry, 'analyze'], {
    input: JSON.stringify({ source: 'var value = 1;\n', name: 'command.mini' }),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const value = JSON.parse(result.stdout) as { tokens: unknown[]; diagnostics: unknown[] };
  assert.ok(Array.isArray(value.tokens));
  assert.deepEqual(value.diagnostics, []);

  const rejected = spawnSync(process.execPath, [entry, 'analyze'], {
    input: JSON.stringify({ source: 'var value = ;\n', name: 'command.mini' }),
    encoding: 'utf8',
  });
  assert.equal(rejected.status, 0, rejected.stderr);
  const failure = JSON.parse(rejected.stdout) as { diagnostics: { message: string }[] };
  assert.equal(failure.diagnostics[0]?.message, 'expected expression');
});
