---
name: compiler-ast-backends
status: in_progress
created: 2026-11-08
---

# Shared compiler AST and target backends

## Mission

Replace JavaScript emission inside the recursive-descent parser and C's second
token walk with one target-neutral parsed and checked program representation.
The JavaScript and C backends consume the same AST. Keep parsing, name/kind
checks, source ordering, and diagnostics shared; keep syntax lowering and
runtime support target-specific.

The AST is also a reusable compiler product for future LSP queries, stable AST
dumps/debugging, and source tools. Keep source spans and semantic annotations
on nodes. Retain source text and lexer tokens/trivia beside the AST because a
semantic AST alone cannot preserve comments and formatting choices.

## Migration

1. Add the AST data model and make the existing parser build it while retaining
   current JavaScript output as a parity bridge. Preserve the public compiler
   output and current diagnostic behavior.
2. Move JavaScript lowering into `libs/compiler/emit-js.mini`; render from AST
   only, then remove JavaScript snippets and builtin lowering from parser state.
3. Port the C backend from its token walk to the same AST. Keep unsupported
   target forms explicit and preserve generated C/header behavior.
4. Expose a stable AST inspection path only after the AST schema is exercised
   by both backends; keep formatting trivia available to future consumers.

Each completed migration step is a separate atomic commit with focused parity,
bootstrap fixed-point, and case verification. Do not hand-edit generated
compiler artifacts.

## Current state

- `libs/compiler/parser.mini` performs recursive descent, shallow checking,
  and JavaScript emission together.
- `libs/compiler/emit-c.mini` runs the JavaScript parser for validation, then
  walks the token stream again for C lowering.
- `tools/compiler.mini` selects between `parser_compile` and
  `emit_c_compile`.
- `docs/self-hosting-requirements.md` and the C target docs describe direct JS
  emission and the C token-walk as the current bootstrap architecture. Update
  those descriptions as each phase lands.

## Acceptance

- Both backends consume the same checked AST; neither backend reparses tokens.
- Existing supported-program output and rejection diagnostics remain stable,
  except for separately accepted language changes.
- AST nodes identify source/file spans and carry resolved value kinds where
  known; tokens/trivia remain available for source-oriented tools.
- The generated compiler reaches the documented fixed point from its source.
- Compiler docs distinguish the reusable AST/front end from backend-specific
  lowering and generated runtime code.
