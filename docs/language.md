# Mini language draft

Status: proposals for review. No grammar is accepted or implemented yet.

## Compiler workload

Start with a readable scanner/parser that emits TypeScript directly. Its basic
working data is source text, a cursor, the current token, and accumulated output.
Named functions will separate scanning, parsing, and emission. Keep the first
implementation small; introduce other data structures when concrete code needs
them.

Review constructs against that workload. A construct should simplify real
compiler code without adding disproportionate implementation or migration cost.

## First proposal: bindings and assignment

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

Review this form before implementation. Functions/calls, control flow,
expressions, and primitive host operations follow as separate small reviews.
Examples here are proposals, not executable verification cases.
