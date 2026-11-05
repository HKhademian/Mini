# Contributing

Follow [AGENTS.md](AGENTS.md). Keep code and communication concise.
Always use atomic commits: one coherent change, its checks, and related docs.
Stage owned paths, review the diff, verify, then commit before independent work.

Use Node 22.18.0 or newer and `npm ci` for locked development dependencies.
Development and release builds pin 24.16.0 in [.node-version](.node-version);
see [runtime requirements](docs/runtime.md).

```text
./bin/mini check
./bin/mini test
./bin/mini verify
./bin/mini bench .cache/bench.json
./bin/mini release dist/local
```

`check` runs strict TypeScript, documentation, version, and case checks.
`check --docs` omits TypeScript checking and needs no installed dependencies.
A configured bootstrap is verified in either mode. `verify CASE.json` runs one
case manifest; bare `verify` checks the bootstrap and fails while the compiler
is unavailable. Release output directories must be empty.

Run compiler host-adapter tests with `node --test compiler/builtins.test.ts`.
CI runs them alongside the editor and release checks.

Executable project code uses direct Node TypeScript or mini; no shell, Python,
or other scripting languages. Extensionless commands are Node shebang entries.
Internal TypeScript imports retain `.ts` for direct Node execution.

Keep root files conventional: README, contributor/agent guides, changelog,
package/lockfile, TypeScript config, and Node version. Put commands in `bin/`,
implementations in `tools/`, metadata in `config/`, cases in `cases/`, and
guides in `docs/`. Standard-library source belongs in `std/`. Create it and
compiler, sample, or example directories when needed; avoid empty scaffolding.

For syntax or compiler changes, follow [language evolution](docs/evolving-language.md)
and [the case guide](docs/cases.md), update
affected samples/examples, and preserve [the bootstrap](docs/bootstrap.md).
Document changes in [CHANGELOG.md](CHANGELOG.md).
Use [versioning](docs/versioning.md) and [release instructions](docs/releases.md)
when preparing a release. Routine implementation does not create tags or push.
