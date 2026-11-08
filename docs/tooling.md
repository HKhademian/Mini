# Tooling direction

Status: source checking, single-file formatting, and language-server diagnostics
and formatting are implemented. Document and help commands remain future and are
not implemented, installed aliases, or assigned release versions. Their initial
input/output contracts and focused cases accompany each implementation. They do
not add language syntax.

Existing tools cover compilation, checking, single-file formatting, language-server
diagnostics and formatting, cases, bootstrap verification, benchmarks, and
releases. See the [README](../README.md) for current commands. The CLI provides
basic usage through `mini --help`; the editor has syntax highlighting and
pairing, and can connect to the standalone language server.
The `mini` dispatcher forwards command arguments to the owning tool. Each tool
consumes its own options and passes remaining program arguments onward. The
compile adapter also supplies a default output path and sets executable mode
for generated scripts with a shebang.

## Command contracts

### mini check SOURCE.mini

Status: implemented with the check and cli streams. Repository checking remains
`mini check` and `mini check --docs` and is a generated mini tool
([tools/check.mini](../tools/check.mini)). Source checking uses `mini check
SOURCE.mini`; `mini check -` reads standard input. `mini-check` accepts the same
forms. Source checking is a generated mini tool
([tools/check-source.mini](../tools/check-source.mini)) composed with compiler
the compiler source through `include`; `--docs` skips strict TypeScript checking.

On success, source checking prints nothing and exits 0. On a mini source failure,
it prints one compiler diagnostic on standard error and exits 1. The diagnostic
is the compiler's first error and must agree with `mini compile`. A file argument
uses the path as given; standard input uses the display name `<stdin>`. A missing
file or invalid argument is a command error, not a source diagnostic. Checking
never writes a `.mini.js` file.

The checker accepts exactly one source argument and rejects `--docs` combined
with a source. Empty input is valid. CRLF and tabs follow the compiler's input
behavior. Diagnostics, offsets, and ranges use the
[analysis contract](compiler.md#analysis-interface).

### mini-format / mini fmt

Status: implemented with the format and cli streams. The standalone command is
`mini-format`; the dispatcher form is `mini fmt`. The command is a generated
mini tool ([tools/format.mini](../tools/format.mini)) composed with compiler
the compiler source through `include`; the language server runs as a generated
mini tool.

Its job is consistent indentation, spacing, and line breaks for accepted mini
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

```mini
value := 1;// keep
if(value==1){io_write("ok");}else{io_write("no");}
```

becomes:

```mini
value := 1; // keep
if value == 1 {
    io_write("ok");
} else {
    io_write("no");
}
```

A file containing only `/// docs` becomes `/// docs` followed by one LF. A
whitespace-only file becomes a zero-byte file.

No line-width setting, project discovery, configuration file, or new comment
syntax is added. Formatter output need not equal the compiler's generated
JavaScript.

### mini-document / mini doc

Status: future and not implemented. A documentation tool. The standalone
command will be `mini-document`; the dispatcher form will be `mini doc`.

Its role is generating reference material from documented source conventions
and declarations. It will read `///` comments from source or comment-including
analysis tokens. A leading doc block is file documentation when a header `//`
comment or an `include` closes the file-doc section before a declaration;
otherwise it documents the next declaration. Blank lines do not create section
boundaries. The parser token stream remains comment-free. The first useful
output format and export visibility remain undecided. This tool does not require
richer comment syntax.

Keep reference output deterministic and avoid inventing parameter or result
types where mini's type contract has not selected them. A website generator,
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

Status: implemented with the lsp stream as a standalone command and a generated
mini tool ([tools/lang-server.mini](../tools/lang-server.mini)). The command is
`mini-lang-server`; no dispatcher spelling is planned for this milestone. It
speaks LSP 3.17 over standard input and standard output.

The server implements `initialize`, `initialized`, `shutdown`, and `exit`. It
advertises full document synchronization with open/close notifications,
whole-document formatting, hover, completion, and go-to-definition, using UTF-16
positions. It advertises no symbols, references, rename, diagnostics-on-type,
range formatting, or incremental-sync capabilities. Unknown requests receive the
protocol error; unknown notifications are ignored.

Hover on a function or variable shows its declaration and the immediately
preceding `///` documentation comments. Blank lines do not break the comment
sequence; an ordinary `//` comment, include, or other token does. Hover on a
builtin shows its signature.
Completion offers document functions and variables, builtins, and the current
keywords (`include`, `fn`, `return`, `if`, `else`, `while`, `true`, `false`),
filtered by the identifier prefix at the cursor. Completion is suppressed inside
comments and text literals. Go-to-definition returns the declaration of a
document function or variable; builtins have no source location and return no
definition. None of these features performs type inference or resolves scopes;
declarations are collected from the current document.

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

## Generated tools

Tool source is mini. Entries live in `tools/`; reusable logic lives in `libs/`
(`libs/common/text.mini`, `libs/tools/cases.mini`, and per-tool libraries such as
`libs/tools/format.mini`); generated artifacts live in `dist/` named by command, for
example `dist/format.js` and `dist/mini.js`, produced from the active compiler
and excluded from the strict TypeScript check.

[tools/mini-tools.json](../tools/mini-tools.json) maps each mini source to its
generated JavaScript file and declares the `bin/` launchers:

```json
{
  "tools": [
    { "source": "tools/check-source.mini", "generated": "dist/check-source.js" }
  ],
  "launchers": [
    { "name": "mini" },
    { "name": "mini-lang-server", "tool": "dist/lang-server.js" }
  ]
}
```

Each tool source declares its dependencies with mini `include` directives, for
example `include "common/text.mini";`. The build helper compiles the
source directly with the tracked bootstrap; include expansion is part of the
compiler.

```text
node dist/build.js           regenerate every generated tool and launcher
node dist/build.js --check   reject stale generated artifacts
node dist/check.js --docs    run repository checks directly
node dist/mini.js check      run through the dispatcher
```

`mini check` rebuilds every manifest entry and fails when a tracked generated
tool differs. A generated tool is self-contained and runs with Node alone.

## Implementation boundaries

Self-hosting remains a requirement for the compiler path only. These tools may
start and remain in direct Node TypeScript. A language server's protocol code,
for example, need not be expressible in the first mini subset.

After bootstrap replacement, authoritative parsing, checking, and emission
behavior must live in mini. Tool integration reuses that behavior through the
active compiler's `tokens --comments` and `compile` commands; the language server
does not import handwritten compiler modules. Builtin signatures for hover/completion
come from the active compiler's `metadata` command.
The compiler now builds a shared AST with source spans and semantic kinds; the
current migration bridge still keeps direct JavaScript rendering in the parser.
AST dumps and LSP analysis can consume this representation as it becomes the
backend contract. A formatter also needs the retained source and token/trivia
stream because the AST does not encode comments or whitespace. No persistent
compiler service is implied by this shared representation.

Follow the existing layout: extensionless Node commands in `bin/`, tool
implementations in `tools/`, mini library source in `std/` when introduced, and
verification sources/manifests/streams in `cases/`. Create files and directories
when implementation begins, without empty placeholders.

Each tool gets its own version stream and annotated release tags when it has a
verified implementation. Future stream names must be registered in the version
registry, release selector, packaging, and checks together; this guide does not
reserve working tags or change the registry. The dispatcher changes under its
own CLI version. See [versioning](versioning.md) and [releases](releases.md).

The [version inventory](versioning.md#current-inventory) also records proposed
stream names. The browser playground is implemented in the showcase under
`site/`; its `play` product stream and version remain unassigned. It pins the
compiler/language/library selection used by shared programs. Docs and help
content identify the versions they describe separately from the tools that
generate or present them.

Implement and verify each tool independently. Useful initial checks are formatter
idempotence and unchanged execution, exact generated documentation/help output,
and a small language-server session with edited source and updated diagnostics.
Tool progress must not delay the [self-hosting target](self-hosting-requirements.md).
