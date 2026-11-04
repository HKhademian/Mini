---
name: mini-tooling-migration
status: active
created: 2026-11-04
todos:
  - id: phase-0-tool-infrastructure
    content: "Phase 0 — Add the Mini tool manifest and generated-tool verification"
    status: completed
  - id: phase-1-check-source
    content: "Phase 1 — Implement source checking as a Mini tool"
    status: completed
  - id: phase-1-format
    content: "Phase 1 — Implement formatting as a Mini tool"
    status: completed
  - id: phase-2-process-primitive
    content: "Phase 2 — Add process execution and stream/status primitives"
    status: pending
  - id: phase-2-run
    content: "Phase 2 — Implement mini run as a Mini tool"
    status: pending
  - id: phase-2-filesystem-primitives
    content: "Phase 2 — Add file and directory primitives"
    status: pending
  - id: phase-2-repository-check
    content: "Phase 2 — Implement repository checking as a Mini tool"
    status: pending
  - id: phase-2-test
    content: "Phase 2 — Implement the case runner as a Mini tool"
    status: pending
  - id: phase-2-bench
    content: "Phase 2 — Implement benchmarks as a Mini tool"
    status: pending
  - id: phase-2-verify
    content: "Phase 2 — Implement bootstrap verification as a Mini tool"
    status: pending
  - id: phase-2-release
    content: "Phase 2 — Implement release packaging as a Mini tool"
    status: pending
  - id: phase-3-json-stream-primitives
    content: "Phase 3 — Add JSON parsing and streaming input primitives"
    status: pending
  - id: phase-3-lsp
    content: "Phase 3 — Implement the language server as a Mini tool"
    status: pending
  - id: phase-4-remove-t0
    content: "Phase 4 — Remove T0 compiler modules and handwritten TypeScript tools"
    status: pending
plans:
  requires: []
  blocks: []
  parallel: []
---

# Mini tooling migration

## Mission

Move every implemented tool from handwritten TypeScript into Mini source, with a
tracked generated TypeScript artifact for each tool. Keep one source of truth:
the Mini source. Running tools must require only Node and the tracked generated
compiler/tool files, never a handwritten compiler.

This plan follows the compiler migration. It does not add language syntax unless
a tool cannot be expressed without a host primitive. Tool contracts and behavior
remain the existing accepted contracts until a separate proposal changes them.

## Current baseline

- Compiler source: `compiler/src/*.mini`, composed into `compiler/compiler.mini`.
- Active compiler: tracked `bootstrap/compiler.ts`, selected by
  `config/compiler.json`.
- Compiler build tool: `tools/build-m1.mini` with tracked
  `tools/build-m1.generated.ts`.
- Tooling analysis: `tools/analysis.ts` invokes the active compiler's
  `tokens --comments` and `compile` commands; it no longer uses T0 behavior.
- Builtin signatures: shared `compiler/builtin-metadata.ts`.
- Remaining handwritten TypeScript: the tool implementations, the tool build
  helper, T0 reference modules, and reference tests/benchmarks.
- Current released state: `f4243c8`, with current product tags pushed.

The compiler itself is done. The remaining duplication is in tools and shared
tooling metadata.

## Target architecture

```text
compiler/src/*.mini          compiler source
compiler/compiler.mini       generated canonical compiler source
bootstrap/compiler.ts        tracked generated compiler
tools/<tool>.mini            tool source
tools/<tool>.generated.ts    tracked generated tool
tools/mini-tools.json        composition manifest
```

Generated tools use the `*.generated.ts` suffix, are excluded from the strict
TypeScript check, and are verified by recompilation in `mini check`.

No tool should import T0 parser, lexer, analysis, or lowering modules. Shared
token, diagnostic, and builtin contracts must move into Mini or a generated
artifact before T0 is removed.

## Fake imports are build-time composition

A tool declares the compiler parts it needs in `tools/mini-tools.json`:

```json
{
  "tools": [
    {
      "source": "tools/check-source.mini",
      "parts": [
        "compiler/src/00-constants.mini",
        "compiler/src/10-text.mini",
        "compiler/src/20-lexer.mini",
        "compiler/src/30-parser.mini",
        "compiler/src/40-builtins.mini"
      ],
      "generated": "tools/check-source.generated.ts"
    }
  ]
}
```

The build tool concatenates the listed parts and the tool source, then compiles
the result with the tracked bootstrap. Rules:

- Exclude `compiler/src/50-main.mini`; it contains `main();`. The tool supplies
  its own entry.
- Keep compiler parts in dependency order.
- Tool functions go after the compiler parts; prefix names when a collision is
  possible.
- The tool may call compiler functions such as `tokenize`, `compile`,
  `token_new`, and `diagnostic_fail` directly.
- The generated tool is self-contained and runnable by Node.
- `mini check` rebuilds and compares every manifest entry.

This is composition, not a Mini module or import syntax.

## Phase 0 — tool infrastructure

Atomic commit: `build: add Mini tool manifest and generated-tool verification`

Add:

- `tools/mini-tools.json` with the existing `build-m1` entry and future entries.
- A generated-tool build/check helper. It may start in TypeScript because it
  needs process execution to invoke the compiler.
- `tools/check.ts` integration that verifies every generated tool.
- Documentation for the manifest and `*.generated.ts` convention.

Acceptance:

- `build-m1` is produced through the manifest path.
- `mini check` rejects stale generated tool output.
- No tool behavior changes.

## Phase 1 — analysis tools with bundled compiler parts

### Step 1: source checking

Atomic commit: `feat: implement source checking as a Mini tool`

- Add `tools/check-source.mini`.
- Bundle compiler parts `00`–`40`.
- Read one file or stdin, call `tokenize`, then `compile`.
- `diagnostic_fail` prints the first diagnostic and exits 1.
- Wire `mini check SOURCE.mini` and `mini check -` to the generated tool.
- Keep `mini check --docs` in TypeScript until Phase 2.
- Move focused source-check cases to the generated tool.
- Bump `mini` and `check`; tag and push.

### Step 2: formatting

Atomic commit: `feat: implement formatting as a Mini tool`

- Port `tools/format.ts` to `tools/format.mini`.
- Bundle text, lexer, and parser parts for tokens and validation.
- Preserve comments, shebang, `--write`, `--check`, stdin, and exact style.
- Replace the formatter implementation and T0-based formatter tests.
- Bump `mini` and `format`; tag and push.

### Optional later tools

`mini doc` and `mini help` are not implemented. Add them only after their
contracts are selected. Both can reuse the bundled lexer and existing file/text
primitives.

## Phase 2 — process-heavy tools

Add host primitives in separate atomic commits before the tools that need them.
Each primitive gets a contract, cases, a builtin version bump, a tag, and a push.

### Step 3: process execution

Atomic commit: `feat: add process execution builtins`

Needed final contract decisions:

- Argument and environment representation.
- Captured stdout/stderr versus inherited stdio.
- Exit status, signal, timeout, and failure behavior.
- One-shot execution versus streaming.

This unlocks `mini run`, source checking through processes, test, bench, verify,
and release wrappers.

### Step 4: `mini run`

Atomic commit: `feat: implement mini run as a Mini tool`

- Compile the source with the tracked bootstrap into a temporary TS file.
- Run Node on it, forwarding arguments and stdio.
- Preserve the current `mini run` and `mini-run` behavior.
- Bump `mini` and `cli`; tag and push.

### Step 5: filesystem primitives

Atomic commit: `feat: add file and directory inspection builtins`

Likely operations:

- File existence, directory listing, remove, rename, and basic metadata.
- Avoid speculative operations; add only what a concrete tool needs.

### Step 6: repository checking

Atomic commit: `feat: implement repository checks as a Mini tool`

- Port `mini check --docs` and the repository checks after filesystem and JSON
  support.
- Keep `mini check SOURCE.mini` on the Phase 1 Mini tool.
- The `check` stream covers both modes.

### Step 7: case runner

Atomic commit: `feat: implement the case runner as a Mini tool`

Needs process execution, directory traversal, JSON parsing, stream/file fixtures,
temporary workspaces, and input/output comparison. This is the first large tool
port.

### Step 8: benchmarks

Atomic commit: `feat: implement benchmarks as a Mini tool`

Reuse the case-runner machinery, process execution, and timing data.

### Step 9: bootstrap verification

Atomic commit: `feat: implement bootstrap verification as a Mini tool`

Needs process execution, filesystem operations, JSON, and hashing.

### Step 10: release packaging

Atomic commit: `feat: implement release packaging as a Mini tool`

This is the last practical port. It needs process execution, filesystem
operations, git, tar, JSON, and hashing. Keeping it TypeScript until the other
primitives settle is acceptable.

## Phase 3 — language server

Add JSON parsing and streaming input in atomic commits, then port the server.

Atomic commits:

- `feat: add JSON parsing to Mini`
- `feat: add streaming input builtins`
- `feat: implement the language server as a Mini tool`

The server can spawn the generated compiler for `tokens --comments` and
`compile`, then implement LSP framing and JSON in Mini. It is last because it
has the largest protocol surface.

## Phase 4 — remove T0 and handwritten TypeScript

Only after every tool and test uses generated compiler output:

Atomic commits:

- `refactor: move shared token and builtin contracts into Mini`
- `refactor: remove T0 compiler modules`
- `refactor: remove handwritten TypeScript tools`
- `build: generate bin launchers`

Checklist:

- Delete `compiler/t0.ts`, `lexer.ts`, `parser.ts`, `analysis.ts`, `builtins.ts`,
  and `types.ts`.
- Remove `compiler/adapters.ts` and `compiler/builtin-metadata.ts`; make Mini the
  source of truth or expose a compiler metadata command.
- Rewrite fixed-point tests to use the tracked bootstrap, not T0.
- Rewrite analysis and formatter tests against generated tools.
- Remove or archive the actual-T0 application benchmark reference.
- Remove all handwritten `tools/*.ts` that have Mini replacements.
- Generate `bin/` launchers or execute generated tools directly.
- Keep only Mini sources, generated TypeScript, manifests/configs, cases, and
  docs.

## Atomic work unit for every tool

1. Add `tools/<tool>.mini`.
2. Add its manifest entry with compiler parts.
3. Generate `tools/<tool>.generated.ts` with the tracked bootstrap.
4. Wire the CLI/bin command.
5. Add or update focused cases and tool tests.
6. Make `mini check` verify the generated file.
7. Run `mini check`, the full suite, and tool-specific tests.
8. Bump the tool’s version, update docs/versioning, create the annotated tag,
   and push `main` plus the tag.

## Verification gates

- `mini check` passes, including bootstrap fixed point and all generated tools.
- `mini test` passes; no pending case counts as coverage.
- Tool-specific Node tests pass until those tests move to Mini cases.
- Generated tool bytes are stable across regeneration.
- The tool runs with Node alone, without a Mini compiler and without T0.
- The release archive contains the Mini source and generated tool.

## Versioning and tags

- Each tool keeps its independent product stream.
- A tool port bumps its stream; shared primitives bump `language` and `builtins`
  when their contracts change.
- Generated tool output is part of the tool release.
- Use annotated tags named `PRODUCT-vGROUP-vVERSION`.
- Push `main` and the explicit new tags; do not use a blanket legacy tag push.
- Record the previous tagged state in release notes when a port changes the
  distributed tool.

## Decisions still open

- Process primitive shape: captured versus inherited streams, timeout, signals.
- JSON number and map representation for parsed data.
- Streaming input granularity for the language server.
- Whether `mini doc`/`mini help` are included in this migration or deferred.
- Whether the tool build helper remains a small TypeScript bootstrap or becomes
  a Mini tool after process execution exists.
- How much of the actual-T0 benchmark reference is retained as historical
  evidence after T0 removal.

## Out of scope

- New language syntax for modules or imports.
- New tool features while porting.
- Rewriting the compiler again.
- Changing accepted tool behavior or diagnostics.
- Adding a general standard library.
