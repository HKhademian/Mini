# Versions

[config/versions.json](../config/versions.json) is authoritative.
Each entity advances independently:

- `mini`: project, tag `mini-vX.Y.Z`.
- `language`: accepted language contract, tag `lang-vX.Y.Z`.
- `compiler`: compiler implementation, tag `compiler-vX.Y.Z`.
- `bootstrap`: generated compiler/source pair, tag `bootstrap-vX.Y.Z`.
- `cli`: command dispatcher, tag `cli-vX.Y.Z`.
- `check`, `test`, `verify`, `bench`, `release`: separate tools,
  each with its own `NAME-vX.Y.Z` tag.

`null` means unimplemented/unassigned and blocks that entity's release.
Language, compiler, and bootstrap are currently unassigned. Only individual
tool/CLI releases can publish before self-hosting; a mini release must include
a verified bootstrap.

Use `MAJOR.MINOR.PATCH`, optionally `-alpha.N`, `-beta.N`, or `-rc.N`.
No leading zeros or build metadata. After 1.0, incompatible changes bump MAJOR,
compatible additions MINOR, and compatible fixes PATCH. Before 1.0, incompatible
changes bump MINOR and are documented; do not hide them in PATCH.

Commit release preparation separately from implementation. An annotated tag
must match its entity's recorded version and exact source commit. Never move
or reuse published tags. Corrections get a new version.

Every release includes the complete source snapshot and available tools and
bootstrap. The manifest records all entity versions; bundling an entity does
not bump its version. Do not use bare `vX.Y.Z` tags or compete for GitHub's
default latest release across independent streams.
