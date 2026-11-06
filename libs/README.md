# Mini libraries

- `common/` — shared path, text, list, JSON, process, project, result, value,
  and numeric libraries. `process-run.mini` layers the simple text-stream
  process helper over `process.mini`'s host-backed process capture.
- `compiler/` — compiler implementation parts included by
  `tools/compiler.mini`.
- `pure/` — reference implementations selected by `compiler --reference`.
- `tools/` — behavior libraries for command entries under `tools/`.
