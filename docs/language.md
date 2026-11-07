# mini language draft

Status: accepted syntax and built-in contracts are documented below.
[Compiler increments](compiler.md) advance one
feature per atomic commit. Typing and other open rules remain undecided.

Unspecified behavior is undecided. T0 and T1 are bootstrap implementations;
their internal choices, including numeric normalization, JSON output, map
representation, helper lowering, and performance, do not define mini semantics
unless an accepted contract below states them. Do not treat a current T0/T1
result as a promise for another target.

After approval, implement and verify that feature in an atomic commit before
presenting the next proposal. Approval does not decide its open questions.
Create [cases](cases.md) with every proposal, including separate mini sources,
expected streams, input variants, rejections, and interactions. Keep unsupported
cases explicitly pending; refine provisional diagnostics with compiler support.

## Compiler workload

Start with a readable scanner/parser that emits JavaScript directly. Its basic
working data is source text, a cursor, the current token, and accumulated output.
Named functions will separate scanning, parsing, and emission. Keep the first
implementation small; introduce other data structures when concrete code needs
them.

Review constructs against that workload. A construct should simplify real
compiler code without adding disproportionate implementation or migration cost.

## Accepted form: line and documentation comments

mini supports line comments only:

```text
/// Return 1 for any supplied values a and b.
fn mine(a, b) {
    // Both arguments are deliberately unused in this example.
    return 1; // Comments can follow code on the same line.
}
```

- Outside quoted text, `//` begins an ordinary comment and `///` identifies a
  documentation comment. Neither requires preceding whitespace.
- Both forms consume the rest of the line, ending at CR, LF, or end of file.
  They may appear alone, after indentation, or after code. Quotation marks,
  braces, escapes, and other comment markers inside a comment are ordinary text.
- Markers inside double-quoted text remain text, including after escaped quotes.
- Comments act as whitespace. Required punctuation such as `;` remains required.
- The compiler skips both forms; they produce no tokens or generated TS text.
  Source offsets, line/column positions, and diagnostic context remain accurate.
- `///` documents the next declaration by default, including a `:=` binding.
  At the start of a file, a leading `///` block is file documentation only when
  a header `//` comment or a following `include` closes the file-doc section
  before the first declaration. A `//` before the `///` block means there are no
  file docs. Put file documentation before includes; use `//` as the boundary
  when no include follows. Blank lines do not separate doc sections.
- There are no block comments or comment-continuation escapes.

Keep mini source well documented. Use `///` for file purpose and immediately
above functions to explain their responsibility, inputs, returned value, and
shared-state changes where relevant. Use `//` for non-obvious implementation
decisions. Prefer useful explanations to repeating the code. Documentation
comments remain in source for readers and future tools; `mini doc` is not yet
implemented, and no documentation tags or extraction format are selected.

The [comment sample](../samples/012-comments.mini) demonstrates both forms.

An include can separate file docs from declaration docs:

```text
/// File purpose.
include "common/io.mini";

/// Documents the next declaration.
message := "hello";
```

Without an include, use an ordinary comment as the boundary:

```text
/// File purpose.
//
/// Documents the next declaration.
message := "hello";
```

## Accepted form: shebang header

A mini source file may begin with a shebang line:

```text
#!/usr/bin/env -S mini run
io_write("ok\n");
```

When `mini-run` is installed on `PATH`, this is an equivalent source launcher;
it needs no `-S` because the interpreter is one command:

```text
#!/usr/bin/env mini-run
io_write("ok\n");
```

- Only a `#!` at offset 0 is a shebang. It consumes through CR, LF, or end of
  file. A `#` anywhere else remains an unexpected character.
- The tokenizer emits a first-line `shebang` token. Following tokens keep their
  original line and column numbers, so the first code token is on line 2.
- The compiler skips the shebang for parsing and emits a Node shebang in the
  generated JavaScript:
  ```text
  #!/usr/bin/env node
  "use strict";
  ```
- The source shebang text is not copied into generated code because mini and
  JavaScript use different runners. Source without a shebang is unchanged.
- The formatter and analysis mode preserve the shebang token. `mini run` compiles
  and executes a mini source directly, and `mini compile` makes shebang output
  executable where the platform supports it.

## Accepted form: include directive

A top-level directive splices another mini source into the current compilation:

```text
include "common/text.mini";
```

- A path such as `"common/text.mini"` is resolved from the project `libs/`
  directory.
- Paths beginning `./` or `../` are resolved relative to the including file;
  `/path/to/file.mini` is an absolute filesystem path. Paths are canonicalized
  before use.
- Each canonical file is included at most once per compilation. A repeated
  include is a no-op. Includes may nest.
- A cycle, a missing file, a shebang in an included file, or an include inside a
  block is a compilation error. The entry file may keep a shebang.
- Included tokens keep their written include path as their source name, so
  diagnostics name the included file.
- `include` adds no values, namespaces, or runtime behavior. `tokens` reports
  directives unexpanded; `compile` expands them before parsing. Formatting keeps
  directives and does not inline files.

## Accepted form: bindings and assignment

Use one declaration form:

```text
source := "";
position := 0;
token := "";
output := "";
```

- `:=` declares a mutable binding.
- Every declaration has an initializer.
- `=` assigns a replacement value to an existing binding.
- `;` ends a declaration or assignment.
- A block rejects a second declaration of a name it already declared. A nested
  block may declare its own binding with the same name.

For example, advancing the source cursor:

```text
position = position + 1;
```

These statements can map directly to readable JavaScript declarations and
assignments. mini's typing, scope, and declaration-order rules remain open;
the handwritten TypeScript sources do not decide them.

## Accepted form: functions and calls

Use named functions with positional parameters and brace-delimited bodies:

```text
fn join(left, right) {
    return left + right;
}

output = join(output, token);
```

- `fn` declares a named function at the top level.
- Parentheses contain comma-separated parameters or call arguments.
- A user call maps arguments to parameters in order.
- A missing user argument is `0`; extra arguments reach the function, where
  declared parameters ignore them.
- `fn_args()` returns the supplied arguments of the current function as a list,
  including any beyond its declared parameters. At program top-level it returns
  the command-line arguments.
- `return expression;` ends the call with that value.
- Falling off the end of a function returns 0.
- `{` and `}` delimit the body; no semicolon follows its closing brace.

This separates scanner, parser, and emitter operations without introducing
objects or methods. The function and call forms map directly to JavaScript.
Parameter and result typing, scope, and declaration order remain open.

mini does not typecheck. It tracks the kind of literals and of expressions it can
derive them for, so a few obviously wrong forms are rejected at compile time.
Anything else, including a wrong argument count, is a runtime concern: mini has
no absence value, so every value is a number, text, boolean, list, or map.

Builtin calls keep exact arity because their parameters are part of the host
contract.

The [parameter-passing proposal](parameter-passing.md) evaluates local parameter
bindings with shared collections and investigates omitted arguments.

## Accepted form: conditionals and loops

Use `if` with an optional `else`, and `while` for repetition:

```text
if token == ";" {
    output = output + token;
} else {
    output = output + " ";
}

while position < limit {
    position = position + 1;
}
```

- A condition is an expression that ends at the following braced body.
  Condition parentheses are not required.
- A parenthesized whole condition still compiles but reports a warning. Use
  parentheses only to group part of a condition.
- Bodies always use braces.
- `if` runs one branch according to its condition.
- `while` checks its condition before every iteration, including the first.
- No semicolon follows a closing block brace.
- A chained decision may use `else if condition { ... }`. The final `else`
  still takes a braced body; there is no unbraced `else` form.

These forms cover parser decisions and scanner loops and map directly to
JavaScript. The expression rules below define comparisons and boolean conditions.

## Accepted form: values and expressions

Start with decimal integer literals, double-quoted text, and `true` / `false`:

```text
next := position + 1;
remaining := limit - position;
ready := token != "" && position < limit;
output := "token: " + token + "\n";
```

- Numeric `+` and `-`; unary `-` negates a number.
- Text `+` concatenates text. No implicit text/number conversion.
- `==` and `!=` compare values of the same kind without coercion.
- `<`, `<=`, `>`, and `>=` compare numbers.
- `!`, `&&`, and `||` operate on booleans. Conditions require booleans.
- `&&` and `||` evaluate their right side only when needed.
- Text escapes: `\"`, `\\`, `\n`, `\r`, and `\t`.

Precedence, tightest first: calls/parentheses, unary `!` / `-`, binary `+` / `-`,
numeric comparisons, equality, `&&`, then `||`. Binary operators at each level
associate left to right. Operands and call arguments evaluate left to right.
Parentheses override grouping. Assignment remains a statement.

This covers cursor arithmetic, token comparisons, emission, and combined parser
conditions. More arithmetic can wait for concrete compiler needs. Numeric limits,
mini's typing strategy, and host operation signatures remain open. mini `==` /
`!=` would emit JavaScript `===` / `!==`.

## Accepted operations: whole-input and text output

Use ordinary calls for two primitive operations:

```text
source := io_read_all();
io_write(source);
```

- `io_read_all()` consumes remaining standard input through EOF and returns text.
  At EOF it returns empty text.
- `io_write(text)` writes text to standard output exactly, with no added newline.
  It returns 0; use it as a call statement ending in `;`.
- `io_write_line(text)` is a Mini helper from `libs/common/io.mini`; it writes
  text followed by one newline and returns the `io_write` result. Include that
  file when using it.
- Both use UTF-8 without newline conversion. Initial cases stay within ASCII.

These operations let small programs expose their behavior without adding
syntax. File I/O, arguments, diagnostics, and process termination follow in
later small reviews; this pair alone is not the compiler's file interface.
`readLine`, `readNumber`, and other stream helpers remain candidates. Add
them only when concrete compiler or tool code needs them.

## Accepted operations: text access

Scanning uses two primitive built-ins.

Use `group_operation` names for the text family. These are flat identifiers;
the prefix adds no namespace syntax. `text_slice` provides the common slicing
operation; a standard library may still add conveniences on top of it.

```text
source := io_read_all();
position := 0;
while position < text_length(source) {
    io_write(text_get(source, position));
    position = position + 1;
}
```

- `text_length(text)` returns the number of characters; empty text has length 0.
- `text_get(text, index)` returns one character as text, using a zero-based index.
- If the target is not text, or the index is negative or at/beyond its length,
  return empty text without an error or conversion.
- `text_find(text, needle)` returns the zero-based position of the first
  occurrence, or `-1` when absent. An empty needle returns `0`; a non-text target
  or needle returns `-1`.
- `text_split(text, divider)` returns a list of text fields split on a literal
  divider. Empty fields are preserved. An empty divider returns a one-element
  list containing the source. A non-text target or divider returns an empty list.
- `text_slice(text, start, end)` returns text from `start` through the exclusive
  `end`. Bounds are zero-based integers. Negative bounds count from the end;
  bounds clamp to the text; a non-text target or an empty/reversed range returns
  empty text.
- The caller supplies integer indices. All arguments are required and evaluate
  once, from left to right, even when the target is not text.
- Start with ASCII text. Unicode indexing is outside the initial scope.

These primitives let mini scan source and accumulate tokens using existing
loops, conditions, and text concatenation. They add no syntax.
The [read-defaults sample](../samples/011-read-defaults.mini) shows ordinary empty
text and numeric-zero fallbacks without an absence value.

## Accepted operation: number text

```text
text := number_to_text(42);
```

- `number_to_text(value)` returns canonical decimal text for a safe integer:
  optional minus sign, no leading zeros, `0` for zero, and no exponent.
- Non-number values and non-safe integers return empty text.
- This does not add implicit text/number concatenation.

## Accepted operation: JSON text

```text
text := json_to_text(value);
```

- `json_to_text(value)` returns compact JSON text without added whitespace.
- Text is quoted and escaped; safe integers use canonical decimal text; booleans
  use `true` and `false`.
- Lists become arrays; gaps become `null`. Maps become objects with keys sorted
  lexicographically for deterministic output.
- Unsupported values become `null`; cyclic collections return empty text.
- This is serialization only; it does not add a JSON value kind or parsing.

## Accepted operations: text files

The compiler needs to read source and write its generated script. Use two
built-ins with ordinary call syntax:

```text
source := file_read("input.txt");
file_write("output.txt", source);
```

- `file_read(path)` reads a whole file as UTF-8 text; an empty file returns `""`.
- `file_write(path, text)` creates or replaces a file with exactly that text,
  using UTF-8 without newline conversion. It returns 0.
- Relative paths use the process working directory.
- Start with readable regular files and writable destinations whose parent
  directories exist. No mini filesystem error model is introduced at this step.

These operations provide file access; parsing and emission stay in mini
compiler code.

## Accepted operations: lists and program arguments

Use shared list operations for a list returned by the host:

```text
args := fn_args();
position := 0;
while position < list_length(args) {
    io_write(list_get(args, position));
    position = position + 1;
}
```

- At program top-level, `fn_args()` returns a list initially containing text
  arguments, excluding Node and the script path. Inside a function, it returns
  that function's supplied arguments. It is compiler-provided, not a builtin.
- `list_length(items)` returns the number of elements; an empty list has length 0.
- `list_get(items, index)` returns one element, using a zero-based index.
  The caller supplies an integer index; negative indices count from the end.
  It returns the stored value, preserving its kind and any collection reference.
- A non-list target, skipped position, or out-of-range index returns numeric `0`
  without changing the target. Stored `0`, `false`, and empty text retain their
  actual kinds. Both arguments are required and evaluate once, left to right.
- Empty arguments and spaces are preserved. Flag-like text is ordinary text;
  these primitives do not parse options.

Lists can be held in bindings and passed to functions. They can store numbers,
booleans, text, lists, and maps using `list_set` below. Equality keeps its existing
scalar contract. The list operations can serve future list-producing APIs too.

For `node compiler.js compile source.mini result.js`, top-level `fn_args()` contains
three elements: `compile`, `source.mini`, and `result.js`, in that order.
The compiler can combine list access with file I/O to implement its selected
command interface.

## Accepted operation: empty-list construction

```text
items := list_new();
count := list_length(items);
```

- `list_new()` returns a fresh empty list; its length is 0.
- The list can be stored in a binding, passed to a function, and returned.
- It uses the shared list kind.

The compiler emits a new array for each call. Only the zero-argument form is implemented.
Explicit reserve remains under discussion. Unassigned positions read as zero.

## Accepted operation: list copying

```text
copy := list_copy(items);
```

- `list_copy(items)` returns a fresh list with the same length and values.
- The copy is shallow: nested lists and maps are shared, not cloned.
- A non-list target returns an empty list.
- The source list is unchanged. Gaps remain readable as numeric zero.

## Accepted operation: list text joining

```text
text := list_to_text(items, ", ");
```

- `list_to_text(items, separator)` joins text elements with a text separator.
- Non-text elements contribute empty text; separators are still placed between
  positions.
- A non-list target or non-text separator returns empty text.

## Accepted operation: list assignment

```text
items := list_new();
list_set(items, 0, "first");
list_set(items, -1, "replacement");
```

- `list_set(items, index, value)` assigns a value and returns 0.
- If `items` is not a list, the operation does nothing, without an error or
  conversion. All three arguments still evaluate once, from left to right.
- The caller supplies an integer index. For a negative index, add the current
  list length. If the adjusted index is still negative, do nothing.
- An index within the list replaces that position. An index at or beyond its
  end grows the length to `index + 1` and assigns that position.
- Stored values retain their kind. Lists can contain different kinds, including
  lists and maps, without converting stored values to text.
- Skipped positions read as numeric `0` through `list_get`. Growth introduces no
  null value or additional absence kind.

On an empty list, assigning index `-1` or `-2` is a no-op. The same rule removes
the need to guard `list_set(items, r - 1, 0)` when a fresh list should stay empty
for `r <= 0`.

Map assignment below likewise makes a non-map target a no-op. Function parameter
rebinding and the broader passing contract remain under review separately.

## Accepted operation: empty-map construction

```text
names := map_new();
```

- `map_new()` returns a fresh empty map and takes no arguments.
- A map can be held in a binding, passed to a function, returned, and stored in
  a list. It is a distinct collection kind, not text or a list.
- Equality retains its scalar-only contract; map identity or content equality
  is not selected by this constructor.

The compiler emits an object-backed map for each call. Other targets can choose their own
representation. Maps hold unique text keys; membership and assignment follow below.
Missing-key lookup returns numeric zero, without introducing null. There is no
`map_empty` alias or record/struct/class syntax.

## Accepted operation: map copying

```text
copy := map_copy(items);
```

- `map_copy(items)` returns a fresh map with the same text keys and values.
- The copy is shallow: nested lists and maps are shared, not cloned.
- A non-map target returns an empty map.
- The source map is unchanged.

## Accepted operation: map membership

```text
names := map_new();
present := map_has(names, "source");
```

- `map_has(items, key)` returns a boolean indicating whether the map contains
  that text key. An empty map returns `false` for every key, including `""`.
- The caller supplies a map and text key, with no key conversion. Both arguments
  are required and evaluate once, from left to right.
- The query does not insert a key or otherwise change the map. An absent key
  does not require a default stored value.

The compiler checks known operand kinds and emits a membership helper. Cases cover absent
and present keys, including keys storing zero or false.

## Accepted operation: map assignment

```text
names := map_new();
map_set(names, "source", "input.mini");
map_set(names, "source", "replacement.mini");
```

- `map_set(items, key, value)` inserts a new text key or replaces its stored
  value if it already exists. Keys stay unique; no key conversion occurs.
- If `items` is not a map, the operation does nothing, without an error or
  conversion. All three arguments still evaluate once, from left to right.
- The caller supplies a text key. Empty text and names such as `"has"` and
  `"__proto__"` are ordinary keys, not properties or methods.
- Values retain their kind: numbers, booleans, text, lists, and maps are stored
  directly. Stored collections are shared, without implicit cloning.
- The operation requires all three arguments and returns 0.

The compiler emits one small map-setter adapter when used. Membership and lookup observe
inserted keys and stored values; a host-adapter test also checks stored references.

## Accepted operation: map lookup

```text
names := map_new();
map_set(names, "source", "input.mini");
source := map_get(names, "source");
missing := map_get(names, "missing");
```

- `map_get(items, key)` returns the stored value, preserving its kind and any
  collection reference. The caller supplies a text key.
- If the key is absent or the target is not a map, return numeric `0` without
  inserting a key or changing the target.
- Stored `0`, `false`, and empty text remain their actual values. No truthiness
  conversion occurs. Use `map_has` to distinguish a missing key from stored zero.
- Both arguments are required and evaluate once, from left to right, including
  when the target is not a map.

Zero is an ordinary number, not an absence type. No null literal, pointer syntax,
or null-checking operation is added. Argument omission remains a separate decision.

## Counting map keys with existing operations

```text
names := map_new();
map_set(names, "source", "input.mini");
count := list_length(map_keys(names));
```

- `list_length(map_keys(items))` counts the stored keys. An empty map gives 0.
- Inserting a new key increases the count by one. Replacing an existing key's
  value leaves the count unchanged, regardless of its value kind.
- The caller supplies one map argument. It evaluates once, and the query does
  not change the map.

Counting materializes a key snapshot. There is no stored size counter or separate
counting primitive. The [map sample](../samples/010-map.mini) combines these operations.

## Accepted operation: map keys

```text
names := map_new();
map_set(names, "source", "input.mini");
keys := map_keys(names);
```

- `map_keys(items)` returns a fresh list containing each stored text key once.
  An empty map returns an empty list.
- The caller supplies one map argument. It evaluates once, and the query does
  not change the map.
- The result is a snapshot. Later map insertions do not update it; changing the
  returned list does not change the map or another result from `map_keys`.
- Enumeration order is unspecified. Do not rely on it for deterministic compiler
  output; maintain an explicit ordered list when order matters.

The compiler uses `Object.keys` to materialize own text keys into a list. Tests check membership and uniqueness
without depending on insertion order. No missing-key value is needed for enumeration.

## Accepted operation: process termination

Use a primitive built-in to report unsuccessful compilation or command usage:

```text
process_exit(1);
```

- `process_exit(status)` immediately terminates the whole program with that
  status, including when called inside a function. Later statements do not run.
- The caller supplies an integer status from 0 through 255. Zero means success;
  a nonzero status means failure. The operation returns 0.
- Reaching the end of the program normally gives status 0.

Use `process_*` names for host process operations. `process_env(name)` reads one
variable; a bulk `process_envs()` map remains a candidate until needed.

## Accepted operations: bytes

```text
bytes := text_to_bytes("Mini");
io_write(text_from_bytes(bytes));
```

- `text_to_bytes(text)` returns UTF-8 bytes as a list of integers 0-255.
- `text_from_bytes(bytes)` decodes such a list as UTF-8. Non-integer or out-of-range
  elements count as zero.
- `file_read_bytes(path)` and `file_write_bytes(path, bytes)` read and replace a
  whole file as a byte list.

## Accepted operation: SHA-256 hashing

```text
io_write(hash_sha256("abc"));
```

- `hash_sha256(value)` hashes UTF-8 text or a byte list and returns lowercase
  hexadecimal SHA-256 text. It takes one argument and adds no other hash.

## Accepted operation: millisecond clock

```text
started := time_millis();
```

- `time_millis()` returns integer milliseconds since the epoch from the host
  clock. It takes no arguments and does not promise monotonicity across clock
  adjustments.

## Accepted operations: file tree

```text
directory := path_temp_directory();
directory_create(directory + "/sub");
names := directory_list(directory);
path_remove(directory);
```

- `path_is_exists(path)` reports whether a file or directory exists.
- `path_is_directory(path)` reports whether a path names a directory.
- `directory_list(path)` returns sorted entry names; a missing path or non-directory
  returns an empty list.
- `directory_create(path)` creates a directory and missing parents; an existing
  directory is a no-op.
- `path_copy(from, to)` copies a file or directory tree, dereferences symlinks,
and preserves file modes.
- `path_remove(path)` removes a file or directory tree; a missing path is a no-op.

## Accepted operation: environment

```text
home := process_env("HOME");
```

- `process_env(name)` returns the text value of an environment variable, or
  empty text when it is unset. It reads the host environment; it does not change
  the environment inherited by child processes.

## Accepted operation: script path

```text
script := process_script_path();
```

- `process_script_path()` returns the path of the running script as supplied by
  the host. It takes no arguments and adds no directory or module resolution.

## Accepted operation: process options

```text
options := map_new();
map_set(options, "command", "node");
map_set(options, "arguments", list_new());
result := process_spawn(options);
```

- `process_spawn(options)` runs one child process. `command` is text,
  `arguments` is a text list, `mode` is `capture` or `inherit`, `directory` sets
  the working directory (empty inherits the parent's), `input` is a byte list for
  captured stdin, and `timeout` is a millisecond limit (zero waits indefinitely).
- The result map holds `status`, `signal`, `stdout`, `stderr`, and `error`.
  Captured streams are byte lists; inherited streams stay empty. `status` is 1
  when the command cannot start or ends by a signal.

## Accepted operation: value kind

```text
if value_kind(value) == "text" { ... }
```

- `value_kind(value)` returns one of `text`, `number`, `boolean`, `list`, `map`,
  or `other`. It takes one argument and does not convert the value.

## Accepted operations: streaming input

```text
line := io_read_line();
bytes := io_read_bytes(16);
```

- `io_read_line()` reads standard input through LF and returns the UTF-8 text
  without the line ending. A trailing CR is removed. End of input returns empty
  text.
- `io_read_bytes(count)` reads up to `count` bytes as a list of integers 0-255.
  End of input returns fewer bytes or an empty list.

## Accepted operation: JSON parsing

```text
parsed := json_parse("{\"name\":\"Mini\"}");
value := map_get(parsed, "value");
```

- `json_parse(text)` parses JSON into existing value kinds. Objects become maps,
  arrays become lists, booleans stay booleans, numbers stay numbers, and JSON
  `null` becomes numeric zero.
- It returns a map with `ok` and `value`; invalid JSON or non-text input returns
  `ok` false and `value` 0. Parsing adds no JSON value kind.

## Process execution helper

Run one child process and inspect its result:

```text
include "common/process-run.mini";
arguments := list_new();
list_set(arguments, 0, "--version");
result := process_run("node", arguments, "capture");
io_write(map_get(result, "stdout"));
```

- `process_run(command, args, mode)` is a Mini library helper over the
  `process_spawn(options)` host operation. It runs one command to completion
  without a shell. `command` is text and `args` is a list whose elements convert
  to text.
- The child inherits the parent environment. `mode` is `capture` to collect
  stdout and stderr as UTF-8 text, or `inherit` to connect the child's standard
  streams to the parent's; inherited streams are not captured. Any other mode
  value uses capture.
- The result is a map with `status`, `signal`, `stdout`, `stderr`, and `error`.
  `status` is the exit status, or 1 when the command cannot start or ends by a
  signal. `signal` names a signalled process; `error` describes a startup
  failure. Both are empty on a normal exit.
- Captured output is bounded by a fixed implementation buffer. Execution is
  one-shot: there is no streaming, stdin piping, environment override, or
  timeout.

## Accepted operations: host paths and temporary files

Tools need a Node executable, a fresh temporary directory, and cleanup:

```text
include "common/path.mini";

node := process_exec_path();
directory := path_temp_directory();
file_write(directory + "/note.txt", "value\n");
file_remove(directory + "/note.txt");
directory_remove(directory);
```

- `process_exec_path()` returns the absolute path of the running Node
  executable. It takes no arguments.
- `path_temp_directory()` creates and returns a fresh empty directory under the host
  temporary directory. It takes no arguments.
- `file_remove(path)` and `directory_remove(path)` are helpers from
  `libs/common/path.mini`; include that file when using them. They call
  `path_remove(path)` only after checking the path kind and, for directories,
  that the directory is empty.
- `directory_remove(path)` leaves non-empty directories untouched.

## Accepted operation: diagnostic output

The compiler needs a separate stream for diagnostics:

```text
io_write_error("expected ;\n");
process_exit(1);
```

- `io_write_error(text)` writes UTF-8 text to standard error, exactly as supplied.
- It adds no newline and returns 0. Empty text writes nothing.
- The write completes before the call returns, preserving the diagnostic when
  followed by `process_exit`.

This primitive uses ordinary call syntax. Compiler code builds messages with
existing text operations.

Pending single-construct, rejection, and combination cases live under
[cases/language](../cases/language/). mini typing and general no-result function
rules remain open.
