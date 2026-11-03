# Changes

## Unreleased

- Record two clean application benchmark runs: 1,380 verified measured calls,
  CPU/RSS evidence, and material scanner/compiler costs relative to actual T0.
- Add ten paired Mini/handwritten-TS application benchmarks, independent result
  models, actual-T0 comparisons, and cold/warm wall, CPU, and memory measurements.
- Compiler/language 0.2.0-alpha.4: add `//` line comments and `///` documentation
  comments, preserve quoted markers and positions, document Mini samples and
  workload helpers, and add VS Code comment highlighting/toggling (0.2.0).
- Define M1 as Mini compiler source and T1 as its generated TS compiler; require
  the first M1 to preserve T0's structure, control flow, lookups, and data layout.
  Defer performance refactoring until parity and the fixed point are established.
- Audit generated-code performance with repeatable compiler workloads, record
  map/storage and TS-loading costs, and require actual-candidate performance
  evidence before retiring T0. Record a separate emitted-expression depth limit.
- Inventory T0's implementation, all built-in lowerings, and T1 equivalents.
- Freeze T0 feature growth, verify the port workload in Mini, and narrow the
  remaining self-hosting work to the compiler port, fixed point, and promotion.
- Focus reader documentation and cases on the current API.
- 0.2.0-alpha.3: list reads return zero for gaps and invalid targets/positions;
  negative indices count from the end.
- 0.2.0-alpha.2: text reads return empty text for non-text targets and invalid positions.
- Group 0.2.0: use consistent text_get/list_get reader names;
  advance language, compiler, and builtins to 0.2.0-alpha.1.
- T0 alpha.35 / builtins alpha.19: map reads use ordinary zero for missing keys.
- T0 alpha.34 / builtins alpha.18: map key snapshots, demonstrated by the map sample.
- Showcase all implemented built-ins in runnable samples, including list mutation.
- T0 alpha.33 / builtins alpha.17: map key counts, with a runnable map sample.
- Document grouped-tag audits, explicit remote publication, and immutable history.
- T0 alpha.32 / builtins alpha.16: map insertion/replacement with non-map no-ops.
- Adopt group 0.1.2 and product-vGROUP-vPRODUCT tags; keep product counters across groups.

- T0 alpha.31 / builtins alpha.15: `map_has` checks text-key membership without mutation.
- T0 alpha.30 / builtins alpha.14: `map_new()` creates empty maps.
- T0 alpha.29 / builtins alpha.13: list mutation with growth and uniform no-op rules.
- Investigate reserve versus list growth and exact versus defaulted argument counts.
- Separate parameter-sharing semantics from target-specific value representation.
- Propose local parameter rebinding and shared collections, with pending review cases.
- T0 alpha.28 / builtins alpha.12: zero-argument `list_new()` creates empty lists.
- Define group/product versioning, compatibility evidence, and the version inventory.
- Exclude records, structs, and classes from Mini's target; use simple collections.
- Document future formatter, documentation, help, and language-server commands.
- Assess remaining self-hosting semantics, compiler capabilities, and useful additions.
- Prepare independently versioned T0 preview releases with source provenance.
- T0 alpha.26 / builtins alpha.11: exact stderr output with `write_error`.
- T0 alpha.25 / builtins alpha.10: `process_exit`.
- T0 alpha.24 / builtins alpha.9: indexed list reads.
- T0 alpha.23 / builtins alpha.8: `list_length`.
- T0 alpha.22 / builtins alpha.7: `process_args` returns the program's text list.
- T0 alpha.21 / builtins alpha.6: `file_write`.
- T0 alpha.20 / builtins alpha.5: `file_read`.
- T0 alpha.19 / builtins alpha.4: indexed character reads.
- T0 alpha.18 / builtins alpha.3: `text_length`.
- T0 alpha.17: braced `while` loops.
- T0 alpha.16: short-circuit boolean disjunction.
- T0 alpha.15: short-circuit boolean conjunction.
- T0 alpha.14: boolean negation.
- T0 alpha.13: braced `if`/`else` branches with boolean conditions.
- T0 alpha.12: numeric ordering comparisons.
- T0 alpha.11: scalar equality and inequality without coercion.
- T0 alpha.10: unary numeric negation.
- T0 alpha.9: numeric subtraction.
- T0 alpha.8: parenthesized expressions.
- T0 alpha.7: named functions, positional calls, and value returns.
- T0 alpha.6: preserve the five supported text escapes directly in emitted TS.
- T0 alpha.5 / builtins alpha.2: read stdin through EOF with `readAll`.
- T0 alpha.4 / builtins alpha.1: write exact text to stdout.
- T0 alpha.3: numeric addition and text concatenation with `+`.
- T0 alpha.2: assign replacement values to existing bindings.
- Start T0 with initialized bindings, positioned tokens, indexed cases, and `.mini.ts` output.
- Accept process termination; propose `write_error(text)` with diagnostic cases.
- Propose `process_exit(status)` with immediate-termination cases; keep `process_envs` optional.
- Accept file I/O, shared text-list operations, and process arguments.
- Accept text-access built-ins; distinguish primitives from Mini library helpers.
- Propose text-file operations with isolated input/output file cases.
- Use grouped names in the text-access proposal and cases.
- Accept `readAll`/`write`; propose two text-access primitives with scanner cases.
- Propose whole-input/text-output primitives with focused I/O and EOF cases.
- Package checksummed VSIX assets from tagged extension sources and verify releases in CI.
- Accept expression forms; balance single/combination cases and share empty fixtures.
- Version VS Code support independently at 0.1.1, validate escapes, and test it in CI.
- Record control-flow approval and propose basic values/operators with combination cases.
- Add local VS Code syntax highlighting, file icons, and bracket/quote pairing.
- Add pending compile, runtime, rejection, and sample cases with each construct.
- Report pending scenarios separately; allow compile checks without exact artifacts.
- Draft the compiler workload and first binding/assignment construct for review.
- Propose named functions, positional calls, and value returns for review.
- Record accepted binding/function forms and propose `if`/`else` and `while`.

## cli 0.1.0-alpha.1 — mini tooling preview

- Define mini's tiny self-hosting foundation and atomic development rules.
- Add independently versioned CLI tools, JSON verification cases, benchmarks,
  bootstrap checks, and release packaging.
- Add Linux/macOS GitHub CI and tag-triggered releases using direct TypeScript.
- Scope self-hosting to the compiler and record built-in I/O/library direction.
- Reserve the independent `std-v*` release stream; std remains unimplemented.
- Place future standard-library source under `std/`.
- Balance language size with compiler readability and incremental syntax migration.
- Put stream descriptors directly in JSON cases and invoke real tools through
  the shared runner; add `mini verify CASE.json` and remove per-case scripts.
- Document the main clone-and-evolve workflow, including breaking syntax bridges
  and atomic promotion of a verified compiler/source pair.

This preview ships TypeScript tooling and guides. Mini grammar, compiler, and
generated bootstrap are not implemented yet.
