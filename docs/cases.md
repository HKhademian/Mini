# Cases, samples, and benchmarks

Each test definition is a `NAME.case.json` file under `cases/`.
Source, input, stdout, and stderr are separate files. Never combine the corpus
or its source/streams in a script. Mini code uses `.mini`; TypeScript tooling
fixtures use `.ts`.

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
      "stdin": "echo-word.stdin.json",
      "stdout": "echo-word.stdout.json",
      "stderr": "echo-word.stderr.json",
      "exitCode": 0
    }
  ]
}
```

Each stream JSON contains exactly one of `text`, `bytes`, or `file`, plus an
optional `hash`. For example, an input file can contain
`{ "text": "hello\\n", "hash": "sha256:..." }`.
`bytes` contains integers 0–255. `file` references a separate raw file.
Paths are relative to the containing JSON. Hashes cover resolved bytes, not
JSON formatting. A changed hash fails verification; update expectations
deliberately after reviewing the contract. Streams are compared byte for byte.

Kinds: `tool` runs TypeScript; `feature`, `sample`, and `example` compile Mini
then run it; `compile` checks emitted compiler output; `reject` checks failed
compilation with no emitted artifact. Unavailable compilers fail language cases;
nothing is silently counted as passed.

Run `./bin/mini test` or `./bin/mini test FILTER`.
[The manifest schema](../config/case.schema.json) and
[stream schema](../config/stream.schema.json) describe the format.
The runner validates structure and unique IDs/scenario names.

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
stream hashes. Timing includes process startup, IO, verification, and compilation
for program cases. Compare like workloads and hosts. Current benchmark cases
measure the harness only; there is no Mini compiler performance result yet.
