# Mini parser

The parser is the shared front end for Mini's target backends. Its source is
[`libs/compiler/parser.mini`](../libs/compiler/parser.mini); token production and
include expansion live in [`lexer.mini`](../libs/compiler/lexer.mini). The
parser returns the versioned target-neutral AST described in
[`ast.md`](ast.md).

## Pipeline and input model

The current compiler processes a program eagerly:

```text
source text
  -> complete token list
  -> include-expanded token list
  -> one checked Program AST
  -> target emitter
  -> generated source text
```

The lexer scans a complete source string and stores token maps in a list. Tokens
carry spelling, kind, source identity, half-open offsets, line and column, and
the source line used for diagnostics. The include expander recursively scans
included files and creates a dependency-first token list with canonical file
identity and execution order. The parser consumes that list by an integer
cursor and returns a complete AST in memory. It does not yield tokens or AST
nodes incrementally, and there is no AST stream between the parser and emitter.

This is a hand-written recursive-descent parser, not a parser-combinator library
such as Parsec, `nom`, or Chumsky, and not an incremental concrete-syntax parser
such as Tree-sitter. Statement parsing dispatches on the current token.
Expression parsing uses one recursive-descent function per
precedence level, from logical OR and AND through equality, comparison,
addition/subtraction, unary forms, and primary expressions. Repeated binary
operators at a level are consumed in loops and build left-associated nodes;
groups and unary negation recurse.

Before parsing statements, `parser_new` scans the token list to register
top-level function names and arities. The main pass then builds nodes and checks
bindings, scopes, call names and arities, builtin argument kinds, and expression
kind compatibility. These checks are part of parsing today; there is not yet a
separate semantic-analysis pass over the finished tree. Function signatures are
available before their declarations are visited, while function result kinds
may remain `unknown` when not established by the current checks.

## Diagnostics and limits

Errors use token source locations and stop compilation at the first reported
failure. The parser can also warn about redundant condition parentheses;
`parser_ast_quiet(tokens)` disables those warnings while retaining errors.
Comments are carried only when the lexer was asked to include comment tokens.
Whitespace trivia is not represented in the AST. Formatters therefore retain
the original source and comment-preserving token list beside the tree.

The parser is coupled to Mini's current lexer token maps, builtin registry,
include-expanded file ordering, and language contract. `parser_ast(tokens)` is
the in-memory front-end entry point for an already prepared token list. It does
not read files or expand includes itself.
