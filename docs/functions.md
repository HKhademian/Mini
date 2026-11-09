# Common functions

Mini functions under `libs/common/` provide the shared APIs for text, numbers,
collections, files, processes, and other host services. Calls use ordinary Mini
function syntax. Importing source files makes their declarations available in
one shared call namespace. Emitters may replace a same-name function body with
an implementation suited to the target.

See [function and emitter behavior](self-containment.md) for the shared
implementation contract and host replacement rules.

`text_code(text)` returns the Unicode code point of the first character as a
number, or 0 for empty/non-text input. Pass that number directly to `io_write`
or `io_write_line`; both use `to_text` for display. `number_to_text` is useful
when number text must be stored or concatenated. `text_from_code(code)` returns
one character for a valid Unicode scalar value and empty text otherwise.
`text_to_bytes(text)` returns the UTF-8 bytes as a list of integers 0-255.
`text_from_bytes(bytes)` decodes a byte list as UTF-8. Byte conversion treats
non-integer elements as zero and normalizes integer elements modulo 256. The
text and UTF-8 functions are
declared in
[libs/common/text.mini](../libs/common/text.mini) and require
`import "common/text"`. Their Mini implementations are the fallback; JavaScript
registers same-name host overrides for the representation and performance paths.
The C target registers ASCII-only host implementations for `text_length`,
`text_get`, `text_code`, and `text_slice`; those operations reject non-ASCII text.
The file functions are declared in [libs/common/file.mini](../libs/common/file.mini)
and require `import "common/file"`. Their Mini implementations panic when a
target has no file host; the JavaScript and C emitters register same-name host
overrides. `file_read(path)` returns UTF-8 text, `file_write(path, text)` writes
UTF-8 text and returns zero, and the byte variants read or replace whole files
as byte lists.

`hash_sha256(value)` hashes UTF-8 text or a byte list and returns lowercase hex.
Import `common/hash`; its Mini fallback panics, and JavaScript registers the
same-name host implementation.

`time_millis()` returns the host clock as integer milliseconds since the epoch.
Import `common/time`; its Mini fallback panics, and JavaScript registers the
same-name host implementation.

Directory and path functions are declared in
[libs/common/path.mini](../libs/common/path.mini) and require
`import "common/path"`. Their Mini implementations panic when a target has no
filesystem host; JavaScript and C register same-name host overrides.
`path_is_exists(path)`, `path_is_file(path)`, and `path_is_directory(path)`
report whether a path exists, names a regular file, or names a directory. `directory_list(path)` returns sorted entry names, or an
empty list when the path is missing or not a directory.
`directory_create(path)` creates a directory and missing parents; an existing
directory is a no-op. `path_copy(from, to)` copies a file or directory tree, dereferences symlinks,
and preserves file modes.
`path_remove(path)` removes a file or directory tree and ignores a missing path.

`process_env(name)` returns the value of one environment variable, or empty
text when it is unset. The child environment remains inherited for processes.

`process_script_path()` returns the absolute path of the running script, or empty
text when the host does not provide one. Tools use it to locate repository files
independently of the current directory.

`process_spawn(options)` runs one child process from an options map. Keys are
`command` (text), `arguments` (text list), `mode` (`capture` or `inherit`; other
mode values capture), `directory` (working directory; empty inherits the
parent's), `input` (byte list for captured stdin), and `timeout` (milliseconds;
zero waits indefinitely). The result map holds `status`, `signal`, `stdout`,
`stderr`, and `error`. Captured streams are byte lists; inherited streams are
connected to the parent and stay empty. `status` is 1 when the command cannot
start or ends by a signal.
Import `common/process` for these APIs. Their Mini fallbacks panic when a target
has no process host; JavaScript registers same-name host overrides, and C
implements `process_exit` while the other process APIs panic.

## Map operations

Map APIs are declared in [libs/common/map.mini](../libs/common/map.mini) and
require `import "common/map"`. Their Mini definitions provide the fallback
contract; a target may replace the same function with a host implementation.
A target that cannot implement a required map primitive uses the panic fallback.
`map_set` and `map_delete` return zero, so these operations never produce a
void result.

`value_kind(value)` is declared in `common/value` and returns `text`, `number`,
`boolean`, `list`, `map`, or `other` for the runtime kind of a value. Targets
without a representation primitive use its panic fallback.
`value_merge(...values)` selects its behavior from the first value: numbers add,
texts concatenate, lists concatenate, and maps merge with later keys replacing
earlier values. Values of other kinds are ignored; an unsupported first kind or
an empty call returns 0.

`io_read_line()` reads one line from standard input through LF, strips a trailing
CR, and returns its UTF-8 text. End of input returns empty text.
`io_read_bytes(count)` reads up to `count` bytes from standard input as a list of
integers 0-255; end of input returns a shorter list or an empty list.

`json_value(text)` parses JSON into the existing value kinds. Objects become maps,
arrays become lists, booleans remain booleans, numbers remain safe integers, and
JSON `null` becomes numeric zero. It returns a map with `ok` and `value`: `ok`
is true on success, and false with `value` 0 for invalid JSON or non-text input.
Import `common/json`; its Mini implementation is the fallback and JavaScript
registers a same-name host overrides.

The accepted [text I/O contract](language.md) starts with `io_read_all()` and `io_write(...values)`:
consume remaining stdin through EOF as UTF-8 text, and write UTF-8 text to stdout
without a newline. EOF yields empty text. Neither operation converts newlines.
`io_write` applies `to_text` to each value, concatenates the results without
separators, writes the result, and returns 0. These same-name Mini APIs are
declared in [libs/common/io.mini](../libs/common/io.mini) and require
`import "common/io"`. Their fallback panics when a target has no I/O host
implementation; the JavaScript emitter replaces the same functions through its
override registry. The C target registers host overrides for standard input,
standard output, and standard error.
`io_write_line(...values)` is a Mini helper in the same module and writes the
converted values followed by one newline.

`to_text(any_value)` is the shared display conversion in
[libs/common/display.mini](../libs/common/display.mini); import `common/display`.
Text passes through, numbers use `number_to_text`, booleans become `true` or
`false`, and lists/maps use `json_text`. JSON serialization remains distinct:
it quotes text values.

`fn_args()` is a compiler-provided language form: the generated function
captures its own argument list, so it needs no adapter or import. It returns a list, empty
when the function received nothing.

`number_to_text(value)` returns canonical decimal text for a safe integer, or
empty text for other values. It is implemented in `common/number` and uses the
same-name JavaScript host override. Import `common/number` before calling number
functions.

`number_mul(a, b)`, `number_div(a, b)`, `number_mod(a, b)`, `number_floor(a)`,
`number_pow(a, b)`, and `number_from_text(text)` cover operations that `+` and
`-` cannot express. Addition and subtraction remain the operators; minimum and
maximum use comparisons. Non-number operands return 0. Division and remainder
by zero return 0. Division truncates toward zero and remainder keeps the
dividend's sign. `number_pow` accepts a non-negative integer exponent.
`number_from_text` accepts an optional minus sign followed by decimal digits.
These number functions have same-name Mini implementations in
[libs/common/number.mini](../libs/common/number.mini), with JavaScript host
implementations selected by the emitter. The Mini implementations also serve
reference mode. The separate JSON reference implementation currently accepts
integer JSON numbers only.

`number_add(a, b)`, `number_sub(a, b)`, `number_min(a, b)`, and `number_max(a, b)`
are imported functions in [libs/common/number.mini](../libs/common/number.mini)
and require `import "common/number"`. They return 0 when either operand is not
a number. The JavaScript emitter replaces each same-name Mini implementation
with its registered host function. The `+` operator remains separately type-checked syntax.

The text functions are imported Mini APIs in
[libs/common/text.mini](../libs/common/text.mini); use `import "common/text"`.
Their Mini implementations are the fallback, with same-name JavaScript host
replacements registered by the JS emitter. `text_get` uses zero-based
integer indices and returns empty text for a non-text target or an out-of-range
position, including negative indices. `text_find` returns the first zero-based
occurrence or `-1`; an empty needle returns `0`, and non-text inputs return
`-1`. `text_slice` uses a zero-based, end-exclusive range; negative bounds count
from the end, bounds clamp to the text, and an empty or reversed range returns
empty text. A non-text target returns empty text. `text_split` uses a literal
divider and preserves empty fields; an empty divider returns a one-element list
containing the source. The text family uses `group_operation` names, with
lowercase words separated by underscores. This naming convention needs no
namespace mechanism.
`text_merge(...texts)` concatenates text arguments in order; non-text arguments
are ignored.
`text_join(separator, ...texts)` concatenates text arguments with the separator
between positions; non-text arguments contribute empty text.

The operations require primitive host access. Prefixes do not decide whether an
operation is built-in or library code; both use ordinary call syntax.

The accepted built-ins `file_read(path)` and `file_write(path, text)` provide
whole-file UTF-8 input and exact replacement output for the compiler's file interface.
See [the draft](language.md) for the initial success contract.

`fn_args()` returns the current function's supplied arguments; at program
top-level it returns the command-line arguments, excluding Node and the script
path. It is compiler-provided. The common functions `list_length(items)` and
`list_get(items, index)` expose the elements.
`list_new()` now creates a fresh empty list of length 0. The compiler supports its
zero-argument form only. `list_set(items, index, value)` replaces or grows a list,
supports negative indices from the end, and ignores targets that are not lists.
Indices still below zero after adjustment are no-ops. Lists can hold scalar
values, lists, and maps; `list_get` returns the actual stored value. Non-list
targets, gaps, and out-of-range positions read as numeric zero. Negative indices
count from the end, as for assignment. Explicit reserve remains under discussion;
see the [language contract](language.md).

Generated helper names use the `$mini_` prefix, which mini identifiers cannot
contain, to avoid collisions with mini source names.

`list_copy(items)` returns a shallow list copy. Values are shared, so nested
lists and maps remain aliases. A non-list target returns an empty list.
`list_merge(...lists)` returns a new list with the items from each list argument
appended in order. Non-list arguments contribute no items; no arguments returns
an empty list.
`list_push_back`, `list_push_front`, `list_pop_back`, and `list_pop_front` are
Mini helpers in [libs/common/list.mini](../libs/common/list.mini). They mutate a
list and return 0 for pushes, or remove and return one value for pops. Empty or
non-list pops return 0. `list_truncate(items, length)` is the representation
primitive they use to shrink a list to an existing non-negative length; longer
or invalid lengths are no-ops.
`list_join(separator, items)` joins text elements with a text separator.
Non-text elements contribute empty text; a non-list target or non-text separator
returns empty text.

[libs/common/result.mini](../libs/common/result.mini) holds the result API.
`result_ok(value, message)` and `result_fail(message)` build the map, which
carries `ok`, `value`, and `message`. `result_is_ok` and `result_is_fail` test
it. `result_get_message`, `result_get_value`, `result_set_message`, and
`result_set_value` read and write fields without exposing the map shape, so
callers import the library rather than indexing keys.

`list_of(...)` and `map_of(...)` build collections from their arguments. They are
functions under [libs/common](../libs/common), so programs import the source modules they use. `list_of` returns its arguments as a list. `map_of` reads alternating
keys and values; a repeated key takes the last value, and a key without a value
takes 0, so `map_of("k")` equals `map_of("k", 0)`.

`map_new()` creates a fresh empty map with no arguments. The compiler uses ordinary objects
with a shared empty prototype; maps can be stored in lists and passed through
functions. There is no per-map metadata or wrapper. The prototype prevents
inherited string keys and makes `"__proto__"` an ordinary stored key.
`map_copy(items)` returns a shallow copy with the same text keys. Values are
shared, so nested lists and maps remain aliases. A non-map target returns an
empty map. `map_has(items, key)` checks a text key and returns a boolean without
changing the map. Empty maps return false; membership does not decide a
missing-key value.
`map_merge(...maps)` returns a fresh map. Later map arguments replace earlier
values for matching keys; non-map arguments are ignored.

`map_set(items, key, value)` inserts or replaces a text-keyed value without a
result. Non-map targets are no-ops. Values retain their kind, including shared
lists and maps. The compiler emits the setter adapter once when used.

`map_delete(items, key)` removes a key and returns 0. A non-map target or an
absent key is a no-op, so removal is observed through `map_has` and the key
count rather than a returned value. mini has no null, so deletion is the only
way to make a key present again as absent.

`map_get(items, key)` returns the stored value, or numeric zero for a missing
key or non-map target, without inserting anything. Stored zero, false, and empty
text retain their kinds; use `map_has` when presence matters. No null value is added.

Count keys with `list_length(map_keys(items))`. This materializes a snapshot
only when counting is requested, without maintaining a counter on every write.
See the [map sample](../samples/010-map.mini) for the operations together.

`map_keys(items)` returns a fresh list of the map's text keys, in unspecified
order. It is a snapshot: list edits do not change the map, and later map insertions
do not update the list. This needs no missing-key default.

The accepted built-in `process_exit(status)` provides immediate termination with
an integer status from 0 through 255, including from inside a function. Normal
program completion gives status 0. This is a primitive host operation.

`process_run(command, args, mode)` is a helper in
[libs/common/process-run.mini](../libs/common/process-run.mini). Include that
library to run one child process through `process_spawn` and receive captured
output as UTF-8 text. It provides the simple command/arguments/mode form; use
`process_spawn(options)` when working-directory, byte-input, or timeout controls
are needed.

The accepted built-ins `process_exec_path()` and `path_temp_directory()` expose the
running Node executable path and create a fresh empty directory under the host
temporary directory. `path_temp_file()` is a Mini helper in
[libs/common/path.mini](../libs/common/path.mini); it creates one empty file in a
fresh temporary directory and returns the file path. Include that file to use
the helper. The same library defines `file_remove(path)` and
`directory_remove(path)` on top of the `path_remove(path)` function. `file_remove`
skips directories; `directory_remove` removes only empty directories and leaves
non-empty paths untouched. `path_remove` removes a file or directory tree
recursively. These helpers support tool process setup and cleanup.
`process_env(name)` covers the environment need; a bulk `process_envs()` map remains
unnecessary until a concrete caller needs it.

`io_write_error(...values)` converts and concatenates values using the same
rules as `io_write`, writes UTF-8 to stderr without an added newline, and
returns 0. It completes before returning so a following `process_exit` preserves
the diagnostic. This requires primitive host access.

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
Prefer mini implementations where practical. No module/import syntax or
standard-library API is selected yet.

Standard-library source belongs under `std/`, with mini code in `.mini` files.
Keep library verification manifests and streams under `cases/`. Create `std/`
when its first implementation is added; do not add empty scaffolding.

If a standard library is introduced, it has an independent `std` version and
`std-vGROUP-vPRODUCT` release tags. Its version remains `null` until implemented and
assigned. A compiler using it must ship the matching library source and include
the required code in its generated bootstrap.
