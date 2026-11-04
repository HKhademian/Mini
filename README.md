# mini

A tiny self-hosting foundation for building other languages.

Keep syntax and implementation small, readable, and easy to change. Include
enough expressiveness to develop, maintain, and extend the self-hosted compiler
directly. Broad general-purpose features are outside this project's objective.

The main workflow is to clone this foundation and
[grow your own language while preserving self-hosting](docs/evolving-language.md).
Read [why Mini exists](docs/why-mini.md) for its purpose, audience, and
deliberate tradeoffs. To install a release and run a first program, see
[getting started](docs/getting-started.md).

[The generated compiler](docs/compiler.md) implements the reviewed language
cases in direct Node JavaScript. The [language draft](docs/language.md) records
the reviewed contract; cases verify compilation, generated output, execution,
and diagnostics.

From a clean checkout, build every generated artifact from the tracked
`bin/bootstrap` seed:

```text
./bin/bootstrap
./bin/mini check
```

`bin/bootstrap` is generated from [tools/bootstrap.mini](tools/bootstrap.mini)
and embeds the compiler. It rebuilds the compiler, verifies the fixed point,
then generates `dist/` and the other `bin/` commands. `dist/` and generated
`bin/` entries are ignored by Git.

## Self-hosting

The bootstrap compiler is the only seed. It is generated from Mini source and is
tracked at `bin/bootstrap`; there is no handwritten compiler. Further compiler
work uses the self-hosted source and bootstrap regeneration. The baseline includes `//` line comments and
`///` documentation comments. Keep Mini source and functions documented using
these forms.
The [map runtime](docs/map-runtime.md) uses object storage and counts keys with
`list_length(map_keys(items))`, keeping writes free of size bookkeeping.
The [before/after measurements](docs/map-runtime-performance.md) record its
compiler gains and the workloads that regress.

M1 is the compiler source written in Mini; T1 is the generated JavaScript
compiler produced from it. The source lives in
[tools/compiler.mini](tools/compiler.mini); the promoted T1 is
[dist/compile.js](dist/compile.js), selected by
[config/compiler.json](config/compiler.json). Keep M1 close to the verified
first-port boundaries, control flow, calls, lookups, and data layout. Defer
redesign and performance refactoring until the corresponding change is verified.

The [progress page](docs/progress.md) turns the tag history into a readable
timeline of groups, milestones, and current release identities.

The [historical port reference](docs/t0-t1-reference.md) records how the retired
T0 implementation mapped to Mini functions, maps, lists, and text helpers.
The [generated-code performance audit](docs/runtime-performance.md) records
measured costs and the actual-compiler comparison; the large-source compile gap
remains a tracked follow-up.
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

The verified generated compiler is promoted to the distributed bootstrap. The
generated compiler, matching Mini source, and rebuild instructions ship together.
The generated compiler is the only compiler implementation.

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

Keep language semantics small to implement across targets. JavaScript/Node is
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
surface; [self-containment](docs/self-containment.md) separates the irreducible
host boundary from replaceable performance builtins.
capabilities needed by the compiler and later tools.

The [self-hosting requirements assessment](docs/self-hosting-requirements.md)
separates necessary semantic decisions and compiler capabilities from optional
language additions. It does not accept new syntax.

Avoid speculative features, advanced mathematics, Unicode requirements, rich
diagnostics, extra safety systems, and unnecessary layers. Rebuild checks stay
small too. “Smallest” is a practical goal, not a mathematical claim.

## Development

Use Node 22.18.0 or newer. Development and release builds pin 24.16.0 in
[.node-version](.node-version); see [runtime requirements](docs/runtime.md).

```text
npm ci
./bin/mini check
./bin/mini check samples/001-bindings.mini
./bin/mini fmt samples/001-bindings.mini
./bin/mini run samples/003-io.mini
./bin/mini test
./bin/mini test --unit
./bin/mini verify
./bin/mini verify cases/tooling/check.case.json
./bin/mini bench .cache/bench.json
```

Source checking uses `mini check SOURCE.mini`; `mini check -` reads standard
input. A successful check writes nothing and creates no `.mini.js` file. A
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
syntax highlighting, bracket/quote pairing, live diagnostics, hover, completion,
go-to-definition, and formatting through the standalone `mini-lang-server`.
Install it locally from a VSIX and install the server from a source distribution
or set `mini.serverPath`.

[Future tooling](docs/tooling.md) records `mini-document` / `mini doc` and
`mini-help` / `mini help`. These commands are not available yet.

Read [contributing](CONTRIBUTING.md), [agent rules](AGENTS.md),
[runtime requirements](docs/runtime.md), [versioning](docs/versioning.md),
[cases](docs/cases.md), [bootstrap verification](docs/bootstrap.md), and
[releases](docs/releases.md).
The [version inventory](docs/versioning.md#current-inventory) lists current
products, future streams, and how specifications/docs identify their versions.

## License

Apache-2.0. See [LICENSE](LICENSE).
