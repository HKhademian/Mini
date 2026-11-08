---
name: compiler-ast-backends
status: complete
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
on nodes. Retain source text and lexer tokens beside the AST because a semantic
AST alone cannot preserve comments and formatting choices.

## Migration

1. **Complete:** Add the AST data model and build it with the existing parser;
   preserve current JavaScript output as a parity bridge.
2. **Complete:** Move JavaScript lowering into `libs/compiler/emit-js.mini`;
   the parser now returns AST nodes only and has no target source strings.
3. **Complete:** Port the C backend from its token walk to the same AST. Keep
   unsupported target forms explicit and preserve generated C/header behavior.
4. **Complete:** Version the AST inspection contract and document the parser,
   schema, and target backend boundaries independently.

Each completed migration step is a separate atomic commit with focused parity,
bootstrap fixed-point, and case verification. Do not hand-edit generated
compiler artifacts.

## Current state

- `libs/compiler/parser.mini` performs recursive descent and shallow checking,
  returning a source-spanned AST without target source strings.
- `libs/compiler/emit-js.mini` consumes the AST for JS syntax and builtin
  lowering; the playground and CLI use its public entry points.
- `libs/compiler/emit-c.mini` exposes an AST-only C lowering entry point and a
  token adapter that parses once and delegates. Generated C runtime fragments
  stay in the C backend and are assembled from readable line lists.
- Both backends lower the shared AST; the stable AST inspection interface and
  retained token list are available through `parser_ast(tokens)`. The tree root
  reports the independently registered AST schema version. Whitespace trivia
  still belongs to the original source, not the AST.

## Acceptance

- Both backends consume the same checked AST; neither backend reparses tokens.
- Existing supported-program output and rejection diagnostics remain stable,
  except for separately accepted language changes.
- AST nodes identify source/file spans and carry parser-computed value kinds
  where known; the input token list remains available for source-oriented tools.
- The generated compiler reaches the documented fixed point from its source.
- Compiler docs distinguish the reusable AST/front end from backend-specific
  lowering and generated runtime code.
- The `ast` product version, root schema version, and release-tag registry stay
  aligned.

## Follow-up: post-AST verification

No standalone post-parse verifier exists yet. Candidate independent stages are
AST shape and required-field validation, source-span checks, semantic consistency
checks after scope/type facts are explicit, and target capability analysis
before backend lowering. Keep target checks out of the shared AST verifier.
