import { TokenKind, type Token } from '../compiler/types.ts';

/** Format an already-validated token stream. */
export function formatTokens(tokens: Token[]): string {
  const visible = tokens.filter(token => token.kind !== TokenKind.End);
  if (visible.length === 0) return '';
  const shebang = visible[0]?.kind === TokenKind.Shebang ? visible[0]!.text : '';
  const lines: string[] = [];
  const stashed: Token[] = [];
  let current = '';
  let indentation = 0;
  let pendingBreak = false;
  let statementStart = true;
  let previous: Token | undefined;
  let previousCode: Token | undefined;
  let previousUnary = false;

  function newline(): void {
    if (current !== '') {
      lines.push(current);
      current = '';
    }
  }

  function startLine(): void {
    if (current === '') current = '    '.repeat(indentation);
  }

  function maybeBlank(token: Token): void {
    if (previous === undefined || current !== '' || !statementStart) return;
    if (token.text === '}' || token.text === 'else') return;
    if (token.line > previous.line + 1 && lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
  }

  function isComment(token: Token): boolean {
    return token.kind === TokenKind.Comment;
  }

  function nextCode(index: number): Token | undefined {
    for (let cursor = index + 1; cursor < tokens.length; cursor++) {
      const token = tokens[cursor]!;
      if (token.kind !== TokenKind.Comment && token.kind !== TokenKind.End) return token;
    }
    return undefined;
  }

  function stashComment(index: number): boolean {
    const next = nextCode(index);
    if (next === undefined) return false;
    if (next.text === 'else') return previousCode?.text === '}';
    if (next.text === '{') return previousCode !== undefined && ['}', ')', 'else'].includes(previousCode.text);
    return false;
  }

  function emitComment(token: Token): void {
    const text = token.text.trimEnd();
    if (previous !== undefined && token.line === previous.line && current !== '') {
      current += ' ' + text;
      newline();
      pendingBreak = false;
      previous = token;
      return;
    }
    if (pendingBreak) {
      newline();
      pendingBreak = false;
    }
    maybeBlank(token);
    startLine();
    current += text;
    newline();
    previous = token;
  }

  function flushStashed(): void {
    for (const [index, comment] of stashed.entries()) {
      if (index === 0) current += ' ' + comment.text.trimEnd();
      else {
        startLine();
        current += comment.text.trimEnd();
      }
      newline();
      previous = comment;
    }
    stashed.length = 0;
    pendingBreak = false;
  }

  function isWord(token: Token): boolean {
    return token.kind === TokenKind.Identifier || token.kind === TokenKind.Keyword ||
      token.kind === TokenKind.Number || token.kind === TokenKind.Text;
  }

  function isBinary(text: string): boolean {
    return ['=', '+', '-', '==', '!=', '<', '<=', '>', '>=', '&&', '||'].includes(text);
  }

  function unaryMinus(): boolean {
    if (previousCode === undefined) return true;
    return ['(', ',', '=', '+', '-', '==', '!=', '<', '<=', '>', '>=', '&&', '||', '!', 'return', '{', ';']
      .includes(previousCode.text);
  }

  function unarySpace(): boolean {
    if (previousCode === undefined) return false;
    if (previousCode.text === '-') return !previousUnary;
    return ['return', ',', '=', '+', '==', '!=', '<', '<=', '>', '>=', '&&', '||'].includes(previousCode.text);
  }

  function needsSpace(token: Token, unary: boolean): boolean {
    if (current === '' || previousCode === undefined) return false;
    const text = token.text;
    if (previousUnary) return false;
    if (token.text === '!' || (text === '-' && unary)) return unarySpace();
    if (text === '(') {
      if (previousCode.text === '-') return !previousUnary;
      return ['if', 'while', 'return', ',', '=', '+', '==', '!=', '<', '<=', '>', '>=', '&&', '||']
        .includes(previousCode.text);
    }
    if (text === '{' || text === 'else') return true;
    if (text === ')' || text === ',' || text === ';' || text === '}') return false;
    if (isWord(token)) {
      return isWord(previousCode) || previousCode.text === ',' || isBinary(previousCode.text);
    }
    return isBinary(text);
  }

  for (const [index, token] of tokens.entries()) {
    if (token.kind === TokenKind.End || token.kind === TokenKind.Shebang) continue;
    if (isComment(token)) {
      if (stashComment(index)) {
        stashed.push(token);
        continue;
      }
      emitComment(token);
      continue;
    }
    if (token.text === 'else' && previousCode?.text === '}') {
      pendingBreak = false;
      current += ' else';
      previous = token;
      previousCode = token;
      previousUnary = false;
      statementStart = false;
      continue;
    }
    if (pendingBreak) {
      newline();
      pendingBreak = false;
    }
    if (token.text === '}') {
      if (current !== '') newline();
      indentation = Math.max(0, indentation - 1);
      startLine();
      current += '}';
      pendingBreak = true;
      previous = token;
      previousCode = token;
      previousUnary = false;
      statementStart = true;
      continue;
    }
    if (current === '') {
      maybeBlank(token);
      startLine();
    }
    const unary = token.text === '!' || (token.text === '-' && unaryMinus());
    if (needsSpace(token, unary)) current += ' ';
    current += token.text;
    if (token.text === '{') {
      indentation++;
      if (stashed.length > 0) flushStashed();
      else pendingBreak = true;
    } else if (token.text === ';') {
      pendingBreak = true;
      statementStart = true;
    } else {
      pendingBreak = false;
      statementStart = false;
    }
    previous = token;
    previousCode = token;
    previousUnary = unary;
  }
  if (current !== '') lines.push(current);
  const body = lines.length === 0 ? '' : lines.join('\n') + '\n';
  return shebang === '' ? body : shebang + '\n' + body;
}
