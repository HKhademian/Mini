# M1 source parts

The Mini compiler is authored as ordered parts and concatenated into the
canonical bootstrap source. The build tool is itself Mini source with tracked
generated TypeScript:

```text
./bin/mini compile tools/build-m1.mini tools/build-m1.generated.ts
./tools/build-m1.generated.ts
./tools/build-m1.generated.ts --check
```

`compiler/m1.parts` is the order. The parts keep the original single-file
structure; concatenation is a build step, not a Mini module or import system.
Generated Mini tools use the `*.generated.ts` suffix and are excluded from the
strict TypeScript check; `mini check` compares `tools/build-m1.generated.ts`
against a fresh compilation.

- `00-constants.mini`: generated adapter text and shared constants.
- `10-text.mini`: text, line, path, and character helpers.
- `20-lexer.mini`: tokens, lexer state, diagnostics, and scanning.
- `30-parser.mini`: expression and statement parsing, checking, and emission.
- `40-builtins.mini`: builtin metadata, lowering, and helpers.
- `50-main.mini`: token JSON and the command entry point.

`compiler/compiler.mini` remains the bootstrap source consumed by the verifier.
`mini check` fails when the canonical file differs from the concatenated parts.
