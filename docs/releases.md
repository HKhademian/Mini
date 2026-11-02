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

Local packaging does not configure a GitHub remote, push, create a tag, or
publish a release. Hosted workflow integration is a separate increment.
