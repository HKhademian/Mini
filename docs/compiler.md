# Compiler reference

The compiler is self-hosted. [tools/compiler.mini](../tools/compiler.mini)
is the source and the generated
[dist/compile.js](../dist/compile.js) is the active compiler,
selected by [config/compiler.json](../config/compiler.json). The former
handwritten implementation was retired; only accepted [language](language.md) and
[builtin](builtins.md) contracts are normative.

JavaScript is the default target. An initial C11 target supports top-level
`io_write` calls with ASCII text literals and safe-integer literals, comments,
an entry shebang, and empty programs. Numbers allow one unary minus and the
inclusive range -9007199254740991 through 9007199254740991. Leading zeros are
normalized; negative zero prints `0`. Bindings and arithmetic remain unsupported.
Other forms reject explicitly. The
[C target and embedding direction](c-target-and-embedding.md) tracks later
increments; the script interpreter and embedding API are not implemented yet.

```text
./bin/mini compile --target c cases/native/001-001-write-literal.mini /tmp/mini-hello.c
cc -std=c11 -E /tmp/mini-hello.c -o /tmp/mini-hello.i
cc -std=c11 -Wall -Wextra -Werror /tmp/mini-hello.i -o /tmp/mini-hello
/tmp/mini-hello
./bin/mini test native
```

The sample prints `hello from C` followed by a newline. Without an explicit
output path, C compilation appends `.c` to the source name and writes a matching
`.h` companion. An explicit `test.c` output produces `test.c` and `test.h`;
the default for `test.mini` is `test.mini.c` and `test.mini.h`. `--target js`
retains the default `.js` path. `mini-compile` and `minic` accept the same target
prefix. The compiler produces the source/header pair without invoking `cc`.
Native case execution requires `cc` on PATH. C rejects `--reference` and
`--program-only`, which are JavaScript emission modes.

The Mini-written C emitter first runs shared language validation, then performs
a bounded token walk for the supported slice. It uses tagged text/number values with
growable byte-buffer backing and offset/length text views. Readable C literals
initialize that backing; raw control bytes are escaped without losing their
lengths. This second walk avoids a whole-compiler rewrite;
later features can justify more shared lowering structure. Target rejection
does not create or replace either output file.

### Native build artifacts

Native case builds perform preprocessing immediately before compilation:

```text
test.mini -> test.c + test.h -> test.i -> native executable
```

The shared Mini build helper runs `cc -std=c11 -E test.c -o test.i`, followed by
strict C11 compilation of `test.i`. This is additive: the macro-based source and
header remain untouched, while the `.i` file contains expanded identifiers,
types, initializers, system headers, and source line markers useful for debugging.
No separate preprocessing flag is needed. A failed native case retains its
workspace and prints `Native artifacts: PATH`; successful cases clean up normally.

The generated header contains guarded type declarations, value initializer
macros, and constructor declarations. The `.c` includes it and supplies
function definitions and the current program entry. This is not yet the planned
script-runner embedding API. Static `.a` and shared `.so`/`.dylib`/`.dll` packaging
remain later plan stages; `.dylib` is the macOS suffix.

### Generated C names and values

Generated runtime names use an overridable preprocessor macro:

```c
#ifndef MINI_ID
#define MINI_ID(name) mini_##name
#endif
```

For example, `MINI_ID(value_text)` becomes `mini_value_text`. Define `MINI_ID`
before including the generated source, or through the C toolchain, to choose
another naming style. The default uses no dollar identifiers; no Mini compiler
flag is needed. `main` and C standard-library names keep their required names.

Types are named directly as `MINI_ID(value)`, `MINI_ID(text)`, and
`MINI_ID(value_kind)`, using the same convention as functions, tags, and storage.
There is no separate type-alias macro layer. The anonymous union exposes
`value.text` and `value.number`. `MINI_VALUE_TEXT(buffer, offset, length)` is a
brace initializer that works
in static declarations. Its arguments each occur once. Use a typed cast for
an expression, or call the constructor function:

```c
static MINI_ID(text_buffer) buffer = {0};
static const MINI_ID(value) saved = MINI_VALUE_TEXT(&buffer, 0, 2);
/* Fill buffer before reading the view. */
MINI_ID(value) current = MINI_ID(value_text)(&buffer, 0, 2);
consume((MINI_ID(value)) MINI_VALUE_TEXT(&buffer, 0, 2));
```

These lines assume the generated types and the shown host variables/functions
are available. The constructor function itself returns
`(MINI_ID(value)) MINI_VALUE_TEXT(buffer, offset, length)`: the macro supplies construction;
it does not call the function. This preserves static initialization and gives
runtime callers a function wrapper. Other value factories follow this pattern
when their kinds are implemented. `MINI_ID(number)` is `double`, with a C11
assertion requiring a binary representation with at least 53 bits of precision.
`MINI_VALUE_NUMBER(number)` supports static initializers, and
`MINI_ID(value_number)(number)` is its function wrapper. Number output uses
canonical decimal safe-integer spelling; non-safe numeric payloads supplied by
a C host produce empty output, matching JavaScript's numeric text conversion.
`text_buffer_append` allocates/grows owned storage and copies input bytes into it.
Views retain a buffer-object reference and offsets, so growth does not invalidate
them. The buffer object must stay alive; `text_buffer_free` releases its storage
and resets it, invalidating its views. Current programs keep one buffer for their
invocation and free it on normal completion or output/allocation failure. No
general collector or persistent host-value lifetime is implied.

Run it directly with Node:

```text
./bin/mini compile cases/language/001-001-bindings-initialize.mini
./bin/mini cases/language/001-001-bindings-initialize.mini
./dist/compile.js --reference SOURCE.mini OUTPUT.js
node cases/language/001-001-bindings-initialize.mini.js
./bin/mini compile --tokens cases/language/001-001-bindings-initialize.mini
```

The default output appends `.js` to the complete source name. Generated
`.mini.js` files are ignored by Git; reviewed emission fixtures use `.expected.js`.
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
node COMPILER compile SOURCE.mini OUTPUT.js
node COMPILER metadata
```

`fn_args()` is a language form rather than a host builtin, so it does not appear
in `metadata`. Each generated function binds its own argument list.

`metadata` emits one JSON object listing every builtin name, parameter kind, and
result kind. Tooling hover, completion, and signature text read this command
instead of a separate builtin table.
`tokens --comments` emits token JSON including comment tokens. Default `tokens`
and `mini-compile --tokens` remain comment-free. `compile` writes no standard
output and reports the first failure on standard error in the terminal format
below. A successful compile may also report warnings on standard error; warnings
do not change the exit status or generated code. the language server runs both
commands and returns `{tokens, diagnostics}` through the active compiler.

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

Compiler increments implemented one feature at a time with indexed cases and
verified version tags. Accepted language cases are active; parameter-passing
proposals remain pending and do not count as completed conformance coverage.
The [port history](port-history.md) records the retired handwritten
implementation and its mini replacements.

Verify a candidate against every mini-source case:

```text
./bin/mini compile tools/compiler.mini .cache/compiler.mini.js
./bin/mini test --candidate .cache/compiler.mini.js
```

The candidate check skips tool cases, which continue to use the active CLI; run
`mini test` for those. A filter argument narrows the case IDs.

The generated compiler is plain JavaScript. mini parameter typing is still open: parameters use an
explicit internal `Unknown` kind, and generated functions currently use ordinary
unannotated parameters. This is not a full mini typechecker. Functions are
top-level, may call later definitions, and fall off the end with value 0.

Lists store runtime values. The compiler uses its internal `Unknown` kind for the result
of `list_get`; it does not infer an element kind from preceding mutations.

- `0.1.0-alpha.1`: initialized bindings with text, number, boolean, and
  existing-binding values.

- `0.1.0-alpha.2`: assignment to existing bindings.

- `0.1.0-alpha.3`: the + operator for numbers and text.

- `0.1.0-alpha.4`: io_write(text) to stdout.

- `0.1.0-alpha.5`: io_read_all() through EOF.

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

- `0.1.0-alpha.26`: io_write_error(text) to stderr.

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

- `0.3.0-alpha.5`: `map_copy` returns a shallow map copy; the compiler source
uses it for scope
  copies.

- `0.3.0-alpha.6`: `list_copy` returns a shallow list copy.

- `0.3.0-alpha.7`: `list_join` joins text elements with a separator; the
compiler source uses
  it instead of a separate join helper.

- `0.3.0-alpha.8`: `number_to_text` renders safe integers as canonical decimal
  text; the compiler source uses it instead of the decimal helper.

- `0.3.0-alpha.9`: `json_to_text` serializes values as compact deterministic JSON;
  the compiler source uses it for JSON string quoting while keeping tok
  en field order explicit.

- `0.3.0-alpha.10`: recognize an optional first-line shebang as a `shebang`
  token; generated JavaScript begins with a Node shebang.

- `0.3.0-alpha.11`: `process_run(command, args, mode)` runs one child process
  with captured or inherited standard streams and returns status, signal, and
  output text.

- `0.3.0-alpha.12`: `process_exec_path()`, `path_temp_directory()`, `file_remove()`,
  and `directory_remove()` support tool process setup and cleanup.

The compiler path is self-hosted. The generated `dist/compile.js` is the
only compiler implementation; `config/bootstrap.json` pins it to
`tools/compiler.mini`. Never reintroduce a handwritten compiler to bypass a
bootstrap migration.

## Mini source layout

The compiler source is authored as ordered sources next to the tools;
[tools/compiler.mini](../tools/compiler.mini) includes `common/text.mini`,
`lexer.mini`, `parser.mini`, and `builtins.mini`.
`tools/compiler.mini` includes them in dependency order. Adapter text is
source in the namespace files under `libs/compiler/builtins/`, shared by the generated compiler and
generated tools. `mini check` verifies the generated bootstrap fixed point and
stale generated tools. `include` is a mini language feature; there is no module
or import syntax.
