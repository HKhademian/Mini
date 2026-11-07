---
name: c-target-and-embedding
status: in_progress
created: 2026-11-07
todos:
  - id: step-1-first-cases
    content: "Specify only the first C slice and focused cases"
    status: completed
  - id: step-2-first-c
    content: "Compile a simple Mini sample to C and execute it"
    status: completed
  - id: step-3-expand-compiler
    content: "Extend C support through small feature increments"
    status: in_progress
  - id: step-4-native-storage
    content: "Add native storage and ownership as supported features need them"
    status: pending
  - id: step-5-simple-host
    content: "Prove a naive generated C entry callable by a host"
    status: pending
  - id: step-6-source-runner
    content: "Choose and implement the Mini-written runner after compiler support exists"
    status: pending
  - id: step-7-distribution
    content: "Expand embedding and verify source/static/shared distribution"
    status: pending
plans:
  requires: []
  blocks: []
  parallel: []
---

# Incremental C target, then an embeddable runner

## Mission

First compile a small Mini program to readable C and run it. Extend the compiler
in small working increments. Later compile a Mini-written script runner to
generated C source/header, usable directly, as a static archive, or as a shared
library through a C-compatible FFI. Runtime scripts need neither Node nor a C
compiler.

## Done and owner direction

- Inspected the compiler, builtin templates, case harness, bootstrap, and rules.
- 2026-11-07: specified the first ASCII literal-output slice and source-manifest
  target metadata, with pending cases committed before implementation (584abdf).
- 2026-11-07: implemented target selection in tools/compiler.mini and the CLI,
  with Mini-written libs/compiler/emit-c.mini and native execution in the shared
  case harness. Twelve C cases and test/native.test.mini cover literal bytes,
  empty forms, flags, diagnostics, target rejection, and unchanged JS behavior.
- Verification: bootstrap/repository gates pass; 423/423 scenarios pass with
  four pre-existing proposal scenarios pending; 6/6 Mini units and 17/17 Node
  LSP/release tests pass. The playground build passes. Local C11 checks used
  Apple Clang through cc; no Linux/Windows CI or native self-hosting is claimed.
- Parent reviewed agent changes and fixed dropped extra CLI arguments with a
  reproducing regression. A second agent independently reviewed C/CLI lowering.
- Generated C names now go through overridable MINI_ID(name), defaulting to
  mini_##name without dollar identifiers or a naming flag. Types use MINI_ID
  directly, and payloads use an anonymous union. MINI_VALUE_TEXT is a
  static initializer; the value_text function wraps it with a typed cast.
  Default/custom host prefixes, static construction, and runtime calls pass
  strict C11 checks in test/native.test.mini and cases/native/value-constructors.c.
- Generation writes companion source/header artifacts. Native builds preprocess
  with cc -E into an adjacent .i before compiling it; failed native cases retain
  their workspace for debugging. No preprocessing flag or library packaging is
  introduced. Constructor and namespace checks still exercise the shared header.
- Generated source/header are the product. Compiler and runner logic stay in
  Mini; native storage support belongs to the backend.
- Use tagged unions. Growing arrays, allocation/deallocation, maps, and text
  storage/views are implementation responsibilities.
- Native text now uses an owned growable byte buffer with offset/length views.
  Readable C literals initialize the backing. Growth preserves existing views;
  invocation cleanup frees it. Host cases cover growth, offset views, self-append,
  overflow rejection, and repeated cleanup. A general collector remains deferred.
- The C emitter's Mini helpers use emit_c_ consistently, keeping their names
  distinct from parser and other backend helpers in the shared top-level scope.
- 2026-11-07: added safe-integer literal output, one unary minus, canonical
  leading-zero/negative-zero handling, and mixed text/number arguments. Tagged
  values now include MINI_ID(number), MINI_VALUE_NUMBER, and value_number.
  Seven agent-authored fixtures pass; parent reviewed the implementation and
  adopted the reviewer's int_least64_t portability correction.
  Verification: 431/431 scenarios, four existing proposals pending, 6/6 units,
  final native 20/20 and native unit 1/1, bootstrap fixed point, playground build,
  and strict C11 host checks with address/undefined-behavior sanitizers pass.
  Bindings and arithmetic remain unsupported; Step 3 stays in progress.
- 2026-11-07: implemented implicit file initialization in both targets. A
  generated entry calls files once in dependency-first include order, preserving
  each file's operation order even before includes. Named functions and existing
  shared binding visibility remain unchanged. Textual declaration checks are
  separate from initializer scheduling. Builtin registry state is now a shared
  dependency, initialized before descriptor files. The browser retains registry
  initialization while suppressing the compiler CLI operation.
  Parent and agent review covered initialization order and binding visibility;
  eight focused cases cover nesting, aliases, empty files, and shared bindings.
  Verification: 439/439 scenarios, four existing proposals pending, 6/6 units,
  17/17 LSP/release tests, repository/bootstrap fixed point, playground build,
  and strict C11 multi-file host sanitizer checks pass. No C binding/arithmetic
  support is added by this initialization increment.
- 2026-11-07: selected MINI_ID(params), a view bundling count and value pointer,
  as the common generated C calling convention. Mini functions may receive any input count; declared parameters
  consume their positions with missing values supplied as numeric zero. Extra
  inputs remain available to the callee. Apply this convention to Mini-visible
  helpers and builtins as their native lowering arrives. Existing JS builtin
  arity checks still need a separate implementation with safe missing/kind
  handling; this is selected direction, not a completed general arity change.
- The current C io_write now takes a parameter view in one call per source call.
  Named local argument arrays require no heap allocation; entries are filled in
  source order. Zero inputs use a view containing (0, NULL). Text backing keeps its owned buffer.
  A growth fixture verifies earlier argument views survive later preparation;
  host checks cover zero inputs, nonzero NULL, and early output failure.
  No Mini function-call performance result is claimed. Benchmark small hot calls
  when native functions exist before selecting internal-call optimizations.
  FFI adapters may accept separate count/pointer parameters and construct a view
  internally, avoiding a by-value structure requirement for foreign callers.
  MINI_PARAMS is a static brace initializer; params_make wraps it for runtime
  calls. Neither copies/owns the argument array or allocates storage. Generated
  calls use the macro. Host checks cover static initialization and single
  evaluation; a local ctypes smoke check passed through a thin count/pointer
  adapter. This does not implement or package a stable embedding API.
  Verification: 440/440 scenarios, four existing proposals pending, native
  24/24, 6/6 units, bootstrap/repository checks, playground build, and strict
  C11 host checks with address/undefined-behavior sanitizers pass. Bindings and
  arithmetic remain the next compiler increments.
- Add no language exceptions, interrupts, error values, or recovery constructs.
- Start with small feature implementations and simple samples, then expand.
- Postpone tree-versus-stack until the runner stage. Resolve broader semantics
  as features reach them. General memory policy is a mid/later implementation
  decision. Begin with a naive host API and extend it when needed.

## Read first and plan links

- [Architecture and scope](../../docs/c-target-and-embedding.md).
- [Project instructions](../../AGENTS.md), [development](../rules/development.md),
  [atomic commits](../rules/atomic-commits.md), and [contributing](../../CONTRIBUTING.md).
- [Language](../../docs/language.md), [builtins](../../docs/builtins.md),
  [passing proposal](../../docs/parameter-passing.md), and [cases](../../docs/cases.md).
- [Bootstrap](../../docs/bootstrap.md) and [evolution](../../docs/evolving-language.md).
- [Compiler](../../tools/compiler.mini), [parser](../../libs/compiler/parser.mini),
  [lexer](../../libs/compiler/lexer.mini), and [builtins](../../libs/compiler/builtins.mini).

No child/prerequisite plans. Execute in order using small atomic commits.
New paths below are proposed. Do not require completing all language features
before trying a useful host or runner sample; carry forward explicit target gaps.

### Step 3 — expand-compiler

**Depends on:** step-2-first-c.
**Files:** extend libs/compiler/emit-c.mini, parser/builtin lowering,
cases/native/, test/compiler.test.mini, and docs/compiler.md.

- Numeric literal output and top-level bindings are complete. Implement the next
  increments in the user's selected order: value arithmetic (number addition and text joining);
  boolean values and logic; comparisons; control flow (if and while); functions.
- Bindings must preserve shared top-level visibility across file initializers.
  Text values referenced by bindings need backing storage that survives those
  initializers and is released after the program's entry completes.
- The C target uses invocation-owned text backing and binding slots, supports
  literal initialization, reassignment, copies, and output, and rejects reads it
  cannot establish as initialized before effects. Seven native cases cover these
  forms and cross-file ordering. General C expressions remain unsupported.
  Verified 447/447 scenarios (four existing proposals pending), 31/31 native
  scenarios, 6/6 units, bootstrap/repository checks, playground build, and a
  strict C11 cross-file host run with address/undefined-behavior sanitizers.
- Give each increment distinct focused cases and a small combined sample.
- Resolve numeric limits, text indexing, calls/defaults, and other questions as
  implemented features reach them. Follow accepted contracts, keep unresolved
  behavior explicit, and guard/reject unsupported ranges or forms.
- Preserve effect order/lazy evaluation when those operations arrive. Extract
  shared nodes/emission routines only when concrete target needs justify them.

**Acceptance:** each increment works independently and records remaining gaps;
small samples are not presented as full C parity.
**Verify:** focused native cases and relevant compiler/bootstrap gates from Step 2.

### Step 4 — native-storage

**Depends on:** relevant feature support from step-3-expand-compiler.
**Files:** extend native support under libs/compiler/, builtin lowering,
reusable libs/pure/ sources, cases/native/, and docs/runtime.md.

- Add dynamic text, lists, maps, mutation, and copies in small increments as
  samples need them. Use tagged values for heterogeneous elements.
- Implement growing arrays, allocation/deallocation, and text views where useful.
  Specify bounds/backing-storage lifetime when each operation is introduced.
- Begin with ownership suited to the actual sample. General reclamation/GC and
  host-retained-value policy are mid/later decisions; no collector is selected.
- Whole-invocation allocation with cleanup can serve bounded early programs if
  limits are explicit. Do not promise persistent managed heaps prematurely.
- Add only needed host services. All builtin families/native CLI ports are not
  prerequisites for a small host or source-runner sample.

**Acceptance:** supported storage has valid lifetimes and cleanup for its stated
scope, with explicit unsupported cases.
**Verify:** focused native/lifetime checks, sanitizers where available, and
compiler/bootstrap gates when compiler source changes.

### Step 5 — simple-host

**Depends on:** enough support from Steps 3–4 for one small sample.
**Files:** add ABI emission under libs/compiler/, cases/embedding/ fixtures,
and update docs/c-target-and-embedding.md.

- Generate a naive C-callable entry/header for one compiled Mini sample.
  Use simple scalar inputs/results or output, as the sample needs.
- Define only the actual call/ownership/status contract. Guard native operations
  and keep diagnostics at the host boundary; add no Mini recovery mechanism.
- Add handles, multiple contexts, callbacks, or retained results only when later
  examples need them. This is not a full stable API promise.

**Acceptance:** a real C host calls generated code; initial API limits are explicit.
**Verify:** compile/link/run the focused host fixture with generated source;
existing gates appropriate to compiler changes.

### Step 6 — source-runner

**Depends on:** enough C compiler/storage support for the chosen runner slice.
**Files:** create tools/runner.mini and libs/runner/ sources; adapt shared compiler
routines where needed; extend cases/embedding/.

- Now choose tree evaluation or a stack machine from concrete implementation
  needs. Neither is selected beforehand. Implement one runner, written in Mini.
- Start with one small script and a source-bytes entry. Reuse shared analysis;
  extend its representation if the runner needs it.
- Compile the runner to C. New scripts run inside it without Node, subprocess
  compilation, or a C compiler at script execution time.
- Reject malformed/unsupported source before effects. Host statuses/diagnostics
  are implementation boundaries, not new Mini errors or recovery features.
- Expand script support/API incrementally: includes, call-by-name, callbacks,
  independent instances, and persistent results are additions when needed.

**Acceptance:** a native host supplies a new small script at runtime and observes
expected output/result, with explicit feature/API limits.
**Verify:** focused loading fixtures and parity for supported script features;
compiler/bootstrap gates when shared compiler code changes.

### Step 7 — distribution

**Depends on:** step-6-source-runner.
**Files:** update tools/mini-tools.json, libs/tools/build.mini,
libs/tools/release.mini, CI, docs/releases.md, docs/runtime.md,
docs/getting-started.md, README, and version registry when warranted.

- Generate reproducible dist/native/mini.c and mini.h.
- Verify source inclusion, separate compilation, static archives, and shared
  libraries with a real dynamic FFI caller. Grow the naive API through examples.
- Document implemented ownership/services. Test retained handles, callbacks, or
  multiple contexts before claiming them.
- Validate macOS/Linux first; verify DLL exports/calling convention before
  claiming Windows support. Ship sources, license, header, and a host example.
- Version implemented components under repository rules. Publishing remains a
  separately authorized release action; planning changes create no release tags.

**Acceptance:** packaged source/static/shared examples work on tested platforms,
without Node at script runtime; claims match evidence.
**Verify:** release gates and focused packaged-artifact/FFI smoke checks.

## Constraints and key facts

- Mini compiler/runner logic stays in Mini; backend storage uses tagged unions.
  Generated C is never hand-edited; authored C fragments are explicit.
- Preserve JS self-hosting, browser support, diagnostics, and unrelated work.
  Active compiler: config/compiler.json. Commands use extensionless bin/ entries.
- No upfront whole-compiler redesign, new syntax, language exceptions/interrupts/
  recovery, mandatory VM/GC, JIT, binary bytecode format, or sandbox claim.
- Use owned paths, focused cases, and atomic commits. Pending cases never count
  as native passes. No blanket tags or routine publishing.
- Full native compiler self-hosting is later work, not an embedding prerequisite;
  compare successive emitted C sources, not binary bytes, when attempted. Keep
  output basenames fixed because they determine companion includes/guards.
- Later C increments remain pending. Resolve deferred decisions at the relevant
  increment; do not make them first-sample prerequisites.
