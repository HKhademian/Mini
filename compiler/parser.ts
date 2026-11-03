import { fail } from './lexer.ts';
import { TokenKind, ValueKind, type Token, type Expression, type FunctionInfo } from './types.ts';
import { builtins } from './builtins.ts';

class Parser {
  tokens: Token[];
  position = 0;
  variables = new Map<string, ValueKind>();
  imports = new Set<string>();
  functions = new Map<string, FunctionInfo>();
  currentFunction?: FunctionInfo;
  depth = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    let depth = 0;
    for (const [index, token] of tokens.entries()) {
      if (token.text === '{') depth++;
      if (token.text === '}') depth--;
      if (depth !== 0 || token.text !== 'fn' || tokens[index + 1]?.kind !== TokenKind.Identifier) continue;
      let arity = 0;
      for (let cursor = index + 3; cursor < tokens.length && ![')', '{'].includes(tokens[cursor]!.text); cursor++) {
        if (tokens[cursor]!.kind === TokenKind.Identifier) arity++;
      }
      this.functions.set(tokens[index + 1]!.text, { arity, result: ValueKind.Unknown, returned: false });
    }
  }
  token(): Token { return this.tokens[this.position]!; }
  take(): Token { return this.tokens[this.position++]!; }
  expect(text: string): void {
    if (this.token().text !== text) fail(this.token(), 'expected ' + text);
    this.take();
  }
  identifier(message = 'expected binding name'): Token {
    if (this.token().kind !== TokenKind.Identifier) fail(this.token(), message);
    return this.take();
  }
  expression(): Expression {
    let left = this.conjunction();
    while (this.token().text === '||') {
      const operator = this.take();
      const right = this.conjunction();
      if ((left.kind !== ValueKind.Boolean && left.kind !== ValueKind.Unknown) || (right.kind !== ValueKind.Boolean && right.kind !== ValueKind.Unknown)) fail(operator, '|| needs booleans');
      left = { code: `(${left.code} || ${right.code})`, kind: ValueKind.Boolean };
    }
    return left;
  }
  conjunction(): Expression {
    let left = this.equality();
    while (this.token().text === '&&') {
      const operator = this.take();
      const right = this.equality();
      if ((left.kind !== ValueKind.Boolean && left.kind !== ValueKind.Unknown) || (right.kind !== ValueKind.Boolean && right.kind !== ValueKind.Unknown)) fail(operator, '&& needs booleans');
      left = { code: `(${left.code} && ${right.code})`, kind: ValueKind.Boolean };
    }
    return left;
  }
  equality(): Expression {
    let left = this.comparison();
    while (this.token().text === '==' || this.token().text === '!=') {
      const operator = this.take();
      const right = this.comparison();
      if (left.kind === ValueKind.Void || right.kind === ValueKind.Void || (left.kind !== ValueKind.Unknown && right.kind !== ValueKind.Unknown && left.kind !== right.kind)) fail(operator, 'equality needs matching scalar kinds');
      left = { code: `(${left.code} ${operator.text === '==' ? '===' : '!=='} ${right.code})`, kind: ValueKind.Boolean };
    }
    return left;
  }
  comparison(): Expression {
    let left = this.additive();
    while (['<', '<=', '>', '>='].includes(this.token().text)) {
      const operator = this.take();
      const right = this.additive();
      if ((left.kind !== ValueKind.Number && left.kind !== ValueKind.Unknown) || (right.kind !== ValueKind.Number && right.kind !== ValueKind.Unknown)) fail(operator, 'comparison needs numbers');
      left = { code: `(${left.code} ${operator.text} ${right.code})`, kind: ValueKind.Boolean };
    }
    return left;
  }
  additive(): Expression {
    let left = this.unary();
    while (this.token().text === '+' || this.token().text === '-') {
      const operator = this.take();
      const right = this.unary();
      const allowed = (kind: ValueKind) => kind === ValueKind.Number || kind === ValueKind.Text || kind === ValueKind.Unknown;
      if (operator.text === '-') {
        if ((left.kind !== ValueKind.Number && left.kind !== ValueKind.Unknown) || (right.kind !== ValueKind.Number && right.kind !== ValueKind.Unknown)) fail(operator, '- needs two numbers');
      } else if (!allowed(left.kind) || !allowed(right.kind) || (left.kind !== ValueKind.Unknown && right.kind !== ValueKind.Unknown && left.kind !== right.kind)) fail(operator, '+ needs two numbers or two texts');
      left = { code: `(${left.code} ${operator.text} ${right.code})`, kind: left.kind === ValueKind.Unknown ? right.kind : left.kind };
    }
    return left;
  }
  unary(): Expression {
    if (this.token().text === '-' || this.token().text === '!') {
      const operator = this.take();
      const value = this.unary();
      const kind = operator.text === '-' ? ValueKind.Number : ValueKind.Boolean;
      if (value.kind !== kind && value.kind !== ValueKind.Unknown) fail(operator, operator.text + ' needs a ' + kind);
      return { code: `(${operator.text}${value.code})`, kind };
    }
    return this.primary();
  }
  primary(): Expression {
    const token = this.take();
    if (token.text === '(') {
      const value = this.expression();
      this.expect(')');
      return value;
    }
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
    const user = this.functions.get(name.text);
    if (!builtin && !user) fail(name, 'unknown function ' + name.text);
    this.expect('(');
    const args: Expression[] = [];
    if (this.token().text !== ')') {
      args.push(this.expression());
      while (this.token().text === ',') { this.take(); args.push(this.expression()); }
    }
    this.expect(')');
    const arity = builtin ? builtin.parameters.length : user!.arity;
    if (args.length !== arity) {
      fail(name, `expected ${arity} argument${arity === 1 ? '' : 's'}`);
    }
    if (!builtin) return { code: `${name.text}(${args.map(arg => arg.code).join(', ')})`, kind: user!.result };
    for (const [index, kind] of builtin.parameters.entries()) {
      if (args[index]!.kind !== ValueKind.Unknown && args[index]!.kind !== kind) fail(name, 'expected ' + kind + ' argument');
    }
    for (const dependency of builtin.imports) this.imports.add(dependency);
    return { code: builtin.emit(args.map(arg => arg.code)), kind: builtin.result };
  }
  statement(): string {
    if (this.token().text === 'if') {
      this.take();
      this.expect('(');
      const start = this.token();
      const condition = this.expression();
      if (condition.kind !== ValueKind.Boolean && condition.kind !== ValueKind.Unknown) fail(start, 'condition must be boolean');
      this.expect(')');
      let output = `if (${condition.code}) ${this.block()}`;
      if (this.token().text === 'else') { this.take(); output += ' else ' + this.block(); }
      return output + '\n';
    }
    if (this.token().text === 'fn') return this.functionDeclaration();
    if (this.token().text === 'return') {
      const token = this.take();
      if (!this.currentFunction) fail(token, 'return outside function');
      const value = this.expression();
      if (value.kind === ValueKind.Void) fail(token, 'expected a value');
      this.expect(';');
      this.currentFunction.result = value.kind;
      this.currentFunction.returned = true;
      return `return ${value.code};\n`;
    }
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
  block(): string {
    this.expect('{');
    const outer = this.variables;
    this.variables = new Map(outer);
    this.depth++;
    let output = '';
    while (this.token().text !== '}' && this.token().kind !== TokenKind.End) output += this.statement();
    this.expect('}');
    this.depth--;
    this.variables = outer;
    const indented = output.split('\n').filter(line => line.length > 0).map(line => '    ' + line).join('\n');
    return '{\n' + (indented ? indented + '\n' : '') + '}';
  }
  functionDeclaration(): string {
    const token = this.take();
    if (this.depth !== 0) fail(token, 'functions must be top-level');
    const name = this.identifier('expected function name');
    this.expect('(');
    const parameters: string[] = [];
    if (this.token().text !== ')') {
      parameters.push(this.identifier('expected parameter name').text);
      while (this.token().text === ',') { this.take(); parameters.push(this.identifier('expected parameter name').text); }
    }
    this.expect(')');
    const info = this.functions.get(name.text)!;
    this.currentFunction = info;
    const outer = this.variables;
    this.variables = new Map(outer);
    for (const parameter of parameters) this.variables.set(parameter, ValueKind.Unknown);
    const body = this.block();
    this.variables = outer;
    this.currentFunction = undefined;
    if (!info.returned) fail(name, 'T0 functions require a value return');
    return `function ${name.text}(${parameters.join(', ')}) ${body}\n`;
  }
  program(): string {
    let output = '';
    while (this.token().kind !== TokenKind.End) output += this.statement();
    const imports = this.imports.size ? `import { ${[...this.imports].sort().join(', ')} } from "node:fs";\n` : '';
    return '"use strict";\n' + imports + output;
  }
}

export function compile(tokens: Token[]): string { return new Parser(tokens).program(); }
