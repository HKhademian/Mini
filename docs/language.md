# Mini language draft

Status: binding and function forms accepted; control flow proposed. Nothing
implemented yet. Typing and other open rules remain undecided.

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
a returned value remain open. The example illustrates the form; text operations
will be reviewed with expressions.

## Next proposal: conditionals and loops

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

These forms cover parser decisions and scanner loops and map directly to
TypeScript. Comparison operators and condition types will be reviewed with
expressions. No additional loop forms or loop-control statements are proposed
at this step.

Expressions and primitive host operations follow as separate small reviews.
Examples illustrate syntax. Their pending compile, runtime, and rejection cases
live under [cases/language](../cases/language/).
