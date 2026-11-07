---
name: c-target-and-embedding
status: pending
created: 2026-11-07
todos:
  - id: step-1-contract
    content: "Settle native substrate and behavior boundaries; add focused fixtures"
    status: pending
  - id: step-2-checked-program
    content: "Separate checking from emission without losing JS self-hosting"
    status: pending
  - id: step-3-c-slice
    content: "Generate, compile, and execute the first scalar C slice"
    status: pending
  - id: step-4-native-runtime
    content: "Complete values, memory, and the runner's required host adapters"
    status: pending
  - id: step-5-embedding-boundary
    content: "Prove generated source embedding and host error recovery"
    status: pending
  - id: step-6-source-runner
    content: "Implement the source runner in mini and generate C source/header"
    status: pending
  - id: step-7-distribution
    content: "Verify inclusion, static/shared builds, FFI calls, and packaging"
    status: pending
plans:
  requires: []
  blocks: []
  parallel: []
---

# C generation and an embeddable mini source runner

## Mission

Deliver generated C source and a header for a runner written in mini. Hosts can
include/compile the source, build a static archive, or expose the C ABI through a
shared library and FFI. The runner loads mini scripts without Node or a runtime
C compiler. Avoid a separately handwritten C compiler, evaluator, or runtime.
This is a planning handoff, not authorization to freeze unresolved semantics.

## Done

- Inspected the current compiler, builtin templates, bootstrap, case runner,
  project rules, and source layout. No native execution gate has been run.
- Recorded the architecture, examples, alternatives, and unresolved decisions in
  [the proposal](../../docs/c-target-and-embedding.md).
- Clarified the owner wants generated source as the primary artifact, not just
  a prebuilt FFI library. AOT compilation enables a generated source interpreter.
- Recorded the stack-machine idea as an option. Recommendation: start with one
  checked-tree evaluator for the easiest initial implementation; no VM selected.

## Read first

- [Project guidance](../../AGENTS.md) and [development rules](../rules/development.md).
- [Atomic commits](../rules/atomic-commits.md) and [contributing](../../CONTRIBUTING.md).
- [Proposal](../../docs/c-target-and-embedding.md), [language](../../docs/language.md),
  [builtins](../../docs/builtins.md), and [passing proposal](../../docs/parameter-passing.md).
- [Bootstrap](../../docs/bootstrap.md), [evolution](../../docs/evolving-language.md),
  [cases](../../docs/cases.md), and [pure-library boundaries](../../docs/self-containment.md).
- [Compiler entry](../../tools/compiler.mini), [parser](../../libs/compiler/parser.mini),
  [lexer](../../libs/compiler/lexer.mini), and [builtin registry](../../libs/compiler/builtins.mini).

Execute in order, using small atomic commits and preserving JS self-hosting.
New paths below are proposed. Create no empty scaffolding.

### Step 1 — contract

**Depends on:** none.
**Files:** update `docs/c-target-and-embedding.md`, `docs/language.md`,
`docs/builtins.md`, `.agents/rules/development.md`; create focused fixtures in
`cases/native/` and `cases/embedding/` when their contracts are selected.

- Inventory necessary allocation/storage/ABI intrinsics and pure mini reuse.
  Settle whether minimal generator-owned C templates meet the owner's intent;
  C in strings is still handwritten C. Do not hide a C runtime in a generator.
- Bound the policy exception allowing generated native code and C host fixtures.
- Resolve number behavior, ASCII/Unicode boundary, parameter-sharing status,
  actual/padded `fn_args()` behavior, exit adaptation, value lifetime, and roots.
  Preserve open questions where not needed for the first scalar slice.
- Name cases from the proposal: 42 output, LR3 order, lazy calls, exit 7 and
  recovery, zero/false/missing, load-before-effects, separate contexts.
  Use separate mini sources and JSON streams. Existing schema has no target
  field: extend the shared harness narrowly when native execution is introduced.
- Mark unsupported new cases pending. Do not make existing JS cases pending.

**Acceptance:** a bounded first C slice and native substrate are selected;
provisional versus accepted behavior and expected streams are explicit. An
absolute zero-authored-C requirement is resolved before backend implementation.
**Verify:** `./bin/mini check --docs` (also checks generated tools/fixed point).

### Step 2 — checked-program

**Depends on:** step-1-contract.
**Files:** modify `libs/compiler/parser.mini`, `libs/compiler/builtins.mini`,
`tools/compiler.mini`; create `libs/compiler/program.mini` and
`libs/compiler/emit-js.mini`; update `test/compiler.test.mini`, `docs/compiler.md`.

- Extract the smallest checked nodes for the existing language, retaining
  source locations, binding identities, scopes, signatures, and diagnostics.
- Represent block return behavior explicitly instead of inspecting output text.
- Separate builtin name/kind metadata from target-specific helper/call emission.
- Keep JS output unchanged where practical; explain necessary output changes.
  Preserve `tokens`, `metadata`, `--reference`, and `--program-only` behavior.
- Regenerate/promote the bootstrap through the existing build flow. Do not
  hand-edit `bin/bootstrap`, `dist/compile.js`, or revive the retired compiler.

**Acceptance:** accepted/rejected programs and diagnostics retain behavior;
successive JS generations match and ordinary examples run. No separate parser
or checker is introduced for C or the future source runner.
**Verify:** `./bin/bootstrap`, `./bin/mini check`, `./bin/mini test`,
`./bin/mini test --unit`, `./bin/mini verify`.

### Step 3 — c-slice

**Depends on:** step-2-checked-program.
**Files:** create `libs/compiler/emit-c.mini` and bounded native emission helpers;
modify `tools/compiler.mini`, `libs/tools/mini.mini`, `libs/tools/cases.mini`,
`config/case.schema.json` if required; add `cases/native/` sources/manifests.

- Add explicit C target selection (proposed `--target c`; not supported yet).
  Default JS behavior stays usable for bootstrap and browser consumers.
- Emit portable C11 for the selected scalars, bindings, calls, branches, loops,
  and output. Lower effects through ordered temporaries and lazy branches.
- Generate the minimal value/platform support from the chosen Mini-owned
  intrinsic boundary; document manually authored C fragments honestly.
- Reject unsupported constructs/builtins with located diagnostics before writing
  an executable output. No partial artifact or Node fallback on failure.
- Teach the shared case runner to compile generated C with a discovered `cc`
  and compare streams/status. Document exact new verification commands now.

**Acceptance:** multiple focused cases run as native binaries, including nested
effects, negative/zero values, lazy branches, and explicit unsupported-feature
rejections. Confirm C compilation actually occurred, rather than JS execution.
**Verify:** existing gates plus the newly documented native case command;
compile with `-std=c11 -Wall -Wextra -Werror` on the supported toolchain.

### Step 4 — native-runtime

**Depends on:** step-3-c-slice.
**Files:** extend `libs/compiler/emit-c.mini`, native intrinsic emission,
`libs/compiler/builtins/*.mini`, reusable `libs/pure/*.mini`; extend
`cases/native/` and `docs/runtime.md`.

- Add text, heterogeneous/sparse lists, maps, mutation, copies, defaults/extras,
  `fn_args()`, globals, and recursion in verified increments.
- Implement the selected allocation/reclamation strategy; root generated locals,
  constants, module state, host handles, and callback arguments. Cover cycles,
  repeated allocations, failed allocation cleanup, and context destruction.
- Add runner-required host services behind adapters. Keep file/process/path/
  time/hash support outside the core where not required; inventory supported and
  rejected builtins. Native CLI tool ports must not block embedded scripting.
- Compile and run collection-heavy native programs using the JS-built compiler.
  Verify deterministic C emission and preserve the separate JS fixed-point gate.

**Acceptance:** runner-required values/builtins and active covered native cases
pass; other gaps are named and rejected. Memory checks confirm lifetime behavior.
**Verify:** existing gates, native parity, supported Clang/GCC builds, and
sanitizer runs where available. Record actual commands/results.

### Step 5 — embedding-boundary

**Depends on:** step-4-native-runtime.
**Files:** add ABI-generation support under `libs/compiler/`, C host fixtures
under `cases/embedding/`, and update `docs/c-target-and-embedding.md`.

- Generate a header/source pair with opaque handles, explicit lengths, stable
  status retrieval, lifecycle, function calls, callbacks, and user data.
- Choose API stack versus opaque value handles using a real host example;
  a C API stack does not require a VM operand stack.
- Put globals and initialization state in per-context/program instances. Define
  program release, retained values, callback roots, and cross-context rejection.
- Separate compiler/interpreter diagnostics and termination from process exit.
  Embedded failures return to the host; the standalone adapter keeps CLI status.
- Prove a host can call a generated mini function and survive an error/exit.
  This is an integration fixture, not a separate AOT embedding product release.

**Acceptance:** two contexts are independent; values survive required lifetimes;
callback errors and exit 7 return control; a subsequent call succeeds.
**Verify:** real C host linked with generated output, native memory checks,
existing gates, and focused embedding fixtures.

### Step 6 — source-runner

**Depends on:** step-5-embedding-boundary.
**Files:** create `libs/runner/evaluate.mini`, `libs/runner/load.mini`,
`tools/runner.mini`; reuse shared compiler nodes; extend `cases/embedding/`.

- Implement one evaluator in mini over the checked representation. Reuse the
  lexer/parser/checker; run it on JS first, then generate its C source/header.
- Expose load-from-bytes, execute, and call-by-name through the generated ABI.
  Load validates without executing; define top-level initialization/repeat rules.
- Add host include resolution and builtin services; define callback signatures
  in checking metadata instead of allowing arbitrary unknown function names.
- Exercise scalar/collection/control-flow/call behavior, included diagnostics,
  callback results, failure recovery, repeated load/release, and independent hosts.
- No external compiler, subprocess, temporary C artifact, or Node at script
  execution time. Keep recursive depth/resource limits honest for a tree evaluator.
- If a stack VM becomes necessary, make that a deliberate replacement decision
  with concrete acceptance needs; do not silently build two interpreters.

**Acceptance:** a native C host submits new mini source at runtime, receives
results/diagnostics, and remains usable afterward, with no Node/toolchain invoked.
**Verify:** runner parity against existing accepted cases plus runtime-loading
fixtures. Record unavailable features as gaps rather than claiming full parity.

### Step 7 — distribution

**Depends on:** step-6-source-runner.
**Files:** update `tools/mini-tools.json`, `libs/tools/build.mini`,
`libs/tools/release.mini`, CI configuration, `docs/releases.md`, `docs/runtime.md`,
`docs/getting-started.md`, README, and `config/versions.json` as warranted.

- Generate reproducible `dist/native/mini.c` and `mini.h`; ship matching source,
  license, ABI/build instructions, and a runnable host example.
- Verify direct source inclusion with one implementation definition, separate
  compilation, static archive linking, and shared-library dynamic FFI calls.
- First verify macOS/Linux; distinguish tested targets from Windows build
  instructions. Test DLL exports/calling convention before claiming DLL support.
- Use one actual dynamic FFI host and check strings, arguments, callbacks,
  errors, and destruction. No new runtime dependency for the mini compiler.
- Follow component versioning only when implemented; no version/tag bump for
  this planning document. Publishing is a separately authorized release action.

**Acceptance:** source inclusion, static linking, and dynamic FFI examples run
from packaged artifacts without Node. Generated sources reproduce, and the
supported-platform list matches CI evidence.
**Verify:** existing repository/release checks and new package smoke tests.

## Constraints and overall acceptance

- All language/compiler/evaluator behavior lives in mini. Generated C is never
  hand-edited; any manually authored native fragments stay explicit and minimal.
- Preserve JS self-hosting, browser support, existing diagnostics, and unrelated
  work. No syntax redesign, general FFI language feature, JIT, VM optimization,
  mandatory binary bytecode, or sandbox claim belongs in this plan.
- Initial C generation may use a native slice; final runner support is measured
  separately. Pending cases and untested platforms never count as passes.
- The deliverable is source/header usable directly, as an archive, or as a
  shared library. Runtime scripts do not require a C compiler or Node.
- Use explicit owned paths and atomic commits. Do not publish/tag merely for
  completing a phase. Update this plan with evidence and remaining scope.

## Key facts and plan links

- Repository: MiniLang; this work does not modify the neighboring repositories.
- Implementation: `tools/*.mini`, `libs/compiler/*.mini`; active generated
  compiler is selected by `config/compiler.json`. A fully native compiler is a
  follow-up, not a runner prerequisite; when supported, compare successive
  emitted C generations, never native binary bytes.
- Host harness: direct Node TypeScript or mini, extensionless `bin/` commands;
  no npm-script, shell-script, or Python build implementation.
- No child plans. The proposal owns architecture; this file owns execution.
  All implementation steps remain pending. No native gate has been run.
