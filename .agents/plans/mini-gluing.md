---
name: mini-gluing
status: completed
created: 2026-11-04
todos:
  - id: step-1-proposal
    content: "Step 1 — Select include syntax, resolution, and expansion semantics"
    status: completed
  - id: step-2-cases
    content: "Step 2 — Add accepted include cases before compiler support"
    status: completed
  - id: step-3-compiler
    content: "Step 3 — Implement include expansion and promote the bootstrap bridge"
    status: completed
  - id: step-4-tooling
    content: "Step 4 — Preserve include directives in formatter and analysis, then adopt in tools"
    status: completed
  - id: step-5-imports
    content: "Step 5 — Decide whether project dependencies need import later"
    status: completed
plans:
  requires: []
  blocks: []
  parallel: []
---

# Source gluing: include, import, and project composition

## Question

Each project needs a way to join more than one source file. Mini originally did
this outside the language: ordered parts were concatenated by build helpers
before compilation. Does the language need `include` or `import`?

## Adopted mechanism

Mini now has a single-unit `include` directive:

```text
tools/compiler.mini
include "../libs/compiler/constants.mini";
include "../libs/text.mini";
include "../libs/compiler/lexer.mini";
include "../libs/compiler/parser.mini";
include "../libs/compiler/builtins.mini";
```

Contract:

- `include "relative/path.mini";` is a top-level directive, recognized
  contextually.
- Paths resolve relative to the including file and are canonicalized. Source
  files and tools share `tools/`; generated artifacts live in `dist/`.
- Each canonical file is included at most once per compilation.
- Cycles, missing files, included shebangs, and includes inside blocks are
  compiler errors.
- Included diagnostics use the written include path.
- `tokens` keeps directives; `compile` expands them; formatting preserves
  directives.

`tools/mini-tools.json` now maps each tool source to its generated target and
declares `bin/` launchers. Tools declare their own dependencies:

```text
tools/check.mini
include "../libs/text.mini";
include "../libs/cases.mini";
```

`tools/mini-tools.ts` compiles the source directly. The compiler's include
expansion replaces the former `compiler/m1.parts`, `compiler/compiler.mini`, and
`tools/build-m1.*` composition path. `bin/` launchers are generated from the
manifest.

## Findings

1. The external manifest was a real glue mechanism, but it kept dependency order
   outside the source and duplicated the source layout.
2. Include solves that for one compilation unit without adding modules,
   namespaces, or runtime boundaries. Generated output remains self-contained.
3. `include` was sufficient for the compiler and every tool; no current consumer
   needs separate compilation or a public/private boundary.
4. Include-once and top-level placement prevented the main hazards: duplicate
   definitions, cycle recursion, and block splitting.
5. Tooling adopted the directive without expanding `tokens`; the formatter
   preserves it.

## Include versus import

## Include versus import

### Include

`include` splices another file's source into the current compilation unit. In
Mini terms it is naturally a tokenizing/loading step: the parser receives one
flat token stream, exactly as if the text had been typed in place.

Properties:

- One compilation unit, one token stream, one generated script.
- No module scope, exports, linker, or runtime change.
- Included tokens keep their own source name, line, column, and context, so
  terminal diagnostics can point into the included file.
- Order follows the include site.
- Cycles and duplicate definitions are the main hazards.
- It can replace the `parts` list; source files state their own dependencies.

### Import

`import` names a dependency with its own module boundary. It usually implies
namespaces or exports, separate compilation, a linker, and a runtime or bundler
policy.

Properties:

- Explicit public surface and collision safety.
- Separate compilation and caching.
- More language and tooling surface: scopes, exported names, resolution,
  cycles, separate generated artifacts, package identity.
- It changes the compiler's workload and the bootstrap layout.
- It is useful for cross-project or versioned dependencies, not for joining a
  handful of files inside one project.

## Recommendation

Add a small, single-unit `include` before considering imports:

```text
include "../libs/text.mini";
```

Proposed contract:

- `include "relative/path.mini";` is a top-level directive. It is recognized
  contextually, not reserved as a general keyword.
- The path is relative to the including file and canonicalized. Absolute paths
  are rejected. `..` is allowed so tools can include compiler parts.
- Each canonical file is included at most once per compilation (include-once).
  A repeated include is a no-op; this avoids duplicate definitions without
  preprocessor guards. This is intentionally simpler than C textual repetition.
- An include cycle is an error naming the cycle.
- A missing file is a load error, not a compiler diagnostic about Mini syntax.
- Only the entry file may have a shebang. Included shebangs are rejected.
- Included tokens retain their own file name and positions. Diagnostics from
  included code point at the included file.
- The directive is preserved in the analysis token stream for the formatter and
  editor. Compilation expands it; formatting does not inline included files.
- `include` adds no values, types, namespaces, or runtime behavior.

Keep `tools/mini-tools.json` for entry-to-generated mapping and composition
until every tool adopts includes, then reduce each entry to `source` and
`generated`.

Do not add `import` now. Revisit it only when a concrete cross-project
dependency needs versioning, separate compilation, or a public/private
boundary.

## Compiler shape

A loading pass after tokenizing is the smallest fit:

```text
source text -> tokenize -> expand include tokens -> parse -> emit
```

- `tokens` can return include tokens without expansion for formatter and
  analysis.
- `compile` expands includes before parsing.
- `tokens --comments` keeps comments and include tokens.
- The expansion result is a flat token list whose tokens already carry their
  source identities, so parsing and emission need no module knowledge.
- Include-once uses a canonical-path set carried by the expansion pass.
- Cycle detection uses the active include stack.

The first compiler increment must be written in the current language, without
using include in its own source. After promotion, compiler parts can adopt
include and the canonical `compiler/compiler.mini` can become the expanded entry
source while the bootstrap pair is replaced atomically.

## Tooling impact

- Formatter: recognize and preserve top-level include directives; do not
  concatenate included files. Formatting an included file is a separate file.
- Analysis: token JSON may contain include tokens. Composite diagnostics need a
  file/offset model; LSP support can start with include go-to-definition and
  single-document diagnostics, then add included-file diagnostics.
- Checker: `mini check SOURCE.mini` checks the entry and its included files;
  diagnostics keep included source names.
- Build helper: manifest `parts` entries become redundant per tool; the helper
  still invokes the compiler and compares generated bytes.
- Release: included sources must ship with the entry source.

## Cases required before support

- one include; nested include; same directory; `..` path; repeated include;
  cycle; missing file; included shebang; include not at top level; include after
  declarations.
- diagnostic inside an included file; token positions and source names.
- formatter preserves directive and is idempotent.
- generated output is unaffected by where the include site is, given the same
  textual order.
- fixed point after the compiler adopts include in its own source.

## Open decisions

- Contextual `include` versus a reserved keyword.
- Include-once versus textual repetition; automatic once is recommended.
- Whether includes may appear between declarations at top level; recommended,
  to make initialization order explicit.
- Whether include paths are limited to the project root or any relative path.
- Whether analysis reports include tokens, and in what shape.
- Whether the compiler build keeps `compiler/compiler.mini` as an expanded
  artifact or replaces it with an including entry.

## Out of scope

- Module namespaces, exports, package identity, or a registry.
- Import cycles and separate compilation.
- A standard library layout selected by modules.
- Changing the single-file generated output.
