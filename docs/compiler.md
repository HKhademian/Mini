# T0 compiler reference

T0 is the handwritten TypeScript compiler and the original bootstrap, not the
language specification. Undocumented T0 behavior is an implementation choice and
may change; only accepted language and builtin contracts are normative.

The active compiler is the generated [bootstrap/compiler.ts](../bootstrap/compiler.ts),
selected by [config/compiler.json](../config/compiler.json). T0 remains the
reference implementation and the source of the TypeScript tooling analyzer.

Run it directly with Node:

```text
./bin/mini compile cases/language/001-001-bindings-initialize.mini
node cases/language/001-001-bindings-initialize.mini.ts
./bin/mini compile --tokens cases/language/001-001-bindings-initialize.mini
```

The default output appends `.ts` to the complete source name. Generated
`.mini.ts` files are ignored by Git; reviewed emission fixtures use `.expected.ts`.
An explicit output path still works.

The lexer is the tokenizer: it emits tokens with a source filename, zero-based
start/end offsets, one-based line/column, and source-line context. Diagnostics
show that location, the line, and a caret. A row means a line; tabs count as one
column and remain tabs in the caret prefix. Parsing emits readable TS directly.
The lexer omits `//` and `///` line comments from the default compile token
stream; original locations and context are preserved. Comments add no generated
code. Tool analysis can request a comment-including token stream, as described
below.

## Analysis interface

Tooling uses the active compiler directly:

```text
node COMPILER tokens --comments SOURCE.mini
node COMPILER compile SOURCE.mini OUTPUT.ts
```

`tokens --comments` emits token JSON including comment tokens. Default `tokens`
and `mini-compile --tokens` remain comment-free. `compile` writes no standard
output and reports the first failure on standard error in the terminal format
below. `tools/analysis.ts` runs both commands and returns `{tokens,
diagnostics}`; it does not import T0 modules. The T0 `analyze` command remains in
the reference compiler for tests and historical tooling.

The token list uses the existing shape: `kind`, `text`, `source`, `start`, `end`,
`line`, `column`, and `context`. It is in source order and includes comment
tokens with `kind` `comment`; comment text includes the leading `//` or `///` and
excludes the line ending. The parser never sees comment tokens.

`diagnostics` contains at most the compiler's first error and uses
`{message, source, start, end}`. `message` is the existing compiler message
without the `source:line:column`, source line, and caret prefix; the shared
renderer adds those fields so terminal output remains byte-identical. Source
failures include lexing, parsing, and the existing kind/arity checks. Internal
failures are not diagnostics.

Source positions are zero-based, half-open UTF-16 code-unit ranges `[start, end)`
into the original source. `line` and `column` are one-based; tabs count as one
column. The EOF token has `start === end === source.length`. Lexer failures finalize
the reported range before failing: an unexpected character covers that character,
an unknown escape includes the backslash and offending character (or EOF), and
unterminated text extends to its line terminator or EOF. A zero-width EOF range
is valid.

The terminal renderer keeps the existing format:

```text
SOURCE:LINE:COLUMN: message
context line
caret
```

Analysis uses temporary files but does not alter source files or run generated
code.

T0's completed increments implemented one feature at a time with indexed cases
and verified version tags. T0 feature growth is now frozen for the Mini port.
The first Mini compiler source is [compiler/compiler.mini](../compiler/compiler.mini);
T0 remains selected until the candidate passes performance review and promotion.
The [T0-to-T1 reference](t0-t1-reference.md) inventories its complete implementation
and the Mini replacements. Accepted language cases are active; parameter-passing
proposals remain pending and do not count as completed conformance coverage.

Verify a candidate against every Mini-source case:

```text
./bin/mini compile compiler/compiler.mini .cache/compiler.mini.ts
node tools/candidate.ts .cache/compiler.mini.ts
```

The candidate check skips tool cases, which continue to use the active CLI; run
`mini test` for those. A filter argument narrows the case IDs.

T0 is strict TypeScript. Mini parameter typing is still open: parameters use an
explicit internal `Unknown` kind, and generated functions currently use ordinary
unannotated parameters. This is not a full Mini typechecker. Functions are
top-level, may call later definitions, and require a value return in this increment.

Lists store runtime values. T0 uses its internal `Unknown` kind for the result
of `list_get`; it does not infer an element kind from preceding mutations.

- `0.1.0-alpha.1`: initialized bindings with text, number, boolean, and
  existing-binding values.

- `0.1.0-alpha.2`: assignment to existing bindings.

- `0.1.0-alpha.3`: the + operator for numbers and text.

- `0.1.0-alpha.4`: write(text) to stdout.

- `0.1.0-alpha.5`: readAll() through EOF.

- `0.1.0-alpha.6`: escaped text literals.

- `0.1.0-alpha.7`: named functions, calls, and value returns.

- `0.1.0-alpha.8`: parenthesized expressions.

- `0.1.0-alpha.9`: numeric subtraction.

- `0.1.0-alpha.10`: unary numeric negation.

- `0.1.0-alpha.11`: scalar equality and inequality.

- `0.1.0-alpha.12`: numeric ordering comparisons.

- `0.1.0-alpha.13`: braced if/else conditionals.

- `0.1.0-alpha.14`: boolean negation.

- `0.1.0-alpha.15`: short-circuit conjunction.

- `0.1.0-alpha.16`: short-circuit disjunction.

- `0.1.0-alpha.17`: braced while loops.

- `0.1.0-alpha.18`: text_length(text).

- `0.1.0-alpha.19`: indexed character reads.

- `0.1.0-alpha.20`: file_read(path).

- `0.1.0-alpha.21`: file_write(path, text).

- `0.1.0-alpha.22`: process_args() text-list values.

- `0.1.0-alpha.23`: list_length(items).

- `0.1.0-alpha.24`: indexed list reads.

- `0.1.0-alpha.25`: process_exit(status).

- `0.1.0-alpha.26`: write_error(text) to stderr.

- `0.1.0-alpha.27`: verified source-distribution and preview-release integration.

- `0.1.0-alpha.28`: list_new() creates empty lists.

- `0.1.0-alpha.29`: list_set() grows and updates lists, with negative-index and
  non-list no-ops; lists retain scalar and nested-list values.

- `0.1.0-alpha.30`: map_new() creates empty maps.

- `0.1.0-alpha.31`: map_has(items, key) checks text-key membership.

- `0.1.0-alpha.32`: map_set(items, key, value) inserts/replaces values and ignores
  non-map targets.

- `0.1.0-alpha.33`: introduced unique-key counting, now expressed with key snapshots.

- `0.1.0-alpha.34`: map_keys(items) returns independent key-list snapshots.

- `0.1.0-alpha.35`: map_get(items, key) reads values, with numeric-zero fallbacks.

- `0.2.0-alpha.1` (group 0.2.0): consistent text_get/list_get reader names
  across maintained sources and cases.

- `0.2.0-alpha.2`: text_get returns empty text for unavailable characters.

- `0.2.0-alpha.3`: list_get reads from the end with negative indices and returns
  zero for non-list targets, gaps, and out-of-range positions.

- `0.2.0-alpha.4`: `//` line comments and `///` documentation comments, including
  inline comments, with quoted markers and source positions preserved.

- `0.3.0-alpha.1`: object-backed map lowering; key counts use
  `list_length(map_keys(items))` without per-write bookkeeping.

- `0.3.0-alpha.2`: `text_slice` with clamped, end-exclusive bounds, negative
  bounds from the end, and empty-text fallbacks.

- `0.3.0-alpha.3`: `text_find` returns the first substring position or -1.

- `0.3.0-alpha.4`: `text_split` splits on a literal divider and preserves empty
  fields.

- `0.3.0-alpha.5`: `map_copy` returns a shallow map copy; M1 uses it for scope
  copies.

- `0.3.0-alpha.6`: `list_copy` returns a shallow list copy.

- `0.3.0-alpha.7`: `list_to_text` joins text elements with a separator; M1 uses
  it instead of a separate join helper.

- `0.3.0-alpha.8`: `number_to_text` renders safe integers as canonical decimal
  text; M1 uses it instead of the decimal helper.

- `0.3.0-alpha.9`: `json_to_text` serializes values as compact deterministic JSON;
  M1 uses it for JSON string quoting while keeping token field order explicit.

- `0.3.0-alpha.10`: recognize an optional first-line shebang as a `shebang`
  token; generated TypeScript begins with a Node shebang.

- `0.3.0-alpha.11`: `process_run(command, args, mode)` runs one child process
  with captured or inherited standard streams and returns status, signal, and
  output text.

- `0.3.0-alpha.12`: `process_exec_path()`, `directory_temp()`, `file_remove()`,
  and `directory_remove()` support tool process setup and cleanup.

The compiler path is self-hosted. The generated `bootstrap/compiler.ts` is the
active compiler; `config/bootstrap.json` pins it to `compiler/compiler.mini`.
T0 is retained only as a reference and tooling source. Never revive T0 as the
active compiler to bypass a bootstrap migration.

## M1 source layout

M1 is authored as ordered parts under [compiler/src](../compiler/src/README.md)
and concatenated by the Mini-source build tool `tools/build-m1.mini` into the
canonical `compiler/compiler.mini`. Adapter text is defined once in
`compiler/adapters.ts`, generated into `compiler/src/00-constants.mini`, and
shared by T0 lowering and M1. Its generated TypeScript is tracked as
`tools/build-m1.generated.ts`; `mini check` rejects stale adapter text, generated
TypeScript, or canonical composition. Concatenation is build tooling; Mini still
has no module or import syntax.
