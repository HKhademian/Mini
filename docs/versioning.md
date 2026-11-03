# Versions

[config/versions.json](../config/versions.json) is authoritative.

## Group and product versions

`mini-vX.Y.Z` identifies a group release: one verified selection of language,
compiler, builtins, available tools, libraries, and their documentation.
Each product also advances independently. A product fix does not require a
language change. A group update changes only its own version and the selected
products that changed; unchanged products retain their versions.

Each product declares the language versions it supports and any required
builtins, libraries, runtime, or product interfaces. Start with exact supported
versions during early development. Support for multiple versions is explicit;
newer does not imply support for older syntax. Introduce ranges only with clear,
tested compatibility rules. Do not combine group and product numbers into a
custom `X-Y` version.

A group pins exact product versions and source/artifact identities. Verify the
selected combination together. Product releases can happen between group
releases; they do not silently change an existing group.

The registry currently records versions, and release manifests record the
snapshot's component versions. Machine-readable compatibility declarations and
their enforcement are not implemented yet. Existing snapshots are not proof of
group compatibility. The assigned `mini` version predates this group policy;
it has no group tag and does not identify a verified group release yet.

## Registered streams

Each entity has its own tag:

- `mini`: verified group, tag `mini-vX.Y.Z`.
- `language`: accepted language/specification contract, tag `lang-vX.Y.Z`.
- `compiler`: compiler implementation, tag `compiler-vX.Y.Z`.
- `builtins`: primitive language operations, tag `builtins-vX.Y.Z`.
- `bootstrap`: generated compiler/source pair, tag `bootstrap-vX.Y.Z`.
- `std`: optional standard library, tag `std-vX.Y.Z`.
- `cli`: command dispatcher, tag `cli-vX.Y.Z`.
- `vscode`: editor extension, tag `vscode-vX.Y.Z`. Its package and lockfile
  versions must match the registry; `mini check` enforces this.
- `check`, `test`, `verify`, `bench`, `release`: separate tools,
  each with its own `NAME-vX.Y.Z` tag.

`mini-compile` and `minic` share the compiler version. T0 is the active compiler
stage, not a second product stream. The `mini` command dispatcher uses the CLI
version separately from the Mini group version.

## Current inventory

Assigned versions at this documentation update; check the registry for later
changes. Assignment does not mean a release was published:

```text
mini       0.1.0-alpha.1   group unverified; no group tag
language   0.1.0-alpha.5   specification / accepted draft
compiler   0.1.0-alpha.30  handwritten T0
builtins   0.1.0-alpha.14
cli        0.1.0-alpha.2
check      0.1.0-alpha.2
test       0.1.0-alpha.2
verify     0.1.0-alpha.2
bench      0.1.0-alpha.2
release    0.1.0-alpha.2
vscode     0.1.1
bootstrap  unassigned; unavailable
std        unassigned; unavailable
```

Future independent products have no version or registered stream yet. Proposed
identifiers and tag forms, to register with their first verified implementation:

- Formatter: `format`, `format-vX.Y.Z`; command `mini-format` / `mini fmt`.
- Documentation generator: `document`, `document-vX.Y.Z`;
  command `mini-document` / `mini doc`.
- Help/reference tool: `help`, `help-vX.Y.Z`; command `mini-help` / `mini help`.
- Language server: `lsp`, `lsp-vX.Y.Z`; command `mini-lang-server`.
- Playground: `play`, `play-vX.Y.Z`; delivery and commands remain undecided.

The [tooling guide](tooling.md) defines the existing future-tool scope. Listing
a version identity does not implement a product or select additional features.

## Specification, docs, and other items

- Specification: the language version identifies the contract. Prose-only
  corrections get a source revision without changing that contract version.
- Repository docs, guides, and generated reference output: identify their source
  revision and the exact language/product versions they describe. Published
  group docs are frozen with their group; later corrections get new revisions.
  The documentation generator has its own product version, separate from output.
- Command help: follows its owning tool's version. Current `mini --help` belongs
  to the CLI. A future standalone help tool also records its content revision
  and the versions its explanations describe.
- Wiki: no separate wiki is maintained yet. Pages need revision history and
  explicit applicable versions. A separately released wiki application would
  have a product version; individual pages need no product counters.
- Cases, samples, examples, schemas, agent rules, and CI definitions: identified
  by source revision; cases retain stable IDs and source/stream hashes. Schema
  revisions follow their owning tool's compatibility contract. No individual
  release stream is needed for each file.
- Benchmark reports: record tested product versions, source/case identities,
  runtime, and environment, using the benchmark tool's version.
- Node and editor/protocol requirements: dependency versions, not Mini products.

## Compatibility evidence

- Compiler: verify every supported contract against its corresponding cases;
  identify partial support explicitly. Record the language used to write the
  compiler separately from the language accepted by it, plus the prior builder
  identity for bootstrap migration.
- Builtins and std: declare their language and builtin/API requirements and
  verify compilation and execution with the selected compiler.
- Editor: declare syntax/editor support. Highlighting is not compiler conformance.
  An LSP additionally declares its client/protocol interface requirements.
- Formatter, documenter, and help: verify behavior/content against their declared
  language/product versions.
- Playground: identify its own release and exact compiler, language, builtins,
  and std selection. Shared programs preserve that selection; an updated site
  must not silently run them with a different compiler.

For example, an editor-only fix can advance `vscode` from `0.1.1` to `0.1.2`
while leaving the language and compiler unchanged. Its support declaration stays
the same if verified support is unchanged. A later group release can select it.
This is an example, not an assigned version bump.

## Assignment and release rules

`null` means unimplemented/unassigned and blocks that entity's release.
The compiler stream versions handwritten T0 while it is active. Each small
support increment advances its prerelease counter. Built-ins advance separately
when primitive support changes.
Language, compiler, and builtins have T0 development versions; bootstrap and std remain
unassigned. Tool/CLI and
implemented library and builtin releases can publish independently. T0 compiler
prereleases are labeled previews; stable compiler, language, bootstrap, and mini
releases require a verified compiler bootstrap. Reserving `std`
does not introduce a library or select module/import syntax.

Use `MAJOR.MINOR.PATCH`, optionally `-alpha.N`, `-beta.N`, or `-rc.N`.
No leading zeros or build metadata. After 1.0, incompatible changes bump MAJOR,
compatible additions MINOR, and compatible fixes PATCH. Before 1.0, incompatible
changes bump MINOR and are documented; do not hide them in PATCH.

The `vscode` stream uses plain `MAJOR.MINOR.PATCH`, matching VS Code's extension
version format. SemVer prerelease suffixes are not supported for this stream.

Commit release preparation separately from implementation. An annotated tag
must match its entity's recorded version and exact source commit. Never move
or reuse published tags. Corrections get a new version.
Tag each verified version increment on its atomic commit before the next feature.
Tags created locally become GitHub release triggers when explicitly pushed.

Every release includes the complete source snapshot and available tools and
bootstrap. The manifest records all entity versions; bundling an entity does
not bump its version. Do not use bare `vX.Y.Z` tags or compete for GitHub's
default latest release across independent streams.
