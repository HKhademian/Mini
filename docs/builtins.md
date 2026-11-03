# Built-ins and library functions

Group 0.2.0 renames `text_at` and `list_at` to `text_get` and `list_get`.
Update calls to the new names; the former names are not built-in aliases.

Mini needs a small set of host operations for compiling files and writing tools.
The accepted [text I/O contract](language.md) starts with `readAll()` and `write(text)`:
consume remaining stdin through EOF as UTF-8 text, and write UTF-8 text to stdout
without a newline. EOF yields empty text. Neither operation converts newlines.
`write` produces no value. T0 implements these operations.

The accepted built-ins `text_length(text)` and `text_get(text, index)` scan
ASCII source. `text_get` uses zero-based integer indices and returns empty text
for a non-text target or an out-of-range position, including negative indices.
The text family uses `group_operation` names, with lowercase words separated by
underscores. This naming convention needs no namespace mechanism.

Both require primitive host access. A future `text_slice` could instead be an
ordinary Mini function built from them and a loop, under `std/`. That helper
remains illustrative. Prefixes do not decide whether an operation is built-in
or library code; both use ordinary call syntax.

The accepted built-ins `file_read(path)` and `file_write(path, text)` provide
whole-file UTF-8 input and exact replacement output for the compiler's file interface.
See [the draft](language.md) for the initial success contract.

The accepted built-in `process_args()` returns a text list for the generated
compiler's command interface. Shared built-ins `list_length(items)` and
`list_get(items, index)` expose the elements.
`list_new()` now creates a fresh empty list of length 0. T0 supports its
zero-argument form only. `list_set(items, index, value)` replaces or grows a list,
supports negative indices from the end, and ignores targets that are not lists.
Indices still below zero after adjustment are no-ops. Lists can hold scalar
values, lists, and maps; `list_get` returns the actual stored value. Non-list
targets, gaps, and out-of-range positions read as numeric zero. Negative indices
count from the end, as for assignment. Explicit reserve remains under discussion;
see the [language contract](language.md).

T0 emits the list setter's small host adapter once when used. It provides array
mutation, not compiler logic. The generated helper name uses `$`, which Mini
identifiers cannot contain, to avoid collisions with Mini source names.

`map_new()` creates a fresh empty map with no arguments. T0 emits a native
`Map`; maps can be stored in lists and passed through functions.
`map_has(items, key)` checks a text key and returns a boolean without changing
the map. Empty maps return false; membership does not decide a missing-key value.

`map_set(items, key, value)` inserts or replaces a text-keyed value without a
result. Non-map targets are no-ops. Values retain their kind, including shared
lists and maps. T0 emits the setter adapter once when used.

`map_get(items, key)` returns the stored value, or numeric zero for a missing
key or non-map target, without inserting anything. Stored zero, false, and empty
text retain their kinds; use `map_has` when presence matters. No null value is added.

`map_length(items)` returns the number of stored keys without changing the map.
New keys increase it; replacing a value does not. See the
[map sample](../samples/010-map.mini) for the implemented map operations together.

`map_keys(items)` returns a fresh list of the map's text keys, in unspecified
order. It is a snapshot: list edits do not change the map, and later map insertions
do not update the list. This needs no missing-key default.

The accepted built-in `process_exit(status)` provides immediate termination with
an integer status from 0 through 255, including from inside a function. Normal
program completion gives status 0. This is a primitive host operation.
The `process_*` family also leaves `process_envs()` as a candidate until needed;
its return shape remains open.

T0 implements `write_error(text)`: exact UTF-8 output to stderr, without
an added newline or result value. It completes before returning so a following
`process_exit` preserves the diagnostic. This requires primitive host access.

Other candidates, added only when concrete compiler or tool code needs them:

- Input: a line and a number; candidate names `readLine`, `readNumber`.
- Output: a line; candidate name `writeLine`.

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
`std-vGROUP-vPRODUCT` release tags. Its version remains `null` until implemented and
assigned. A compiler using it must ship the matching library source and include
the required code in its generated bootstrap.
