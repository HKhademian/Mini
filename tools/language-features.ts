import { join } from 'node:path';
import { compiler, root, run } from './project.ts';
import { TokenKind, type Token } from '../compiler/types.ts';

export type Position = { line: number; character: number };
export type Range = { start: Position; end: Position };
export type Declaration = {
  name: string;
  kind: 'function' | 'variable';
  signature: string;
  doc: string[];
  token: Token;
};
export type Hover = { contents: { kind: 'markdown'; value: string }; range: Range } | null;
export type CompletionItem = {
  label: string;
  kind: number;
  detail?: string;
  documentation?: { kind: 'markdown'; value: string };
  insertText: string;
};

const CompletionKind = { Function: 3, Variable: 6, Keyword: 14 } as const;

type BuiltinInfo = { parameters: string[]; result: string };
let builtinCache: Map<string, BuiltinInfo> | undefined;

/** Load builtin signatures from the active compiler's metadata command. */
function builtins(): Map<string, BuiltinInfo> {
  if (builtinCache !== undefined) return builtinCache;
  const output = run(process.execPath, [join(root, compiler().entry), 'metadata'], root);
  const parsed = JSON.parse(output.toString()) as { builtins: { name: string; parameters: string[]; result: string }[] };
  builtinCache = new Map(parsed.builtins.map(item => [item.name, { parameters: item.parameters, result: item.result }]));
  return builtinCache;
}
const keywords = ['var', 'fn', 'return', 'if', 'else', 'while', 'true', 'false'];

/** Convert an LSP position to a UTF-16 offset. */
export function offsetAt(text: string, position: Position): number {
  let line = 0;
  let offset = 0;
  while (line < position.line) {
    const newline = text.indexOf('\n', offset);
    if (newline === -1) return text.length;
    offset = newline + 1;
    line++;
  }
  return Math.min(offset + position.character, text.length);
}

function rangeOf(token: Token): Range {
  return {
    start: { line: token.line - 1, character: token.column - 1 },
    end: { line: token.line - 1, character: token.column - 1 + token.text.length },
  };
}

export { rangeOf };

function docAbove(tokens: Token[], index: number): string[] {
  const doc: string[] = [];
  let line = tokens[index]!.line - 1;
  for (let cursor = index - 1; cursor >= 0; cursor--) {
    const token = tokens[cursor]!;
    if (token.kind !== TokenKind.Comment || !token.text.startsWith('///') || token.line !== line) break;
    doc.unshift(token.text.slice(3).trim());
    line--;
  }
  return doc;
}

/** Collect function and variable declarations with their `///` documentation. */
export function declarations(tokens: Token[]): Declaration[] {
  const result: Declaration[] = [];
  for (const [index, token] of tokens.entries()) {
    if (token.kind !== TokenKind.Keyword || (token.text !== 'fn' && token.text !== 'var')) continue;
    const name = tokens[index + 1];
    if (name === undefined || name.kind !== TokenKind.Identifier) continue;
    if (token.text === 'var') {
      result.push({ name: name.text, kind: 'variable', signature: `var ${name.text}`, doc: docAbove(tokens, index), token: name });
      continue;
    }
    const parameters: string[] = [];
    for (let cursor = index + 2; cursor < tokens.length; cursor++) {
      const current = tokens[cursor]!;
      if (current.text === ')') break;
      if (current.kind === TokenKind.Identifier) parameters.push(current.text);
    }
    result.push({
      name: name.text, kind: 'function', signature: `fn ${name.text}(${parameters.join(', ')})`,
      doc: docAbove(tokens, index), token: name,
    });
  }
  return result;
}

function builtinSignature(name: string): string {
  const builtin = builtins().get(name)!;
  const parameters = builtin.parameters.join(', ');
  return `${name}(${parameters}) -> ${builtin.result}`;
}

function markdown(signature: string, doc: string[]): string {
  const code = '```mini\n' + signature + '\n```';
  return doc.length === 0 ? code : code + '\n\n' + doc.join('\n');
}

function tokenAt(tokens: Token[], offset: number): Token | undefined {
  return tokens.find(token => token.kind !== TokenKind.End && token.start <= offset && offset < token.end);
}

/** Return hover content for the identifier at an offset. */
export function hoverAt(tokens: Token[], offset: number): Hover {
  const token = tokenAt(tokens, offset);
  if (token === undefined || token.kind !== TokenKind.Identifier) return null;
  const found = declarations(tokens).filter(item => item.name === token.text).at(-1);
  if (found !== undefined) {
    return { contents: { kind: 'markdown', value: markdown(found.signature, found.doc) }, range: rangeOf(token) };
  }
  if (builtins().has(token.text)) {
    return { contents: { kind: 'markdown', value: markdown(builtinSignature(token.text), []) }, range: rangeOf(token) };
  }
  return null;
}

/** Return the declaration for the identifier at an offset, if it is a document declaration. */
export function definitionAt(tokens: Token[], offset: number): Declaration | null {
  const token = tokenAt(tokens, offset);
  if (token === undefined || token.kind !== TokenKind.Identifier) return null;
  return declarations(tokens).filter(item => item.name === token.text).at(-1) ?? null;
}

function prefixAt(text: string, offset: number): string {
  let start = offset;
  while (start > 0 && /[A-Za-z0-9_]/.test(text[start - 1]!)) start--;
  return text.slice(start, offset);
}

/** Return completion items for the identifier prefix at an offset. */
export function completionsAt(tokens: Token[], text: string, offset: number): CompletionItem[] {
  const token = tokenAt(tokens, offset);
  if (token !== undefined && (token.kind === TokenKind.Comment || token.kind === TokenKind.Text)) return [];
  const prefix = prefixAt(text, offset);
  const items: CompletionItem[] = [];
  const seen = new Set<string>();
  const add = (item: CompletionItem) => {
    if (seen.has(item.label) || !item.label.startsWith(prefix)) return;
    seen.add(item.label);
    items.push(item);
  };
  for (const declaration of declarations(tokens)) {
    add({
      label: declaration.name,
      kind: declaration.kind === 'function' ? CompletionKind.Function : CompletionKind.Variable,
      detail: declaration.signature,
      ...(declaration.doc.length === 0 ? {} : { documentation: { kind: 'markdown', value: declaration.doc.join('\n') } }),
      insertText: declaration.name,
    });
  }
  for (const name of builtins().keys()) {
    add({ label: name, kind: CompletionKind.Function, detail: builtinSignature(name), insertText: name });
  }
  for (const keyword of keywords) {
    add({ label: keyword, kind: CompletionKind.Keyword, insertText: keyword });
  }
  return items;
}
