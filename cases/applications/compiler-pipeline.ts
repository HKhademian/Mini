import { lex_tokenize, type Token } from './lexer.ts';
type State = Map<string, unknown>;
type Value = Map<string, string>;
function parser_value(code: string, kind: string): Value { const value: Value = new Map(); value.set('code', code); value.set('kind', kind); return value; }
function parser_token(state: State): Token { return (state.get('tokens') as Token[])[state.get('position') as number]!; }
function parser_take(state: State): Token { const token = parser_token(state); state.set('position', (state.get('position') as number) + 1); return token; }
function parser_expect(state: State, text: string): number { if (parser_token(state).get('text') !== text) process.exit(1); parser_take(state); return 0; }
function parser_primary(state: State): Value {
  const token = parser_take(state); const text = token.get('text') as string; const kind = token.get('kind') as string;
  if (text === '(') { const value = parser_expression(state); parser_expect(state, ')'); return value; }
  if (kind === 'number' || kind === 'text') return parser_value(text, kind);
  if (text === 'true' || text === 'false') return parser_value(text, 'boolean');
  if (kind === 'identifier' && (state.get('variables') as Map<string, string>).has(text)) return parser_value(text, (state.get('variables') as Map<string, string>).get(text)!);
  process.exit(1);
}
function parser_unary(state: State): Value {
  if (parser_token(state).get('text') === '-') {
    parser_take(state); const value = parser_unary(state); if (value.get('kind') !== 'number') process.exit(1);
    return parser_value('(-' + value.get('code') + ')', 'number');
  }
  return parser_primary(state);
}
function parser_additive(state: State): Value {
  let left = parser_unary(state);
  while (parser_token(state).get('text') === '+' || parser_token(state).get('text') === '-') {
    const operator = parser_take(state).get('text') as string; const right = parser_unary(state);
    if (left.get('kind') !== right.get('kind') || left.get('kind') === 'boolean' || (operator === '-' && left.get('kind') !== 'number')) process.exit(1);
    left = parser_value('(' + left.get('code') + ' ' + operator + ' ' + right.get('code') + ')', left.get('kind')!);
  }
  return left;
}
function parser_expression(state: State): Value {
  let left = parser_additive(state);
  while (parser_token(state).get('text') === '==' || parser_token(state).get('text') === '!=') {
    let operator = parser_take(state).get('text') as string; const right = parser_additive(state);
    if (left.get('kind') !== right.get('kind')) process.exit(1);
    if (operator === '==') operator = '==='; else operator = '!==';
    left = parser_value('(' + left.get('code') + ' ' + operator + ' ' + right.get('code') + ')', 'boolean');
  }
  return left;
}
function parser_scope(outer: Map<string, string>): Map<string, string> {
  const inner = new Map<string, string>(); const keys = [...outer.keys()]; let index = 0;
  while (index < keys.length) { const key = keys[index]!; inner.set(key, outer.get(key)!); index = index + 1; } return inner;
}
function parser_indent(source: string): string {
  let output = ''; let start = true; let index = 0;
  while (index < source.length) {
    const character = source[index]!;
    if (character === '\n') { if (!start) output = output + '\n'; start = true; }
    else { if (start) { output = output + '    '; start = false; } output = output + character; }
    index = index + 1;
  }
  return output;
}
function parser_block(state: State): string {
  parser_expect(state, '{'); const outer = state.get('variables') as Map<string, string>;
  state.set('variables', parser_scope(outer)); let output = '';
  while (parser_token(state).get('text') !== '}') output = output + parser_statement(state);
  parser_expect(state, '}'); state.set('variables', outer); return '{\n' + parser_indent(output) + '}';
}
function parser_statement(state: State): string {
  if (parser_token(state).get('text') === 'if') {
    parser_take(state); parser_expect(state, '('); const condition = parser_expression(state); parser_expect(state, ')');
    if (condition.get('kind') !== 'boolean') process.exit(1);
    let output = 'if (' + condition.get('code') + ') ' + parser_block(state);
    if (parser_token(state).get('text') === 'else') { parser_take(state); output = output + ' else ' + parser_block(state); }
    return output + '\n';
  }
  let name = parser_take(state);
  if (name.get('text') === 'write') {
    parser_expect(state, '('); const value = parser_expression(state); parser_expect(state, ')'); parser_expect(state, ';');
    if (value.get('kind') !== 'text') process.exit(1);
    state.set('uses_write', true); return 'writeSync(1, ' + value.get('code') + ');\n';
  }
  let prefix = '';
  if (name.get('text') === 'var') { name = parser_take(state); prefix = 'let '; }
  else if (!(state.get('variables') as Map<string, string>).has(name.get('text') as string)) process.exit(1);
  if (name.get('kind') !== 'identifier') process.exit(1);
  parser_expect(state, '='); const value = parser_expression(state); parser_expect(state, ';');
  (state.get('variables') as Map<string, string>).set(name.get('text') as string, value.get('kind')!);
  return prefix + name.get('text') + ' = ' + value.get('code') + ';\n';
}
export function app_run(source: string): string {
  const state: State = new Map(); state.set('tokens', lex_tokenize(source)); state.set('position', 0);
  state.set('variables', new Map<string, string>()); state.set('uses_write', false); let output = '';
  while (parser_token(state).get('kind') !== 'eof') output = output + parser_statement(state);
  let imports = ''; if (state.get('uses_write')) imports = 'import { writeSync } from "node:fs";\n';
  return '"use strict";\n' + imports + output;
}
