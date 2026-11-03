# Application performance before T1 replacement

The [paired application samples](../cases/applications/README.md) compare Mini
generated TS with handwritten TS across ten document-processing applications.
They supplement the earlier [primitive audit](runtime-performance.md) with
complete operations and realistic structured input. No language/compiler change
or extra runtime dependency is introduced.
The [recorded results](application-performance-results.md) and
[raw baseline](application-performance-baseline.json) contain two clean runs
from the committed suite and a provisional T1-readiness assessment.

## Reproduce

Use the repository's Node.js and locked development dependencies:

```text
node tools/application-performance.ts --check
node tools/application-performance.ts --check .cache/compiler.mini.ts
node tools/application-performance.ts .cache/applications.json
node tools/application-performance.ts .cache/candidate-applications.json bootstrap/compiler.ts
```

The `--check` form accepts the same optional candidate compiler path and runs
scale-1 semantic verification without writing a report. Choose a fresh report path. Full runs retain the assembled Mini input and
instrumented generated TS in `REPORT.json.assets/`; originals are identified by
hash before appending the export used by the harness. Compilation happens once
per application and its wall time is recorded separately from execution.
No generated application logic is hand-edited or implemented by the harness.

The [fixtures](../tools/application-fixtures.ts) generate source documents and
expected results from independent data models. Small explicit cases cover empty
input, CSV escaping/EOF, configuration replacement, graph cycles, missing template
keys, expression precedence, and exclusion of identifiers inside comments/text.
The token generator records known token atoms and positions while building the
input; it does not use either tokenizer to invent expectations. The compiler
generator constructs expected TS from a known statement model. Each returned
program must match those bytes and execute with the expected output.

## Comparisons

- **Generated versus handwritten:** same algorithms, helper boundaries, source
  traversal, logical maps/lists, and output shapes. The handwritten counterpart
  uses native `Map`; generated storage follows the selected compiler backend.
  Compare generated before/after runs to isolate a backend change. Cross-language
  comparisons also include storage choice and accepted fallback behavior.
- **Generated versus actual T0:** tokenization, identifier indexing, and the
  compiler pipeline additionally invoke the current handwritten T0 modules.
  T0 uses its own object records, regex tests, slicing, and full parser. This is
  a distinct comparison of port adaptations, not just primitive lowering.

The actual T0 reference is optional and its source hashes are recorded. When its
source is retired, that reference is unavailable; the benchmark does not preserve
or revive a handwritten compiler for normal operation. The matched handwritten
application samples remain benchmark baselines only.

The subset compiler accepts declarations, assignment, scalar arithmetic/equality,
parentheses, numeric negation, `if`/`else`, and text `write`. Its scanner recognizes
the current ASCII token forms and comments. It deliberately does not claim full
language checking, full diagnostic parity, general function compilation, or
self-compilation. Canonical numeric spellings are used in its inputs.

## Measurements

For every application, input size grows by factors 1, 4, and 16. Each variant has
three fresh processes and a separate warm process with three warmups and seven
measured calls. Processes run sequentially; cold order rotates and warm starting
variants vary. There is no forced GC. Every measured result is checked, including
each warm result; mismatches, crashes, signals, and timeouts fail the run.

- **Cold wall time:** entire worker process, including Node/TS loading, input
  read, application, result normalization, output, and exit. It includes the
  common harness; it is not an uninstrumented product CLI startup measurement.
- **Cold CPU time:** process user and system CPU through output serialization,
  excluding the final metric print and shutdown. Reported in milliseconds.
- **Warm application wall/CPU:** application call plus flattening a top-level
  returned string. Imports, input loading, output normalization, and correctness
  hashing are outside this timed region. Natural GC during the call is included.
- **Application RSS:** process high-water resident bytes sampled after the first
  application call, before normalization/validation. This includes Node, worker,
  imports, input, and application allocations; it is not isolated object storage.
- **Process RSS:** high-water resident bytes after normalization and writing
  output. The report retains both RSS readings to expose output-handling costs.
- **Heap snapshots:** before/after application `heapUsed`, including garbage.
  Their difference is neither retained memory nor peak JS heap and can be noisy.

Wall and CPU use medians; memory summaries use the largest cold high-water value.
Raw samples, sizes, input/output hashes, source/harness/compiler hashes, versions,
Node/OS/CPU, and checkout identity remain in the report. A CPU sum can exceed wall
time when runtime threads also work; CPU percentage is not inferred from it.

These are in-memory document-processing workloads, including scanner/parser and
emitter work. They do not measure filesystem durability, concurrent servers, a
controlled OS cold cache, or a complete M1 self-build. Three cold samples and
seven warm samples on one host do not establish universal performance.

## T1 acceptance

Use the results to identify port costs and unexpected scaling; they informed the
first M1. Preserve the [first-port continuity requirement](t0-t1-reference.md#first-m1-continuity);
these samples do not authorize restructuring M1 or adding T0 features.

T0 retirement still requires the actual M1 source, complete conformance and
diagnostics, a runnable fixed point, and time/peak-memory measurements of the real
generated compiler and all self-build generations. There is no automatic
performance pass/fail ratio or invented replacement budget in this harness.
