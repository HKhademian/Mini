# Self-hosting readiness

Assessment: 2026-11-04. The [language contract](language.md), current compiler
sources, and executable cases are the evidence for this assessment.
Baseline: group 0.3.0, compiler 0.3.0-alpha.11, bootstrap 0.1.0-alpha.1.

## Verdict

The current subset is sufficient for the mini compiler. The mini compiler source is
[tools/compiler.mini](../tools/compiler.mini), and the fixed-point check
proves the promoted compiler reaches a byte-identical fixed point. mini is self-hosted
for the compiler path: `dist/compile.js` is selected by
`config/compiler.json` and pinned by `config/bootstrap.json`.

The handwritten compiler has been retired. Further compiler work uses the
generated compiler and the
bootstrap regeneration process.

## What already works

Functions, forward calls, recursion, per-call locals, branches, loops, scalar
operations, mutable lists/maps, text access, and file/process I/O cover the
compiler's main workload. No record, class, closure, module, or general AST is
needed for the first direct emitter.
Line comments (`//`) and documentation comments (`///`) support documenting
the compiler source;
both are omitted from the compiler parse path and add no generated runtime work.
Tool analysis can request comment tokens from the lexer's include-comments mode.

The [port-foundation case](../cases/compiler/port-foundation.case.json) compiles
and runs mini code that checks:

- Direct and mutual recursion, with local values retained across recursive calls.
- Shared parser-style state in a map, with ordered results accumulated in a list.
- Copying a scope map using existing key enumeration and lookup.
- Decimal rendering with addition/subtraction, text slicing, character membership,
  and quoting the supported text escapes.
- Writing an exact self-contained JavaScript program using ordinary host I/O.

These are integration checks of existing capabilities. The self-hosting claim
rests on the promoted bootstrap fixed point, not on these samples alone.

The existing echo [example manifest](../cases/language/005-002-io-sample.case.json)
is ready for the bootstrap example gate, including empty and multiline input.
The [verifier](../tools/verify.mini) already rebuilds an isolated compiler three
times, compares each result to the shipped seed, and runs the ordinary example.
The case runner already accepts a candidate compiler override.
The [paired application results](application-performance-results.md) verify
meaningful workloads and quantify port costs. They supported the first port,
while leaving actual-candidate performance and self-build acceptance outstanding.

## mini compiler source

The mini compiler source is `tools/compiler.mini`; the JavaScript compiler is
generated from it.
It ports the five retired handwritten TypeScript source files with close
structural
correspondence to the handwritten compiler. Preserve its routines, conditions,
evaluation order, calls,
lookups, named fields, and collection roles. Keep algorithms and storage layout
recognizable; adapt the JavaScript mechanisms only where mini requires it:

- Tokens and expressions become maps with named text keys; token streams and
  parameter/argument collections become lists.
- Parser methods become top-level functions taking an explicit state map.
  Keep recursive temporaries in local bindings and avoid parameter rebinding.
- Sets become maps used for membership. Scope copies are small mini helpers.
- Regex character tests become character membership helpers. Slicing, quoting,
  decimal formatting, basename handling, and token JSON output can be mini code.
- Procedures can return ordinary zero for now. A no-result function form is not
  a prerequisite.
- Keep the first compiler in one mini file. Helpers can live there without adding
  module syntax, a separate std library, or another prerequisite build tool.

The [complete port inventory](port-history.md) lists the methods, data,
host APIs, diagnostics, and exact output rules behind these responsibilities.
It records the
[first-port continuity requirement](port-history.md#first-port-continuity).
Defer redesign and performance refactoring until parity and the fixed point are
established. Investigate a reproduced blocker with the smallest documented change.

Map key order is unspecified. Emit the finite host-import and adapter sets in an
explicit fixed order, matching the handwritten compiler, rather than
introducing a sorting API.

Host adapters may still provide the accepted primitives. Scanning, parsing,
name/kind checking, and emission must move into mini, including built-in lowering
decisions; they must not remain in handwritten TypeScript helpers.

## Remaining deliverables

1. **mini compiler source.** Implemented in `tools/compiler.mini`: the
   scanner/tokenizer, positioned diagnostics, recursive-descent parser, current
   checking, TS emitter, and `compile` / `tokens` interfaces. The generated
   compiler is promoted and
   active; the handwritten implementation has been removed.
2. **Output and behavior parity.** The candidate passes the current language,
   rejection, emission, token-position, sample, and example cases in local
   verification. Preserve deterministic imports, adapters, parentheses,
   whitespace, and literal spelling.
3. **Fixed point and ordinary execution.** The focused check compiles the
   compiler source three times, each generation with the previous output during
   the migration;
   all three are runnable and byte-identical.
4. **Compiler performance.** Measured in the
[compiler performance evidence](compiler-performance-results.md).
   The generated compiler emits identical bytes and passes the complete active
   case corpus. Its
   self-build wall time was slightly below the handwritten compiler's w
   ith about 2% higher RSS, while
   large synthetic sources compile about 1.43x slower. The remaining
   large-source gap stays tracked; byte equality alone does not
   establish a useful replacement.
5. **Bootstrap promotion.** Delivered: `dist/compile.js` matches the mini
   source, the bootstrap/compiler identities are assigned, the isolated rebuild
   and packaged execution pass, and the handwritten compiler is removed. The
   CLI and other tools may
   remain TypeScript.

A merely equivalent program is insufficient for the byte-equality gate. The
initial port preserved the handwritten compiler's emission rules instead of
weakening that gate. The
replacement was selected and the handwritten compiler removed only after the
complete candidate
passed.

## Open rules and deferred work

The four parameter-passing review cases remain pending because the contract is
under review, not because their forms need a new compiler construct. The first port
can use explicit map state and avoid parameter reassignment. Resolve the final
contract before claiming those cases as accepted conformance coverage.
All four draft programs also matched their proposed results in direct reference-compiler runs;
that observation does not activate them or satisfy the bootstrap gate.

Broader typing, numeric limits, shadowing, and target-name policy remain open.
Use the existing ordinary-integer/ASCII subset, complete value-return paths, and
unambiguous names in the port; do not turn every open design question into a new
compiler feature. A concrete failed port case is evidence for a blocker.

Enum/const syntax, optional arguments, extra arithmetic, convenience
text APIs, modules, and future tools are deferred. Records, structs, and classes
remain outside mini's scope. The next targets are the large-source performance
follow-up, multi-file compiler-source authoring, and moving tooling onto self-hosted mini
sources.
