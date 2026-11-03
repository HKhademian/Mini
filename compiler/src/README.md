# M1 source parts

The Mini compiler is authored as ordered parts and concatenated into the
canonical bootstrap source:

```text
node tools/build-m1.ts
node tools/build-m1.ts --check
```

`compiler/m1.json` is the order. The parts keep the original single-file
structure; concatenation is a build step, not a Mini module or import system.

- `00-constants.mini`: generated adapter text and shared constants.
- `10-text.mini`: text, line, path, and character helpers.
- `20-lexer.mini`: tokens, lexer state, diagnostics, and scanning.
- `30-parser.mini`: expression and statement parsing, checking, and emission.
- `40-builtins.mini`: builtin metadata, lowering, and helpers.
- `50-main.mini`: token JSON and the command entry point.

`compiler/compiler.mini` remains the bootstrap source consumed by the verifier.
`mini check` fails when the canonical file differs from the concatenated parts.
