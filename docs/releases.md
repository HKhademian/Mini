# Releases

Use a clean committed checkout and Node from [.node-version](../.node-version).

```text
npm ci
./bin/mini check
./bin/mini test
./bin/mini release dist/local
```

Local packaging creates snapshot assets and never publishes. Output directories
must be empty. To validate an existing annotated component tag at HEAD:

```text
./bin/mini release dist/tag check-v0.1.2-v0.1.0-alpha.3
```

The tag must match [the version registry](../config/versions.json). Packaging
rejects dirty sources, mismatched versions, lightweight tags, and tags at another
commit. Mini/language/bootstrap releases require a verified bootstrap. Compiler
releases also require it except for explicitly labeled T0 prerelease previews.
T0 previews record their stage and all implementation-source hashes and never
claim self-hosting. Stable T0 compiler releases are rejected.
Packaging compiles and runs the configured Mini smoke case from the extracted
T0 distribution without dependencies. The manifest records its case/stream
identities and emitted-program hashes separately from the self-hosting gate.
The optional library uses `std-v*`; its unassigned version blocks release until
the library exists. Supporting tools and libraries need not be self-hosted.

Assets: complete `minilang-TAG.tar.gz`, embedded `RELEASE.json`, external
`manifest.json`, `RELEASE-NOTES.md`, and `SHA256SUMS`. They identify the source
commit, entity versions, Node version, and available bootstrap hashes.

The [group/product policy](versioning.md#group-and-product-versions) uses
`product-vGROUP-vPRODUCT` tags. Packaging validates both numbers against the
registry and records them separately in schema-version-2 manifests. A complete
distribution pins the exact products it verifies. General dependency compatibility
checks are not implemented. Product fixes do not automatically bump other products.

Packaging extracts and checks the finished archive without Git history or
installed npm packages. Compiler output must reproduce exactly; compressed
archive bytes across tar implementations need not.

## VS Code extension

An annotated `vscode-vGROUP-vPRODUCT` tag releases the extension independently of the
compiler. Install its locked development dependencies before local packaging:

```text
npm --prefix editors/vscode ci --ignore-scripts
./bin/mini release dist/vscode vscode-v0.1.2-v0.1.1
```

The example requires the matching annotated tag at HEAD and a clean checkout.
The release adds `mini-GROUP-vPRODUCT.vsix`, built from the committed source archive.
Its filename and SHA-256 are recorded in both manifests; `SHA256SUMS` covers
the VSIX alongside the source archive and release notes. GitHub installs the
packaging dependencies and uploads the VSIX automatically for `vscode-v*` tags.
Other streams and untagged snapshots retain source-only packaging.

After verifying `SHA256SUMS` with your platform's SHA-256 utility, extract into
an empty directory. Run `./bin/mini check --docs` without dependencies.
Run `./bin/mini verify` when a compiler is included. For development, install
the lockfile with `npm ci`, then use the normal bin commands.

## GitHub

[CI](../.github/workflows/ci.yml) checks Linux and macOS on branch pushes and
pull requests. It runs strict checks, JSON cases, benchmark smoke tests, and
extracted distribution checks. Benchmark reports are downloadable artifacts.
It also checks the VS Code grammar on both platforms. The extension has its own
`vscode-v*` stream; see its [local VSIX build](../editors/vscode/README.md).

[Release](../.github/workflows/release.yml) runs CI for an authorized push of an
annotated entity tag, packages the exact revision, uploads all assets to a
draft, then publishes it. Prereleases stay prereleases. Existing releases are
never overwritten. Manual runs build artifacts without publishing. All workflow
tasks use TypeScript directly through Node, with no shell scripts.

After committing release preparation, create an annotated tag matching the
registry and push that tag to your GitHub remote. Branch pushes never publish
or create tags. Workflows become active when their commits reach GitHub;
local packaging never publishes a release.
