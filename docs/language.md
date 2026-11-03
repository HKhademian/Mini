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
bindings with shared collections. It remains under review, with pending cases.

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
    write(text_at(source, position));
    position = position + 1;
}
```

- `text_length(text)` returns the number of characters; empty text has length 0.
- `text_at(text, index)` returns one character as text, using a zero-based index.
- The caller supplies an integer index with `0 <= index < text_length(text)`.
  Out-of-range behavior is outside the initial contract; scanners guard access.
- Start with ASCII text. Unicode indexing is outside the initial scope.

These primitives let Mini scan source and accumulate tokens using existing
loops, conditions, and text concatenation. They add no syntax.

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

## Accepted operations: text lists and process arguments

Use shared list operations for a text list returned by the host:

```text
var args = process_args();
var position = 0;
while (position < list_length(args)) {
    write(list_at(args, position));
    position = position + 1;
}
```

- `process_args()` returns a list of program arguments, excluding Node and
  the script path. It is a primitive built-in.
- `list_length(items)` returns the number of elements; an empty list has length 0.
- `list_at(items, index)` returns one element, using a zero-based index.
  The caller supplies an integer with `0 <= index < list_length(items)`.
- Empty arguments and spaces are preserved. Flag-like text is ordinary text;
  these primitives do not parse options.

Start with read-only access to lists of text. Lists can be held in bindings and
passed to functions. Empty-list construction follows below; mutation and broader
element-type rules remain open. Equality keeps its existing scalar contract.
The list operations are built-ins that can serve future list-producing APIs too.

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
- It uses the existing list kind. This step adds no element or mutation rules.

T0 emits a new array for each call. This increment supports the zero-argument
form only. The selected collection direction includes an optional reserve size
and list assignment; those operations are not implemented yet. Missing elements,
mixed/nested values, and maps still require their own reviewed contracts.

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
