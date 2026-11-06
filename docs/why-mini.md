# Why mini

mini is a small self-hosting foundation for building other languages. It is not
trying to be the smallest self-hosted language, and that difference is the point.

## What it is

mini is a language, a compiler written in that language, and the machinery that
keeps the compiler rebuilding itself. You clone the foundation and grow your own
language from it; mini is the starting point, not the destination.

The compiler source is [tools/compiler.mini](../tools/compiler.mini). It compiles
mini to readable JavaScript that runs on Node. The generated compiler is the only
implementation and reproduces itself byte for byte.

## What it does

- Compiles mini to plain JavaScript (`mini compile`, `mini run`).
- Rebuilds its own compiler and verifies the fixed point (`mini verify`).
- Checks, formats, runs, and tests mini source (`mini check`, `mini fmt`,
  `mini test`).
- Runs JSON case suites, benchmarks, releases, and a language server.
- Runs from a source distribution on Node 22.18.0 or newer, without installed
  packages.

## Who it is for

People who want to build a language and keep its compiler self-hosted. The
foundation is useful when "the compiler still compiles itself" must remain true
after every change, not only on the day of the first port.

It is not aimed at people who want a general-purpose language to write
applications in. mini is small on purpose: no records, structs, classes, or
standard library yet.

## Why not the simplest self-hosted language?

The simplest self-hosted language optimizes for closing the loop once: a compiler
that compiles itself, demonstrated. mini has to keep the loop closed while the
language changes. That costs more, and the cost is deliberate.

The extra machinery is visible in the repository:

- A fixed point: Compiler1, Compiler2, and Compiler3 must run and be
  byte-identical, and the final compiler must compile an example that runs.
- Cases written before compiler support, covering valid forms, rejections, and
  interactions.
- Migration bridges for breaking changes, kept temporary until the migrated
  source and generated compiler self-host together.
- Versioned release gates: a compiler, language, bootstrap, or distribution
  release requires a verified bootstrap.

None of that is needed to self-host once. All of it is needed to change a
language without silently losing self-hosting. The complexity budget goes to that
loop, not to features: syntax and builtins stay small so the compiler and its
changes stay readable.

"Smallest" is a practical goal, not a mathematical claim. A tiny construct count
is not useful if it makes the compiler unreadable or a migration unsafe.

If you want the smallest possible self-hosted demonstration, mini is bigger than
that. If you want a starting point that survives changes, that extra is what you
are choosing.

## What it is not

- Not a general-purpose language. Broad features are outside its objective.
- Not stable. Versions are alpha and contracts still move.
- Not a package ecosystem or a standard library. `std` is unassigned.
- Not a WebAssembly or native-code target. JavaScript on Node is the selected
  bootstrap target; its representation does not define mini's semantics.
- Not finished tooling. `mini doc` and `mini help` are planned. The browser
  playground is available in the showcase.

## Growing a language from it

The workflow is clone, extend, and keep self-hosting:

1. Read the [language draft](language.md) and the [compiler reference](compiler.md).
2. Add cases for a feature before its compiler support.
3. Implement one feature per atomic commit and keep the fixed point.
4. For a breaking change, follow [language evolution](evolving-language.md): use a
   temporary bridge, migrate the source, and promote the verified pair.
5. Release through the [official cycle](releases.md).

[Runnable samples](../samples/README.md) show the current language. The
[VS Code extension](../editors/vscode/README.md) provides syntax support and a
language server.

## Status

mini is an alpha foundation, not a finished language. See
[versioning](versioning.md) for the current inventory and
[runtime requirements](runtime.md) for the supported Node range.
