# Changes

## Unreleased

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
