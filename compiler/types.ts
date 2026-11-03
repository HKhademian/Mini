export const TokenKind = {
  Identifier: 'identifier', Keyword: 'keyword', Number: 'number',
  Text: 'text', Symbol: 'symbol', End: 'eof',
} as const;
export type TokenKind = typeof TokenKind[keyof typeof TokenKind];

export const ValueKind = { Number: 'number', Text: 'text', Boolean: 'boolean', Void: 'void' } as const;
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
