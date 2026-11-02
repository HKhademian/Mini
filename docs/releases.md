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
./bin/mini release dist/tag check-v0.1.0-alpha.1
```

The tag must match [the version registry](../config/versions.json). Packaging
rejects dirty sources, mismatched versions, lightweight tags, and tags at another
commit. Compiler/mini releases require a verified bootstrap.

Assets: complete `minilang-TAG.tar.gz`, embedded `RELEASE.json`, external
`manifest.json`, `RELEASE-NOTES.md`, and `SHA256SUMS`. They identify the source
commit, entity versions, Node version, and available bootstrap hashes.

Packaging extracts and checks the finished archive without Git history or
installed npm packages. Compiler output must reproduce exactly; compressed
archive bytes across tar implementations need not.

After verifying `SHA256SUMS` with your platform's SHA-256 utility, extract into
an empty directory. Run `./bin/mini check --docs` without dependencies.
Run `./bin/mini verify` when a compiler is included. For development, install
the lockfile with `npm ci`, then use the normal bin commands.

## GitHub

[CI](../.github/workflows/ci.yml) checks Linux and macOS on branch pushes and
pull requests. It runs strict checks, JSON cases, benchmark smoke tests, and
extracted distribution checks. Benchmark reports are downloadable artifacts.

[Release](../.github/workflows/release.yml) runs CI for an authorized push of an
annotated entity tag, packages the exact revision, uploads all assets to a
draft, then publishes it. Prereleases stay prereleases. Existing releases are
never overwritten. Manual runs build artifacts without publishing. All workflow
tasks use TypeScript directly through Node, with no shell scripts.

After committing release preparation, create an annotated tag matching the
registry and push that tag to your GitHub remote. Branch pushes never publish
or create tags. Workflows become active when their commits reach GitHub;
local packaging never publishes a release.
