# T0 implementation inventory for M1 and T1

Baseline: group 0.2.0, compiler 0.2.0-alpha.4. M1 is the first compiler source
written in Mini. T1 is its generated TypeScript compiler: `T1 = T0(M1)`.
This inventories the five files in
[compiler configuration](../config/compiler.json), not the CLI tools, tests, or
release system. T0 remains frozen; this is a port reference, not a feature list
to add to Mini.

M1 must preserve the compiler's responsibilities, required behavior, and
recognizable implementation structure using Mini functions, maps, lists, and
text helpers.

## First M1 continuity

The first M1 is a close port of T0. Keep the two implementations easy to compare
routine by routine while establishing behavior parity and the fixed point.

- Retain the logical source sections, function responsibilities, and call graph.
  Keep names recognizable; method names can gain a `parser_` or `lexer_` prefix.
- Preserve conditions, branch order, short-circuiting, evaluation order, and
  loop progression. Do not merge checks or move lookups as an optimization.
- Keep function pre-registration, recursive-descent precedence, direct emission,
  and the same points for diagnostics. No new AST or parser architecture is needed.
- Preserve storage roles and named fields: token lists, token/expression maps,
  binding/function tables, membership sets, and parser state. Keep T0's map/set
  lookups at corresponding locations. Avoid packed token rows or parallel arrays.
- Preserve scope-copy boundaries and function-state transitions. Keep locals
  local where Mini permits; introduce explicit shared state only where needed
  to replace captured variables or `this`.
- Adapt unsupported host forms directly: methods become top-level functions,
  object fields become named-key map access, arrays become lists, sets become
  membership maps, and native helpers become small corresponding Mini helpers.
- Keep built-in signature metadata and lowering decisions recognizable. Replace
  callback fields with named functions or a dispatcher because Mini has no
  function values; retain the same built-in cases and output rules.
- Document necessary deviations and their reasons in the relevant inventory
  sections as M1 is implemented. Keep them limited to Mini's available forms
  and reproduced blockers.

Defer redesign, lookup caching, storage changes, and performance refactoring
until parity and the fixed point are established. The
[performance assessment](runtime-performance.md) still applies before promotion;
a reproduced blocker warrants the smallest documented change that preserves
clear correspondence with T0. T0 remains frozen under the existing port policy.

## 1. Source units and entry points

- [types.ts](../compiler/types.ts): named token/value kinds, escape tags, and
  TypeScript shapes for tokens, expressions, and function information.
- [lexer.ts](../compiler/lexer.ts): `tokenize(text, source)` and
  `fail(token, message)`; two nested helpers, `advance()` and `start()`.
- [parser.ts](../compiler/parser.ts): `Parser` and the exported
  `compile(tokens)` wrapper.
- [builtins.ts](../compiler/builtins.ts): nineteen signatures, lowering callbacks,
  required Node imports, and five optional generated adapters.
- [t0.ts](../compiler/t0.ts): argument validation, file loading, dispatch,
  token JSON output, generated-file writing, and error reporting.

M1 can place these responsibilities in one `compiler/compiler.mini` file.
Existing TypeScript imports/exports and file boundaries need no Mini equivalent.

## 2. Named constants and data shapes

T0 uses `as const` objects and derived TypeScript types. M1 can use named
bindings or maps holding the same tag strings.

- Token kinds: `identifier`, `keyword`, `number`, `text`, `symbol`, `eof`.
- Value kinds: `number`, `text`, `boolean`, `list`, `map`, `void`, `unknown`.
- Escape tags: quote, backslash, and the letters `n`, `r`, `t`.

T0's object shapes become maps with these keys:

- Token: `kind`, `text`, `source`, `start`, `end`, `line`, `column`, `context`.
- Expression: `code`, `kind`.
- Function information: `arity`, `result`, `returned`.
- Built-in information: `parameters`, `result`, `imports`, optional `helper`,
  and an `emit` callback.

M1 replaces the `emit` function-valued field with a named dispatcher or top-level
lowering functions. It does not need first-class functions or object methods.

`void` and `unknown` are compiler bookkeeping tags. They are not new Mini values.
An unknown expected built-in parameter accepts any produced value; a known
`void` expression is rejected. An unknown actual kind passes the current shallow
kind checks rather than gaining a new runtime type.

## 3. Lexer state and operations

The lexer holds source text, source name, token list, source-line list, keyword
and escape sets, cursor offset, line, and column.

- Whitespace: space, tab, carriage return, newline.
- Outside text, `//` line comments and `///` documentation comments are skipped
  through CR, LF, or EOF before starting a token. Preserve source positions and
  original diagnostic context. Neither form creates a token or emitted text.
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

T0 uses regex tests, `split`, `slice`, `includes`, `Set.has`, and nested closures
here. M1 can use an explicit lexer-state map, top-level helpers taking that map,
character membership, text slicing, and list append through `list_set`.

## 4. Parser state and complete method inventory

The eight fields are:

- `tokens`: token list; `position`: next-token index.
- `variables`: binding-name to value-kind map.
- `functions`: function-name to function-information map.
- `imports` and `helpers`: membership sets for generated headers.
- `currentFunction`: optional function information.
- `depth`: current brace/block depth.

Use a parser-state map in M1. Replace the optional function object with explicit
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
- Each function must contain a value return somewhere. T0 does not prove every
  path returns, nor infer a consistent result across all paths.
- A call statement may discard a result, so M1 procedure helpers can return zero.

This is the existing partial kind checker. Keep its case-covered behavior during
the port; broader scope/name/type rules remain open. The
[scope-copy workload](../cases/compiler/port-foundation.mini) already implements
the needed shallow map copy in Mini.

## 6. TypeScript mechanisms and their M1 replacements

- `const` / `let`: Mini `var`; retain intended constant use by convention.
- Type aliases, type-only imports, annotations, generics, `readonly`,
  `as const`, optional fields, non-null assertions: implementation typing only.
  Keep runtime tags/data; no matching Mini type syntax is required.
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
- `Map.get/set/has`: the existing Mini map operations.
- `new Map(existing)`: copy entries with `map_keys`, `map_get`, `map_set`.
- `Set.add/has/size`: map entries holding a membership flag.
- Spread of sets into arrays: obtain keys, but choose an explicit output order.
- Template literals and conditional expressions: text concatenation and `if`.
  Numeric line/column/arity interpolation needs an explicit decimal helper;
  Mini does not implicitly concatenate text and numbers.
- Increment/decrement: ordinary addition/subtraction and assignment.
- Compound text accumulation with `+=`: `output = output + text`.
- Strict JS equality: Mini `==` / `!=` already lower to strict comparisons.
- Optional chaining, nullish coalescing, `undefined`, object truthiness:
  explicit bounds, membership checks, and initialized boolean/state fields.
- A default method parameter in `identifier`: pass the message explicitly at
  every M1 call site; optional-argument syntax is unnecessary.
- `throw new Error` / `try...catch` / `assert`: explicit validation and
  `write_error` + `process_exit` for compiler-controlled failures.

T0 also uses ordinary function calls, returns, if/else, while, short-circuit
booleans, comparisons, indexing, addition, subtraction, and mutable locals.
Those are already available in Mini.

## 7. Text, list, and serialization helpers used by T0

- `text.length` and text indexing: `text_length` / `text_get`.
- `slice(start, end)`: a Mini text-copy loop.
- `split(/\r?\n/)`: scan lines, preserving the final empty line and CRLF behavior.
- `replace(/[^\t]/g, " ")`: build the caret prefix, preserving tabs.
- String `includes`: single-character membership.
- Array `includes`: compare complete elements; do not accidentally match across
  boundaries of concatenated operator spellings.
- `map` / `filter` / `join`: loops and concatenation, with explicit separators.
- `Object.values(TextEscape)`: a fixed list/map of accepted escape letters.
- `String(Number(token.text))`: current numeric-literal normalization. Preserve
  the required spelling for the compiler's own literals and emission fixtures;
  broader numeric limits remain open.
- `JSON.stringify(character)`: compact quoted text in unexpected-character errors.
- `JSON.stringify(tokens, null, 2)`: token JSON with two-space indentation,
  stable field order, and a final newline.
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
target TS produced by the compiler, not extra syntax required in M1.

### Text and streams

- `readAll() -> text`: `readFileSync(0, "utf8")`.
- `write(text) -> no result`: `writeSync(1, arg0)`.
- `write_error(text) -> no result`: `writeSync(2, arg0)`.
- `text_length(text) -> number`: `(arg0).length`.
- `text_get(value, number) -> text`: `$mini_text_get(arg0, arg1)` (adapter).

### Lists

- `list_new() -> list`: `[]`.
- `list_length(list) -> number`: `(arg0).length`.
- `list_get(value, number) -> value`: `$mini_list_get(arg0, arg1)` (adapter).
- `list_set(value, number, value) -> no result`: `$mini_list_set(arg0, arg1, arg2)` (adapter).

### Maps

- `map_new() -> map`: `new Map()`.
- `map_has(map, text) -> boolean`: `(arg0).has(arg1)`.
- `map_get(value, text) -> value`: `$mini_map_get(arg0, arg1)` (adapter).
- `map_set(value, text, value) -> no result`: `$mini_map_set(arg0, arg1, arg2)` (adapter).
- `map_length(map) -> number`: `(arg0).size`.
- `map_keys(map) -> list`: `[...(arg0).keys()]`.

### Files and process

- `file_read(text) -> text`: `readFileSync(arg0, "utf8")`.
- `file_write(text, text) -> no result`: `writeFileSync(arg0, arg1, "utf8")`.
- `process_args() -> list`: `process.argv.slice(2)`.
- `process_exit(number) -> no result`: `process.exit(arg0)`.

## 9. Generated host adapters and imports

Five adapters are emitted only when needed, once each. Their current sort order is:

1. `$mini_list_get`: check list target, normalize a negative index, check bounds
   and assigned slot, otherwise return numeric zero.
2. `$mini_list_set`: ignore non-lists; normalize negative indices; ignore an index
   still below zero; assign/grow at a nonnegative index.
3. `$mini_map_get`: ignore non-maps or absent keys by returning zero; otherwise
   return the stored value, preserving false/empty text and collection references.
4. `$mini_map_set`: update only native map targets.
5. `$mini_text_get`: read an in-range character from text, otherwise empty text.

The emitted TS uses `Array.isArray`, `instanceof Map`, `typeof`, property/index
access, `in` for slot presence, ordinary early returns, and native Map methods.
These mechanisms live in target adapter text. Mini does not need these source
constructs to emit that text.

The five implementations in [builtins.ts](../compiler/builtins.ts) are the exact
initial-port reference, including whitespace. Their `$` prefix cannot collide
with Mini identifiers.

The only generated module import is `node:fs`. The finite named imports, sorted
when present, are `readFileSync`, `writeFileSync`, `writeSync`. M1 can keep these
and the five adapter names in fixed ordered lists rather than add general sorting.

## 10. Emission rules that affect fixed-point equality

- Begin every output with `"use strict";` and a newline.
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

The same Mini compiler source must produce identical TS under T0 and T1 for
the first fixed point. Matching execution alone does not establish this.

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

Use the existing rejection fixtures for exact locations/bytes. T0 catches its
own Error/assertion objects and file-operation errors and prints their message.
The initial Mini file-I/O contract covers successful regular-file operations;
a general exception system is not a prerequisite for that path.

## 12. Compiler command interface and host facilities

T0 itself uses:

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
`usage: T0 compile SOURCE.mini [OUTPUT.ts] | tokens SOURCE.mini`.

M1 can use `process_args`, the file primitives, `write`, `write_error`,
`process_exit`, and text helpers. Its single-file program can run the command
entry point last. It does not need Mini imports, export syntax, an assertion
library, or reflection over Error objects.
T0 itself runs directly on Node. It does not use the TypeScript compiler API;
the TypeScript development dependency checks project code outside this path.

## 13. Port boundaries

T0's essential work is scanning, positioned diagnostics, function registration,
recursive parsing, scope/kind bookkeeping, built-in selection, deterministic
emission, and the compiler command interface.

Keep all of that in Mini. The generated Node adapters provide primitives only.
Verification, packaging, the dispatcher, and tests may remain TypeScript. Tests
that import T0 modules directly need adaptation when T0 is retired; that is
tooling integration, not another language feature.

Use this inventory with the [readiness assessment](self-hosting-requirements.md)
and [bootstrap gate](bootstrap.md). The next implementation is M1, compiled into T1.
