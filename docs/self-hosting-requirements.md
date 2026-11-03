# Self-hosting readiness

Assessment: 2026-11-03. The [language contract](language.md), current compiler
sources, and executable cases are the evidence for this assessment.
Baseline: group 0.2.0, T0/compiler 0.2.0-alpha.3.

## Verdict

The current subset is sufficient to begin the Mini compiler port. No additional
language construct or host primitive has been demonstrated to be indispensable.
Mini is not self-hosted yet: there is no Mini compiler source, the active compiler
is T0, and the bootstrap configuration is null.

Freeze T0 language additions now. A reproduced bug that blocks compiling the
port may justify a focused T0 fix. Further language improvements should be made
with the self-hosted compiler after its fixed point is verified.

## What already works

Functions, forward calls, recursion, per-call locals, branches, loops, scalar
operations, mutable lists/maps, text access, and file/process I/O cover the
compiler's main workload. No record, class, closure, module, or general AST is
needed for the first direct emitter.

The [port-foundation case](../cases/compiler/port-foundation.case.json) compiles
and runs Mini code that checks:

- Direct and mutual recursion, with local values retained across recursive calls.
- Shared parser-style state in a map, with ordered results accumulated in a list.
- Copying a scope map using existing key enumeration and lookup.
- Decimal rendering with addition/subtraction, text slicing, character membership,
  and quoting the supported text escapes.
- Writing an exact self-contained TypeScript program using ordinary host I/O.

These are integration checks of existing capabilities, not another compiler or
a self-hosting claim. They do not prove the absent port's correctness or speed.

The existing echo [example manifest](../cases/language/005-002-io-sample.case.json)
is ready for the bootstrap example gate, including empty and multiline input.
The [verifier](../tools/verify.ts) already rebuilds an isolated compiler three
times, compares each result to the shipped seed, and runs the ordinary example.
The case runner already accepts a candidate compiler override.

## Write the compiler with the existing subset

Port the responsibilities of the five files named in
[compiler configuration](../config/compiler.json), rather than their TypeScript
mechanisms:

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

Map key order is unspecified. Emit the finite host-import and adapter sets in an
explicit fixed order, matching T0, rather than introducing a sorting API.

Host adapters may still provide the accepted primitives. Scanning, parsing,
name/kind checking, and emission must move into Mini, including built-in lowering
decisions; they must not remain in handwritten TypeScript helpers.

## Remaining deliverables

1. **Mini compiler source.** Implement the scanner/tokenizer, positioned
   diagnostics, recursive-descent parser, current checking, TS emitter, and
   `compile` / `tokens` interfaces in `compiler/compiler.mini`.
   Keep T0 active while the replacement is being completed.
2. **Output and behavior parity.** Run the active language, rejection, emission,
   token-position, and sample cases through the candidate. Preserve deterministic
   imports, adapters, parentheses, whitespace, and literal spelling. The first
   self-build must reproduce T0's output for that same compiler source.
3. **Fixed point and ordinary execution.** For unchanged source, produce
   Compiler1 with T0, Compiler2 with Compiler1, and Compiler3 with Compiler2.
   Require all three to be runnable and byte-identical. Use the final generation
   to compile and run the ordinary example and the current language cases.
4. **Bootstrap promotion.** Ship the matching Mini source and generated
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

Comments, enum/const syntax, optional arguments, extra arithmetic, convenience
text APIs, modules, and future tools are deferred. Records, structs, and classes
remain outside Mini's scope. The next implementation target is the Mini compiler.
