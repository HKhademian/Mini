// Handwritten map-based scanner: same helpers, conditions, calls, fields, and traversal.
export type Token = Map<string, string | number>;
type State = Map<string, string | number>;
function lex_contains(choices: string, character: string): boolean {
  let index = 0; while (index < choices.length) { if (choices[index] === character) return true; index = index + 1; } return false;
}
function lex_slice(source: string, start: number, end: number): string {
  let output = ''; let position = start; while (position < end && position < source.length) { output = output + source[position]; position = position + 1; } return output;
}
function lex_lines(source: string): string[] {
  const lines: string[] = []; let line = ''; let position = 0;
  while (position <= source.length) {
    const character = source[position] ?? '';
    if (character === '\n' || character === '') {
      if (line[line.length - 1] === '\r' && character === '\n') line = lex_slice(line, 0, line.length - 1);
      lines[lines.length] = line; line = '';
    } else line = line + character;
    position = position + 1;
  }
  return lines;
}
function lex_advance(state: State): string {
  const character = (state.get('source') as string)[state.get('position') as number] ?? '';
  state.set('position', (state.get('position') as number) + 1);
  if (character === '\n') { state.set('line', (state.get('line') as number) + 1); state.set('column', 1); }
  else state.set('column', (state.get('column') as number) + 1);
  return character;
}
function lex_start(state: State, lines: string[]): Token {
  const token: Token = new Map();
  token.set('kind', 'symbol'); token.set('text', ''); token.set('source', 'application.mini');
  token.set('start', state.get('position')!); token.set('end', state.get('position')!);
  token.set('line', state.get('line')!); token.set('column', state.get('column')!);
  token.set('context', lines[(state.get('line') as number) - 1]!); return token;
}
export function lex_tokenize(source: string): Token[] {
  const tokens: Token[] = []; const lines = lex_lines(source); const keywords = new Map<string, boolean>();
  keywords.set('var', true); keywords.set('fn', true); keywords.set('return', true); keywords.set('if', true);
  keywords.set('else', true); keywords.set('while', true); keywords.set('true', true); keywords.set('false', true);
  const state: State = new Map(); state.set('source', source); state.set('position', 0); state.set('line', 1); state.set('column', 1);
  while ((state.get('position') as number) < source.length) {
    const character = source[state.get('position') as number]!; let skipped = false;
    if (lex_contains(' \t\r\n', character)) { lex_advance(state); skipped = true; }
    else if (character === '/' && source[(state.get('position') as number) + 1] === '/') {
      while ((state.get('position') as number) < source.length && source[state.get('position') as number] !== '\r' && source[state.get('position') as number] !== '\n') lex_advance(state);
      skipped = true;
    }
    if (!skipped) {
      const token = lex_start(state, lines);
      if (lex_contains('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_', character)) {
        token.set('kind', 'identifier');
        while ((state.get('position') as number) < source.length && lex_contains('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789', source[state.get('position') as number]!)) lex_advance(state);
        if (keywords.has(lex_slice(source, token.get('start') as number, state.get('position') as number))) token.set('kind', 'keyword');
      } else if (lex_contains('0123456789', character)) {
        token.set('kind', 'number');
        while ((state.get('position') as number) < source.length && lex_contains('0123456789', source[state.get('position') as number]!)) lex_advance(state);
      } else if (character === '"') {
        token.set('kind', 'text'); lex_advance(state);
        while ((state.get('position') as number) < source.length && source[state.get('position') as number] !== '"') {
          const current = source[state.get('position') as number]!;
          if (current === '\n' || current === '\r') process.exit(1);
          if (current === '\\') { lex_advance(state); if (!lex_contains('"\\nrt', source[state.get('position') as number] ?? '')) process.exit(1); }
          lex_advance(state);
        }
        if (state.get('position') === source.length) process.exit(1);
        lex_advance(state);
      } else {
        const pair = lex_slice(source, state.get('position') as number, (state.get('position') as number) + 2);
        if (pair === '==' || pair === '!=' || pair === '<=' || pair === '>=' || pair === '&&' || pair === '||') { lex_advance(state); lex_advance(state); }
        else { if (!lex_contains('=+-!<>(),;{}', character)) process.exit(1); lex_advance(state); }
      }
      token.set('text', lex_slice(source, token.get('start') as number, state.get('position') as number));
      token.set('end', state.get('position')!); tokens[tokens.length] = token;
    }
  }
  const end = lex_start(state, lines); end.set('kind', 'eof'); tokens[tokens.length] = end; return tokens;
}
