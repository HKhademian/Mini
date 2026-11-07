# C target and embeddable runner

Status: proposal, 2026-11-07. C is the requested next target. No C backend,
native runtime, or script interpreter is implemented by this document. The
[implementation plan](../.agents/plans/c-target-and-embedding.md) records the
remaining work and its gates.

## Goal

Write mini's compiler and script runner in mini, then compile them to readable
C. Distribute the runner as generated C source and a header. An application can
include or compile that source, link it as a static library (`.a` or `.lib`), or
build a shared library (`.so`, `.dylib`, or `.dll`) and call its C ABI through an
FFI. Static archives require a link step; dynamic FFI loaders use shared libraries.

The eventual host supplies mini source as data, runs it, and gets a result or an
error. It needs neither Node nor a C compiler at script execution time. The C
compiler is used when building the generated runner, not for each loaded script.
Each shared binary still targets a particular OS, architecture, and calling
convention; source distribution is the portable deliverable.

The owner wants to avoid a handwritten C implementation. Compiler, loader,
checking, interpreter, and ordinary library behavior should live in mini. Do
not create a second compiler or runner maintained in C.

## Current foundation

- [tools/compiler.mini](../tools/compiler.mini) drives tokenization, include
  expansion, checking, and JavaScript generation.
- [libs/compiler/parser.mini](../libs/compiler/parser.mini) checks while
  directly building JavaScript strings. It does not expose a reusable program
  tree or instructions. Even return-flow detection currently inspects emitted text.
- [libs/compiler/builtins.mini](../libs/compiler/builtins.mini) combines
  target-independent builtin metadata with JavaScript helper and call templates.
- [Pure libraries](self-containment.md) already implement substantial behavior
  in mini, but still require primitive value storage and host operations.
- [mini run](../tools/run.mini) compiles and launches JavaScript. It is not a
  source interpreter. The [bootstrap](bootstrap.md) verifies JavaScript generations.

These are source observations, not a fresh full-suite or release verification.
Keep the working JavaScript path while introducing C in tested increments.

## Proposed architecture

```text
BUILD TIME
compiler + runner + libraries, written in mini
    -> mini compiler with C backend
    -> generated mini.c + mini.h
    -> include/compile into host, static archive, or shared library

SCRIPT EXECUTION INSIDE THE HOST
source bytes supplied through the C API
    -> shared lexer + parser + checker, compiled into the runner
    -> checked program representation
    -> evaluator written in mini, compiled to C
    -> result or diagnostic returned to the host
```

The same checked program representation also feeds the JavaScript and C
emitters. Start with the smallest explicit nodes needed for existing syntax;
do not introduce an optimizer, general compiler framework, or new source syntax.
Preserve parser routine boundaries and diagnostics during the transition.

There are two distinct uses of C generation:

1. Ahead-of-time compilation: an ordinary mini program becomes C and runs as
   native code. This is the easier first milestone and proves the backend.
2. Embedded scripting: the mini-written evaluator becomes C. It interprets
   newly supplied scripts in memory; it never invokes the C toolchain to run them.

The final embedding product is generated source, not a requirement to ship a
prebuilt library. A single amalgamated source/header pair is the initial goal;
generate it from maintained mini sources rather than maintaining it by hand.

## How much C must be authored?

Generating C does not automatically provide allocation, value storage, operating
system calls, or ABI entry points. Existing mini cannot express raw pointers,
C layouts, or C exports directly. Those operations need a backend boundary.

Recommended boundary: small native intrinsics and ABI emission owned by the
mini-written C generator, with ordinary algorithms implemented in mini and
reusing the pure libraries. The delivered `.c` and `.h` are generated artifacts.
C fragments inside that generator are still manually authored C; do not call
this a zero-C implementation or hide a substantial runtime in string templates.

Before implementation, inventory that unavoidable substrate and settle whether
small C templates are acceptable. If absolutely no C fragments may be authored,
investigate how mini will express memory and ABI primitives first. That is a
different language/backend scope, not something a runner can solve afterward.

## Simple host calls and stacks

The intended experience is a small C surface resembling the simple JS/Lua
embedders the owner recalls. The exact projects are unidentified. The proposed
API below is our design sketch, not a claim about their interfaces.

A C API stack and a stack-machine interpreter are independent choices:

- An API stack lets the host push arguments, call a function, and read results.
  A direct value API can be equally small and easier for some FFIs.
- A bytecode operand stack holds intermediate values during script execution.
  Call frames also track locals, the return position, and argument counts.
- Generated C can call runtime helpers directly. Such calls do not require a
  bytecode VM, and helper calls alone do not implement runtime source loading.
- Direct/threaded dispatch is an implementation optimization, not a requirement
  for either a simple host API or C generation.

For the easiest first scripting implementation, interpret the shared checked
program tree. A bytecode VM would additionally need instruction lowering,
instruction validation, dispatch, operand stack rules, and debug locations.
Do not implement both evaluators initially. Revisit the stack machine if explicit
resumption, bounded execution stacks, or measured workload costs justify it.

If selected later, keep it in mini: lower checked nodes to an in-memory
instruction list, use explicit operand and call-frame lists, and start with a
portable opcode loop. Initial operations would cover constants, locals/globals,
calls/returns, arithmetic, collections, and conditional jumps. Preserve source
positions. No binary bytecode format or computed-goto optimization is needed.

## C API sketch

Names, types, ownership, and statuses below are provisional; this is not a
released header. Prefer opaque context/program handles, explicit byte lengths,
and ordinary C functions usable from FFIs without exposing tagged structs.

```c
mini_status mini_create(const mini_config *config, mini_context **out);
mini_status mini_load(mini_context *ctx, const char *source, size_t length,
                      const char *source_name, mini_program **out);
mini_status mini_run(mini_context *ctx, mini_program *program);
mini_status mini_call(mini_context *ctx, mini_program *program,
                      const char *name, size_t argument_count);
void mini_destroy(mini_context *ctx);
```

Choose a small value/argument interface in the embedding phase: either stack
push/read operations with a defined stack effect, or opaque value handles and
argument arrays. Also specify diagnostic retrieval, program release, host
callbacks with user data, and access to return values. Test the complete header
with a C host and one real dynamic FFI; a `.so` alone does not prove usability.

Source and source-name buffers are borrowed only for the load call unless
documented otherwise. Loaded programs belong to their context. Define exactly
when result/text handles expire, how a host retains a value across calls, and
how callbacks keep values alive. Reject cross-context handles. Two contexts
must not share generated global variables or module initialization state.

Loading checks the complete script before executing top-level statements.
`mini_run` performs initialization; specify whether repeated execution is allowed
before exposing it. Function calls occur against that program's instance state.
Callbacks must have an explicit registration/binding rule; the current checker
rejects unknown function names, so callback names cannot bypass checking.

## Behavior and runtime decisions

Resolve these with named cases before freezing a native ABI:

- **Values:** a tagged representation for number, boolean, text, list, and map;
  numeric zero remains an ordinary value and the missing-lookup fallback.
  Keep runtime/internal errors separate from mini values.
- **Numbers:** current arithmetic uses JavaScript numbers, while several
  conversions require safe integers. The [language](language.md) leaves numeric
  limits open. Propose binary64 initially; verify compiler/tool workloads and
  define overflow, non-finite values, negative zero, and conversions. Do not
  silently change to signed C integer arithmetic or invoke undefined overflow.
- **Text:** ASCII indexing is the initially specified scope; current JS helpers
  index UTF-16 units, while byte conversion uses UTF-8. Pick and document the
  supported native behavior, including embedded NUL and buffer lengths. Unicode
  indexing changes require their own decision; UTF-8 byte indexing is not parity.
- **Collections:** preserve heterogeneous values, sparse-list defaults, negative
  indices, mutation, and shallow copies. Map key order is unspecified. Treat
  the [parameter-passing proposal](parameter-passing.md) as unresolved; do not
  turn current JS aliasing into a new language decision during this port.
- **Calls and scope:** default return zero, missing-argument padding, extras,
  `fn_args()`, recursion, block shadowing, and access to top-level mutable state.
  Resolve actual-versus-padded argument-list expectations against owning cases.
- **Evaluation:** emit temporaries/statements for left-to-right, exactly-once
  arguments and operands. C function argument evaluation order cannot supply
  mini's order. Preserve lazy `&&`/`||`, including calls and faults on the right.
- **Memory:** propose a context-owned heap with explicit roots and tracing
  collection. Lists/maps can form cycles; reference counting alone is incomplete.
  Generated C locals, interpreter frames, globals, program constants, callback
  arguments, and host-held handles must remain reachable across allocation.
  A free-at-context-destruction prototype is a bounded experiment, not a complete
  memory policy for a long-lived scripting host. Define allocation-failure cleanup.
- **Errors and exit:** current compiler diagnostics call `process_exit`, and the
  language gives it whole-program termination semantics. Embedded operation
  needs an explicit host profile: return an exit status/error to the host and
  unwind script work without calling C `exit()`. The CLI maps that result to
  process termination. Document this adaptation; preserve standalone behavior.
- **Host services:** script loading accepts bytes and a host source resolver for
  includes. File, process, path, clock, and I/O operations are adapter callbacks.
  Define missing-service behavior. Keep parser/checker logic out of adapters.

Portable C11 is the proposed generated-code baseline. OS services are separate:
first validate macOS/Linux adapters; Windows DLL exports, calling convention,
toolchain, and adapters need their own checks. C source alone does not establish
full platform support. The backend needs a bounded exception to the current
Mini/TypeScript-only executable-source policy, not a general rewrite in C.

## Concrete acceptance examples

Each example becomes separate source/manifest/expected-stream fixtures before
implementation. The checked-program refactor must preserve existing cases too.

```mini
fn add(a, b) {
    return a + b;
}
io_write(add(40, 2), "\n");
```

Standalone JS and C print `42\n` and exit zero. An embedded host can load the
program without output, run its top level, then call `add(20, 22)` and read 42.

```mini
fn left() { io_write("L"); return 1; }
fn right() { io_write("R"); return 2; }
io_write(left() + right(), "\n");
```

Both paths print `LR3\n`. Add separate argument-order, lazy-right-side, and
nested-call cases; one arithmetic sample does not prove native parity.

```mini
io_write("before");
process_exit(7);
io_write("after");
```

Standalone output is `before` with status 7. Under the proposed embedded profile,
the host receives exit status 7, stays alive, and can execute a later program.
Malformed source must produce diagnostics before any program output; a load
failure followed by a successful load must also leave the context usable.

Add distinct cases for empty input/text/collections, stored false versus missing
zero, included-file errors, argument defaults/extras, recursion and shadowing,
callback return/error, independent contexts, retained values across collection,
cycles, and repeated load/run/release. New target gaps must reject explicitly;
do not silently fall back to Node or count pending cases as native passes.

## Delivery order

1. Settle substrate, semantic boundaries, and focused fixtures.
2. Extract a checked representation while keeping JavaScript self-hosting valid.
3. Generate and execute a small scalar C program with explicit target selection.
4. Complete values, memory, and the host adapters needed by the runner.
5. Prove generated source can be embedded and return control safely.
6. Write the source runner in mini and generate its embeddable C artifact.
7. Verify source inclusion, static/shared builds, an FFI caller, and packaging.

Do not require a standalone precompiled-program embedding product before the
scripting runner; use that milestone only to prove the generated C boundary.
Keep JS bootstrap checks separate from native checks. A fully native compiler
is a useful follow-up, not a prerequisite for the embedded runner: its CLI needs
additional file/process/path services. When attempted, native self-hosting means
successive native-built compilers generate identical C source for the same
compiler source and flags, then compile/run real cases. Native binary byte
identity is not the fixed-point criterion.

This plan adds no new mini syntax, release version, published artifact, or
claim of sandboxing. It does not retire JavaScript or promise stack-machine
performance. Stop at each working atomic increment and measure real workloads.
