# C target and embeddable runner

Status: proposal, 2026-11-07. The owner selected C as the next target and a
compiler-first, incremental approach. The first C literal-output slice is
implemented; a script interpreter and embedding API remain pending. See the
[compiler reference](compiler.md) for current usage and the
[implementation plan](../.agents/plans/c-target-and-embedding.md) for later work.

## Goal and first milestone

First compile a small Mini program to readable C and run it. Extend supported
features through small implementations and examples. Later write the script
runner in Mini and compile it to generated C source and a header.

Hosts can include/compile the source, link a static archive (.a/.lib), or build
a shared library (.so/.dylib/.dll) for a C-compatible FFI. Generated source/header
are the primary product. Each binary targets a particular platform, architecture,
and calling convention.

The first native sample can be as small as:

```mini
io_write("hello from C\n");
```

Expected stdout is hello from C followed by a newline, with status zero.
Nearby cases cover empty text, escapes, and rejection of an unsupported form.
The first slice needs no source-level functions. Text uses a growable byte buffer;
literal spellings are only initialization inputs. Runner model, general
memory strategy, Unicode indexing, and a complete embedding API do not block it.

The first accepted native slice is top-level io_write calls with zero or more
ASCII text literals and safe-integer literals (including one unary minus).
Common Mini text escapes, multiple calls, empty text/programs, comments, and an
entry shebang are included. Bindings, arithmetic, and other expressions remain
unsupported by this slice. C output is written only after
the whole source passes shared language checks and native subset validation.
The [native case fixtures](../cases/native/) execute this slice through the
shared runner: Mini compilation, strict C11 compilation with cc, and native
execution. Their target field selects C; future target gaps stay explicit.

## Current foundation

- [Compiler entry](../tools/compiler.mini) drives tokenization, include expansion,
  checking, and JavaScript output. The [parser](../libs/compiler/parser.mini)
  checks while emitting strings; it has no reusable program tree today.
- [Builtin registry](../libs/compiler/builtins.mini) combines metadata with
  JavaScript helpers/call templates. Separate only what each C slice needs.
- [Pure libraries](self-containment.md) supply algorithms, while native storage
  remains a backend responsibility.
- [mini run](../tools/run.mini) compiles and launches JavaScript; no source
  interpreter exists to port. Keep the [JS bootstrap](bootstrap.md) working.

## Incremental architecture

```text
FIRST
Mini source -> Mini-written compiler + C emission -> C source -> native program

LATER, AT BUILD TIME
runner written in Mini -> C backend -> generated mini.c + mini.h
    -> include in host / static archive / shared library

LATER, INSIDE THE HOST
new script bytes -> runner compiled to C -> result/output or host diagnostic
```

Ahead-of-time compilation and runtime interpretation are separate stages.
The eventual runner executes new scripts without Node or a C compiler; C
compilation happens when building the runner.

Reuse lexer/parser/checks. Separate emission as concrete C slices need it.
A whole-compiler conversion to checked nodes is not an initial gate. Shared
nodes may become useful for later features or the runner; that does not select
tree evaluation over a stack machine now. Preserve existing routine boundaries
and diagnostics unless a verified change justifies otherwise.

## Native implementation responsibilities

The C backend owns value layout, growing arrays, allocation/deallocation,
text storage/views, maps, and ABI adapters. Reuse Mini algorithms where useful.
Growth policy and helper organization are implementation choices.

C source/header are generated artifacts. Document any C fragments authored in
the generator honestly; generated output does not imply that no C was authored.
Compiler and eventual runner logic stay in Mini; do not maintain a second
handwritten C parser or evaluator.

A tagged union is the selected value-storage direction:

- A tag distinguishes number, boolean, text, list, and map payloads.
- Store scalar numbers/booleans inline, and references to managed text/collections
  when needed. Exact layouts remain implementation choices.
- Bindings, elements, arguments, and results can use the common representation.
  An untagged union cannot distinguish its active kind.
- Numeric zero remains an ordinary value and the missing-lookup fallback.
  No Mini error/null kind is introduced.

Generated names use `MINI_ID(name)`, defaulting to `mini_##name` behind an
`#ifndef` guard. Hosts can override naming without a Mini compiler flag or dollar
identifiers. Types, functions, tags, and storage use `MINI_ID` directly; redundant
type-alias macros are omitted. Values use initializers such as `MINI_VALUE_TEXT`;
constructor functions wrap the macro for runtime calls. Payloads use an anonymous
union. See the [generated C reference](compiler.md#generated-c-names-and-values).

Generation now writes matching C/header files. Native builds add a `.i` through
standard C preprocessing immediately before compiling it, preserving the original
pair. Failed native cases retain available artifacts for debugging. Library
packaging follows in the later distribution stages.

Add native operations when the corresponding feature needs them. Check array
bounds/growth arithmetic when arrays arrive; preserve valid backing storage
when text views arrive. Correct ownership for an implemented operation does
not require designing the eventual collector before a scalar program.

## Behavior grows with the supported slice

Follow accepted [language](language.md) and [builtin](builtins.md) contracts.
Small samples establish a small supported scope, not full parity. Explicitly
guard/reject unsupported forms or ranges; do not silently fall back to Node.

Resolve these topics as implementation reaches them:

- Numbers: start with small ordinary values. Choose native representation and
  boundaries with the numeric increment. JS uses numbers while some conversions
  require safe integers; broader limits remain open. Undefined C overflow is
  not a Mini rule.
- Text: start with ASCII literal output. Define indexing/conversion when added.
Current JS indexes UTF-16 units and converts bytes as UTF-8; UTF-8 byte indexing
  is not automatically equivalent.
- Collections: add heterogeneous values, missing-zero defaults, mutation, copies,
  sparse/negative indexing, and map behavior as distinct increments.
  The [passing proposal](parameter-passing.md) remains separate from accepted rules.
- Calls: add default returns, argument defaults/extras, fn_args(), recursion,
  scope, and globals when cases require them; resolve ambiguities at that point.
- Effects: preserve left-to-right, exactly-once evaluation and lazy logical
  operators when implemented. Use temporaries/control flow rather than assuming
  C argument evaluation order.

A later combined sample can exercise functions and arithmetic:

```mini
fn add(a, b) {
    return a + b;
}
io_write(add(40, 2), "\n");
```

Expected stdout is 42 followed by a newline, with status zero. This becomes
native coverage only when the necessary features are implemented.

```mini
fn left() { io_write("L"); return 1; }
fn right() { io_write("R"); return 2; }
io_write(left() + right(), "\n");
```

Expected stdout is LR3 followed by a newline. Add distinct argument-order and
lazy-side cases when those operations are implemented. Keep source, manifests,
and expected streams separate under cases/; pending cases are not native passes.

## Memory decisions during implementation

The owner deferred general reclamation, text-view ownership design, and
host-retained-value policy to mid/later implementation. No collector is selected.
Start with the simplest ownership appropriate to the actual sample.
Whole-invocation allocation with cleanup can serve bounded early programs.

When dynamic storage arrives, ensure live values/views retain valid backing
storage and cleanup matches the stated scope. Choose reclamation when repeated
or persistent execution needs it. Cycles, generated locals, runner frames, and
host-held values become relevant to that choice. Do not promise a long-lived
managed heap or persistent handles before their lifetimes are implemented/tested.

## No language error or recovery features

Mini gains no exceptions, interrupts, error values, or script-level recovery.
Guard unsafe native operations, preserve specified builtin defaults, and reject
malformed/unsupported source before execution. Unavoidable implementation
failures such as unavailable memory belong at the host boundary with valid
cleanup, not in new Mini language features.

Treat diagnostics and explicit process_exit at the host boundary when embedding
arrives: the CLI preserves process status; embedded code must not terminate the
host process. Define only the validation/status behavior needed for the current
entry, rather than an upfront recovery framework.

## Runner model is deferred

Choose tree evaluation or a stack machine after enough C compiler support exists
to build the runner. Neither is selected now. A tree evaluator can walk shared
nodes; a stack machine can use an instruction loop and explicit operand/call
frames. Compare their concrete needs at that stage.

A simple C API does not require a VM stack. Direct helper calls alone do not
interpret new scripts. Do not implement two runners, a binary bytecode format,
threaded dispatch, or a JIT as prerequisites for a script sample.

## Start with a naive host API

First prove one C-callable generated entry with simple inputs/results or output.
Document only its actual call, ownership, and status contract. An interface limited
to one invocation is enough for an initial example; no full stable API is selected.

At the runner stage, start with source bytes and one small script. Add includes,
function calls, richer results, callbacks, independent instances, and retained
values when useful examples need them. Callback binding/checking rules are
specified when registration arrives. Reject unsupported host features explicitly.

Define buffer lifetimes when exporting them. Verify source inclusion, separate C
compilation, static linking, and one actual dynamic FFI caller as distribution
grows. A shared library existing does not by itself prove API usability.

## Delivery order and boundaries

1. Specify the first sample and nearby cases only.
2. Generate/run its C output, preserving JS self-hosting.
3. Extend compiler support through small features and combined samples.
4. Add native storage/ownership when supported features need them.
5. Prove a naive C-callable entry using the supported subset.
6. Choose/build the Mini-written source runner and generate C source/header.
7. Extend embedding and verify source/static/shared distribution.

The stages do not require completing every language feature before trying a
host or runner sample. The [plan](../.agents/plans/c-target-and-embedding.md)
records concrete paths and gates. The first compiler slice works; later language
features, native storage, and the script runner remain pending.

Portable C11 is the proposed baseline. Verify macOS/Linux first; test Windows
exports/calling convention before claiming DLL support. Full native compiler
self-hosting is later work, not a runner prerequisite. Compare successive emitted
C sources, not native binaries, when attempted; preserve the separate JS gate.

This creates no release version, published artifact, new syntax, or sandbox
claim. Keep verified implementation increments in atomic commits.
