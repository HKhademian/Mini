# Mini AST

The Mini AST is a separately versioned compiler product. Its current schema is
`0.1.0-alpha.3`, registered as `ast` in
[`config/versions.json`](../config/versions.json) and returned as
`Program.ast_schema_version` by `parser_ast(tokens)`. The schema implementation
and node constructors are in [`libs/compiler/ast.mini`](../libs/compiler/ast.mini);
the parser contract is documented in [`parser.md`](parser.md).

The tree is target-neutral and is shared by the JavaScript and C emitters. It is
currently represented as nested Mini maps and lists, not as a serialized wire
format. `test/ast.test.mini` is the schema smoke test. Keep the schema version
aligned with the registered `ast` product when changing the inspected node
contract.

## Common source fields

Nodes created from source carry:

- `node_kind`: one of the tags below.
- `source`: source identity used by the lexer.
- `file`: canonical file identity after import expansion, or `source` when no
  separate file field was supplied.
- `start` and `end`: half-open source offsets; `line` and `column` are the
  one-based starting location.
- `context`: the source line used for diagnostics when available.
- `file_order`: import execution order when available.

Expression nodes also carry `value_kind`: currently `number`, `text`, `boolean`,
`list`, or `unknown`. Program nodes retain the token list given to the parser.
Tokens retain comments only when lexing requested comments; spaces and line-break
trivia are not stored in the AST.

## Node shapes

- `Program`: `body` in expanded postorder, postorder `files`,
  `main_source`, `has_shebang`, `tokens`, and `ast_schema_version`.
- `Block`: `statements` and `ends_with_return`.
- `Function`: `name`, parameter nodes, `body`, `captures_arguments`,
  `result_kind`, and `has_final_return`. Parameters are `Name` nodes with
  `role: "parameter"`.
- `Return`: expression in `value`.
- `If`: `condition`, `consequent`, and optional `alternate` block or nested `If`.
- `While`: `condition` and `body`.
- `Binding`: `name`, `initializer`, `top_level`, and inferred `value_kind`.
- `Assignment`: `name`, assigned `value`, and inferred `value_kind`.
- `CallStatement`: call expression in `expression`.
- `Literal`: `literal_kind`, source spelling in `raw`, `value`, and
  `value_kind`. Number values are normalized decimal text; boolean values are
  booleans. Text values currently retain their quoted token spelling rather
  than a separately decoded string.
- `Name`: resolved `name` and its current `value_kind`.
- `Call`: `callee`, checked `arguments`, and result `value_kind`.
- `FnArgs`: `captures` and `value_kind: "list"`.
- `Unary`: `operator`, `operand`, and result `value_kind`.
- `Binary`: `operator`, `left`, `right`, and result `value_kind`.
- `Group`: inner `expression` and its `value_kind`.

User calls with fewer arguments than their declaration receive synthetic zero
literal nodes marked with `synthetic: true`. Those nodes use the call name's
source location. Consumers should check `synthetic` before treating a node span
as explicit source syntax.

## Consumers and next checks

The JS and C emitters consume the whole `Program`; neither reparses source. The
LSP, formatter, debugger, and AST dump tools can use the same tree, while
source-preserving tools must also retain original text and trivia. There is not
yet a stable JSON AST dump command or a standalone post-parse verifier.

Useful independent verifier stages to add after parsing are:

1. A schema walk that rejects missing or mistyped required node fields.
2. A span verifier that checks node/token locations against retained source.
3. A semantic consistency verifier for scopes, call metadata, and inferred
   value kinds once those facts are represented explicitly on the tree.
4. Target capability verifiers that report unsupported constructs before
   backend lowering, without putting target rules into the shared AST check.

These are follow-up stages, not behavior currently provided by `parser_ast`.
