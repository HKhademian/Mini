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
The baseline includes `//` line comments and `///` documentation comments.
Keep Mini source and functions documented using these forms.
The [map runtime](docs/map-runtime.md) uses object storage and counts keys with
`list_length(map_keys(items))`, keeping writes free of size bookkeeping.
The [before/after measurements](docs/map-runtime-performance.md) record its
compiler gains and the workloads that regress.

M1 is the first compiler source written in Mini; T1 is the generated TypeScript
compiler, `T1 = T0(M1)`. The first M1 lives in
[compiler/compiler.mini](compiler/compiler.mini). T0 remains active until the
candidate passes performance review and bootstrap promotion. Keep M1 close to T0
in routine boundaries, control flow, calls, lookups, and data layout. Adapt forms
where Mini requires it; defer redesign and performance refactoring until the
corresponding port is verified.

Use the [T0-to-T1 implementation reference](docs/t0-t1-reference.md) to map the
existing compiler's mechanisms to Mini functions, maps, lists, and text helpers.
The [generated-code performance audit](docs/runtime-performance.md) records
measured costs and the actual-compiler comparison required before retiring T0.
The [paired application benchmarks](docs/application-performance.md) compare ten
Mini/handwritten-TS applications, including scanner/parser/emitter workloads.

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
./bin/mini check samples/001-bindings.mini
./bin/mini fmt samples/001-bindings.mini
./bin/mini test
./bin/mini verify cases/tooling/check.case.json
./bin/mini bench .cache/bench.json
```

Source checking uses `mini check SOURCE.mini`; `mini check -` reads standard
input. A successful check writes nothing and creates no `.mini.ts` file. A
failure prints the compiler's first diagnostic and exits 1.

`mini fmt SOURCE.mini` writes canonical source to standard output; `mini fmt -`
reads standard input. `--write` replaces one file after successful formatting,
and `--check` reports noncanonical input without writing.

npm installs development dependencies only. Commands live in `bin/`:
`mini`, `mini-check`, `mini-format`, `mini-lang-server`, `mini-test`, `mini-bench`,
`mini-verify`, `mini-release`, `mini-compile`, and `minic`.

Runnable [samples](samples/README.md) showcase language features and built-ins.
Each sample has a matching JSON verification case.

Basic [VS Code support](editors/vscode/README.md) provides `.mini` file icons,
syntax highlighting, and bracket/quote pairing. Install it locally from a VSIX.
The standalone `mini-lang-server` provides diagnostics and formatting for
editors that launch it directly; the extension does not connect to it yet.

[Future tooling](docs/tooling.md) records `mini-document` / `mini doc` and
`mini-help` / `mini help`. These commands are not available yet.

Read [contributing](CONTRIBUTING.md), [agent rules](AGENTS.md),
[versioning](docs/versioning.md), [cases](docs/cases.md),
[bootstrap verification](docs/bootstrap.md), and [releases](docs/releases.md).
The [version inventory](docs/versioning.md#current-inventory) lists current
products, future streams, and how specifications/docs identify their versions.
