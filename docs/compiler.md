# T0 compiler

T0 is the handwritten TypeScript compiler. Run it directly with Node:

```text
./bin/mini compile cases/language/001-001-bindings-initialize.mini
node cases/language/001-001-bindings-initialize.mini.ts
./bin/mini compile --tokens cases/language/001-001-bindings-initialize.mini
```

The default output appends `.ts` to the complete source name. Generated
`.mini.ts` files are ignored by Git; reviewed emission fixtures use `.expected.ts`.
An explicit output path still works.

The lexer is the tokenizer: it emits tokens with a source filename, zero-based
start/end offsets, one-based line/column, and source-line context. Diagnostics
show that location, the line, and a caret. A row means a line; tabs count as one
column and remain tabs in the caret prefix. Parsing emits readable TS directly.

Each increment implements one feature, enables its indexed JSON cases, checks
generated code and execution, and commits before starting the next feature.
Pending cases are the remaining work, not completed support.

T0 is strict TypeScript. Mini parameter typing is still open: parameters use an
explicit internal `Unknown` kind, and generated functions currently use ordinary
unannotated parameters. This is not a full Mini typechecker. Functions are
top-level, may call later definitions, and require a value return in this increment.

- `0.1.0-alpha.1`: initialized bindings with text, number, boolean, and
  existing-binding values.

- `0.1.0-alpha.2`: assignment to existing bindings.

- `0.1.0-alpha.3`: the + operator for numbers and text.

- `0.1.0-alpha.4`: write(text) to stdout.

- `0.1.0-alpha.5`: readAll() through EOF.

- `0.1.0-alpha.6`: escaped text literals.

- `0.1.0-alpha.7`: named functions, calls, and value returns.

- `0.1.0-alpha.8`: parenthesized expressions.

T0 is not self-hosted. `config/compiler.json` selects it explicitly;
`config/bootstrap.json` remains null. Promotion will select the generated
compiler and remove T0 from the active build. Never fall back to T0 afterward.
