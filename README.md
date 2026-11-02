# mini

A tiny self-hosting foundation for building other languages.

Keep syntax and implementation small, readable, and easy to change. Add only
what the compiler needs to compile itself. Broad general-purpose features are
outside this project's objective.

No grammar or compiler is implemented yet. Maintenance tools are available.

## Self-hosting

Start with a minimal handwritten TypeScript compiler, emitting readable
TypeScript run directly by Node. Port the compiler to Mini immediately.

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

Every later increment preserves self-hosting. Implement syntax support using
old syntax, promote its compiler, then adopt new syntax in compiler source.
Never revive the handwritten compiler to bypass a migration.

## Scope

Mini source uses `.mini`. Other executable project code uses TypeScript run
directly by Node. Supporting tools may start in TypeScript and move to Mini
incrementally. Compiler logic must not remain hidden in TypeScript helpers
after bootstrap replacement.

[Built-in I/O and library functions](docs/builtins.md) provide the small host
capabilities needed by the compiler and later tools.

Avoid speculative features, advanced mathematics, Unicode requirements, rich
diagnostics, extra safety systems, and unnecessary layers. Rebuild checks stay
small too. “Smallest” is a practical goal, not a mathematical claim.

## Development

Use Node 24.16.0 from [.node-version](.node-version).

```text
npm ci
./bin/mini check
./bin/mini test
./bin/mini bench .cache/bench.json
```

npm installs development dependencies only. Commands live in `bin/`:
`mini`, `mini-check`, `mini-test`, `mini-bench`, `mini-verify`,
`mini-release`, `mini-compile`, and `minic`. Compiler commands report
unavailability until the compiler exists.

Read [contributing](CONTRIBUTING.md), [agent rules](AGENTS.md),
[versioning](docs/versioning.md), [cases](docs/cases.md),
[bootstrap verification](docs/bootstrap.md), and [releases](docs/releases.md).
