import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import textmate from 'vscode-textmate';
import oniguruma from 'vscode-oniguruma';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const registry = new textmate.Registry({
  onigLib: oniguruma.loadWASM(readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'))).then(() => ({
    createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
    createOnigString: text => new oniguruma.OnigString(text),
  })),
  loadGrammar: async scope => scope === 'source.mini'
    ? textmate.parseRawGrammar(readFileSync(new URL('syntaxes/mini.tmLanguage.json', root), 'utf8'), 'mini.json') : null,
});
const grammar = await registry.loadGrammar('source.mini');
assert.ok(grammar);

function tokenize(source: string) {
  let state = textmate.INITIAL;
  return source.split('\n').map(line => {
    const result = grammar!.tokenizeLine(line, state);
    assert.equal(result.stoppedEarly, false);
    state = result.ruleStack;
    return { line, tokens: result.tokens };
  });
}

function scopes(source: string, needle: string, line = 0) {
  const row = tokenize(source)[line]!;
  const start = row.line.indexOf(needle);
  assert.notEqual(start, -1, needle);
  return row.tokens.find(token => token.startIndex <= start && start < token.endIndex)!.scopes;
}

test('draft preview uses ordinary theme scopes for declarations, calls and control flow', () => {
  const source = readFileSync(new URL('test/preview.mini', root), 'utf8');
  for (const [line, needle, scope] of [
    [0, 'fn', 'storage.type.mini'],
    [0, 'join', 'entity.name.function.mini'],
    [0, 'left', 'variable.other.mini'],
    [1, 'return', 'keyword.control.mini'],
    [4, ':=', 'keyword.operator.mini'],
    [5, '0', 'constant.numeric.mini'],
    [6, 'while', 'keyword.control.mini'],
    [7, 'if', 'keyword.control.mini'],
    [8, 'join', 'entity.name.function.call.mini'],
    [9, 'else', 'keyword.control.mini'],
  ] as const) assert.ok(scopes(source, needle, line + 3).includes(scope), `${needle}: ${scope}`);
});

test('strings shield keywords and calls, handle escaped quotes, and resume after closing', () => {
  const source = String.raw`text := "if join(1) \"while\""; join(text, "");`;
  assert.ok(scopes(source, 'if').includes('string.quoted.double.mini'));
  assert.ok(!scopes(source, 'if').includes('keyword.control.mini'));
  assert.ok(scopes(source, 'join(1)').includes('string.quoted.double.mini'));
  assert.ok(scopes(source, '\\"').includes('constant.character.escape.mini'));
  assert.ok(scopes(source, 'join(text').includes('entity.name.function.call.mini'));
});

test('keyword boundaries and illustrated operators stay distinct', () => {
  for (const name of ['variable', 'fn_name', 'returning', 'if_value', 'elsewhere', 'while1', 'true_value', 'falsehood']) {
    assert.deepEqual(scopes(`${name} = 1;`, name), ['source.mini', 'variable.other.mini']);
  }
  const row = tokenize('= + - == != < <= > >= ! && ||')[0]!;
  const operators = row.tokens.filter(token => token.scopes.includes('keyword.operator.mini'))
    .map(token => row.line.slice(token.startIndex, token.endIndex));
  assert.deepEqual(operators, ['=', '+', '-', '==', '!=', '<', '<=', '>', '>=', '!', '&&', '||']);
  for (const value of ['true', 'false']) {
    assert.ok(scopes(value, value).includes('constant.language.mini'));
  }
  assert.ok(scopes('include "library.mini";', 'include').includes('keyword.control.import.mini'));
  assert.deepEqual(scopes('include_value := 1;', 'include_value'), ['source.mini', 'variable.other.mini']);
  assert.deepEqual(scopes('var := 1;', 'var'), ['source.mini', 'variable.other.mini']);
  for (const name of [
    'readAll', 'write', 'write_error', 'text_length', 'text_get',
    'file_read', 'file_write', 'process_args', 'list_new', 'list_set', 'list_length', 'list_get',
    'map_new', 'map_has', 'map_set', 'map_get', 'map_keys', 'process_exit',
  ]) {
    assert.ok(scopes(`${name}();`, name).includes('entity.name.function.call.mini'));
  }
});

test('accepted text escapes differ from unsupported escapes', () => {
  for (const escape of [String.raw`\"`, String.raw`\\`, String.raw`\n`, String.raw`\r`, String.raw`\t`]) {
    assert.ok(scopes(`"${escape}"`, escape).includes('constant.character.escape.mini'), escape);
  }
  assert.ok(scopes(String.raw`"\q"`, String.raw`\q`).includes('invalid.illegal.escape.mini'));
});

test('line and documentation comments shield code and end at the next line', () => {
  const source = [
    'value := "// ///"; // fn ignored() { "',
    '/// Return the input; fn is documentation here.',
    'fn mine(value) { return value; } /// trailing documentation',
    String.raw`write("escaped \"//");`,
  ].join('\n');
  assert.ok(scopes(source, '// ///').includes('string.quoted.double.mini'));
  assert.ok(!scopes(source, '// ///').some(scope => scope.startsWith('comment.')));
  for (const needle of ['fn ignored', '{']) {
    assert.ok(scopes(source, needle).includes('comment.line.double-slash.mini'));
  }
  assert.ok(!scopes(source, 'fn ignored').includes('storage.type.mini'));
  assert.ok(scopes(source, 'Return', 1).includes('comment.line.documentation.mini'));
  assert.ok(scopes(source, 'mine', 2).includes('entity.name.function.mini'));
  assert.ok(scopes(source, 'trailing', 2).includes('comment.line.documentation.mini'));
  assert.ok(scopes(source, 'write', 3).includes('entity.name.function.call.mini'));
  assert.ok(scopes(source, '//', 3).includes('string.quoted.double.mini'));
  const configuration = JSON.parse(readFileSync(new URL('language-configuration.json', root), 'utf8'));
  assert.deepEqual(configuration.comments, { lineComment: '//' });
});

test('language contribution includes both icons and only packaged resource paths', () => {
  const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  const language = manifest.contributes.languages[0];
  assert.equal(manifest.displayName, 'mini');
  assert.deepEqual(language.aliases, ['mini']);
  assert.deepEqual(language.extensions, ['.mini']);
  assert.equal(manifest.contributes.grammars[0].scopeName, 'source.mini');
  for (const path of [language.configuration, manifest.contributes.grammars[0].path]) {
    JSON.parse(readFileSync(new URL(path, root), 'utf8'));
  }
  for (const path of Object.values(language.icon) as string[]) {
    assert.match(readFileSync(new URL(path, root), 'utf8'), /<svg[^>]+viewBox="0 0 16 16"/);
  }
  assert.equal(manifest.main, './dist/extension.cjs');
  assert.equal(manifest.dependencies, undefined);
  assert.deepEqual(manifest.activationEvents, ['onLanguage:mini']);
  assert.equal(manifest.contributes.configuration.properties['mini.serverPath'].default, '');
  assert.equal(manifest.contributes.configuration.properties['mini.nodePath'].default, 'node');
});
