# Cases, samples, and benchmarks

Each test definition is a `NAME.case.json` file under `cases/`.
Mini source stays in separate `.mini` files. Tool cases name existing commands
under `bin/`; they do not have their own executable scripts.

A manifest can hold several named scenarios for one source:

```json
{
  "id": "text.echo",
  "kind": "feature",
  "source": "echo.mini",
  "features": ["text.input"],
  "cases": [
    {
      "name": "word",
      "stdin": { "file": "echo-word.stdin" },
      "stdout": { "file": "echo-word.stdout" },
      "stderr": { "text": "" },
      "exitCode": 0
    }
  ]
}
```

`stdin`, `stdout`, `stderr`, and `artifact` are objects directly in the manifest.
Each contains exactly one of `text`, `bytes`, or `file`, plus optional `hash`.
`text` is UTF-8; `bytes` contains integers 0–255; `file` reads raw bytes from a
separate file relative to the manifest. File payloads are not JSON wrappers.
Prefer external files for substantial inputs and expected output.

Hashes use `sha256:` followed by 64 lowercase hex digits and cover resolved
bytes. A mismatch fails verification. Update expectations deliberately after
reviewing the contract. Streams are compared byte for byte.

Kinds: `tool` invokes the named command; `feature`, `sample`, and `example` compile Mini
then run it; `compile` checks compiler stdout/stderr/status and a separate
`artifact` descriptor; `reject` checks failed compilation with no output file.
Unavailable compilers fail language cases;
nothing is silently counted as passed.

Run `./bin/mini test` or `./bin/mini test FILTER`.
Run one manifest with `./bin/mini verify cases/tooling/check.case.json`.
[The manifest schema](../config/case.schema.json) and
[stream schema](../config/stream.schema.json) describe the format.
The runner validates structure and unique IDs/scenario names.

## Tool cases

Use `"kind": "tool"` and, for example, `"tool": "mini-release"` instead of
`source`. Scenarios supply arguments and stream descriptors to that real tool.
There is no per-case TypeScript runner.

For tools that modify a checkout, `"workspace": "clean"` or `"dirty"` creates
an isolated Git copy. Optional `tag` describes a fixture tag with `name` and
`annotated`; `files` lists output paths that must exist. These setup options
belong to the shared runner, not executable case scripts.

## Language changes

Write the intended contract and focused cases before implementation. Cover
supported forms, relevant input variants, rejections, and interactions with
existing features. Keep distinct syntax forms in separate source/manifest pairs;
use multiple scenarios for different inputs to the same source. Avoid
speculative cases outside the tiny supported subset.

Draft syntax and its unimplemented cases belong in documentation until accepted;
do not claim executable support. Once implemented, register the cases under
`cases/`, verify generated output/execution, and preserve the bootstrap gate.
A self-build alone does not establish all feature behavior.

Use `samples/` for small teaching programs and `examples/` for complete useful
programs, creating those directories only when needed. Give each a stable
numeric slug, short explanation, and a matching case manifest. The check tool
requires coverage for every `.mini` file there. After syntax changes, simplify
affected consumers, update cases/docs, and rerun them.

## Benchmarks

Opt a case into benchmarking with `"benchmark": { "warmups": 1, "samples": 7 }`.
Run `./bin/mini bench .cache/bench.json FILTER`; use a fresh output filename.
Every measured run still checks expected streams/status. Failures and timeouts
are not successful timing samples.

Reports contain raw wall times, an upper-middle median, warm-up count, Node/OS/
architecture, source commit, entity versions, compiler hash, and case/source/
stream hashes. Tool identities hash their command entrypoint. Timing includes
process startup, IO, verification, and compilation
for program cases. Compare like workloads and hosts. Current benchmark cases
measure repository tools; there is no Mini compiler performance result yet.
