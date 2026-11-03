# Changes

## Unreleased

- T0 alpha.26 / builtins alpha.11: exact stderr output with `write_error`.
- T0 alpha.25 / builtins alpha.10: `process_exit`.
- T0 alpha.24 / builtins alpha.9: `list_at`.
- T0 alpha.23 / builtins alpha.8: `list_length`.
- T0 alpha.22 / builtins alpha.7: `process_args` returns the program's text list.
- T0 alpha.21 / builtins alpha.6: `file_write`.
- T0 alpha.20 / builtins alpha.5: `file_read`.
- T0 alpha.19 / builtins alpha.4: `text_at`.
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
- Use `text_length`/`text_at` names in the text-access proposal and cases.
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
