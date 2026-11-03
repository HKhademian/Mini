import { lex_tokenize } from './lexer.ts';
// Index all identifier token offsets; declarations and references share one posting list.
export function app_run(source: string): Map<string, number[]> {
  const tokens = lex_tokenize(source); const symbols = new Map<string, number[]>(); let position = 0;
  while (position < tokens.length) {
    const token = tokens[position]!;
    if (token.get('kind') === 'identifier') {
      const name = token.get('text') as string;
      if (!symbols.has(name)) symbols.set(name, []);
      const occurrences = symbols.get(name)!; occurrences[occurrences.length] = token.get('start') as number;
    }
    position = position + 1;
  }
  return symbols;
}
