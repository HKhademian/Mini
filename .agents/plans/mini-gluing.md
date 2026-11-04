---
name: mini-gluing
status: proposed
created: 2026-11-04
todos:
  - id: step-1-proposal
    content: "Step 1 — Select include syntax, resolution, and expansion semantics"
    status: pending
  - id: step-2-cases
    content: "Step 2 — Add accepted include cases before compiler support"
    status: pending
  - id: step-3-compiler
    content: "Step 3 — Implement include expansion and promote the bootstrap bridge"
    status: pending
  - id: step-4-tooling
    content: "Step 4 — Preserve include directives in formatter and analysis, then adopt in tools"
    status: pending
  - id: step-5-imports
    content: "Step 5 — Decide whether project dependencies need import later"
    status: pending
plans:
  requires: []
  blocks: []
  parallel: []
---

# Source gluing: include, import, and project composition

## Question

Each project needs a way to join more than one source file. Mini currently does
this outside the language: ordered parts are concatenated by a build helper
before compilation. Is that enough, or does Mini need a language-level
`include` or `import` construct?

## Current mechanisms

The compiler is authored as ordered parts and concatenated into
`compiler/compiler.mini`:

```text
compiler/m1.parts
compiler/src/00-constants.mini
compiler/src/10-text.mini
compiler/src/20-lexer.mini
compiler/src/30-parser.mini
compiler/src/40-builtins.mini
compiler/src/50-main.mini
```

`tools/build-m1.mini` reads that list and writes the canonical file. A tracked
`tools/build-m1.generated.ts` runs it.

Generated tools use `tools/mini-tools.json`. Each entry names a tool source, an
ordered part list, and a generated TypeScript target. `tools/mini-tools.ts`
concatenates parts plus source, hoists the tool shebang, and compiles the result
with the active bootstrap.

Shared parts today:

| Part | Tools that compose it |
| --- | --- |
| `compiler/src/10-text.mini` | 6 |
| `tools/cases.mini` | 4 |
| `compiler/src/00-constants.mini` | 2 (source check, format) |
| `compiler/src/20-lexer.mini` | 2 |
| `compiler/src/30-parser.mini` | 2 |
| `compiler/src/40-builtins.mini` | 2 |

Composed tools currently define 48-75 functions each. No duplicate function
names exist today, but nothing in the language or manifest prevents them; the
convention is manual prefixing.

## Findings

1. Composition already *is* the project's glue. It is deterministic, keeps one
   generated unit, and preserves the bootstrap fixed point. It is not a compiler
   feature, so the language itself cannot express a dependency between files.
2. The manifest centralizes knowledge that belongs to each source. Adding a
   shared dependency means editing a central list; reading a tool source does not
   reveal its dependencies or their order.
3. The glue is order-sensitive. Global table initialization in
   `compiler/src/40-builtins.mini` depends on `compiler/src/00-constants.mini`
   appearing first. A source file has no way to state that requirement.
4. A single compilation unit is still valuable for Mini: generated code remains
   self-contained, diagnostics use one token stream, and the bootstrap fixed
   point is simple. Any glue should preserve that property if possible.
5. A modern language that reaches self-hosting in one file still accumulates
   shared libraries and multiple tools. At that stage, file-level glue becomes a
   maintenance requirement rather than an optional convenience.

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
include "compiler/src/10-text.mini";
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
