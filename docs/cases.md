# Cases, samples, and benchmarks

Each test definition is a `NAME.case.json` file under `cases/`.
mini source stays in separate `.mini` files. Tool cases name existing commands
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
Git preserves stream bytes, including CRLF; do not normalize fixture newlines.

Kinds: `tool` invokes the named command; `feature`, `sample`, and `example` compile mini
then run it; `compile` checks compiler stdout/stderr/status and a separate
optional `artifact` descriptor; `reject` checks failed compilation with no output
file. A compile case without `artifact` checks acceptance, streams, status, and
creation of the generated file. It does not run the program or pin formatting.
A silent program can have empty expected streams and still check compilation
and execution; see the [binding sample](../samples/001-bindings.mini) and its
[case](../cases/language/003-002-bindings-sample.case.json).

Use `"pending": "reason"` on an unimplemented language case. Its source and
expectations are validated now. `test` reports it as pending, never passed.

Source manifests may specify `"target": "js"` or `"target": "c"`; omission
means JavaScript. Tool manifests have no target field. Runnable C cases generate
a source/header pair, preprocess C with `cc -std=c11 -E` into an adjacent `.i`,
then compile that expanded input with `-std=c11 -Wall -Wextra -Werror` and run it
with the same input, arguments, and file fixtures. `cc` must be on PATH;
preprocessing, compilation, or launch failures fail the case. Failed native cases
retain their workspace and report its path so source/header/expanded artifacts
can be inspected; successful cases clean up. C `compile` cases check generated
source/header without invoking `cc`; `artifact` still compares the source only.
`reject` cases require failed Mini compilation and neither output artifact.
Unimplemented target cases stay
pending and never count as native passes.
The full suite may pass its implemented scenarios while listing pending ones;
an explicitly verified pending manifest or a selection containing only pending
scenarios exits unsuccessfully. Pending cases cannot benchmark or satisfy the
bootstrap example gate. Unmarked cases with unavailable compilers still fail.

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

Tooling cases stay focused. Source checking uses tool scenarios with `.mini`
sources and exact streams; stdin uses the shared runner's stdin. Formatting cases
compare exact stdout and include empty, comment-only, CRLF, and invalid-input
scenarios. The runner executes a command once, so formatter idempotence, token
preservation, and `--write` safety use focused Node tests. The language server's
JSON case covers only standalone version/startup behavior; interactive protocol
sessions use Node tests that spawn the real server. Do not add per-case
executables or a general protocol scenario framework.

## mini unit tests

Standalone mini tests use the `test/*.test.mini` suffix. Run them with
`./bin/mini test --unit [FILTER]`. Each test receives the repository root as its
first argument, runs with captured streams, and passes when it exits 0. Compile
failures and nonzero exits are reported as failures. Tests may include `libs/`
helpers through `include`.

`mini test` remains the JSON case runner. Node test files under `test/` cover
host integrations such as VSIX packaging, archive extraction, and LSP sessions.

## Language changes

Write the intended contract and focused cases before implementation. Cover
supported forms, relevant input variants, rejections, and interactions with
existing features. Keep distinct syntax forms in separate source/manifest pairs;
use multiple scenarios for different inputs to the same source. Avoid
speculative cases outside the tiny supported subset.

Include combination cases: functions containing loops and branches, expressions
in arguments and conditions, and observable evaluation order. For example,
[repeat](../cases/language/017-007-combination-repeat.case.json) combines bindings,
functions, loops, branches, and expressions with several input/output pairs.
Keep coverage representative: one case should check a distinct rule or
interaction. Reuse scenarios and shared empty streams; avoid duplicate programs
and exhaustive combinations that add no new behavior.

Runnable mini scenarios can stage files with `inputFiles` and compare generated
files with `outputFiles`. Each maps a relative program path to a stream descriptor:

```json
{
  "inputFiles": { "input.txt": { "file": "io-lines.stdin" } },
  "outputFiles": { "output.txt": { "file": "io-lines.stdout" } }
}
```

The shared runner uses an isolated working directory for each program. Input
files are staged there; output files are compared byte for byte. Paths must
remain within that directory. The case identity includes their content hashes.

Create cases alongside every construct proposal, not after implementation.
Keep them under `cases/language/`, marked pending while syntax or dependencies
remain unimplemented. Include multiple valid forms, input/output variants,
invalid forms, and relevant construct interactions. A proposal's pending cases
are review material, not additional language decisions.

Expected successful output can be specified before compiler support. Rejection
diagnostics can be provisional: say so in the pending reason and review their
exact bytes when implementing that compiler step. Remove `pending` only when
the construct and its dependencies work; run the cases and preserve the
bootstrap gate. A self-build alone does not establish all feature behavior.

Language cases remain pending until compiler support. Their pending reasons
identify proposal dependencies. Approval alone does not count as an execution
pass.

Use `samples/` for small teaching programs and `examples/` for complete useful
programs, creating those directories only when needed. Give each a stable
numeric slug, short explanation, and a matching case manifest. The check tool
requires coverage for every `.mini` file there. After syntax changes, simplify
affected consumers, update cases/docs, and rerun them.
Add or extend a runnable teaching sample with new language constructs and
built-ins, and update [the sample index](../samples/README.md).

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
include repository tools and the real compiler binding-emission case. CI keeps both
reports; they measure fresh-process wall time, not isolated lexer/parser speed.
