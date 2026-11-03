import { TextEscape, TokenKind, type Token } from './types.ts';

export function fail(token: Token, message: string): never {
  const indent = token.context.slice(0, token.column - 1).replace(/[^\t]/g, ' ');
  throw new Error(`${token.source}:${token.line}:${token.column}: ${message}\n${token.context}\n${indent}^`);
}

export function tokenize(text: string, source: string): Token[] {
  const tokens: Token[] = [];
  const lines = text.split(/\r?\n/);
  const keywords = new Set(['var', 'fn', 'return', 'if', 'else', 'while', 'true', 'false']);
  const escapes = new Set<string>(Object.values(TextEscape));
  let position = 0;
  let line = 1;
  let column = 1;
  function advance(): string {
    const value = text[position++]!;
    if (value === '\n') { line++; column = 1; }
    else column++;
    return value;
  }
  function start(): Token {
    return { kind: TokenKind.Symbol, text: '', source, start: position, end: position,
      line, column, context: lines[line - 1] ?? '' };
  }
  while (position < text.length) {
    const character = text[position]!;
    if (/[ \t\r\n]/.test(character)) { advance(); continue; }
    const token = start();
    if (/[A-Za-z_]/.test(character)) {
      token.kind = TokenKind.Identifier;
      while (position < text.length && /[A-Za-z_0-9]/.test(text[position]!)) advance();
      if (keywords.has(text.slice(token.start, position))) token.kind = TokenKind.Keyword;
    } else if (/[0-9]/.test(character)) {
      token.kind = TokenKind.Number;
      while (position < text.length && /[0-9]/.test(text[position]!)) advance();
    } else if (character === '"') {
      token.kind = TokenKind.Text;
      advance();
      while (position < text.length && text[position] !== '"') {
        if (text[position] === '\n' || text[position] === '\r') fail(token, 'unterminated text');
        if (text[position] === '\\') {
          const escape = start();
          advance();
          if (position === text.length || !escapes.has(text[position]!)) fail(escape, 'unknown text escape');
        }
        advance();
      }
      if (position === text.length) fail(token, 'unterminated text');
      advance();
    } else if (['==', '!=', '<=', '>=', '&&', '||'].includes(text.slice(position, position + 2))) {
      advance(); advance();
    } else if ('=+-!<>(),;{}'.includes(character)) advance();
    else fail(token, 'unexpected character ' + JSON.stringify(character));
    token.text = text.slice(token.start, position);
    token.end = position;
    tokens.push(token);
  }
  tokens.push({ ...start(), kind: TokenKind.End });
  return tokens;
}
