---
name: tooling-foundation
status: pending
created: 2026-11-03
todos:
  - id: step-1-contracts
    content: "Step 1 — Record the checker, formatter, and LSP contracts"
    status: pending
  - id: step-2-analysis
    content: "Step 2 — Expose compiler-owned analysis and structured diagnostics"
    status: pending
  - id: step-3-checker
    content: "Step 3 — Add explicit Mini source checking"
    status: pending
  - id: step-4-formatter
    content: "Step 4 — Implement a deterministic single-file formatter"
    status: pending
  - id: step-5-lsp
    content: "Step 5 — Implement diagnostics and formatting over LSP"
    status: pending
  - id: step-6-editor
    content: "Step 6 — Connect the VS Code extension to the installed server"
    status: pending
  - id: step-7-distribution
    content: "Step 7 — Verify the complete workflow from a source distribution and VSIX"
    status: pending
plans:
  requires: []
  blocks: []
  parallel: []
---

# Tooling foundation

## Mission

Focus on tooling, formatter, checker, and LSP. Deliver a small, usable editing workflow for the current Mini language:
compiler-consistent checking, stable formatting, and live editor diagnostics. Tools may remain TypeScript. This plan
adds no language syntax and does not implement the self-hosted compiler.

## Done

- Read the project direction, authoritative rules, tooling/versioning guides, compiler, CLI, case runner, release
  tooling, and VS Code extension.
- Confirmed the user wants **existing compiler diagnostics first**, without new lint rules in this milestone.
- Inspected clean baseline `8ff9908`; Node is `v24.16.0`.
- No implementation or new product versions exist from this planning session.

## Read first

- [README](../../README.md), [atomic commits](../rules/atomic-commits.md), [development
  guidance](../rules/development.md).
- [Tooling direction](../../docs/tooling.md), [compiler](../../docs/compiler.md), [bootstrap](../../docs/bootstrap.md),
  [cases](../../docs/cases.md).
- [Versioning](../../docs/versioning.md), [releases](../../docs/releases.md), [VS Code
  extension](../../editors/vscode/README.md).

## Proposed implementation decisions

- Preserve `mini check` and `mini check --docs` as repository checks. Add `mini check SOURCE.mini` and `mini check -`
  for source/stdin checking, with corresponding `mini-check` forms. No output on success, compiler-style diagnostics on
  stderr and exit 1 on failure; stdin uses display name `<stdin>`.
- Use `mini fmt SOURCE.mini` / `mini-format SOURCE.mini` for stdout output; `-` reads stdin. `--write` replaces one file
  only after successful formatting; `--check` reports noncanonical input without writing. Flags are mutually exclusive;
  `--write -` fails. Exit 0 on success, 1 on failure/noncanonical input.
- Use four-space indentation, LF line endings, no trailing spaces, and exactly one final LF for nonempty programs;
  empty/whitespace-only input becomes empty. Put statements on separate lines, use braced blocks, and keep `} else {`
  together. Preserve every token's spelling, order, and explicit parentheses. No line-width setting, config file, file
  discovery, or comment syntax.
- Start with one diagnostic per analysis, matching the compiler's first error. Preserve existing plain-text compiler
  messages; add structured source offsets rather than scraping carets. No error recovery or new type inference.
- The selected compiler provides a small `analyze` command: one JSON request `{source, name}` on stdin, one JSON result
  `{tokens, diagnostics}` on stdout. Source failures are result data; invocation/internal failures are failures. Define
  exact fields and exit behavior in Step 1. Reuse an in-memory entry within the compiler, and select the executable via
  `config/compiler.json`. No generated files, temporary source files, or handwritten parser in tools.
- `mini-lang-server` is standalone initially, using LSP 3.17 over stdio. Start with full document synchronization, push
  diagnostics, and whole-document formatting. No new dispatcher spelling is needed.
- First editor delivery is a local VSIX with a configurable installed server path and Node executable. Document
  installation outside this checkout; bundle the client runtime needed by the VSIX. No Marketplace publication in scope.

## Implementation order

Execute sequentially. Each step is a focused session, not necessarily one commit. Finish, verify, and atomically commit
each coherent increment before independent work. Include version/tag/release-selector integration with each
implementation, not as deferred cleanup. Never push or publish as part of this plan.

### Step 1 — contracts

**Depends on:** none.
**Files:** modify `docs/tooling.md`, `docs/compiler.md`, `docs/cases.md`.

- Record the proposed command forms, output/exit rules, formatting examples, invalid-input policy, source range
  representation, and analysis JSON contract.
- Distinguish syntax from existing semantic checks and internal failures. A formatter initially accepts only
  compiler-valid input; LSP still diagnoses incomplete input and refuses formatting edits for invalid documents.
- Define half-open UTF-16 source offsets, including EOF and lexer errors where a token's `end` is not yet finalized.
  Keep terminal line/column display stable.
- Specify LSP lifecycle, UTF-16 positions, document versions, and capability set. Keep implementation status explicitly
  future until each command ships.

**Acceptance:** documented examples determine behavior for valid/invalid/empty source, stdin, CRLF, formatting flags,
and unsaved documents without new semantics.
**Verify:** `./bin/mini check --docs`.

### Step 2 — analysis

**Depends on:** step-1-contracts.
**Files:** modify `compiler/types.ts`, `compiler/lexer.ts`, `compiler/t0.ts`, `config/compiler.json`, `docs/compiler.md`, and `compiler/parser.ts` only for concrete error crashes; create `compiler/analysis.ts`, `tools/analysis.ts`, `compiler/analysis.test.ts`.

- Add a structured compiler diagnostic carrying message, source, start, and end. Preserve the current diagnostic text
  renderer and all existing stderr fixtures.
- Analyze in-memory text using the existing tokenizer and `compile(tokens)`; discarding generated text is sufficient
  initially. Do not split out a second checker, build an AST, or change accepted/rejected programs.
- Implement the narrow JSON command and selected-compiler adapter. Return diagnostics only for known source failures;
  surface unexpected exceptions. Include new compiler sources in `config/compiler.json`. Node tests exercise the
  compiler command directly; this internal interface needs no new `bin/` command or tool-case wrapper.
- Check lexing, parsing, and existing kind/arity errors, EOF, tabs/CRLF, and an astral character inside a string before
  an error. Ensure malformed input produces a diagnostic rather than an unhandled exception; fix only concrete
  source-error crashes exposed by this interface, with focused regressions.

**Acceptance:** identical compiler rejection behavior and readable diagnostics; machine-readable ranges work for unsaved
text, with no filesystem output.
**Verify:** `./bin/mini check`, `./bin/mini test`, `node --test compiler/analysis.test.ts`.

### Step 3 — checker

**Depends on:** step-2-analysis.
**Files:** modify `tools/cli.ts`, `cases/tooling/check.case.json`, `cases/tooling/cli.case.json`, `README.md`, `docs/tooling.md`; create `tools/source-check.ts`, source fixtures/streams under `cases/tooling/`.

- Add the explicit source/stdin modes using `tools/analysis.ts`; preserve repository checks and their existing output,
  including standalone aliases.
- Verify valid input, lexer/parser/semantic rejection, stdin, missing file, argument errors, and no emitted `.mini.ts`
  files. Reuse existing language fixtures where practical; no new lint policy or stronger type claims.

**Acceptance:** CLI and compiler agree on the first error; successful checks create no artifacts and require no
development dependencies in a distribution.
**Verify:** `./bin/mini check`, `./bin/mini verify cases/tooling/check.case.json`.

### Step 4 — formatter

**Depends on:** step-3-checker.
**Files:** create `bin/mini-format`, `tools/format.ts`, `tools/format.test.ts`, `cases/tooling/format.case.json` and fixtures; modify `tools/cli.ts`, `docs/tooling.md`, `README.md` and product integration files listed below.

- Format compiler-provided raw tokens with a small whitespace printer. Reuse token kind constants; retain
  literals/escapes, unary operators, grouping, and evaluation order. Add syntax structure only if an actual ambiguity
  requires it.
- Implement stdout, stdin, write, and check modes. Reject invalid input before emitting output or replacing files. Share
  the text formatter with the LSP.
- Verify exact expected output, idempotence, identical raw token sequences, and unchanged generated TS for all currently
  passing language fixtures. Run a few focused execution cases for expressions, control flow, and I/O. Check
  unary/binary spacing, nested blocks, empty input, CRLF, and no-write behavior on invalid input. Avoid bulk
  reformatting existing sources.

**Acceptance:** formatting stabilizes after one pass; source meaning and literal bytes are preserved; CLI output is
deterministic and safe for explicit writes.
**Verify:** `./bin/mini check`, `./bin/mini verify cases/tooling/format.case.json`, `node --test tools/format.test.ts`.

### Step 5 — lsp

**Depends on:** step-4-formatter.
**Files:** create `bin/mini-lang-server`, `tools/lang-server.ts`, `tools/lang-server.test.ts`, `cases/tooling/lsp.case.json`; modify `docs/tooling.md`, `README.md`, product integration files, and `config/case.schema.json` only as required for the multiword standalone tool name.

- Implement initialize/initialized, shutdown/exit, didOpen/didChange/didClose, publishDiagnostics, and document
  formatting. Use byte-counted Content-Length framing; stdout carries protocol only, stderr carries logs. Advertise only
  supported capabilities; handle unknown requests/notifications correctly.
- Store current text and version per URI; use full sync and UTF-16 offsets. Analyze unsaved buffers through the selected
  compiler. Suppress obsolete results after newer edits/close, clear diagnostics after fixes/close, and isolate
  documents. Untitled documents need no on-disk source.
- Return one whole-document edit from the shared formatter, no edit when unchanged, and no edit for invalid source. Keep
  style fixed for this milestone.
- Use focused Node protocol tests spawning the real server for interactive edit sessions, split/coalesced frames,
  CRLF/astral offsets, and clean shutdown. Add a small static JSON case for standalone version/startup behavior; do not
  add per-case executables or a general protocol scenario framework.
- Widen the case-schema tool-name pattern only enough for hyphenated words; retain the runner's existing executable/path
  checks and test the new name.

**Acceptance:** edits change diagnostics without saving; CLI/LSP errors match; formatting matches the CLI; the server
remains usable after source errors.
**Verify:** `./bin/mini check`, `node --test tools/lang-server.test.ts`, `./bin/mini verify cases/tooling/lsp.case.json`.

### Step 6 — editor

**Depends on:** step-5-lsp.
**Files:** modify `editors/vscode/package.json`, `editors/vscode/package-lock.json`, `editors/vscode/.vscodeignore`, `editors/vscode/README.md`; create `editors/vscode/src/extension.ts` and a minimal TypeScript build configuration.

- Add a thin standard LSP client, activation for Mini documents, clean deactivation, and explicit Node/server-path
  settings. Discover a documented installed command by default; keep launching independent of workspace cwd.
- Compile the TypeScript client to editor-loadable packaged code and include required client dependencies. Keep
  generated extension output out of authored sources; preserve icons, highlighting, and pairing.
- Update extension version/registry/lockfile together. Verify the development host and installed VSIX in a separate
  workspace: diagnostics on open/edit/fix, format-document and format-on-save, untitled source, and useful launch
  errors.

**Acceptance:** installing the VSIX and configuring the installed tool is enough for diagnostics and formatting; no
checkout-local dependency paths are required.
**Verify:** existing `node --test test/grammar.test.ts` from `editors/vscode`, client type/build check, local VSIX
packaging, and the manual editor session.

### Step 7 — distribution

**Depends on:** step-6-editor.
**Files:** modify `tools/ci.ts`, `tools/release.ts`, `tools/release.test.ts`, `.github/workflows/ci.yml`, documentation and packaging checks only as needed.

- Wire focused compiler/tool/client checks into existing CI; retain grammar, language, host-adapter, and release
  coverage. Verify Linux/macOS command paths.
- Test checker, formatter, and an LSP session from an extracted source archive with no `.git` or development
  `node_modules`. Package and inspect the VSIX. Fix build/runtime dependency inclusion at the owning component.
- Make README, tooling status, install instructions, and changelog agree with the shipped commands. Record compiler
  stage honestly; bare bootstrap verify remains unavailable while `config/bootstrap.json` is null.

**Acceptance:** source distribution and VSIX reproduce the documented workflow; implemented tools have independent
versions and valid local annotated tags.
**Verify:** `./bin/mini check`, `./bin/mini test`, all new focused Node tests, editor build/grammar checks, then
`./bin/mini release dist/tooling-<unique-suffix>` from a clean committed checkout. Packaging is local, not publication.

## Product integration and constraints

- Every implementation increment owns its relevant `config/versions.json`, `tools/project.ts` streams/tag selector,
  `tools/release.ts` packaging, `.github/workflows/release.yml` tag filters, exact version-output fixtures,
  `docs/versioning.md`, and `CHANGELOG.md` updates. Existing counters continue; register `format` and `lsp` only with
  their verified implementations. Include focused CI coverage when each increment lands rather than waiting for Step 7.
- Commit verified increments and create their annotated grouped product tags under the repository rules. This
  planning-only change needs no product tag.
- After compiler promotion, analysis/parsing/checking must live in Mini and the selected generated compiler must
  implement this interface; tooling cannot retain T0 as a fallback. If promotion happens during this work, adapt first.
- No new syntax, comments, modules, parameter typing, lint rules, project config, AST framework, compiler daemon,
  persistent cache, or new self-hosting gate.
- Completion, hover, symbols, navigation, rename, quick fixes, range/on-type formatting, incremental analysis, docs/help
  tools, and publication are later milestones. They need separate justification and plans after this workflow.
- Keep authored executable code in direct Node TypeScript or Mini; extension JavaScript is build output only. No
  per-case executables or broad test matrix.

## Key project facts

| Item | Current baseline |
| --- | --- |
| Runtime | Node 24.16.0; strict erasable TypeScript, `.ts` imports |
| Compiler | T0, direct emitter; `Unknown` parameters/results limit checking |
| Existing check | Repository types, docs, versions, cases, available bootstrap |
| Editor | Declarative TextMate extension, version 0.1.1 |

## Overall acceptance

- [ ] Source checker, compiler, and LSP report the same existing source errors.
- [ ] Formatter is deterministic, idempotent, and preserves compiled behavior.
- [ ] Unsaved editor buffers receive accurate diagnostics and shared formatting.
- [ ] Existing repository commands and language behavior remain compatible.
- [ ] Tools run from the distribution; installed VSIX works outside the checkout.
- [ ] Checks, independent versions, atomic commits, and local tags are complete.

## Plan links and references

- Execute with `/xplan @.agents/plans/tooling-foundation.md`.
- [LSP 3.17 specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)
  and [initialize/capabilities
  source](https://raw.githubusercontent.com/microsoft/language-server-protocol/gh-pages/_specifications/lsp/3.17/general/initialize.md).
