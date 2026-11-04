# Generated-code performance before T1

Assessment: 2026-11-03, Node.js on CPU details omitted/platform details omitted. The compiler baseline is
group 0.2.0, compiler 0.2.0-alpha.3. These measurements predate M1/T1 and define
the T0 baseline; they do not establish T1's speed.
This is the historical native-Map baseline. The current
[object-backed map runtime](map-runtime.md) uses the same logical map operations
with a different representation and no per-write size counter.
The later [application suite](application-performance.md) adds paired complete
operations, CPU measurements, and per-process memory without correctness checks
inflating the cold application RSS reading. The [M1/T1 evidence](m1-performance-results.md)
runs this audit against the candidate and records compiler and self-build costs.

## What emission adds

Inspecting `libs/compiler/parser.mini` and
`libs/compiler/builtins.mini` shows direct TS output:

- Mini functions become ordinary functions; calls pass ordinary JS arguments.
- Bindings, arithmetic, conditions, and loops become native TS statements.
- Lists become arrays; maps become `Map` instances; text remains strings.
- There is no interpreter, boxed-value hierarchy, reference-cell wrapper,
  deep copy on assignment/call, compiler framework, or runtime package.
- Five small adapters implement accepted collection/text fallback behavior.
  They are emitted once when needed. Array/type/index checks and map membership
  checks still have costs; direct emission is not a zero-overhead guarantee.
- Each `map_keys` call allocates a fresh array, as required by its snapshot
  contract. Scope copying allocates another map and copies its entries.
- A Mini text-copy/slice helper must access individual characters. T0 can use
  native host slicing. Identical-looking compiler operations can therefore have
  different algorithms even when their primitive lowerings are small.

The current `map_get` adapter checks both `has` and `get` for an existing key.
Using maps for every parser-state access and token field can be more expensive
than the handwritten compiler's locals and object fields.

## Reproduce the audit

From the repository root, using a fresh report filename:

```text
node tools/runtime-performance.ts .cache/runtime-performance.json
node tools/runtime-performance.ts .cache/runtime-candidate.json dist/compile.ts
```

The optional compiler path selects a candidate implementing
`compile SOURCE.mini OUTPUT.ts`; the default is the configured compiler.
The audit is a developer script, not a required dependency of the generated
compiler or a new published CLI command.

The [Mini workloads](../cases/compiler/runtime-workloads.mini) exercise scalar
calls/loops, dense list construction/reads, parser-state mutation, eight-field
token maps, character copying, 24-character slices, and 63-key scope copying.
No new Mini constructs or primitives are involved.

The [harness](../tools/runtime-performance.ts) compiles those functions using
the selected compiler. It appends exports to an isolated instrumented copy,
leaving the hashed original emitted output unchanged. Three sizes are measured
in separate workers, with a first call, three warmups, and seven samples.
It compares generated code against handwritten TS using the same representations
and algorithms, plus selected host idioms such as object fields and native
`slice`. It verifies returned values, text, and every token field outside timing.
String flattening is consumed inside timing; explicit GC happens before each call.

Separate complete-compiler probes compile and run programs with growing statement
counts, long text literals, and long addition expressions. These use three fresh
processes per measurement. Identical emitted bytes saved as `.mjs` isolate the
Node loading-path cost from steady-state Mini operations. Temporary files have
an explicit `type:module` package scope.

The checked-in [raw baseline](runtime-performance-baseline.json) records two
runs, samples, environment, source/compiler/harness hashes, output size, first
calls, GC-based retained heap estimates, worker RSS, and complete-program results.
The recorded source commit predates the audit files; hashes identify their exact
contents. Negative scalar heap deltas are GC noise. Worker peak RSS includes
verification allocations and must not be presented as compiler-only memory.

These are synthetic workloads on one host. Sub-millisecond ratios, JIT behavior,
fixed variant order, GC, and system noise limit precision. This does not measure
a complete Mini lexer, parser, self-build, or recursive parser stack usage.

## Findings relevant to the compiler port

The generated scalar loop and function calls were close to handwritten TS.
Character copying was also close when both versions used character-by-character
copying. At 160,000 dense items, generated list construction/reads took 0.67–1.14
ms across the two runs, versus 0.63–0.66 ms for direct array operations. First-call
costs were higher too. Do not extrapolate these results to mixed value shapes
or sparse arrays.

The largest representation cost is the proposed token map layout. At 160,000
eight-field tokens, generated code retained approximately 48.7 MB versus
15.5 MB for handwritten object records, about 3.15 times as much. Creation took
roughly 22 ms versus 1.3 ms in the initial recorded run. Handwritten TS constructing
the same maps was close to generated code. Most of this difference comes from
choosing maps as records, rather than from Mini's syntax or function calls.

For 1.6 million cursor increments, generated map access took 13–14 ms, direct
unchecked map access 9–10 ms, and object fields 1.7–1.8 ms. Copying 160,000 text
characters through 24-character Mini slices took 0.88–0.92 ms versus roughly
0.08 ms for native slicing. The raw results separate guard overhead from these
representation/library differences. Scope copying repeats work proportional
to the number of visible bindings; repeated snapshots/copies need attention
in deeply nested or binding-heavy programs.

The first M1 must follow T0's
[structure and access patterns](t0-t1-reference.md#first-m1-continuity). Preserve
its existing local counters, parser fields, token layout, lookup locations, and
scope-copy behavior. These microbenchmarks do not justify caching parser fields,
packing token data, or changing algorithms during that port. After parity and
the fixed point, actual compiler profiling can justify separate optimizations
using existing Mini. A reproduced blocker before then warrants the smallest
documented deviation that retains clear correspondence with T0.

The `.ts` loading path has a real cold-start cost on the selected Node version.
For the smallest successful emitted programs, `.ts` execution was around
47–53 ms versus 22–24 ms for identical `.mjs` bytes in the initial recorded run.
The 336 KB statement program took around 72 ms versus 24 ms. This includes
startup/parsing/execution; it is not an additional cost on every function call.
The target remains TS; the `.mjs` run is an experimental control, not a target
or packaging change.

The T0 baseline compiled a 304 KB, 16,000-assignment source in approximately
84 ms including process startup. Its emitted program ran successfully. Long
text literals through 160,000 characters also compiled and ran successfully.
These numbers establish reference workloads; they are not T1 estimates.

## Separate expression stress finding

T0 does not contain a 1,000-term addition expression. The synthetic expression
probe is not evidence that T1's ordinary compiler code will fail.

T0's additive loop emits a new pair of parentheses for each operation. A flat
1,000-term source expression becomes deeply nested generated text. In this
environment the `.ts` loading path failed with `Maximum call stack size exceeded`,
while a flat handwritten `.ts` control and the identical generated `.mjs` ran.
At 4,000 terms both generated extensions failed; the flat TS control still ran.
The exact limit is host-dependent. This is an emitted-expression depth issue,
not a measured slowdown in normal scanner/parser execution.

The audit exits unsuccessfully after saving the report when these stress probes
fail. Preserve this finding separately from compiler-workload acceptance; no
language or emitter change is made by this audit.

## Before retiring T0

Byte equality proves reproducibility, not useful compiler performance. Before
bootstrap promotion:

1. Capture T0 compiling the actual `compiler/compiler.mini`, representative
   large programs, and samples. Record cold wall time, generated bytes, and
   process peak memory on the same Node/host as the candidate.
2. Measure the actual generated compiler on exactly those inputs. Check outputs
   and diagnostics, repeated runs, and increasing input sizes. Investigate
   material slowdowns and unexpected growth in time or memory.
3. Measure all self-build generations and their peak memory. The candidate must
   complete the whole fixed point and ordinary workload reliably without hidden
   handwritten compiler helpers. Profile the complete port before choosing
   optimizations; microbenchmark ratios alone are insufficient.
4. Record the comparison and the accepted time/memory limits for the actual
   compiler workload. Select the generated compiler and remove T0 only after
   correctness, fixed-point, and performance evidence is reviewed together.

The current audit supports beginning the port, while identifying map storage and
cold TS loading as real costs. It does not provide performance clearance for an
absent replacement compiler.
