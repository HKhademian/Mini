import { fail } from './lexer.ts';
import { TokenKind, ValueKind, type Token, type Expression } from './types.ts';
import { builtins } from './builtins.ts';

class Parser {
  tokens: Token[];
  position = 0;
  variables = new Map<string, ValueKind>();
  imports = new Set<string>();

  constructor(tokens: Token[]) { this.tokens = tokens; }
  token(): Token { return this.tokens[this.position]!; }
  take(): Token { return this.tokens[this.position++]!; }
  expect(text: string): void {
    if (this.token().text !== text) fail(this.token(), 'expected ' + text);
    this.take();
  }
  identifier(): Token {
    if (this.token().kind !== TokenKind.Identifier) fail(this.token(), 'expected binding name');
    return this.take();
  }
  expression(): Expression {
    let left = this.primary();
    while (this.token().text === '+') {
      const operator = this.take();
      const right = this.primary();
      if (left.kind !== right.kind || (left.kind !== ValueKind.Number && left.kind !== ValueKind.Text)) fail(operator, '+ needs two numbers or two texts');
      left = { code: `(${left.code} + ${right.code})`, kind: left.kind };
    }
    return left;
  }
  primary(): Expression {
    const token = this.take();
    if (token.kind === TokenKind.Number) return { code: String(Number(token.text)), kind: ValueKind.Number };
    if (token.kind === TokenKind.Text) return { code: token.text, kind: ValueKind.Text };
    if (token.text === 'true' || token.text === 'false') return { code: token.text, kind: ValueKind.Boolean };
    if (token.kind === TokenKind.Identifier && this.token().text === '(') return this.call(token);
    if (token.kind === TokenKind.Identifier && this.variables.has(token.text)) {
      return { code: token.text, kind: this.variables.get(token.text)! };
    }
    fail(token, 'expected expression');
  }
  call(name: Token): Expression {
    const builtin = builtins.get(name.text);
    if (!builtin) fail(name, 'unknown function ' + name.text);
    this.expect('(');
    const args: Expression[] = [];
    if (this.token().text !== ')') {
      args.push(this.expression());
      while (this.token().text === ',') { this.take(); args.push(this.expression()); }
    }
    this.expect(')');
    if (args.length !== builtin.parameters.length) {
      fail(name, `expected ${builtin.parameters.length} argument${builtin.parameters.length === 1 ? '' : 's'}`);
    }
    for (const [index, kind] of builtin.parameters.entries()) {
      if (args[index]!.kind !== kind) fail(name, 'expected ' + kind + ' argument');
    }
    for (const dependency of builtin.imports) this.imports.add(dependency);
    return { code: builtin.emit(args.map(arg => arg.code)), kind: builtin.result };
  }
  statement(): string {
    if (this.token().kind === TokenKind.Identifier && this.tokens[this.position + 1]?.text === '(') {
      const value = this.expression();
      this.expect(';');
      return value.code + ';\n';
    }
    if (this.token().text !== 'var') {
      const name = this.identifier();
      if (!this.variables.has(name.text)) fail(name, 'unknown binding ' + name.text);
      this.expect('=');
      const value = this.expression();
      if (value.kind === ValueKind.Void) fail(name, 'expected a value');
      this.expect(';');
      this.variables.set(name.text, value.kind);
      return `${name.text} = ${value.code};\n`;
    }
    this.expect('var');
    const name = this.identifier();
    if (this.token().text !== '=') fail(this.token(), 'expected initializer');
    this.take();
    const value = this.expression();
    if (value.kind === ValueKind.Void) fail(name, 'expected a value');
    this.expect(';');
    this.variables.set(name.text, value.kind);
    return `let ${name.text} = ${value.code};\n`;
  }
  program(): string {
    let output = '';
    while (this.token().kind !== TokenKind.End) output += this.statement();
    const imports = this.imports.size ? `import { ${[...this.imports].sort().join(', ')} } from "node:fs";\n` : '';
    return '"use strict";\n' + imports + output;
  }
}

export function compile(tokens: Token[]): string { return new Parser(tokens).program(); }
