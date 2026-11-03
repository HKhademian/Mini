# Mini language draft

Status: accepted syntax and built-in contracts are documented below.
[T0 support](compiler.md) advances one feature
per atomic commit. Typing and other open rules remain undecided.

After approval, implement and verify that feature in an atomic commit before
presenting the next proposal. Approval does not decide its open questions.
Create [cases](cases.md) with every proposal, including separate Mini sources,
expected streams, input variants, rejections, and interactions. Keep unsupported
cases explicitly pending; refine provisional diagnostics with compiler support.

## Compiler workload

Start with a readable scanner/parser that emits TypeScript directly. Its basic
working data is source text, a cursor, the current token, and accumulated output.
Named functions will separate scanning, parsing, and emission. Keep the first
implementation small; introduce other data structures when concrete code needs
them.

Review constructs against that workload. A construct should simplify real
compiler code without adding disproportionate implementation or migration cost.

## Accepted form: bindings and assignment

Use one declaration form:

```text
var source = "";
var position = 0;
var token = "";
var output = "";
```

- `var` introduces a mutable binding.
- Every declaration has an initializer.
- `=` assigns a replacement value to an existing binding.
- `;` ends a declaration or assignment.

For example, advancing the source cursor:

```text
position = position + 1;
```

These statements can map directly to readable TypeScript declarations and
assignments. Mini's typing, scope, and declaration-order rules remain open;
the TypeScript bootstrap being strongly typed does not decide them.

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
- A call supplies one argument per parameter, in order.
- `return expression;` ends the call with that value.
- `{` and `}` delimit the body; no semicolon follows its closing brace.

This separates scanner, parser, and emitter operations without introducing
objects or methods. The function and call forms map directly to TypeScript.
Parameter and result typing, scope, declaration order, and functions without
a returned value remain open.

The [parameter-passing proposal](parameter-passing.md) evaluates local parameter
bindings with shared collections and investigates omitted arguments. Passing rules
remain under review, with pending cases; calls still require exact arity.

## Accepted form: conditionals and loops

Use `if` with an optional `else`, and `while` for repetition:

```text
if (token == ";") {
    output = output + token;
} else {
    output = output + " ";
}

while (position < limit) {
    position = position + 1;
}
```

- Conditions use parentheses; bodies always use braces.
- `if` runs one branch according to its condition.
- `while` checks its condition before every iteration, including the first.
- No semicolon follows a closing block brace.
- A chained decision uses another `if` inside the braced `else` body.
  There is no separate `elseif` or unbraced `else if` form.

These forms cover parser decisions and scanner loops and map directly to
TypeScript. The expression rules below define comparisons and boolean conditions.

## Accepted form: values and expressions

Start with decimal integer literals, double-quoted text, and `true` / `false`:

```text
var next = position + 1;
var remaining = limit - position;
var ready = token != "" && position < limit;
var output = "token: " + token + "\n";
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
Mini's typing strategy, and host operation signatures remain open. Mini `==` /
`!=` would emit TypeScript `===` / `!==`.

## Accepted operations: whole-input and text output

Use ordinary calls for two primitive operations:

```text
var source = readAll();
write(source);
```

- `readAll()` consumes remaining standard input through EOF and returns text.
  At EOF it returns empty text.
- `write(text)` writes text to standard output exactly, with no added newline.
  It produces no value; use it as a call statement ending in `;`.
- Both use UTF-8 without newline conversion. Initial cases stay within ASCII.

These operations let small programs expose their behavior without adding
syntax. File I/O, arguments, diagnostics, and process termination follow in
later small reviews; this pair alone is not the compiler's file interface.
`readLine`, `readNumber`, and `writeLine` remain candidates. Add
them only when concrete compiler or tool code needs them.

## Accepted operations: text access

Scanning uses two primitive built-ins.

Use `group_operation` names for the text family. These are flat identifiers;
the prefix adds no namespace syntax. A future `text_slice` helper could be
written in Mini and live in `std/`; it remains only a naming example.

```text
var source = readAll();
var position = 0;
while (position < text_length(source)) {
    write(text_get(source, position));
    position = position + 1;
}
```

- `text_length(text)` returns the number of characters; empty text has length 0.
- `text_get(text, index)` returns one character as text, using a zero-based index.
- If the target is not text, or the index is negative or at/beyond its length,
  return empty text without an error or conversion.
- The caller supplies an integer index. Both arguments are required and evaluate
  once, from left to right, even when the target is not text.
- Start with ASCII text. Unicode indexing is outside the initial scope.

These primitives let Mini scan source and accumulate tokens using existing
loops, conditions, and text concatenation. They add no syntax.
The [read-defaults sample](../samples/011-read-defaults.mini) shows ordinary empty
text and numeric-zero fallbacks without an absence value.

## Accepted operations: text files

The compiler needs to read source and write its generated script. Use two
built-ins with ordinary call syntax:

```text
var source = file_read("input.txt");
file_write("output.txt", source);
```

- `file_read(path)` reads a whole file as UTF-8 text; an empty file returns `""`.
- `file_write(path, text)` creates or replaces a file with exactly that text,
  using UTF-8 without newline conversion. It produces no value.
- Relative paths use the process working directory.
- Start with readable regular files and writable destinations whose parent
  directories exist. No Mini filesystem error model is introduced at this step.

These operations provide file access; parsing and emission stay in Mini
compiler code.

## Accepted operations: lists and process arguments

Use shared list operations for a list returned by the host:

```text
var args = process_args();
var position = 0;
while (position < list_length(args)) {
    write(list_get(args, position));
    position = position + 1;
}
```

- `process_args()` returns a list initially containing text arguments, excluding Node and
  the script path. It is a primitive built-in.
- `list_length(items)` returns the number of elements; an empty list has length 0.
- `list_get(items, index)` returns one element, using a zero-based index.
  The caller supplies an integer with `0 <= index < list_length(items)` and reads
  an assigned position. It returns the stored value, which need not be text.
- Empty arguments and spaces are preserved. Flag-like text is ordinary text;
  these primitives do not parse options.

Lists can be held in bindings and passed to functions. They can store numbers,
booleans, text, lists, and maps using `list_set` below. Equality keeps its existing
scalar contract. The list operations can serve future list-producing APIs too.

For `node compiler.ts compile source.mini result.ts`, `process_args()` contains
three elements: `compile`, `source.mini`, and `result.ts`, in that order.
The compiler can combine list access with file I/O to implement its selected
command interface.

## Accepted operation: empty-list construction

```text
var items = list_new();
var count = list_length(items);
```

- `list_new()` returns a fresh empty list; its length is 0.
- The list can be stored in a binding, passed to a function, and returned.
- It uses the shared list kind.

T0 emits a new array for each call. Only the zero-argument form is implemented.
Explicit reserve and missing-position values remain under discussion.

## Accepted operation: list assignment

```text
var items = list_new();
list_set(items, 0, "first");
list_set(items, -1, "replacement");
```

- `list_set(items, index, value)` assigns a value and produces no result.
- If `items` is not a list, the operation does nothing, without an error or
  conversion. All three arguments still evaluate once, from left to right.
- The caller supplies an integer index. For a negative index, add the current
  list length. If the adjusted index is still negative, do nothing.
- An index within the list replaces that position. An index at or beyond its
  end grows the length to `index + 1` and assigns that position.
- Stored values retain their kind. Lists can contain different kinds, including
  lists and maps, without converting stored values to text.
- Only assigned positions can be read in this increment. Reading skipped
  positions and out-of-range positions remains outside the contract. No zero or
  null default is selected by growth.

On an empty list, assigning index `-1` or `-2` is a no-op. The same rule removes
the need to guard `list_set(items, r - 1, 0)` when a fresh list should stay empty
for `r <= 0`. The reader is `list_get`; the former `list_at` built-in is removed.

Map assignment below likewise makes a non-map target a no-op. Function parameter
rebinding and the broader passing contract remain under review separately.

## Accepted operation: empty-map construction

```text
var names = map_new();
```

- `map_new()` returns a fresh empty map and takes no arguments.
- A map can be held in a binding, passed to a function, returned, and stored in
  a list. It is a distinct collection kind, not text or a list.
- Equality retains its scalar-only contract; map identity or content equality
  is not selected by this constructor.

T0 emits a native `Map` for each call. Other targets can choose their own
representation. Maps hold unique text keys; membership and assignment follow below.
Missing-key lookup returns numeric zero, without introducing null. There is no
`map_empty` alias or record/struct/class syntax.

## Accepted operation: map membership

```text
var names = map_new();
var present = map_has(names, "source");
```

- `map_has(items, key)` returns a boolean indicating whether the map contains
  that text key. An empty map returns `false` for every key, including `""`.
- The caller supplies a map and text key, with no key conversion. Both arguments
  are required and evaluate once, from left to right.
- The query does not insert a key or otherwise change the map. An absent key
  does not require a default stored value.

T0 checks known operand kinds and emits native map membership. Cases cover absent
and present keys, including keys storing zero or false.

## Accepted operation: map assignment

```text
var names = map_new();
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
- The operation requires all three arguments and produces no result.

T0 emits one small map-setter adapter when used. Membership and lookup observe
inserted keys and stored values; a host-adapter test also checks stored references.

## Accepted operation: map lookup

```text
var names = map_new();
map_set(names, "source", "input.mini");
var source = map_get(names, "source");
var missing = map_get(names, "missing");
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

## Accepted operation: map length

```text
var names = map_new();
map_set(names, "source", "input.mini");
var count = map_length(names);
```

- `map_length(items)` returns the number of stored keys as a nonnegative integer.
  An empty map has length 0.
- Inserting a new key increases the count by one. Replacing an existing key's
  value leaves the count unchanged, regardless of its value kind.
- The caller supplies one map argument. It evaluates once, and the query does
  not change the map.

The [map sample](../samples/010-map.mini) combines construction, membership,
insertion, replacement, length, and key snapshots with observable output.

## Accepted operation: map keys

```text
var names = map_new();
map_set(names, "source", "input.mini");
var keys = map_keys(names);
```

- `map_keys(items)` returns a fresh list containing each stored text key once.
  An empty map returns an empty list.
- The caller supplies one map argument. It evaluates once, and the query does
  not change the map.
- The result is a snapshot. Later map insertions do not update it; changing the
  returned list does not change the map or another result from `map_keys`.
- Enumeration order is unspecified. Do not rely on it for deterministic compiler
  output; maintain an explicit ordered list when order matters.

T0 materializes native map keys into a list. Tests check membership and uniqueness
without depending on insertion order. No missing-key value is needed for enumeration.

## Accepted operation: process termination

Use a primitive built-in to report unsuccessful compilation or command usage:

```text
process_exit(1);
```

- `process_exit(status)` immediately terminates the whole program with that
  status, including when called inside a function. Later statements do not run.
- The caller supplies an integer status from 0 through 255. Zero means success;
  a nonzero status means failure. The operation produces no value.
- Reaching the end of the program normally gives status 0.

Use `process_*` names for host process operations. `process_envs()` remains a
candidate; add it only with a concrete need and a defined return shape.

## Accepted operation: diagnostic output

The compiler needs a separate stream for diagnostics:

```text
write_error("expected ;\n");
process_exit(1);
```

- `write_error(text)` writes UTF-8 text to standard error, exactly as supplied.
- It adds no newline and produces no value. Empty text writes nothing.
- The write completes before the call returns, preserving the diagnostic when
  followed by `process_exit`.

This primitive uses ordinary call syntax. Compiler code builds messages with
existing text operations.

Pending single-construct, rejection, and combination cases live under
[cases/language](../cases/language/). Mini typing and general no-result function
rules remain open.
