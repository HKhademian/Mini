# Progress

Tags are the project's source milestones. They mark verified commits, not
necessarily published binaries. The full tag list
is the complete chronological history; this page highlights the groups.

## Current identities

The current assigned versions are in
[config/versions.json](../config/versions.json). The active release labels are:

```text
mini      mini-v0.4.0-v0.1.0-alpha.33
lang      lang-v0.4.0-v0.3.0-alpha.32
compiler  compiler-v0.4.0-v0.3.0-alpha.43
bootstrap bootstrap-v0.4.0-v0.1.0-alpha.30
builtins  builtins-v0.4.0-v0.3.0-alpha.31
cli       cli-v0.4.0-v0.1.0-alpha.16
check     check-v0.4.0-v0.1.0-alpha.9
format    format-v0.4.0-v0.1.0-alpha.5
lsp       lsp-v0.4.0-v0.1.0-alpha.7
test      test-v0.4.0-v0.1.0-alpha.5
verify    verify-v0.4.0-v0.1.0-alpha.5
bench     bench-v0.4.0-v0.1.0-alpha.5
release   release-v0.4.0-v0.1.0-alpha.5
vscode    vscode-v0.4.0-v0.3.4
```

## Groups

| Group | Period | Focus |
| --- | --- | --- |
| `0.1` | 2026-11-02 to 2026-11-03 | Foundation, first language cases, early tooling |
| `0.2` | 2026-11-03 | Language expansion, editor and language server |
| `0.3` | 2026-11-03 to 2026-11-04 | Self-hosting, include, generated tooling, bootstrap-only distribution |
| `0.4` | 2026-11-04 to 2026-11-06 | JavaScript output, bootstrap-only seed, browser playground and showcase |

## Milestones

- **mini compiler self-hosted.** The compiler source is mini and rebuilds itself
  through the bootstrap fixed point.
- **Tooling generated from mini.** Build, dispatcher, checks, formatter, language
  server, tests, benchmarks, release, and CI tasks are mini sources.
- **`include` composition.** Source files declare their dependencies instead of
  being concatenated by a central parts list.
- **Bootstrap-only distribution.** [bin/bootstrap](../bin/bootstrap) is the only
  tracked executable under `bin/`; it rebuilds the compiler and every generated
  tool.
- **JavaScript output.** The compiler emits plain Node JavaScript. Generated
  programs run directly on Node 22.18.0 or newer, without a TypeScript transform.
- **Paren-free conditions.** `if` and `while` conditions end at the braced body;
  parentheses remain available for grouping. A block rejects duplicate `var`
  declarations.
- **Browser playground.** The [showcase](../site/README.md) compiles tracked
  samples in a worker and shows the generated JavaScript beside each result.
- **Pure reference mode.** Text, list, map, JSON, number, and UTF-8 operations
  have pure implementations selected by `compiler --reference`.

## Tags versus releases

A tag marks source identity. A release can additionally carry built artifacts:

- compiler and tools
- launchers
- VS Code VSIX
- source and checksums

Not every historical tag was built into a published release. For a stable
artifact, use the latest release for the relevant product; for history, browse
the tag list.

The release workflow and artifact policy are documented in
[versioning](versioning.md) and [releases](releases.md).
