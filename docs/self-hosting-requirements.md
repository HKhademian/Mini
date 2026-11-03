# Requirements for meaningful self-hosting

Status: workload assessment, not an accepted language extension. The current
[language contract](language.md) and [T0 support](compiler.md) remain authoritative.
Review one concrete rule or construct with cases, then implement and verify it
before advancing to another proposal.

## Current position

T0 implements bindings, assignment, named functions, calls, value returns,
branches, loops, scalar expressions, text access, file I/O, process arguments,
stdout/stderr, and process exit. This covers most of a small compiler's basic
control flow and host access. The generated self-hosted bootstrap is unavailable.

No additional syntax is demonstrated to be indispensable yet. A streaming
scanner and recursive-descent parser can use scalar bindings and emit TypeScript
directly. However, a compiler that encodes every table into text or shares all
state through globals would be a poor foundation to maintain and reshape.
Judge the first port by readability as well as whether it compiles itself.

The existing TypeScript implementation uses token records, arrays, maps, sets,
classes, regular expressions, and callbacks. Port its responsibilities, not
every TypeScript construct. None of those particular mechanisms is itself a
self-hosting requirement.

## Required decisions using existing syntax

These rules need explicit contracts and focused cases. Current T0 behavior is
implementation evidence, not an automatic decision for the language.

- **Binding visibility and lifetime.** Define top-level, function, and block
  bindings; shadowing and duplicate names; when a name becomes usable; and
  whether a function can read or update top-level state. A scanner needs persistent
  source/cursor state, while recursive parsing needs per-call local state.
- **Function calls and recursion.** Confirm direct recursion, calls to later
  functions, and mutual recursion. Expression parsing naturally calls through
  precedence levels and back into expressions inside parentheses. T0 recognizes
  later function names, but that alone does not settle recursive behavior.
- **Function results.** Decide parameter/result kind rules, inconsistent return
  kinds, and reaching the end of a function. T0 requires a value return somewhere;
  this is not a check that every execution path returns a value. Define how
  no-result calls may be used before relying on scanner/emitter procedures.
- **Value kinds and assignment.** Decide whether replacing a binding may change
  its kind and what checking applies at function boundaries. T0's internal
  `Unknown` kind is not a selected Mini type system. A small clear rule is enough;
  sophisticated inference and annotation syntax are separate choices.
- **Names emitted into TypeScript.** Choose a simple policy for reserved target
  names, built-in collisions, and duplicate declarations so accepted Mini names
  produce runnable output. This belongs to name handling, not new syntax.
- **Numbers and text.** Bound the ordinary integer workload used for positions
  and counts. Choose deterministic literal emission, including leading zeros.
  Preserve the selected ASCII/escape contract; broad numeric or Unicode support
  is unnecessary for this target.

These are real language semantics even when they add no keywords. Each decision
should cover its compiler use and a rejection or interaction where relevant.

## Required capabilities, with representation still open

The compiler must perform the following work in Mini. They need not all become
new language constructs or host built-ins.

- **Scan and track locations.** Classify ASCII characters, advance through source,
  and retain token kind, spelling, offsets, line, column, and diagnostic context.
  Existing text access, equality, loops, and counters can do this without regex.
  A current-token scanner can avoid storing the entire token stream initially.
- **Parse nested syntax.** Use functions and local state for precedence, calls,
  braces, and returns. Retain enough context to reject invalid forms and locate
  errors. A full AST is unnecessary for direct TypeScript emission.
- **Remember names.** Store or recover binding kinds, function names and arities,
  scope information, and built-in signatures. A small pre-scan can collect later
  function names. The representation must remain readable as the compiler grows.
- **Build deterministic output.** Accumulate generated code, indentation, escaped
  text, and required host imports in a fixed order. Existing text concatenation
  can start this; a string builder or sorting API is not required.
- **Produce diagnostics.** Render positions and source context through
  `write_error`, then fail through `process_exit`. Decimal rendering and quoting
  can be Mini helpers; a concrete implementation should establish whether a
  further primitive is justified. TypeScript must not hide the diagnostic logic.
- **Run the compiler interface.** Read arguments/source and write output using
  the accepted process and file built-ins. Generated code must run with Node
  alone. Keep parsing, name handling, checking, and emission out of host adapters.

## High-value additions to evaluate against port code

These are candidates, not selected syntax or APIs. Add one only when a compiler
slice demonstrates its benefit over an ordinary Mini helper or simpler design.

- **Functions without a result.** Advancing a token, expecting punctuation,
  emitting text, and reporting an error are naturally procedures. Supporting
  them avoids meaningless returned values. This is a small next review candidate;
  its explicit return and fallthrough rules still need to be chosen.
- **Named kind constants.** Token, value, and stage kinds should have one shared
  definition rather than repeated string literals. Existing bindings can name
  values; immutability or enum syntax should earn its cost separately.
- **Small reusable text helpers.** Slicing, character membership, quoting, and
  decimal rendering can remove repeated loops. Prefer Mini library functions
  when the accepted primitives suffice; add primitive access only when needed.
- **Source comments.** Useful for explaining scanner/parser invariants and
  bootstrap migrations. Evaluate one simple form independently. Documentation
  comments and annotations are additional choices, not prerequisites.

## Collection direction

Records, structs, and classes are outside Mini's intended scope, rather than
deferred additions. Text-keyed maps can hold named compiler data such as token
information without dedicated field declarations or construction syntax.
Lists can now be constructed, grown, and mutated, storing scalars, lists, and
maps. Empty-map construction, membership, and mutation are available; map lookup
is not implemented yet. Missing-position and missing-key values remain open.

Lists and maps can share implementation machinery, but their observable rules
differ. Lists have positional indices, a sequence length, growth, and indexing
from the end. Maps have unique text keys and membership. Combining them into
one entity must not make these rules more complicated merely to reduce the
number of container names. No shared runtime representation is required.

Keep the collection implementation small and readable. A short linear lookup
can be adequate initially; a general collection/type system is unnecessary for
the first compiler port.

Capacity reservation and logical growth are different. On a fresh list, setting
nonnegative index `r` makes its length `r + 1`; it cannot replace reserving
capacity while keeping length zero. To obtain logical length `r` by assignment,
set index `r - 1`. On a fresh list, the negative-index no-op rule keeps it empty
when `r <= 0`. This sets the last element; it does not choose values for skipped
positions. Growth by assignment cannot shrink an existing list either.

Keeping only `list_new()` and growing through assignment is an option under
discussion. It would omit explicit capacity control rather than emulate it.
An optional reserve argument can wait for a measured compiler need, with targets
managing automatic growth themselves. The existing empty constructor needs no
optional-argument machinery; see the [argument-count investigation](parameter-passing.md).

## Useful later, without blocking the first port

Modules/imports can wait while the compiler is one manageable source file.
`break`, `continue`, `for`, `switch`, extra arithmetic, richer collections,
structured recoverable errors, and source maps can wait for concrete pressure.
Closures, methods, generics, pattern matching, packages, concurrency,
and optimization passes are not first self-hosting requirements.

Primitive file failures may retain the current narrow success contract at this
stage. Do not introduce exceptions or a result type solely to mirror Node.
Future tools may need broader contracts; their requirements do not expand the
first compiler target automatically.

## What proves the target

Start a small Mini compiler slice using the current subset: scan positioned
tokens, parse bindings and one nested expression, and emit runnable TypeScript.
Use its actual awkward code to select the next single review. It is a prototype,
not a claim of self-hosting; do not keep a second unfinished compiler framework.

The completed port must compile the reviewed language, including its own source,
with understandable scanner, parser, checking, emission, and host boundaries.
Run the language and diagnostic cases through the generated compiler as well as
the ordinary example; deliberately resolve any differences from T0.

For unchanged source, require Compiler1, Compiler2, and Compiler3 to be
byte-identical and runnable. Compile and run the ordinary example with the final
generation. Then promote the generated compiler/source pair, remove handwritten
T0 from the active build, and verify a rebuild in isolation. Follow the existing
[bootstrap](bootstrap.md) and [evolution](evolving-language.md) gates.

The ability to make and verify a small compiler change is part of the foundation's
purpose. Subsequent increments must preserve the fixed point; a one-off compiler
that cannot be maintained in Mini is not the intended outcome.

The [future tooling](tooling.md) may remain TypeScript. A formatter, documenter,
help tool, and language server are useful follow-on work, not compiler bootstrap
prerequisites.
