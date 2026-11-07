# Port history (historical)

Status: historical. The handwritten TypeScript compiler and its TypeScript
modules were removed once the generated compiler became the only
implementation. This page records the port mapping and is not a current
interface.

Earlier revisions use short names: T0 for the handwritten compiler, M1 for the
first compiler source written in mini, and T1 for its generated TypeScript
compiler. Elsewhere in the docs, read them as "the handwritten compiler", "the
mini compiler source", and "the generated compiler".

Handwritten source baseline: group 0.3.0, compiler 0.3.0-alpha.1. The first
compiler source written in mini is implemented in
[tools/compiler.mini](../tools/compiler.mini). Its generated TypeScript compiler
is promoted as [dist/compile.js](../dist/compile.js). The inventory covers the
five retired handwritten source files, not the CLI tools, tests, or release
system.

The mini source must preserve the compiler's responsibilities, required
behavior, and recognizable implementation structure using mini functions, maps,
lists, and text helpers.

## First-port continuity

The first port is a close copy of the handwritten compiler. Keep the two
implementations easy to compare
routine by routine while establishing behavior parity and the fixed point.

- Retain the logical source sections, function responsibilities, and call graph.
  Keep names recognizable; method names can gain a `parser_` or `lexer_` prefix.
- Preserve conditions, branch order, short-circuiting, evaluation order, and
  loop progression. Do not merge checks or move lookups as an optimization.
- Keep function pre-registration, recursive-descent precedence, direct emission,
  and the same points for diagnostics. No new AST or parser architecture is needed.
- Preserve storage roles and named fields: token lists, token/expression maps,
  binding/function tables, membership sets, and parser state. Keep the
  handwritten compiler's map/set
  lookups at corresponding locations. Avoid packed token rows or parallel arrays.
- Preserve scope-copy boundaries and function-state transitions. Keep locals
  local where mini permits; introduce explicit shared state only where needed
  to replace captured variables or `this`.
- Adapt unsupported host forms directly: methods become top-level functions,
  object fields become named-key map access, arrays become lists, sets become
  membership maps, and native helpers become small corresponding mini helpers.
- Keep built-in signature metadata and lowering decisions recognizable. Replace
  callback fields with named functions or a dispatcher because mini has no
  function values; retain the same built-in cases and output rules.
- Document necessary deviations and their reasons in the relevant inventory
  sections as the port is implemented. Keep them limited to mini's available forms
  and reproduced blockers.

Defer redesign, lookup caching, storage changes, and performance refactoring
until parity and the fixed point are established. The
[performance assessment](runtime-performance.md) still applies before promotion;
a reproduced blocker warrants the smallest documented change that preserves
clear correspondence with the handwritten compiler. It remains frozen under
the existing port policy.

## 1. Source units and entry points

- `compiler/types.ts`: named token/value kinds, escape tags, and
  TypeScript shapes for tokens, expressions, and function information.
- `compiler/lexer.ts`: `tokenize(text, source)` and
  `lexer_fail(token, message)`; the parser aliases it as `parser_fail`; two nested helpers, `advance()` and `start()`.
- `compiler/parser.ts`: `Parser` and the exported
  `compile(tokens)` wrapper.
- `compiler/builtins.ts`: thirty-one signatures, lowering callbacks,
  required Node imports, and optional generated adapter blocks.
- `compiler/t0.ts`: argument validation, file loading, dispatch,
  token JSON output, generated-file writing, and error reporting.

The mini source can place these responsibilities in `tools/compiler.mini`.
Existing TypeScript imports/exports and file boundaries need no mini equivalent.

## 2. Named constants and data shapes

The handwritten compiler uses `as const` objects and derived TypeScript types. The
mini source can use named
bindings or maps holding the same tag strings.

- Token kinds: `identifier`, `keyword`, `number`, `text`, `symbol`, `comment`,
  `shebang`, `eof`.
- Value kinds: `number`, `text`, `boolean`, `list`, `map`, `void`, `unknown`.
- Escape tags: quote, backslash, and the letters `n`, `r`, `t`.

The handwritten compiler's object shapes become maps with these keys:

- Token: `kind`, `text`, `source`, `start`, `end`, `line`, `column`, `context`.
- Expression: `code`, `kind`.
- Function information: `arity`, `result`, `returned`.
- Built-in information: `parameters`, `result`, `imports`, optional `helper`,
  and an `emit` callback.

The mini source replaces the `emit` function-valued field with a named
dispatcher or top-level
lowering functions. It does not need first-class functions or object methods.

`void` and `unknown` are compiler bookkeeping tags. They are not new mini values.
An unknown expected built-in parameter accepts any produced value; a known
`void` expression is rejected. An unknown actual kind passes the current shallow
kind checks rather than gaining a new runtime type.

## 3. Lexer state and operations

The lexer holds source text, source name, token list, source-line list, keyword
and escape sets, cursor offset, line, and column.

- Whitespace: space, tab, carriage return, newline.
- Outside text, `//` line comments and `///` documentation comments run through
  CR, LF, or EOF. The compile path skips them and creates no token or emitted
  text. Preserve source positions and original diagnostic context. The lexer
  also exposes an `includeComments` mode for tool analysis; that mode appends a
  comment token with the marker, text, and positions. The parser path keeps the
  default comment-free list. The mini source and generated compiler implement
  the mode directly; it must not add
  a general `list_filter` builtin or introduce parser comment filtering.
- Identifier start: ASCII letter or underscore.
- Identifier continuation: ASCII letter, underscore, or decimal digit.
- Numbers: consecutive decimal digits. Signs are separate operator tokens.
- Keywords: `var`, `fn`, `return`, `if`, `else`, `while`, `true`, `false`.
- Text: double quotes; only the five accepted escapes are recognized. Preserve
  the raw quoted token spelling for emitted TS.
- Two-character symbols: `==`, `!=`, `<=`, `>=`, `&&`, `||`.
- Single-character symbols: `= + - ! < > ( ) , ; { }`.
- Unknown characters and malformed text produce positioned diagnostics.
- Append an explicit EOF token with empty text.

`advance()` increments the offset; LF increments the line and resets the column
to 1. Every other character, including tab and CR, increments the column by 1.
Start/end offsets are zero-based and end-exclusive. Lines/columns are one-based.
Contexts come from splitting on LF with an optional preceding CR removed;
a final empty line is retained.

The handwritten compiler uses regex tests, `split`, `slice`, `includes`,
`Set.has`, and nested closures
here. The mini source can use an explicit lexer-state map, top-level helpers
taking that map,
character membership, text slicing, and list append through `list_set`.

## 4. Parser state and complete method inventory

The eight fields are:

- `tokens`: token list; `position`: next-token index.
- `variables`: binding-name to value-kind map.
- `functions`: function-name to function-information map.
- `imports` and `helpers`: membership sets for generated headers.
- `currentFunction`: optional function information.
- `depth`: current brace/block depth.

Use a parser-state map in the mini source. Replace the optional function
object with explicit
function-state data and an `in_function` boolean; no null value is needed.

All constructor/method responsibilities:

- `constructor(tokens)`: pre-scan top-level function names and arities, allowing
  calls before definitions; initialize results as unknown and returned flags false.
- `token()`: inspect the current token.
- `take()`: return the token and advance.
- `expect(text)`: consume required punctuation or report an error.
- `identifier(message)`: require an identifier with a selected diagnostic.
- `expression()`: logical OR.
- `conjunction()`: logical AND.
- `equality()`: scalar equality/inequality, emitting strict TS comparisons.
- `comparison()`: numeric comparisons.
- `additive()`: addition, text concatenation, subtraction.
- `unary()`: recursive boolean negation and numeric negation.
- `primary()`: literals, bindings, calls, and parenthesized expressions.
- `call(name)`: parse arguments; resolve built-ins/functions; check arity/kinds;
  collect headers and emit the call.
- `statement()`: declarations, assignment, call statements, return, if/else,
  while, and top-level function declarations.
- `condition()`: parentheses and boolean-kind checking.
- `block()`: braces, copied binding-kind scope, depth, statements, indentation.
- `functionDeclaration()`: positional parameters, function context, body, and
  presence of a value return.
- `program()`: statements through EOF, then deterministic headers and output.

Expression precedence runs from `expression` through `conjunction`, `equality`,
`comparison`, `additive`, `unary`, and `primary`. Binary levels associate left to
right. `primary` re-enters `expression` for parentheses; `call` parses argument
expressions. These cycles require ordinary direct/mutual recursion.

## 5. Current checking and scope behavior

- Every binding declaration needs an initializer.
- Assignment requires a known binding and replaces its tracked kind.
- Entering a block copies the binding-kind map; leaving restores the outer map.
- A function starts with a copy of visible binding kinds; parameters are unknown.
- Function names/arities are pre-registered, while result information is updated
  as function bodies are parsed.
- All arguments are required, and excess arguments are rejected too.
- Conditions and logical operators require booleans when the kind is known.
- Comparisons/subtraction require numbers; addition allows matching numbers or
  text; equality excludes known collection/no-result kinds.
- Return is allowed only inside a function and must produce a value.
- Each function must contain a value return somewhere. The handwritten
compiler does not prove every
  path returns, nor infer a consistent result across all paths.
- A call statement may discard a result, so mini procedure helpers can return zero.

This is the existing partial kind checker. Keep its case-covered behavior during
the port; broader scope/name/type rules remain open. The
[scope-copy workload](../cases/compiler/port-foundation.mini) already implements
the needed shallow map copy in mini.

## 6. TypeScript mechanisms and their mini replacements

- `const` / `let`: mini `var`; retain intended constant use by convention.
- Type aliases, type-only imports, annotations, generics, `readonly`,
  `as const`, optional fields, non-null assertions: implementation typing only.
  Keep runtime tags/data; no matching mini type syntax is required.
- Class, constructor, methods, `this`, mutable fields: state maps and top-level
  functions with explicit state arguments.
- Nested closures: top-level functions with explicit lexer state.
- Arrow predicates/callbacks: named helpers, direct loops, or dispatch functions.
- Object literals and object spread: allocate/fill maps or use a small copy helper.
- Array literals, tuple entries, indexed access, `push`, `length`: ordinary lists,
  `list_set(items, list_length(items), value)`, `list_get`, `list_length`.
- Array/argument destructuring and rest binding: explicit indexed reads and counts.
- `for` / `for...of` / `entries()` / `continue`: indexed `while` loops and braced
  conditions, keeping cursor advancement explicit.
- `Map.get/set/has`: the existing mini map operations.
- `new Map(existing)`: `map_copy`.
- `Set.add/has/size`: map entries holding a membership flag.
- Spread of sets into arrays: obtain keys, but choose an explicit output order.
- Template literals and conditional expressions: text concatenation and `if`.
  Numeric line/column/arity interpolation uses `number_to_text`;
  mini does not implicitly concatenate text and numbers.
- Increment/decrement: ordinary addition/subtraction and assignment.
- Compound text accumulation with `+=`: `output = output + text`.
- Strict JS equality: mini `==` / `!=` already lower to strict comparisons.
- Optional chaining, nullish coalescing, `undefined`, object truthiness:
  explicit bounds, membership checks, and initialized boolean/state fields.
- A default method parameter in `identifier`: pass the message explicitly at
  every mini call site; optional-argument syntax is unnecessary.
- `throw new Error` / `try...catch` / `assert`: explicit validation and
  `write_error` + `process_exit` for compiler-controlled failures.

The handwritten compiler also uses ordinary function calls, returns, if/else,
while, short-circuit
booleans, comparisons, indexing, addition, subtraction, and mutable locals.
Those are already available in mini.

## 7. Text, list, and serialization helpers used by the handwritten compiler

- Shebang header: a first-line `shebang` token; generated TypeScript uses a
  Node shebang.
- `text.length` and text indexing: `text_length` / `text_get`.
- Substring search: `text_find`.
- `slice(start, end)`: the `text_slice` built-in.
- `split(/\r?\n/)`: `text_split` on LF plus CRLF trimming; preserve the final empty line.
- `replace(/[^\t]/g, " ")`: build the caret prefix, preserving tabs.
- String `includes`: single-character membership.
- Array `includes`: compare complete elements; do not accidentally match across
  boundaries of concatenated operator spellings.
- `map` / `filter`: loops; `join`: `list_join`.
- `Object.values(TextEscape)`: a fixed list/map of accepted escape letters.
- `String(Number(token.text))`: current numeric-literal normalization. mini
  exposes `number_to_text` for canonical safe-integer decimal output; broader
  numeric limits remain open.
- `JSON.stringify(character)`: `json_to_text` for compact quoted text.
- `JSON.stringify(tokens, null, 2)`: token JSON with two-space indentation,
  stable field order, and a final newline. String fields use `json_to_text`;
  field order remains explicit.
- `basename(path)` and `endsWith(".mini")`: small text helpers for supported paths.
- `argv.slice(2)`: already provided by `process_args()`.

The [port-foundation case](../cases/compiler/port-foundation.case.json) exercises
decimal formatting, quoting, slicing, membership, recursion, and map copying.
Keep such helpers in the first compiler file; a std/module system is unnecessary.
Token JSON field order is `kind`, `text`, `source`, `start`, `end`, `line`,
`column`, `context`; enumerate those fields explicitly rather than map key order.

## 8. Complete built-in lowering inventory

The signatures below use `value` for the internal unknown kind and `no result`
for void. `arg0`, `arg1`, and `arg2` mean emitted argument expressions. This is
target TS produced by the compiler, not extra syntax required in the mini source.

### Text and streams

- `io_read_all() -> text`: `readFileSync(0, "utf8")`.
- `io_write(text) -> no result`: `writeSync(1, arg0)`.
- `io_write_error(text) -> no result`: `writeSync(2, arg0)`.
- `text_length(text) -> number`: `(arg0).length`.
- `text_find(text, text) -> number`: `$mini_text_find(arg0, arg1)` (adapter).
- `text_get(value, number) -> text`: `$mini_text_get(arg0, arg1)` (adapter).
- `text_slice(text, number, number) -> text`: `$mini_text_slice(arg0, arg1, arg2)` (adapter).
- `text_split(text, text) -> list`: `$mini_text_split(arg0, arg1)` (adapter).
- `number_to_text(number) -> text`: `$mini_number_to_text(arg0)` (adapter).
- `json_to_text(value) -> text`: `$mini_json_to_text(arg0)` (adapter).

### Lists

- `list_new() -> list`: `[]`.
- `list_copy(list) -> list`: `$mini_list_copy(arg0)` (adapter).
- `list_length(list) -> number`: `(arg0).length`.
- `list_get(value, number) -> value`: `$mini_list_get(arg0, arg1)` (adapter).
- `list_set(value, number, value) -> no result`: `$mini_list_set(arg0, arg1, arg2)` (adapter).
- `list_join(list, text) -> text`: `$mini_list_join(arg0, arg1)` (adapter).

### Maps

- `map_new() -> map`: `({ __proto__: $mini_map_proto })` (shared runtime block).
- `map_has(map, text) -> boolean`: `$mini_map_has(arg0, arg1)` (adapter).
- `map_get(value, text) -> value`: `$mini_map_get(arg0, arg1)` (adapter).
- `map_set(value, text, value) -> no result`: `$mini_map_set(arg0, arg1, arg2)` (adapter).
- `map_keys(map) -> list`: `Object.keys(arg0)`.
- `map_copy(map) -> map`: `$mini_map_copy(arg0)` (adapter).

Count keys with `list_length(map_keys(items))`; no map size counter is maintained.

### Files and process

- `file_read(text) -> text`: `readFileSync(arg0, "utf8")`.
- `file_write(text, text) -> no result`: `writeFileSync(arg0, arg1, "utf8")`.
- `process_args() -> list`: `process.argv.slice(2)`.
- `process_exit(number) -> no result`: `process.exit(arg0)`.
- `process_run(text, list, text) -> map`: `$mini_process_run(arg0, arg1, arg2)`
  (adapter).
- `process_exec_path() -> text`: `process.execPath`.
- `path_temp_directory() -> text`: `$mini_path_temp_directory()` (adapter).
- `file_remove(text) -> no result`: `$mini_file_remove(arg0)` (adapter).
- `directory_remove(text) -> no result`: `$mini_directory_remove(arg0)` (adapter).

## 9. Generated host adapters and imports

The shared map block is emitted once when map construction, lookup, membership,
or mutation is used. It declares an empty prototype and three helpers: get,
has, and set. All mini map values are non-array objects; getters/setters reject
the other mini value kinds. Missing keys return zero while stored values retain
their identity. The prototype has no inherited string keys or `__proto__` setter.
There is no brand, per-map counter, hidden field, or wrapper.

Adapter blocks sort by their emitted text, giving this order when all are used:

1. The shared map block: `$mini_map_proto`, `$mini_map_get`, `$mini_map_has`,
   `$mini_map_set`. The membership helper preserves argument evaluation order.
2. `$mini_directory_remove`: remove an existing empty directory and ignore a
   missing path.
3. `$mini_file_remove`: remove an existing non-directory path and ignore a
   missing path.
4. `$mini_json_to_text`: encode values as compact deterministic JSON, with map
   keys sorted and cycles returning empty text.
5. `$mini_list_copy`: return a shallow array copy or an empty array.
6. `$mini_list_get`: check list target, normalize a negative index, check bounds
   and assigned slot, otherwise return numeric zero.
7. `$mini_list_set`: ignore non-lists; normalize negative indices; ignore an index
   still below zero; assign/grow at a nonnegative index.
8. `$mini_list_join`: join text elements with a separator, treating non-text
   elements as empty text.
9. `$mini_map_copy`: copy own text keys into a fresh map.
10. `$mini_number_to_text`: render a safe integer as canonical decimal text.
11. `$mini_process_run`: run one child process to completion and return status,
    signal, captured output, and a startup error in a fresh map.
12. `$mini_path_temp_directory`: create a fresh empty directory under the host
    temporary directory and return its path.
13. `$mini_text_find`: return the first substring position or -1.
14. `$mini_text_get`: read an in-range character from text, otherwise empty text.
15. `$mini_text_slice`: clamp start/end, normalize negative bounds, and return
    the selected text or empty text for a non-text target or empty range.
16. `$mini_text_split`: split on a literal divider, preserving empty fields.

The emitted TS uses `Array.isArray`, `typeof`, property/index access, `in` for
presence, ordinary early returns, object prototypes, and `Object.keys`.
These mechanisms live in target adapter text. mini does not need these source
constructs to emit that text.

The adapter implementations in `compiler/builtins.ts` are the exact
initial-port reference, including whitespace. Their `$` prefix cannot collide
with mini identifiers.

The only generated module import is `node:fs`. The finite named imports, sorted
when present, are `readFileSync`, `writeFileSync`, `writeSync`. The mini source
can keep these
and the adapter blocks in fixed ordered lists rather than add general sorting.
`process_run`, `path_temp_directory`, `file_remove`, and `directory_remove` reach
`node:child_process`, `node:fs`, and `node:os` through `process.getBuiltinModule`,
so the generated import list stays limited to `node:fs`.

## 10. Emission rules that affect fixed-point equality

- If the source starts with a shebang, begin output with
  `#!/usr/bin/env node` and a newline before `"use strict";`. Sources without a
  shebang keep the existing first line, preserving the fixed point.
- Otherwise begin every output with `"use strict";` and a newline.
- Emit the optional fs import, then sorted adapters, then program statements.
- Imports use comma-space separators and double-quoted `"node:fs"`.
- Declarations use `let`; functions use `function` with unannotated parameters.
- Parameter and argument lists use comma-space separators.
- Binary expressions are parenthesized; unary output is parenthesized too.
- Parenthesized input returns its inner expression code rather than adding
  another wrapper.
- Each statement/function ends with the current emitted newline.
- Blocks use braces and four spaces added to every nonempty output line.
  `filter(line.length > 0)` removes empty lines, not whitespace-only lines.
- Empty blocks still contain the newline between their braces.
- Text literal spelling is retained; numbers pass through host normalization.
- All generated adapter definitions retain their source strings and trailing
  newlines exactly.

The same mini compiler source must produce identical TS under the handwritten
and generated compilers for the first fixed point. Matching execution alone
does not establish this.

## 11. Diagnostics and failure paths

The format is `source:line:column: message`, newline, original line, newline,
caret prefix and `^`. Tabs stay tabs in the prefix; other preceding characters
become spaces. CLI stderr output adds the final newline.

Lexer messages:

- `unterminated text`
- `unknown text escape`
- `unexpected character <compact JSON text>`

Parser/checking messages:

- `expected <punctuation>`
- `expected binding name` / `expected function name` / `expected parameter name`
- `expected expression` / `expected initializer` / `expected a value`
- `unknown binding <name>` / `unknown function <name>`
- `expected <count> argument`, with plural `arguments` except when count is 1
- `expected value argument` / `expected <kind> argument`
- `|| needs booleans` / `&& needs booleans`
- `equality needs matching scalar kinds`
- `comparison needs numbers`
- `- needs two numbers` / `+ needs two numbers or two texts`
- `- needs a number` / `! needs a boolean`
- `condition must be boolean`
- `return outside function`
- `functions must be top-level`
- `T0 functions require a value return`

Use the existing rejection fixtures for exact locations/bytes. The
handwritten compiler catches its
own Error/assertion objects and file-operation errors and prints their message.
The initial mini file-I/O contract covers successful regular-file operations;
a general exception system is not a prerequisite for that path.

## 12. Compiler command interface and host facilities

The handwritten compiler itself uses:

- `import.meta.main` to guard CLI execution.
- `process.argv` and array destructuring/rest to obtain command/source/output.
- `node:assert/strict` to validate the command.
- `node:path.basename` for diagnostic source names.
- `node:fs.readFileSync` / `writeFileSync` with UTF-8.
- `process.stdout.write` for pretty token JSON.
- `console.error`, `instanceof Error`, `error.message`, `String(error)`.
- `process.exitCode = 1` after a caught failure.

Accepted commands are `compile SOURCE.mini [OUTPUT]` and `tokens SOURCE.mini`.
Common validation currently accepts two or three program arguments for either
command; the token branch ignores an optional third argument. Source names must
end in `.mini`. Compilation defaults to the complete source name plus `.ts`.
No output directory is created by the compiler.
Successful compilation is silent on stdout and writes its file only after the
whole compile succeeds. Token mode writes JSON to stdout. Source/usage rejections
write stderr, finish with status 1, and do not create or replace an output file.

The current usage message is
`usage: T0 compile SOURCE.mini [OUTPUT.js] | tokens SOURCE.mini`.

The mini source can use `process_args`, the file primitives, `io_write`,
`io_write_error`,
`process_exit`, and text helpers. Its single-file program can run the command
entry point last. It does not need mini imports, export syntax, an assertion
library, or reflection over Error objects.
The handwritten compiler itself runs directly on Node. It does not use the
TypeScript compiler API;
the TypeScript development dependency checks project code outside this path.

## 13. Port boundaries

The handwritten compiler's essential work is scanning, positioned diagnostics,
function registration,
recursive parsing, scope/kind bookkeeping, built-in selection, deterministic
emission, and the compiler command interface.

Keep all of that in mini. The generated Node adapters provide primitives only.
Verification, packaging, the dispatcher, and tests may remain TypeScript. Tests
that import the handwritten modules directly need adaptation after their
retirement; that is
tooling integration, not another language feature.

Use this inventory with the [readiness assessment](self-hosting-requirements.md)
and [bootstrap gate](bootstrap.md). The mini source is implemented; promotion
and candidate performance evidence are recorded.
