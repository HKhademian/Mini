# Built-ins and library functions

Mini needs a small set of host operations for compiling files and writing tools.
Whether an operation lowers inline or through an adapter is a target choice.
The accepted operation contract is normative; adapter text, helper names, and
representation are not.

See [Builtins, purity, and self-containment](self-containment.md) for the
trusted host boundary, removable performance fast paths, pure reference
implementations, and the numeric requirements for a pure `hash_sha256`.
`compiler metadata` reports each builtin's layer and pure reference target.

`text_code(text)` returns the Unicode code point of the first character, or 0
for empty/non-text input. `text_from_code(code)` returns one character for a
valid Unicode scalar value and empty text otherwise.
`text_to_bytes(text)` returns the UTF-8 bytes as a list of integers 0-255.
`text_from_bytes(bytes)` decodes a byte list as UTF-8. Byte operations treat
non-integer or out-of-range elements as zero. `text_to_bytes` and
`text_from_bytes` have pure reference implementations in
[libs/pure/bytes.mini](../libs/pure/bytes.mini).
`file_read_bytes(path)` and `file_write_bytes(path, bytes)` read and replace
whole files as byte lists.

`hash_sha256(value)` hashes UTF-8 text or a byte list and returns lowercase hex.

`time_millis()` returns the host clock as integer milliseconds since the epoch.

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
`command` (text), `arguments` (text list), `mode` (`capture` or `inherit`),
`directory` (working directory; empty inherits the parent's), `input` (byte list
for captured stdin), and `timeout` (milliseconds; zero waits indefinitely). The
result map holds `status`, `signal`, `stdout`, `stderr`, and `error`. Captured
streams are byte lists; inherited streams are connected to the parent and stay
empty. `status` is 1 when the command cannot start or ends by a signal.

`value_kind(value)` returns `text`, `number`, `boolean`, `list`, `map`, or
`other` for the runtime kind of a value.

`io_read_line()` reads one line from standard input through LF, strips a trailing
CR, and returns its UTF-8 text. End of input returns empty text.
`io_read_bytes(count)` reads up to `count` bytes from standard input as a list of
integers 0-255; end of input returns a shorter list or an empty list.

`json_parse(text)` parses JSON into the existing value kinds. Objects become maps,
arrays become lists, booleans remain booleans, numbers remain numbers, and JSON
`null` becomes numeric zero. It returns a map with `ok` and `value`: `ok` is
true on success, and false with `value` 0 for invalid JSON or non-text input.

The accepted [text I/O contract](language.md) starts with `io_read_all()` and `io_write(text)`:
consume remaining stdin through EOF as UTF-8 text, and write UTF-8 text to stdout
without a newline. EOF yields empty text. Neither operation converts newlines.
`io_write` produces no value. The compiler implements these operations.

`number_to_text(value)` returns canonical decimal text for a safe integer, or
empty text for other values.

`number_mul(a, b)`, `number_div(a, b)`, `number_mod(a, b)`, `number_floor(a)`,
`number_pow(a, b)`, and `number_from_text(text)` cover operations that `+` and
`-` cannot express. Addition and subtraction remain the operators; minimum and
maximum use comparisons. Non-number operands return 0. Division and remainder
by zero return 0. Division truncates toward zero and remainder keeps the
dividend's sign. `number_pow` accepts a non-negative integer exponent.
`number_from_text` accepts an optional minus sign followed by decimal digits.
These six have pure reference implementations selected by `--reference`.

`number_add(a, b)`, `number_sub(a, b)`, `number_min(a, b)`, and `number_max(a, b)`
are total library functions in [libs/common/number.mini](../libs/common/number.mini), not
builtins. They use the core operators and return 0 when either operand is not a
number. The operators themselves reject mixed text/number operands at compile
time, so `+` and `number_add` have different contracts even though both generate
`a + b` for two valid numbers.

The accepted built-ins `text_length(text)`, `text_get(text, index)`,
`text_find(text, needle)`, `text_slice(text, start, end)`, and
`text_split(text, divider)` scan ASCII source. `text_get` uses zero-based
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

The operations require primitive host access. Prefixes do not decide whether an
operation is built-in or library code; both use ordinary call syntax.

The accepted built-ins `file_read(path)` and `file_write(path, text)` provide
whole-file UTF-8 input and exact replacement output for the compiler's file interface.
See [the draft](language.md) for the initial success contract.

The accepted built-in `process_args()` returns a text list for the generated
compiler's command interface. Shared built-ins `list_length(items)` and
`list_get(items, index)` expose the elements.
`list_new()` now creates a fresh empty list of length 0. The compiler supports its
zero-argument form only. `list_set(items, index, value)` replaces or grows a list,
supports negative indices from the end, and ignores targets that are not lists.
Indices still below zero after adjustment are no-ops. Lists can hold scalar
values, lists, and maps; `list_get` returns the actual stored value. Non-list
targets, gaps, and out-of-range positions read as numeric zero. Negative indices
count from the end, as for assignment. Explicit reserve remains under discussion;
see the [language contract](language.md).

, which Mini
identifiers cannot contain, to avoid collisions with Mini source names.

`list_copy(items)` returns a shallow list copy. Values are shared, so nested
lists and maps remain aliases. A non-list target returns an empty list.
`list_push_back(items, value)` and `list_push_front(items, value)` mutate a list
and return no value. `list_pop_back(items)` and `list_pop_front(items)` remove and
return one value, or numeric zero for an empty or non-list target.
`list_truncate(items, length)` shrinks a list to an existing non-negative length;
longer or invalid lengths are no-ops. These operations are performance builtins
with pure reference implementations; `list_truncate` is a representation
primitive used by the pure pop implementations.
`list_to_text(items, separator)` joins text elements with a text separator.
Non-text elements contribute empty text; a non-list target or non-text separator
returns empty text.

`map_new()` creates a fresh empty map with no arguments. The compiler uses ordinary objects
with a shared empty prototype; maps can be stored in lists and passed through
functions. There is no per-map metadata or wrapper. The prototype prevents
inherited string keys and makes `"__proto__"` an ordinary stored key.
`map_copy(items)` returns a shallow copy with the same text keys. Values are
shared, so nested lists and maps remain aliases. A non-map target returns an
empty map. `map_has(items, key)` checks a text key and returns a boolean without
changing the map. Empty maps return false; membership does not decide a
missing-key value.

`map_set(items, key, value)` inserts or replaces a text-keyed value without a
result. Non-map targets are no-ops. Values retain their kind, including shared
lists and maps. The compiler emits the setter adapter once when used.

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

The accepted built-in `process_run(command, args, mode)` runs one child process
to completion and returns a map with `status`, `signal`, `stdout`, `stderr`, and
`error`. `command` is text, `args` is a list whose elements convert to text, and
the environment is inherited. `mode` is `capture` to collect UTF-8 stdout and
stderr, or `inherit` to connect the child's standard streams to the parent, with
empty captured fields. `status` is the exit status, or 1 when the command cannot
start or ends by a signal. `signal` names a signalled process and is otherwise
empty; `error` holds a startup failure message and is otherwise empty. Captured
output is bounded by a fixed implementation buffer. Execution is one-shot; there
is no streaming, stdin piping, environment override, or timeout.

The accepted built-ins `process_exec_path()` and `path_temp_directory()` expose the
running Node executable path and create a fresh empty directory under the host
temporary directory. `path_temp_file()` creates a fresh temporary directory with
one empty file and returns the file path. `file_remove(path)` removes a file when present and ignores
a missing path. `directory_remove(path)` removes an empty directory when present
and ignores a missing path; a non-empty directory remains a host error. These
operations back tool process setup and cleanup.
`process_env(name)` covers the environment need; a bulk `process_envs()` map remains
unnecessary until a concrete caller needs it.

The compiler implements `io_write_error(text)`: exact UTF-8 output to stderr, without
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
