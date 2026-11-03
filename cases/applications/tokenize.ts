import { lex_tokenize, type Token } from './lexer.ts';
export function app_run(source: string): Token[] { return lex_tokenize(source); }
