# mini

A tiny self-hosting foundation for building other languages.

Keep syntax and implementation small, readable, and easy to change. Include
enough expressiveness to develop, maintain, and extend the self-hosted compiler
directly. Broad general-purpose features are outside this project's objective.

The main workflow is to clone this foundation and
[grow your own language while preserving self-hosting](docs/evolving-language.md).

[T0](docs/compiler.md) implements the reviewed language cases in direct Node
TypeScript. The [language draft](docs/language.md) records the reviewed contract;
cases verify compilation, generated output, execution, and diagnostics.

## Self-hosting

Start with a minimal handwritten TypeScript compiler, emitting readable
TypeScript run directly by Node. Port the compiler to Mini immediately.

The current subset is the port baseline. Freeze T0 language additions and write
the Mini compiler now. Limit T0 work to reproduced bugs that block that port;
further language improvements belong after verified self-hosting.

For unchanged compiler source `S`:

```text
Compiler1 = Compiler0(S)
Compiler2 = Compiler1(S)
Compiler3 = Compiler2(S)
```

Compiler1, Compiler2, and Compiler3 must run and be byte-identical. The final
compiler must also compile an example that runs with its expected output.
Compiler0 is handwritten; its own code need not match generated code.

Self-hosting belongs to the compiler path only. The generated compiler runs
directly on Node; the CLI, checker, verifier, tests, and release tools need not
be written in Mini. They may remain TypeScript until Mini or a cloned language
can replace them conveniently.

Promote the verified generated compiler to the distributed bootstrap. Remove
the handwritten compiler from the active build. Ship the generated compiler,
matching Mini source, and rebuild instructions together.

Every completed increment preserves self-hosting. A breaking change can use a
temporary compiler written in old syntax that accepts only the new syntax;
rewrite its source and verify the final pair before promotion. Never revive
the handwritten compiler to bypass a migration.

## Size and evolution

Minimize the combined complexity of the language, compiler, and future changes.
A tiny construct count is not useful if it forces an unreadable compiler or
makes ordinary changes difficult. Extra language machinery also makes the
foundation harder to implement and reshape.

Add a construct when its concrete readability or migration benefit justifies
its implementation cost. Prefer simple rules and direct compiler code. A cloned
language should approach its target through small, self-hosted increments;
[temporary syntax bridges](docs/evolving-language.md) can keep those steps manageable.

Keep language semantics small to implement across targets. TypeScript/Node is
the selected bootstrap target; its physical value representation does not define
Mini's semantics.

## Scope

Records, structs, and classes are outside Mini's intended scope. Use simple
collections for compiler data rather than adding dedicated structure syntax.

Mini source uses `.mini`. Other executable project code uses TypeScript run
directly by Node. Supporting tools may start in TypeScript and move to Mini
incrementally. Compiler logic must not remain hidden in TypeScript helpers
after bootstrap replacement.

[Built-in I/O and library functions](docs/builtins.md) provide the small host
capabilities needed by the compiler and later tools.

The [self-hosting requirements assessment](docs/self-hosting-requirements.md)
separates necessary semantic decisions and compiler capabilities from optional
language additions. It does not accept new syntax.

Avoid speculative features, advanced mathematics, Unicode requirements, rich
diagnostics, extra safety systems, and unnecessary layers. Rebuild checks stay
small too. “Smallest” is a practical goal, not a mathematical claim.

## Development

Use Node 24.16.0 from [.node-version](.node-version).

```text
npm ci
./bin/mini check
./bin/mini test
./bin/mini verify cases/tooling/check.case.json
./bin/mini bench .cache/bench.json
```

npm installs development dependencies only. Commands live in `bin/`:
`mini`, `mini-check`, `mini-test`, `mini-bench`, `mini-verify`,
`mini-release`, `mini-compile`, and `minic`.

Runnable [samples](samples/README.md) showcase language features and built-ins.
Each sample has a matching JSON verification case.

Basic [VS Code support](editors/vscode/README.md) provides `.mini` file icons,
syntax highlighting, and bracket/quote pairing. Install it locally from a VSIX;
there is no language server yet.

[Future tooling](docs/tooling.md) records `mini-format` / `mini fmt`,
`mini-document` / `mini doc`, `mini-help` / `mini help`, and `mini-lang-server`.
These commands are not available yet.

Read [contributing](CONTRIBUTING.md), [agent rules](AGENTS.md),
[versioning](docs/versioning.md), [cases](docs/cases.md),
[bootstrap verification](docs/bootstrap.md), and [releases](docs/releases.md).
The [version inventory](docs/versioning.md#current-inventory) lists current
products, future streams, and how specifications/docs identify their versions.
