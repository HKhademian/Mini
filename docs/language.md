# Mini language draft

Status: binding, function, control-flow, expression, and text I/O forms accepted.
Text access proposed. Nothing implemented yet. Typing and other open rules
remain undecided.

After approval, record the decision and present the next small proposal in an
atomic commit. Approval covers the presented form, not its open questions.
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
`readLine`, `readNumber`, `writeLine`, and `writeError` remain candidates. Add
them only when concrete compiler or tool code needs them.

## Next proposal: text access

Scanning needs two more ordinary calls:

```text
var source = readAll();
var position = 0;
while (position < textLength(source)) {
    write(textAt(source, position));
    position = position + 1;
}
```

- `textLength(text)` returns the number of characters; empty text has length 0.
- `textAt(text, index)` returns one character as text, using a zero-based index.
- The caller supplies an integer index with `0 <= index < textLength(text)`.
  Out-of-range behavior is outside the initial contract; scanners guard access.
- Start with ASCII text. Unicode indexing is outside the initial scope.

These primitives let Mini scan source and accumulate tokens using existing
loops, conditions, and text concatenation. They add no syntax.

Pending single-construct, rejection, and combination cases live under
[cases/language](../cases/language/). Mini typing and general no-result function
rules remain open.
