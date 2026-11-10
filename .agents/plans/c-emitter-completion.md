---
name: c-emitter-completion
status: in_progress
created: 2026-11-10
todos:
  - id: baseline
    content: Establish and document current C parity gaps
    status: completed
  - id: parity
    content: Close confirmed accepted-language and host-service gaps
    status: in_progress
  - id: bootstrap-gate
    content: Automate the four-way compiler and native bootstrap verification
    status: pending
  - id: portability
    content: Verify supported platforms and native storage lifetimes
    status: pending
  - id: completion
    content: Run final gates and reconcile C target documentation
    status: pending
plans:
  requires: []
  blocks: []
  parallel: []
---

# C emitter completion

## Mission

Complete the Mini-to-C emitter for the accepted language and supported host services, establish a repeatable C compiler bootstrap and cross-target parity gate, and document the evidence and remaining platform limits. The separate embedding, runtime script runner, and library distribution work remains in the existing C target plan.

## Done

- The emitter and its native runtime are written in Mini and consume the shared AST.
- On 2026-11-10, `./bin/mini test native` passed 80/80 scenarios. `./bin/mini compile --target c tools/compiler.mini /tmp/mini-c-audit.c` emitted the compiler, and `cc -std=c11 -Wall -Wextra -Werror /tmp/mini-c-audit.c -o /tmp/mini-c-audit` built it locally. This did not verify execution or the full matrix.
- The related plan records a prior manual four-way compiler comparison, C-built test suite and native bootstrap; these are historical results, not a current automated gate.

## Read first

- [Project direction](../../README.md), [development rules](../rules/development.md), and [atomic commits](../rules/atomic-commits.md).
- [Existing C target and embedding plan](./c-target-and-embedding.md) — broader mission, historical evidence and bootstrap acceptance.
- [Compiler reference](../../docs/compiler.md), [language](../../docs/language.md), [functions](../../docs/functions.md), and [runtime](../../docs/runtime.md) — accepted contracts.
- [C emitter](../../libs/compiler/emit-c.mini), [C host implementations](../../libs/compiler/emit-c/), [native tests](../../test/native.test.mini), and [bootstrap](../../docs/bootstrap.md).

### Baseline findings (2026-11-10)

- Local JS language suite: 342/342 scenarios passed; four proposal scenarios pending. Local C native suite: 80/80 passed.
- Temporary copies of 211 non-pending language manifests (excluding JS-specific compile-artifact cases) were run with target `c` using `./bin/mini test --file`; 206 manifests passed and five failed. Temporary manifests and results are under `/tmp/mini-parity-audit/`; these are local evidence, not a durable test gate. Case totals are manifests, not scenario counts. Sample source paths were rewritten to their real paths.
- Confirmed missing C host overrides: `time_millis` and `process_env` fall through to their Mini panic stubs (`054-001-time`, `061-001-process-env`).
- `048-002-json-to-text-values`: nested JSON passes but sparse list JSON fails; native list expansion fills gaps with numeric zero, while the JS case expects JSON null. Check the accepted list and JSON contracts before fixing representation.
- `049-001-process-run` and `056-001-process-spawn`: inherited child output precedes earlier parent output under captured stdout; investigate flushing stdio before child execution, including stderr and failure paths.
- Current CI includes Ubuntu 24.04 and macOS 15; this session only verified the current host. Existing test runner chooses C via manifest `target`; candidate mode selects the compiler, not the target. A durable parity harness still needs design.
- Static comparison of the host-required stubs under `libs/core/` against the C registry found `time_millis` and `process_env` without matching C replacements; other stub names have registered implementations. Higher-level operations can use Mini definitions.
- Reproduced conservative initialization rejection: an imported initializer with `if false { io_write(value); }` rejects in C even though JS completes when `value` is assigned in the entry file. The fixture is `/tmp/mini-init-audit/`; examine accepted initialization behavior and preserve rejection of actual early reads when resolving this.
- The documented contract requires list gaps to read as zero but serialize as `null`, so C zero-filling loses required information. The inherited-process cases reproduce output ordering differences when the parent stream is captured.
- Seventy `kind: compile` manifests were excluded because they assert JS generated artifacts or compiler acceptance rather than executable behavior. Their shared front-end diagnostics and C acceptance need a dedicated target-aware check in the parity phase. C JSON output has a depth limit of 128, and native host process/path code uses POSIX facilities.

### Step 2 — parity

**Depends on:** baseline  
**Files:** `libs/compiler/emit-c.mini`, `libs/compiler/emit-c/`, `cases/native/`, relevant shared cases and documentation as needed.

**Actions:**
- Fix each confirmed gap in small independent increments, preserving accepted semantics, evaluation order, diagnostics and target rejection before effects. Add focused cases for each distinct behavior and interaction.
- Cover host functions needed by accepted programs and compiler dependencies, using existing Mini fallbacks where applicable. Avoid speculative host APIs and language changes.
- Keep invocation-owned values valid and clean up in supported execution paths; capture any deliberate limits in documentation.
- Follow repository version, self-hosting, atomic commit and annotated tag rules for each completed compiler increment.

**Acceptance:** all in-scope accepted cases have matching observable behavior on JS and C, or an explicit documented platform boundary; no unresolved in-scope mismatch is silently waived.  
**Verify:** focused native and differential cases, relevant compiler and bootstrap gates for each increment.

### Step 3 — bootstrap-gate

**Depends on:** baseline; parity fixes as required by the gate  
**Files:** `libs/tools/`, `tools/`, `bin/`, `test/`, relevant documentation; choose exact locations consistent with existing build and test orchestration.

**Actions:**
- Add a repeatable repository command implementing the four compiler directions in the existing plan: JS compiler to JS and C, then C compiler to JS and C. Strictly build and run the C compiler, and run all resulting compiler outputs.
- Compare JS output byte-for-byte and generated C after normalizing only the output-specific companion-header name; use fixed output paths where possible. Report artifact identity and retain useful failure diagnostics.
- Run the complete test-suite driver compiled through JS and C and compare scenario results, statuses, and output checks. Compile and run generated `bootstrap.c` to rebuild and verify compiler and tools.
- Keep the JS bootstrap check active; make the new command suitable for the repository's CI without silently weakening existing gates.

**Acceptance:** one documented command fails on any matrix, suite, or native bootstrap discrepancy and passes all stages on a supported host.  
**Verify:** run the new command and existing JS bootstrap verifier; check failure reporting with a focused deliberate mismatch.

### Step 4 — portability

**Depends on:** parity and bootstrap-gate  
**Files:** native fixtures, relevant CI configuration, `docs/runtime.md`, `docs/c-target-and-embedding.md` as warranted.

**Actions:**
- Run strict C11 builds and native/parity checks on available macOS and Linux environments; record exact host and compiler. Use sanitizer checks for focused allocation, view lifetime, mutation and cleanup paths where available.
- Identify POSIX dependencies and document platform boundaries. Do not claim Windows support without testing its process, path, build, and ABI behavior; leave unavailable platform verification explicit.
- Fix reproduced portability or lifetime defects in focused atomic increments.

**Acceptance:** supported-platform claims match actual passing checks; known unsupported platforms and untested configurations are explicit.  
**Verify:** platform CI or recorded host runs; relevant sanitizer fixtures when available.

### Step 5 — completion

**Depends on:** parity, bootstrap-gate, portability  
**Files:** `docs/compiler.md`, `docs/c-target-and-embedding.md`, `docs/runtime.md`, and the related plan as needed.

**Actions:**
- Reconcile stale early-slice statements with current capabilities, contract limits, portability and automated evidence. Distinguish current status from dated historical milestones.
- Run the complete documented repository checks and the new C bootstrap/parity gate. Record exact failures, pending proposals and unavailable environments.
- Mark this mission complete only when the acceptance criteria pass; keep embedding, script runner and distribution in the related plan.

**Acceptance:** documentation and plan status agree with verified behavior; full in-scope parity and the repeatable bootstrap pass without hidden exclusions.  
**Verify:** repository checks, JS and C bootstrap gates, native suite, documentation link and consistency checks.

## Constraints and key facts

- Keep the active JS bootstrap; never hand-edit generated compiler output. Compiler changes are made in Mini and regenerated per repository rules.
- Follow focused atomic commits, version and annotated tag requirements; preserve unrelated work. This plan itself does not authorize publication.
- Mini targets Node 22.18+ for its JS tooling; native checks need a C compiler. Orchestration stays in Mini or direct Node TypeScript.
- General garbage collection, stable FFI, persistent host values, runtime script interpretation and distribution are not prerequisites for standalone emitter completion; follow the related plan for those goals.
- Historical plan text includes superseded statements; verify current code and contracts rather than assuming dated pending notes still apply.

## Plan links

- Related broader plan: [C target and embedding](./c-target-and-embedding.md). Coordinate its bootstrap and parity status when this work finishes; do not duplicate embedding implementation here.
