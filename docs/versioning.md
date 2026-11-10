# Versions

[config/versions.json](../config/versions.json) is authoritative.

## Group and product versions

Tags use `product-vGROUP_VERSION-vPRODUCT_VERSION`:

```text
ast-v0.6.0-v0.1.0-alpha.1
compiler-v0.5.0-v0.4.0-alpha.5
bootstrap-v0.5.0-v0.2.0-alpha.7
vscode-v0.5.0-v0.3.6
```

The shared group is `0.6.1`. Each product keeps its own version.
The group identifies mini's compatibility baseline, not a product counter.
Change it when that baseline changes; changing groups does not reset products.
A product-only fix advances only that product's version.

Product versions increase across groups. An unchanged implementation may carry
its existing version into a new group after verification:

```text
vscode-v0.3.0-v0.3.0  initial grouped label
vscode-v0.3.0-v0.3.1  editor fix; same group
vscode-v0.3.0-v0.3.2  hover and completion; same group
vscode-v0.3.0-v0.3.3  go to definition; same group
vscode-v0.5.0-v0.3.6  := grammar; new group
vscode-v0.5.0-v0.3.7  include syntax; same group
vscode-v0.5.0-v0.3.8  canonical file icon; same group
vscode-v0.6.0-v0.3.9  import syntax; new group
```

The editor keeps one counter while its group changes. Use one continuous
product counter; never restart it at a group boundary.
New products start at `0.1.0-alpha.1`. Existing counters are preserved.

Group versions use plain `MAJOR.MINOR.PATCH`. Product versions use
`MAJOR.MINOR.PATCH`, optionally `-alpha.N`, `-beta.N`, or `-rc.N`.
No leading zeros or build metadata. After 1.0, incompatible changes bump MAJOR,
compatible additions MINOR, and compatible fixes PATCH. Before 1.0, incompatible
changes bump MINOR and are documented.

The VS Code package and lockfile retain the plain product version, such as
`0.2.0`; the group appears in its release tag and packaged VSIX filename.
`mini check` validates registry/package/lockfile alignment. A plain group
version does not make an alpha product stable.

## Current inventory

Current group: `0.6.1`. These are assigned release identities, not claims of
publication. Bootstrap promotion is recorded separately in
[config/bootstrap.json](../config/bootstrap.json). Check the registry for later
increments:

```text
mini-v0.6.1-v0.3.0-alpha.57
lang-v0.6.1-v0.5.0-alpha.16
ast-v0.6.1-v0.1.0-alpha.3
compiler-v0.6.1-v0.5.0-alpha.89
bootstrap-v0.6.1-v0.3.0-alpha.75
cli-v0.6.1-v0.1.0-alpha.20
check-v0.6.1-v0.1.0-alpha.13
format-v0.6.1-v0.1.0-alpha.9
lsp-v0.6.1-v0.1.0-alpha.11
test-v0.6.1-v0.1.0-alpha.8
verify-v0.6.1-v0.1.0-alpha.10
bench-v0.6.1-v0.1.0-alpha.7
release-v0.6.1-v0.1.0-alpha.8
vscode-v0.6.1-v0.3.9
```

`mini` versions the complete distribution; `cli` versions its dispatcher.
`lang` identifies the language/specification contract. `ast` versions the
target-neutral AST schema and `Program` inspection contract. `compiler` versions the
active generated compiler; the retired handwritten compiler has no product
stream. `bootstrap` versions the promoted generated fixed point.
`mini-compile` and `minic` share the compiler version.
Each other tool keeps the stream named by its tag.

Std remains unassigned/unavailable. Future first-release examples under the
current group, to use only after implementation and verification:

```text
std-v0.6.1-v0.1.0-alpha.1
document-v0.6.1-v0.1.0-alpha.1
help-v0.6.1-v0.1.0-alpha.1
play-v0.6.1-v0.1.0-alpha.1
```

Only std is already registered as an unassigned stream. Register other
future streams with their first implementation. See [tooling](tooling.md) for
scope and commands. The browser playground is implemented in `site/`; its `play`
product stream and version remain unassigned.

## Compatibility evidence

Products need not depend on one another merely because they share a group.
The editor follows language syntax; bench consumes cases and the compiler
command interface; release consumes packaging, case, and compiler interfaces.
Do not introduce extra case-format or package-format release streams now.

Verify each product against the contracts it actually uses. A distribution pins
exact product versions, source/artifact identities, and documentation revisions.
Sharing a group label does not prove every possible pair was tested.
Release manifests record group and product versions separately.

The tag parser, CLI version output, release packaging, and CI enforce the
group/product identities. General dependency declarations and cross-version
compatibility checks are not implemented.

Compiler verification uses the corresponding language cases. Record its source
language separately from the language it accepts, plus its prior builder during
bootstrap migration. Editor highlighting is not compiler conformance.
Std declares its language and builtin requirements. A future LSP also identifies
its client/protocol requirements. A playground pins its compiler/language/library
selection; shared programs preserve that selection.

## Specification, docs, and other items

- Specification: follows the language contract; prose corrections use source revisions.
- Docs/reference/wiki pages: source revision plus applicable group/product versions.
  Freeze published revisions; corrections produce new revisions. No wiki exists yet.
- Command help: follows its owning tool; current `mini --help` belongs to CLI.
  Future help/document tools have independent versions; their content records its targets.
- Cases, samples, schemas, agent rules, and CI: source revision, not per-file
  release counters. Cases retain stable IDs and source/stream hashes.
- Benchmarks: tested versions, case identities, runtime, and environment.
- Node, editor, and protocol versions: dependencies, not mini products.

## Assignment and release rules

`null` means unimplemented/unassigned and blocks that product's release.
Every verified increment has one atomic commit and an annotated grouped tag.
Never move or rename historical tags. Old tags remain valid historical
identities; current tooling requires the new grouped format.
Keep legacy tags on their original commits; do not manufacture group membership
for revisions that predate the group registry. New publications use grouped tags.

Release manifests use schema version 2 and record the full source commit,
`group`, product versions, and the released product's group/version. VSIX
filenames include both numbers, for example `mini-0.4.0-v0.3.4.vsix`.

Stable compiler, language, bootstrap, and mini distribution releases require a
verified self-hosted bootstrap. Tools and implemented libraries need not be
self-hosted.

Tag each verified product on its atomic commit before the next feature.
Push tags only when publishing is authorized. Packaging never publishes.
Never reuse published tags; corrections require a new product version.
Before pushing, audit annotation, group/product values at each tag's own commit,
and existing remote object IDs. Push explicit new refs and verify remote IDs
afterward. Do not use a blanket legacy-tag push or force-update remote tags.
Publishing a version tag does not bypass the self-hosting release gate.
