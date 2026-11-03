# Tooling direction

Status: source checking and single-file formatting are implemented. Document,
help, and language server commands remain future and are not implemented,
installed aliases, or assigned release versions. Their initial input/output
contracts and focused cases accompany each implementation. They do not add
language syntax.

Existing tools cover compilation, checking, single-file formatting, cases,
bootstrap verification, benchmarks, and releases. See the [README](../README.md)
for current commands. The CLI provides basic usage through `mini --help`; the
editor has syntax highlighting and pairing, without a language server.

## Command contracts

### mini check SOURCE.mini

Status: implemented with the check and cli streams. Repository checking remains
`mini check` and `mini check --docs`. Source checking uses `mini check
SOURCE.mini`; `mini check -` reads standard input. `mini-check` accepts the same
forms.

On success, source checking prints nothing and exits 0. On a Mini source failure,
it prints one compiler diagnostic on standard error and exits 1. The diagnostic
is the compiler's first error and must agree with `mini compile`. A file argument
uses the path as given; standard input uses the display name `<stdin>`. A missing
file or invalid argument is a command error, not a source diagnostic. Checking
never writes a `.mini.ts` file.

The checker accepts exactly one source argument and rejects `--docs` combined
with a source. Empty input is valid. CRLF and tabs follow the compiler's input
behavior. Diagnostics, offsets, and ranges use the
[analysis contract](compiler.md#analysis-interface).

### mini-format / mini fmt

Status: implemented with the format and cli streams. The standalone command is
`mini-format`; the dispatcher form is `mini fmt`.

Its job is consistent indentation, spacing, and line breaks for accepted Mini
syntax. Preserve program meaning, literal values, evaluation order, and `//`
and `///` comment text. Reformatting already formatted source produces identical
bytes.

```text
mini fmt SOURCE.mini
mini fmt -
mini fmt --write SOURCE.mini
mini fmt --check SOURCE.mini
mini-format SOURCE.mini
```

The default writes the formatted source to standard output; `-` reads standard
input. `--write` requires one file and replaces it only after successful
formatting; an unchanged file is left untouched. `--check` writes no source and
reports noncanonical input on standard error as `SOURCE: not formatted` (or
`<stdin>: not formatted`), exiting 1. `--write` and `--check` are mutually
exclusive, and `--write -` is invalid. Successful formatting and writes exit 0.

Invalid source is rejected before any output is written or any file is replaced.
It prints the compiler's first diagnostic on standard error and exits 1. The
formatter initially accepts only compiler-valid input; it does not perform error
recovery. Source paths use `.mini`; standard input has no extension requirement.
The tool does no file discovery and reads no configuration.

Style is fixed for this milestone:

- Four-space indentation, LF line endings, no trailing whitespace, and exactly one
  final LF for nonempty output. Empty or whitespace-only input becomes empty output.
  A comment-only source is nonempty and keeps its comments plus one final LF.
- Statements go on separate lines, blocks keep their braces, and `} else {` stays
  together. Preserve at most one source blank line between constructs; never add
  a blank line.
- Preserve every token's spelling, order, literal bytes, and explicit parentheses.
  Do not add or remove parentheses, statements, or tokens.
- Preserve comment tokens in source order. A comment on the same source line as
  the preceding token stays on that line after one space; other comments go on
  their own line at the current indentation. A comment between `}` and `else` is
  emitted after the opening brace of the else block so `} else {` stays together.
  Trailing whitespace at the end of a comment line is removed with the general
  no-trailing-whitespace rule.
- CRLF input becomes LF output. CR and LF inside text literals are not accepted
  by the compiler; comment tokens exclude their line ending.

For example:

```text
var value=1;// keep
if(value==1){write("ok");}else{write("no");}
```

becomes:

```text
var value = 1; // keep
if (value == 1) {
    write("ok");
} else {
    write("no");
}
```

A file containing only `/// docs` becomes `/// docs` followed by one LF. A
whitespace-only file becomes a zero-byte file.

No line-width setting, project discovery, configuration file, or new comment
syntax is added. Formatter output need not equal the compiler's generated
TypeScript.

### mini-document / mini doc

Status: future and not implemented. A documentation tool. The standalone
command will be `mini-document`; the dispatcher form will be `mini doc`.

Its role is generating reference material from the language's documented source
conventions and declarations. Decide the first useful output format and source
of descriptions before implementation. Mini selects `///` documentation comments;
read these from source or from the compiler's comment-including analysis tokens.
The parser token stream remains comment-free.
Documentation tags, declaration attachment/extraction rules, export visibility,
modules, and annotations remain undecided. This tool does not approve them
implicitly or require richer comment syntax.

Keep reference output deterministic and avoid inventing parameter or result
types where Mini's type contract has not selected them. A website generator,
search service, or publishing system is unnecessary for the initial tool.

### mini-help / mini help

Status: future and not implemented. A help/reference helper. The standalone
command will be `mini-help`; the dispatcher form will be `mini help`.

Its role is finding explanations of commands, language constructs, built-ins,
and diagnostics. Start with concise, deterministic topic lookup over maintained
project material. Unknown topics should give a useful response and an appropriate
status. Command usage remains available through the existing `mini --help`.

The help tool presents explanations; the document tool generates reference
material. Reuse a maintained source of descriptions where practical so the two
do not develop conflicting copies. Network access or an AI service is not a
requirement for this helper.

### mini-lang-server

Status: future and not implemented. The standalone command will be
`mini-lang-server`; no dispatcher spelling is planned for this milestone. It
speaks LSP 3.17 over standard input and standard output.

The server implements `initialize`, `initialized`, `shutdown`, and `exit`. It
advertises full document synchronization with open/close notifications and
whole-document formatting, using UTF-16 positions. It advertises no completion,
hover, symbols, navigation, rename, diagnostics-on-type, range formatting, or
incremental-sync capabilities. Unknown requests receive the protocol error;
unknown notifications are ignored.

Documents are keyed by URI and retain the latest text and version. `didOpen`,
`didChange`, and `didClose` update or remove that state; every change analyzes the
current unsaved text. Diagnostics use the same first compiler error as `mini
check` and `mini compile`. They are pushed with `publishDiagnostics`, carrying
the document version, and are cleared after a fix or close. Results for an older
version are discarded if a newer edit or close has arrived. Documents do not
affect one another, and untitled documents require no file on disk.

Formatting returns one whole-document edit from the same formatter as `mini fmt`.
It returns no edit when the document is already canonical and no edit when the
source is invalid. Style is fixed for this milestone.

Standard output carries only protocol frames. Standard error carries logs and
startup failures. `Content-Length` counts UTF-8 bytes, not characters. The server
supports `--version` for its independent `lsp` stream and otherwise runs until
shutdown.

Keep protocol traffic separate from logs and diagnostics. This service does not
require a new type system, module mechanism, or richer diagnostic model before
the first compiler port.

## Implementation boundaries

Self-hosting remains a requirement for the compiler path only. These tools may
start and remain in direct Node TypeScript. A language server's protocol code,
for example, need not be expressible in the first Mini subset.

After bootstrap replacement, authoritative parsing, checking, and emission
behavior must live in Mini. Tool integration should reuse that behavior through
a deliberate interface rather than preserve a second handwritten compiler.
A future formatter or documenter may need syntax/trivia information that a
direct emitter does not expose. Review that interface when needed; do not build
an AST or persistent compiler service solely for hypothetical tools.

Follow the existing layout: extensionless Node commands in `bin/`, tool
implementations in `tools/`, Mini library source in `std/` when introduced, and
verification sources/manifests/streams in `cases/`. Create files and directories
when implementation begins, without empty placeholders.

Each tool gets its own version stream and annotated release tags when it has a
verified implementation. Future stream names must be registered in the version
registry, release selector, packaging, and checks together; this guide does not
reserve working tags or change the registry. The dispatcher changes under its
own CLI version. See [versioning](versioning.md) and [releases](releases.md).

The [version inventory](versioning.md#current-inventory) also records proposed
stream names. A future playground has its own product version and pins the
compiler/language/library selection used by shared programs. Its delivery is
undecided. Docs and help content identify the versions they describe separately
from the tools that generate or present them.

Implement and verify each tool independently. Useful initial checks are formatter
idempotence and unchanged execution, exact generated documentation/help output,
and a small language-server session with edited source and updated diagnostics.
Tool progress must not delay the [self-hosting target](self-hosting-requirements.md).
