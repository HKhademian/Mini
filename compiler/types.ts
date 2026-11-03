export const TokenKind = {
  Identifier: 'identifier', Keyword: 'keyword', Number: 'number',
  Text: 'text', Symbol: 'symbol', End: 'eof',
} as const;
export type TokenKind = typeof TokenKind[keyof typeof TokenKind];

export const TextEscape = { Quote: '"', Backslash: '\\', Newline: 'n', Return: 'r', Tab: 't' } as const;

export const ValueKind = { Number: 'number', Text: 'text', Boolean: 'boolean', Void: 'void', Unknown: 'unknown' } as const;
export type ValueKind = typeof ValueKind[keyof typeof ValueKind];

export type Token = {
  kind: TokenKind;
  text: string;
  source: string;
  start: number;
  end: number;
  line: number;
  column: number;
  context: string;
};
export type Expression = { code: string; kind: ValueKind };
export type FunctionInfo = { arity: number; result: ValueKind; returned: boolean };
