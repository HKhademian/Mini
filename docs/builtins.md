# Built-ins and library functions

Mini needs a small set of host operations for compiling files and writing tools.
The accepted [text I/O contract](language.md) starts with `readAll()` and `write(text)`:
consume remaining stdin through EOF as UTF-8 text, and write UTF-8 text to stdout
without a newline. EOF yields empty text. Neither operation converts newlines.
`write` produces no value. These operations are accepted, not implemented.

The accepted built-ins `text_length(text)` and `text_at(text, index)` scan
ASCII source. Indices are zero-based and in range; scanner code guards access.
The text family uses `group_operation` names, with lowercase words separated by
underscores. This naming convention needs no namespace mechanism.

Both require primitive host access. A future `text_slice` could instead be an
ordinary Mini function built from them and a loop, under `std/`. That helper
remains illustrative. Prefixes do not decide whether an operation is built-in
or library code; both use ordinary call syntax.

The next proposal is `file_read(path)` and `file_write(path, text)`: whole-file
UTF-8 input and exact replacement output for the compiler's file interface.
See [the draft](language.md) for the initial success contract.

Other candidates, added only when concrete compiler or tool code needs them:

- Input: a line and a number; candidate names `readLine`, `readNumber`.
- Output: a line and diagnostic text; candidate names `writeLine`, `writeError`.
- Process termination: an explicit status; candidate name `exit`.
- Process arguments for the compiler's file interface.

These candidates are not selected APIs. Their signatures, EOF,
number parsing, newline behavior, and failure behavior remain to be defined.
Implement the subset needed for self-hosting first; add other practical
capabilities in small increments with focused cases.

Built-ins may lower directly to Node operations through small host adapters.
Those adapters provide primitives, not a handwritten compiler implementation.
The generated compiler must still run with Node alone.

Functions expressible using existing language features and primitives can live
in a standard library instead of adding syntax or compiler special cases.
Prefer Mini implementations where practical. No module/import syntax or
standard-library API is selected yet.

Standard-library source belongs under `std/`, with Mini code in `.mini` files.
Keep library verification manifests and streams under `cases/`. Create `std/`
when its first implementation is added; do not add empty scaffolding.

If a standard library is introduced, it has an independent `std` version and
`std-vX.Y.Z` release tags. Its version remains `null` until implemented and
assigned. A compiler using it must ship the matching library source and include
the required code in its generated bootstrap.
