# Paired application samples

Each pair implements `app_run(source)`, a complete document-processing operation.
The Mini source uses the current subset; the TS counterpart is handwritten, not
generated output with renamed functions. Keep conditions, helpers, call order,
loops, and logical map/list roles comparable. TS uses typed native `Map` and
array operations; generated storage follows the selected compiler backend.
These are benchmark applications, not
released commands, a standard library, or a replacement compiler.

- Word frequencies: [Mini](word-count.mini), [TS](word-count.ts).
- Request-log aggregation: [Mini](log-summary.mini), [TS](log-summary.ts).
- CSV filtering with quotes and embedded newlines: [Mini](csv-clean.mini), [TS](csv-clean.ts).
- Sectioned configuration parsing and replacement: [Mini](config-read.mini), [TS](config-read.ts).
- Dependency reachability with cycles and duplicates: [Mini](dependencies.mini), [TS](dependencies.ts).
- Header-driven template rendering: [Mini](template-render.mini), [TS](template-render.ts).
- Recursive arithmetic-expression evaluation: [Mini](expression-eval.mini), [TS](expression-eval.ts).
- Positioned Mini tokenization: [Mini entry](tokenize.mini), [TS entry](tokenize.ts).
- Identifier occurrence indexing: [Mini](source-index.mini), [TS](source-index.ts).
- A Mini-subset compiler pipeline: [Mini](compiler-pipeline.mini), [TS](compiler-pipeline.ts).

The last three share the [Mini lexer](lexer.mini) and [handwritten TS lexer](lexer.ts).
The harness concatenates the explicit Mini lexer and application source into one
ordinary Mini input; TS uses its normal module import. This is benchmark build
assembly, not Mini import syntax. All application logic is in the paired sources.
Generated inputs and emitted TS are retained beside each full benchmark report.

Run from the repository root:

```text
node test/performance/application-performance.ts --check
node test/performance/application-performance.ts .cache/applications.json
node test/performance/application-performance.ts .cache/candidate-applications.json dist/compile.ts
```

`--check` runs explicit small semantic fixtures and the smallest generated dataset
against each available variant. CI runs this correctness check, not performance
thresholds. Full runs use three dataset sizes with independent model-based
expected results; the compiler pipeline's emitted programs are also executed.
See [measurement definitions and limits](../../docs/application-performance.md).
