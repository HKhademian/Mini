// Optional measurements of the actual handwritten T0. No reference compiler is
// retained or selected by this benchmark after T0's source files are retired.
type Token = { kind: string; text: string; start: number };
const lexer = await import(new URL('../compiler/lexer.ts', import.meta.url).href) as {
  tokenize: (source: string, name: string) => Token[];
};
const parser = await import(new URL('../compiler/parser.ts', import.meta.url).href) as {
  compile: (tokens: Token[]) => string;
};
export function tokenize(source: string): unknown { return lexer.tokenize(source, 'application.mini'); }
export function compile(source: string): string { return parser.compile(lexer.tokenize(source, 'application.mini')); }
export function index(source: string): Map<string, number[]> {
  const result = new Map<string, number[]>();
  for (const token of lexer.tokenize(source, 'application.mini')) {
    if (token.kind === 'identifier') {
      if (!result.has(token.text)) result.set(token.text, []);
      result.get(token.text)!.push(token.start);
    }
  }
  return result;
}
