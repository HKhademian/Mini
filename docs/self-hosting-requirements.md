# Self-hosting readiness

Assessment: 2026-11-03. The [language contract](language.md), current compiler
sources, and executable cases are the evidence for this assessment.
Baseline: group 0.3.0, T0/compiler 0.3.0-alpha.1.

## Verdict

The current subset is sufficient for the Mini compiler port. No additional
language construct or host primitive has been demonstrated to be indispensable.
M1 now exists in [compiler/compiler.mini](../compiler/compiler.mini), and the
focused fixed-point check proves `T0(M1)`, `T1(M1)`, and `T2(M1)` are byte-identical.
Mini is not self-hosted yet: T0 remains active and the bootstrap configuration is null.

Freeze T0 language additions now. A reproduced bug that blocks compiling the
port may justify a focused T0 fix. Further language improvements should be made
with the self-hosted compiler after its fixed point is verified.

## What already works

Functions, forward calls, recursion, per-call locals, branches, loops, scalar
operations, mutable lists/maps, text access, and file/process I/O cover the
compiler's main workload. No record, class, closure, module, or general AST is
needed for the first direct emitter.
Line comments (`//`) and documentation comments (`///`) support documenting M1;
both are skipped by the compiler and add no generated runtime work.

The [port-foundation case](../cases/compiler/port-foundation.case.json) compiles
and runs Mini code that checks:

- Direct and mutual recursion, with local values retained across recursive calls.
- Shared parser-style state in a map, with ordered results accumulated in a list.
- Copying a scope map using existing key enumeration and lookup.
- Decimal rendering with addition/subtraction, text slicing, character membership,
  and quoting the supported text escapes.
- Writing an exact self-contained TypeScript program using ordinary host I/O.

These are integration checks of existing capabilities, not another compiler or
a self-hosting claim. They do not prove the candidate's correctness or speed alone.

The existing echo [example manifest](../cases/language/005-002-io-sample.case.json)
is ready for the bootstrap example gate, including empty and multiline input.
The [verifier](../tools/verify.ts) already rebuilds an isolated compiler three
times, compares each result to the shipped seed, and runs the ordinary example.
The case runner already accepts a candidate compiler override.
The [paired application results](application-performance-results.md) verify
meaningful workloads and quantify port costs. They supported the first M1 port,
while leaving actual-candidate performance and self-build acceptance outstanding.

## Mini compiler source

M1 is the first Mini compiler source; T1 is the TypeScript compiler generated
from it, `T1 = T0(M1)`. It ports the five files named in
[compiler configuration](../config/compiler.json) with close structural
correspondence to T0. Preserve its routines, conditions, evaluation order, calls,
lookups, named fields, and collection roles. Keep algorithms and storage layout
recognizable; adapt the TypeScript mechanisms only where Mini requires it:

- Tokens and expressions become maps with named text keys; token streams and
  parameter/argument collections become lists.
- Parser methods become top-level functions taking an explicit state map.
  Keep recursive temporaries in local bindings and avoid parameter rebinding.
- Sets become maps used for membership. Scope copies are small Mini helpers.
- Regex character tests become character membership helpers. Slicing, quoting,
  decimal formatting, basename handling, and token JSON output can be Mini code.
- Procedures can return ordinary zero for now. A no-result function form is not
  a prerequisite.
- Keep the first compiler in one Mini file. Helpers can live there without adding
  module syntax, a separate std library, or another prerequisite build tool.

The [complete T0-to-T1 inventory](t0-t1-reference.md) lists the methods, data,
host APIs, diagnostics, and exact output rules behind these responsibilities.
It records the [first-M1 continuity requirement](t0-t1-reference.md#first-m1-continuity).
Defer redesign and performance refactoring until parity and the fixed point are
established. Investigate a reproduced blocker with the smallest documented change.

Map key order is unspecified. Emit the finite host-import and adapter sets in an
explicit fixed order, matching T0, rather than introducing a sorting API.

Host adapters may still provide the accepted primitives. Scanning, parsing,
name/kind checking, and emission must move into Mini, including built-in lowering
decisions; they must not remain in handwritten TypeScript helpers.

## Remaining deliverables

1. **Mini compiler source (M1).** Implemented in `compiler/compiler.mini`: the
   scanner/tokenizer, positioned diagnostics, recursive-descent parser, current
   checking, TS emitter, and `compile` / `tokens` interfaces. T0 remains active
   until promotion.
2. **Output and behavior parity.** The candidate passes the current language,
   rejection, emission, token-position, sample, and example cases in local
   verification. Preserve deterministic imports, adapters, parentheses,
   whitespace, and literal spelling.
3. **Fixed point and ordinary execution.** The focused check produces
   Compiler1 with T0, Compiler2 with Compiler1, and Compiler3 with Compiler2;
   all three are runnable and byte-identical.
4. **Compiler performance.** Follow the [generated-code audit](runtime-performance.md).
   Compare T0 and the actual candidate on the compiler source, representative
   larger inputs, and complete self-builds, including cold time and peak memory.
   Investigate material regressions before retiring T0; primitive microbenchmarks
   and byte equality alone do not establish a useful replacement.
5. **Bootstrap promotion.** Ship the matching Mini source and generated
   `bootstrap/compiler.ts`; assign the bootstrap version and configure the
   active compiler/source identities. Update affected check/release expectations,
   verify an isolated rebuild and packaged execution, then remove handwritten
   T0 from the active build. Adapt any tests importing T0 directly. The CLI and
   other tools may remain TypeScript.

A merely equivalent program is insufficient for the byte-equality gate. Preserve
T0's emission rules during the initial port instead of weakening that gate.
Do not select the replacement or remove T0 before the complete candidate passes.

## Open rules and deferred work

The four parameter-passing review cases remain pending because the contract is
under review, not because their forms need a new T0 construct. The first port
can use explicit map state and avoid parameter reassignment. Resolve the final
contract before claiming those cases as accepted conformance coverage.
All four draft programs also matched their proposed results in direct T0 runs;
that observation does not activate them or satisfy the bootstrap gate.

Broader typing, numeric limits, shadowing, and target-name policy remain open.
Use the existing ordinary-integer/ASCII subset, complete value-return paths, and
unambiguous names in the port; do not turn every open design question into a new
T0 feature. A concrete failed port case is evidence for a blocker.

Enum/const syntax, optional arguments, extra arithmetic, convenience
text APIs, modules, and future tools are deferred. Records, structs, and classes
remain outside Mini's scope. The next targets are candidate performance evidence
and bootstrap promotion.
