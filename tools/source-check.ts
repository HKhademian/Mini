import type { Diagnostic } from '../compiler/types.ts';

/** Render one diagnostic with the compiler's terminal format. */
export function renderDiagnostic(source: string, diagnostic: Diagnostic): string {
  const before = source.slice(0, diagnostic.start);
  const line = before.split('\n').length;
  const column = diagnostic.start - before.lastIndexOf('\n');
  const context = source.split(/\r?\n/)[line - 1] ?? '';
  const indent = context.slice(0, column - 1).replace(/[^\t]/g, ' ');
  return `${diagnostic.source}:${line}:${column}: ${diagnostic.message}\n${context}\n${indent}^`;
}
