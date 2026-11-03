import { compile } from './parser.ts';
import { CompilerDiagnostic, tokenize } from './lexer.ts';
import type { Diagnostic, Token } from './types.ts';

export type Analysis = { tokens: Token[]; diagnostics: Diagnostic[] };

/** Analyze text without writing files or running generated code. */
export function analyze(source: string, name: string): Analysis {
  let tokens: Token[] = [];
  try {
    tokens = tokenize(source, name, true);
    compile(tokenize(source, name));
    return { tokens, diagnostics: [] };
  } catch (error) {
    if (error instanceof CompilerDiagnostic) return { tokens, diagnostics: [error.diagnostic] };
    throw error;
  }
}
