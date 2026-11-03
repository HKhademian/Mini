# Tooling direction

Status: future tooling names and responsibilities. The commands in the next
section are not implemented, installed aliases, or assigned release versions.
Their initial input/output contracts and focused cases must accompany each
implementation. They do not add language syntax.

Existing tools cover compilation, checking, cases, bootstrap verification,
benchmarks, and releases. See the [README](../README.md) for current commands.
The CLI currently provides basic usage through `mini --help`; the editor has
syntax highlighting and pairing, without a language server.

## Future commands

### mini-format / mini fmt

A source formatter. The standalone command will be `mini-format`; the dispatcher
form will be `mini fmt`.

Its initial job is consistent indentation, spacing, and line breaks for accepted
Mini syntax. Preserve program meaning, literal values, and evaluation order.
Preserve comments once a comment form exists. Reformatting already formatted
source should produce identical bytes.

Decide file versus stdin input, stdout versus in-place output, newline policy,
invalid-source behavior, and any check-only mode in the first implementation
review. Avoid project-wide discovery/configuration before a single-file tool
works. Formatter output need not equal the compiler's generated TypeScript.

### mini-document / mini doc

A documentation tool. The standalone command will be `mini-document`; the
dispatcher form will be `mini doc`.

Its role is generating reference material from the language's documented source
conventions and declarations. Decide the first useful output format and source
of descriptions before implementation. Mini does not yet select documentation
comments, export visibility, modules, or annotations; this tool does not approve
any of them implicitly. A declaration listing can be a smaller starting point
if that is useful without new language forms.

Keep reference output deterministic and avoid inventing parameter or result
types where Mini's type contract has not selected them. A website generator,
search service, or publishing system is unnecessary for the initial tool.

### mini-help / mini help

A help/reference helper. The standalone command will be `mini-help`; the
dispatcher form will be `mini help`.

Its role is finding explanations of commands, language constructs, built-ins,
and diagnostics. Start with concise, deterministic topic lookup over maintained
project material. Unknown topics should give a useful response and an appropriate
status. Command usage remains available through the existing `mini --help`.

The help tool presents explanations; the document tool generates reference
material. Reuse a maintained source of descriptions where practical so the two
do not develop conflicting copies. Network access or an AI service is not a
requirement for this helper.

### mini-lang-server

An editor-facing language server. The standalone command will be
`mini-lang-server`; a dispatcher spelling has not been selected.

Start with source diagnostics for an open Mini document, using its current
contents and accurate source ranges. Keep diagnostic logic aligned with the
compiler. Completion, hover, navigation, rename, formatting integration, and
incremental analysis can follow separately when their required language rules
are settled. The existing VS Code extension can become a client later.

Choose the protocol, transport, document lifecycle, and initial capability set
with the first implementation. Keep protocol traffic separate from logs and
diagnostics. This service does not require a new type system, module mechanism,
or richer diagnostic model before the first compiler port.

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

Implement and verify each tool independently. Useful initial checks are formatter
idempotence and unchanged execution, exact generated documentation/help output,
and a small language-server session with edited source and updated diagnostics.
Tool progress must not delay the [self-hosting target](self-hosting-requirements.md).
