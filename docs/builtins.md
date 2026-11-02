# Built-ins and library functions

Mini needs a small set of host operations for compiling files and writing tools.
Built-in capabilities include:

- Input: whole input, a line, and a number; candidate names `readAll`,
  `readLine`, `readNumber`.
- Output: text, a line, and diagnostic text; candidate names `write`,
  `writeLine`, `writeError`.
- Process termination: an explicit status; candidate name `exit`.
- File reading/writing and process arguments for the compiler's file interface.

These are built-in directions, not implemented APIs. Names, signatures, EOF,
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

If a standard library is introduced, it has an independent `std` version and
`std-vX.Y.Z` release tags. Its version remains `null` until implemented and
assigned. A compiler using it must ship the matching library source and include
the required code in its generated bootstrap.
