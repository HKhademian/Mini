# Changes

## Unreleased

- Run independent case scenarios and Mini unit tests concurrently through a
  bounded worker pool; Node's available CPU count is the default, and
  `mini test --jobs N` controls the concurrency. Default output shows periodic
  progress and the applied worker count, and reports failures and pending cases
  without individual passes; `--verbose` lists each result and `--mute`
  suppresses progress.

- mini 0.3.0-alpha.55 / compiler 0.5.0-alpha.66 / bootstrap
  0.3.0-alpha.68: move C addition and equality runtime definitions into the
  emitter override registry.

- mini 0.3.0-alpha.54 / compiler 0.5.0-alpha.65 / bootstrap
  0.3.0-alpha.67: require imported Mini function definitions for every
  contracted operation and remove the stale AST builtin-call flag.

- mini 0.3.0-alpha.53 / ast 0.1.0-alpha.2 / builtins 0.4.0-alpha.20 /
  compiler 0.5.0-alpha.64 / bootstrap 0.3.0-alpha.66: remove descriptor-based
  call lowerings; builtin calls require imported Mini functions and emit through
  same-name target overrides.

- mini 0.3.0-alpha.52 / builtins 0.4.0-alpha.19 / compiler
  0.5.0-alpha.63 / bootstrap 0.3.0-alpha.65: move process APIs to imported
  Mini panic fallbacks and same-name emitter registries.

- mini 0.3.0-alpha.51 / builtins 0.4.0-alpha.18 / compiler
  0.5.0-alpha.62 / bootstrap 0.3.0-alpha.64: move hash and clock APIs to
  imported Mini fallbacks and same-name JavaScript host registries.

- mini 0.3.0-alpha.50 / compiler 0.5.0-alpha.61 / bootstrap
  0.3.0-alpha.63: complete the native C standard-stream host API.

- mini 0.3.0-alpha.49 / compiler 0.5.0-alpha.60 / bootstrap
  0.3.0-alpha.62: add ASCII C text representation overrides and exercise pure
  number parsing and formatting through them.

- mini 0.3.0-alpha.48 / compiler 0.5.0-alpha.59 / bootstrap
  0.3.0-alpha.61: move C list representation runtime code into the imported
  list host override registry.

- mini 0.3.0-alpha.47 / compiler 0.5.0-alpha.58 / bootstrap
  0.3.0-alpha.60: move POSIX declarations and headers for C path overrides
  into the host include registry.

- mini 0.3.0-alpha.46 / compiler 0.5.0-alpha.57 / bootstrap
  0.3.0-alpha.59: include registered C host runtimes with their host function
  wrappers, including for empty programs.

- mini 0.3.0-alpha.45 / compiler 0.5.0-alpha.56 / bootstrap
  0.3.0-alpha.58: move C output runtime and `io_write` implementation into the
  imported host override registry.

- mini 0.3.0-alpha.44 / compiler 0.5.0-alpha.55 / bootstrap
  0.3.0-alpha.57: add C value-kind overrides so imported pure numeric
  algorithms can run against native C values.

- mini 0.3.0-alpha.43 / compiler 0.5.0-alpha.54 / bootstrap
  0.3.0-alpha.56: move native C list operations from emitter branches to the
  imported host override registry.

- mini 0.3.0-alpha.42 / compiler 0.5.0-alpha.53 / bootstrap
  0.3.0-alpha.55: add native C host implementations for the common directory
  and path APIs.

- mini 0.3.0-alpha.41 / builtins 0.4.0-alpha.17 / compiler
  0.5.0-alpha.52 / bootstrap 0.3.0-alpha.54: move directory and filesystem
  path operations into imported `common/path` APIs and register JavaScript
  host overrides.

- mini 0.3.0-alpha.40 / compiler 0.5.0-alpha.51 / bootstrap
  0.3.0-alpha.53: add native C host implementations for the imported file API.

- mini 0.3.0-alpha.39 / builtins 0.4.0-alpha.16 / compiler
  0.5.0-alpha.50 / bootstrap 0.3.0-alpha.52: move file operations into
  same-name `common/file` APIs, require explicit imports, and register
  JavaScript host overrides.

- language 0.5.0-alpha.13 / builtins 0.4.0-alpha.13 / compiler
  0.5.0-alpha.47 / bootstrap 0.3.0-alpha.49: move `to_text` and `number_to_text` to same-name common APIs, and give
  `value_kind` a panic fallback with a registered JS host override with registered JS overrides.

- language 0.5.0-alpha.12 / builtins 0.4.0-alpha.12 / compiler
  0.5.0-alpha.46 / bootstrap 0.3.0-alpha.48: move JSON parsing and encoding
  into same-name `common/json` APIs, register JS host overrides, and remove
  the injected `pure` library aggregate.

- language 0.5.0-alpha.11 / builtins 0.4.0-alpha.11 / compiler
  0.5.0-alpha.45 / bootstrap 0.3.0-alpha.47: move text and UTF-8 helpers
  into same-name `common/text` APIs, register JavaScript host overrides, and
  require explicit text imports.

- language 0.5.0-alpha.10 / builtins 0.4.0-alpha.10 / compiler
  0.5.0-alpha.44 / bootstrap 0.3.0-alpha.46: move `number_*` Mini
  implementations into `common/number`, require its import, and register
  same-name JavaScript host overrides. Remove the separate pure-number module.


- compiler 0.5.0-alpha.43 / bootstrap 0.3.0-alpha.45: let each JavaScript
  host override register an optional call-site lowering in the same registry
  entry; restore the `list_length` property lowering without emitter hardcoding.


- language 0.5.0-alpha.9 / builtins 0.4.0-alpha.9 / compiler
  0.5.0-alpha.42 / bootstrap 0.3.0-alpha.44: require explicit
  `import "common/list"`, register JS host implementations separately from Mini
  fallbacks, and remove `include` in favor of extensionless `import` paths,
  including relative sibling and child paths.

- builtins 0.4.0-alpha.8 / compiler 0.5.0-alpha.40 / bootstrap 0.3.0-alpha.42:
  move map operations to explicit `import "common/map"` APIs, add pure Mini
  `map_copy`, and register JavaScript host implementations for map primitives.

- builtins 0.4.0-alpha.7 / compiler 0.5.0-alpha.39 / bootstrap 0.3.0-alpha.41:
  move `text_slice` to the imported `common/text.mini` API and use its registered
  JavaScript host override by default.

- language 0.5.0-alpha.8: add extensionless `import "common/module"` syntax for
  library modules, sharing import-once cycle traversal and postorder behavior.

- compiler 0.5.0-alpha.38 / bootstrap 0.3.0-alpha.40: move JavaScript host
  function replacements into a target-specific registry with numeric namespace
  definitions.

- compiler 0.5.0-alpha.37 / bootstrap 0.3.0-alpha.39: establish an emitter
  override for the imported `number_add` function while retaining its pure Mini
  definition as the reference behavior.

- language 0.5.0-alpha.7 / compiler 0.5.0-alpha.36 / bootstrap 0.3.0-alpha.38:
  allow cyclic includes by visiting each file once; emit declarations and run
  top-level operations in depth-first postorder, with a target entry point.

- mini 0.3.0-alpha.34 / language 0.5.0-alpha.6 / compiler 0.5.0-alpha.33 /
  bootstrap 0.3.0-alpha.35: remove unary numeric negation. Negative number
  literals remain supported; use `0 - value` for expressions. Migration SHA-256
  identities: prior seed `afee4ff274671364ddd173582e3a8e954955b769242b175bc4edecff2fc538c7`,
  parser source `e62cd253d0cb9f8ca356ceff85623e948195a81e87dc50fb03b09cf24a4b629e`,
  promoted compiler `b50fb98cde6e79173c8476ef81463a66406989ca84c30f9925a38c4569091846`,
  and promoted seed `1010d40bb49ad800e40d7a0b029426e110b5bd5ee2a1a017ef88941441035939`.

- mini 0.2.0-alpha.33 / compiler 0.4.0-alpha.32 / bootstrap 0.2.0-alpha.34:
  lower binary numeric subtraction and compile the Mini `list_reverse` helper for C.

- mini 0.2.0-alpha.32 / compiler 0.4.0-alpha.31 / bootstrap 0.2.0-alpha.33:
  lower `while` loops in function bodies and compile the Mini `list_contains`
  helper for C, including its early returns.

- mini 0.2.0-alpha.31 / compiler 0.4.0-alpha.30 / bootstrap 0.2.0-alpha.32:
  add C target support for shallow `list_copy` and text-only `list_join`.

- mini 0.2.0-alpha.30 / compiler 0.4.0-alpha.29 / bootstrap 0.2.0-alpha.31:
  support `list_length`, `list_get`, and `list_set` in the C target, including
  negative indices and zero-filled gaps when a list grows.

- mini 0.2.0-alpha.26 / CLI 0.1.0-alpha.20 / check 0.1.0-alpha.12 /
  format 0.1.0-alpha.8 / verify 0.1.0-alpha.10 / release 0.1.0-alpha.7:
  let commands consume their own options and forward remaining arguments;
  the dispatcher keeps only routing and compile output adaptation.

- mini 0.2.0-alpha.25 / CLI 0.1.0-alpha.19 / test 0.1.0-alpha.8 /
  verify 0.1.0-alpha.9: show test summaries by default and per-case results
  with `--verbose`; retain detailed CI test logs.

- mini 0.2.0-alpha.12 / compiler 0.4.0-alpha.13 / bootstrap 0.2.0-alpha.15:
  namespace the Mini-written C emitter helpers with emit_c_ and update callers.
  Generated C and source-language behavior are unchanged.

- mini 0.2.0-alpha.11 / compiler 0.4.0-alpha.12 / bootstrap 0.2.0-alpha.14:
  back text views with an owned growable byte buffer. Keep ordinary literals
  readable in C, escape controls/trigraphs, preserve views across growth, and
  release invocation storage on completion or failure.

- mini 0.2.0-alpha.10 / compiler 0.4.0-alpha.11 / bootstrap 0.2.0-alpha.13:
  use MINI_ID directly for generated C types and emit companion .c/.h files.
  Native builds add an adjacent .i using cc -E and compile that expanded input,
  preserving the original pair for inspection.
- test 0.1.0-alpha.7 / check 0.1.0-alpha.11 / verify 0.1.0-alpha.8 /
  bench 0.1.0-alpha.7: require C source/header pairs and retain failed native
  case workspaces with available preprocessing artifacts for debugging.

- mini 0.2.0-alpha.9 / compiler 0.4.0-alpha.10 / bootstrap 0.2.0-alpha.12:
  customize generated C names through overridable MINI_ID(name), defaulting
  to mini_ without dollar identifiers. Add type aliases, an anonymous payload
  union, a static text initializer macro, and a function wrapper that uses it.
  Source language support and JavaScript output are unchanged.

- mini 0.2.0-alpha.8 / compiler 0.4.0-alpha.9 / bootstrap 0.2.0-alpha.11 /
  cli 0.1.0-alpha.18: add explicit JavaScript/C target selection and a first
  C11 slice for ASCII text-literal output. The generated native runtime uses
  tagged text views and static byte storage; unsupported forms reject before
  writing output. No language syntax change.
- test 0.1.0-alpha.6 / check 0.1.0-alpha.10 / verify 0.1.0-alpha.7 /
  bench 0.1.0-alpha.6: validate source-case targets and compile/run C cases
  through the shared harness using cc with strict C11 diagnostics.

- mini 0.2.0-alpha.7 / language 0.4.0-alpha.4 / compiler 0.4.0-alpha.8 /
  builtins 0.4.0-alpha.5 / bootstrap 0.2.0-alpha.10: add `to_text(value)` as
  the shared Mini display conversion used by `io_write`.

- mini 0.2.0-alpha.6 / language 0.4.0-alpha.3 / compiler 0.4.0-alpha.7 /
  builtins 0.4.0-alpha.4 / bootstrap 0.2.0-alpha.9: make direct I/O conversion
  match `number_to_text` and `json_to_text`, and verify that multiple values
  write the same bytes as separate calls.

- mini 0.2.0-alpha.5 / language 0.4.0-alpha.2 / compiler 0.4.0-alpha.6 /
  builtins 0.4.0-alpha.3 / bootstrap 0.2.0-alpha.8: make `io_write` and
  `io_write_line` accept any number of values. Text passes through, scalar
  values convert to text, and lists/maps use JSON text; the line helper adds
  one final newline.

- bootstrap 0.2.0-alpha.5: make `./bin/bootstrap --clean` remove all
  untracked and ignored project files, rebuild generated tools, run all project
  checks, and package a local VSIX under `dist/rebuild/`.

- compiler 0.4.0-alpha.5 / bootstrap 0.2.0-alpha.7: keep included library
  declarations available while omitting their generated bodies in Program only.
  No language change.

- compiler 0.4.0-alpha.4 / bootstrap 0.2.0-alpha.6: omit an unreachable
  fallback return when a function ends with an explicit return. No language
  change.

- release 0.1.0-alpha.6: launch the platform-specific esbuild executable directly
  when packaging VS Code releases.

- verify 0.1.0-alpha.6: copy project libraries into the isolated bootstrap
  verification directory so bare `libs/...` imports resolve during fixed-point
  checks.

- compiler 0.4.0-alpha.4: add `fn_args()`, the list of arguments the current
  function received. Extra arguments now reach the callee instead of being
  discarded at the call site, so declared parameters ignore them and
  `fn_args()` sees every supplied value.

- compiler 0.4.0-alpha.4: a user call no longer reports an argument-count error.
  A missing argument is 0 and an extra argument is discarded, matching mini's
  no-absence-value rule. Builtin calls keep exact arity. The language contract
  now states that mini does not typecheck.

- mini 0.2.0-alpha.4 / cli 0.1.0-alpha.17 / VS Code 0.3.6: write the name as
  lowercase mini in the editor display name, language picker alias,
  configuration title, grammar name, launch configuration, output channel, and
  error message. The dispatcher and generated tools report
  `mini source must use .mini`, `mini-source scenarios passed`, and
  `mini-written compiler` in diagnostics. No language change.

- mini 0.2.0-alpha.3 / compiler 0.4.0-alpha.3 / format 0.1.0-alpha.7 / lsp
  0.1.0-alpha.9 / bootstrap 0.2.0-alpha.3: use `io_write_line` for
  newline-terminated output, keep a space before unary `!` after `if` and
  `while`, and report builtin results as `number`. No language change.

- mini 0.2.0-alpha.2 / compiler 0.4.0-alpha.2 / builtins 0.4.0-alpha.2 /
  bootstrap 0.2.0-alpha.2: helper-backed builtins return 0 directly; simple host
  calls keep the `(op, 0)` expression. No language change.

- mini 0.2.0-alpha.1 / language 0.4.0-alpha.1 / compiler 0.4.0-alpha.1 /
  bootstrap 0.2.0-alpha.1 / builtins 0.4.0-alpha.1: open group 0.5.0. Declare
  with `name := value;`; the `var` keyword is gone. Every call produces a
  value: no-result builtins return 0, functions that fall through return 0, and
  `io_write_line` writes text plus a newline. Add `else if` chains.
- format 0.1.0-alpha.6 / lsp 0.1.0-alpha.8 / VS Code 0.3.5: format and
  highlight `:=`, recognize declarations after the operator, and expose the
  zero-result builtin metadata.

- mini 0.1.0-alpha.34 / language 0.3.0-alpha.33 / compiler 0.3.0-alpha.44 /
  bootstrap 0.1.0-alpha.31: warn when parentheses enclose a whole `if` or
  `while` condition. Grouped subexpressions stay quiet, warnings do not change
  the exit status or generated code, and formatting validates quietly.
- mini 0.1.0-alpha.33 / language 0.3.0-alpha.32 / compiler 0.3.0-alpha.43 /
  bootstrap 0.1.0-alpha.30: accept unparenthesized `if` and `while` conditions.
  Conditions end at the braced body; parentheses remain available for grouping,
  so existing sources keep compiling. Reject a second `var` declaration in the
  same block; nested blocks may shadow. Update the compiler, libraries, tools,
  cases, samples, tests, and docs.
- mini 0.1.0-alpha.32 / language 0.3.0-alpha.31 / builtins 0.3.0-alpha.31 /
  compiler 0.3.0-alpha.42 / bootstrap 0.1.0-alpha.29: open group 0.4.0. The
  compiler emits plain JavaScript and requires Node 22.18.0 or newer. The
  tracked distribution is the `bin/bootstrap` seed, which rebuilds the compiler
  and every tool. Builtins gain pure `json_parse` / `json_to_text` references
  and per-namespace descriptors; map runtime helpers are split per builtin; and
  libraries move to `libs/common`, `libs/tools`, and `libs/pure`. The language
  contract is unchanged. Add the browser playground, showcase site, brand
  assets, and the Apache-2.0 license.
- CLI 0.1.0-alpha.16 / check 0.1.0-alpha.9 / format 0.1.0-alpha.5 / LSP
  0.1.0-alpha.7 / test, verify, bench, release 0.1.0-alpha.5 / VS Code 0.3.4:
  generated tools run from `dist/*.js`, the Node gate accepts 22.18.0 or newer,
  and the formatter tests are Mini unit tests. The VS Code package adopts the
  Apache-2.0 license.
- Mini 0.1.0-alpha.31 / language 0.3.0-alpha.31 / builtins 0.3.0-alpha.30 /
  compiler 0.3.0-alpha.41 / bootstrap 0.1.0-alpha.28: normalize the path
  namespace with `path_is_exists`, `path_is_file`, `path_is_directory`,
  `path_temp_directory`, and `path_temp_file`.
- Mini 0.1.0-alpha.30 / language 0.3.0-alpha.30 / builtins 0.3.0-alpha.29 /
  compiler 0.3.0-alpha.40 / bootstrap 0.1.0-alpha.27: add `text_code` and
  `text_from_code` representation primitives, with pure UTF-8 encoding and
  decoding in `libs/pure/bytes.mini`. Add `value_is_*` predicates and move
  common result/path/process/JSON/project/list helpers out of `cases.mini`.
- Mini 0.1.0-alpha.29 / language 0.3.0-alpha.29 / builtins 0.3.0-alpha.28 /
  compiler 0.3.0-alpha.39 / bootstrap 0.1.0-alpha.26: remove the trivial
  `number_add`, `number_sub`, `number_min`, and `number_max` builtins and their
  tautological pure references. Addition and subtraction remain operators;
  minimum and maximum use comparisons. Total `number_add`, `number_sub`,
  `number_min`, and `number_max` helpers live in `libs/number.mini` instead.
  Only operations that add real semantics keep reference implementations.
- Mini 0.1.0-alpha.28 / language 0.3.0-alpha.28 / builtins 0.3.0-alpha.27 /
  compiler 0.3.0-alpha.38 / bootstrap 0.1.0-alpha.25: add the `number_*`
  namespace with add, subtract, multiply, divide, modulo, floor, power, min,
  max, and decimal text parsing, each with a pure reference implementation.
- Mini 0.1.0-alpha.27 / language 0.3.0-alpha.27 / builtins 0.3.0-alpha.26 /
  compiler 0.3.0-alpha.37 / bootstrap 0.1.0-alpha.24: add `list_push_front`,
  `list_push_back`, `list_pop_front`, `list_pop_back`, and `list_truncate`, with
  pure reference implementations for the push/pop operations. Centralize
  `text_chomp`, `text_trim_end`, `text_trim`, and common list helpers.
- Mini 0.1.0-alpha.26 / compiler 0.3.0-alpha.36 / bootstrap 0.1.0-alpha.23 /
  builtins 0.3.0-alpha.25: add builtin layer metadata, pure reference
  implementations for text_slice, text_find, text_split, list_copy, and
  map_copy, and the `--reference` compiler mode. Equivalence is covered by
  `test/reference.test.mini`. JSON and byte reference paths remain pending.
- Mini 0.1.0-alpha.25 / language 0.3.0-alpha.26 / builtins 0.3.0-alpha.24 /
  compiler 0.3.0-alpha.35 / bootstrap 0.1.0-alpha.22: establish the `io_` fake
  namespace for standard streams. `write`, `write_error`, `readAll`, `read_line`,
  and `read_bytes` become `io_write`, `io_write_error`, `io_read_all`,
  `io_read_line`, and `io_read_bytes`; old names are removed.
- Mini 0.1.0-alpha.24 / CLI 0.1.0-alpha.15: implement CI tasks as a Mini tool,
  `dist/ci.ts` (`mini ci TASK_FILE`). Workflows invoke it directly; remove
  `tools/ci.ts`.
- Language 0.3.0-alpha.25 / builtins 0.3.0-alpha.23 / compiler 0.3.0-alpha.34 /
  bootstrap 0.1.0-alpha.21: add `process_env(name)` for reading host environment
  variables, returning empty text when unset.
- Mini 0.1.0-alpha.23 / test 0.1.0-alpha.4: add `test/*.test.mini` unit tests and
  `mini test --unit [FILTER]`. Convert the compiler fixed-point test to Mini;
  move Node integration tests to `test/`.
- Mini 0.1.0-alpha.22 / compiler 0.3.0-alpha.33 / CLI 0.1.0-alpha.14: name
  generated artifacts by command under `dist/` (`dist/compile.ts`, `dist/mini.ts`,
  `dist/check.ts`, `dist/format.ts`, and so on). Generated tools are directly
  executable; the `*.generated.ts` suffix and `dist/tools/` directory are gone.
- Mini 0.1.0-alpha.21 / CLI 0.1.0-alpha.13: move the build helper and command
  dispatcher to Mini. `dist/tools/build.generated.ts` regenerates tools and
  launchers; `dist/tools/mini.generated.ts` provides `check`, `build`, `compile`,
  and the other commands. Remove `tools/mini-tools.ts` and `tools/cli.ts`; all
  generated tools are executable.
- Compiler 0.3.0-alpha.32 / bootstrap 0.1.0-alpha.20: accept the implicit
  `compiler SOURCE.mini [OUTPUT.ts]` form alongside `compile`, and emit an
  executable Node shebang for the generated compiler.
- Mini 0.1.0-alpha.20 / compiler 0.3.0-alpha.31: move included code into
  `libs/`. `tools/` holds command entries, `libs/` holds shared text and case
  libraries plus compiler parts under `libs/compiler/`, and `dist/` holds
  generated artifacts. No behavior change.
- Mini 0.1.0-alpha.19: move generated artifacts into `dist/`. The bootstrap is
  `dist/compiler.ts` and generated tools are `dist/tools/*.generated.ts`;
  `bin/` launchers and configuration point there. Sources remain in `tools/`.
- Mini 0.1.0-alpha.18 / compiler 0.3.0-alpha.30 / bootstrap 0.1.0-alpha.19 /
  verify 0.1.0-alpha.4: adopt `include` for all authored sources. The compiler
  entry is `tools/compiler.mini`; compiler sources and tools live together with
  unnumbered names, and tools include their own dependencies. Remove
  `compiler/compiler.mini`, `compiler/m1.parts`, and the `build-m1` tool.
  The verifier compiles the source path directly so includes resolve.
- Mini 0.1.0-alpha.16: generate every `bin/` launcher from the tool manifest.
  Launchers are executable files, verified by `mini check`, and are no longer
  handwritten symlinks.
- Mini 0.1.0-alpha.15 / lsp 0.1.0-alpha.5: implement the language server as a
  generated Mini tool. It frames LSP over standard input, analyzes documents
  through the active compiler, publishes diagnostics, formats through the
  generated formatter, and implements hover, completion, and definition. Remove
  `lang-server.ts`, `language-features.ts`, and `analysis.ts`.
- Language 0.3.0-alpha.23 / compiler 0.3.0-alpha.28 / builtins 0.3.0-alpha.22;
  bootstrap 0.1.0-alpha.17: add `read_line()` and `read_bytes(count)` for
  streaming standard input.
- Mini 0.1.0-alpha.14 / release 0.1.0-alpha.4 / CLI 0.1.0-alpha.12: implement
  release packaging as a generated Mini tool. It validates clean checkouts,
  annotated tags, versions, archives committed sources, verifies the extracted
  distribution, writes manifests and checksums, and packages VSIX assets. Remove
  `tools/release.ts`; release tests use the CLI.
- Mini 0.1.0-alpha.13 / bench 0.1.0-alpha.4 / CLI 0.1.0-alpha.11: implement
  benchmarks as a generated Mini tool on the shared case runner. Reports are
  compact JSON with integer sample milliseconds. Remove `tools/bench.ts`.
- Mini 0.1.0-alpha.12 / check 0.1.0-alpha.7 / CLI 0.1.0-alpha.10: implement
  repository checking as a generated Mini tool. `tools/check.mini` runs strict
  TypeScript, generated-tool and composition checks, versions, editor metadata,
  cases, documents, portable paths, and the bootstrap fixed point. Remove
  `tools/check.ts`.
- Mini 0.1.0-alpha.11 / verify 0.1.0-alpha.3 / CLI 0.1.0-alpha.9: implement
  bootstrap verification as a generated Mini tool. `mini verify` prints compact
  JSON; `mini check` and release packaging consume the same tool. Remove
  `tools/verify.ts`.
- Mini 0.1.0-alpha.10 / test 0.1.0-alpha.3 / CLI 0.1.0-alpha.8: implement the
  case runner as a generated Mini tool. `tools/test.mini` and the shared
  `tools/cases.mini` load manifests, run tool and Mini cases, compare byte
  streams, and handle workspaces; `mini test` and selected `mini verify` route
  through it. Remove `tools/test.ts`.
- Language 0.3.0-alpha.22 / compiler 0.3.0-alpha.27 / builtins 0.3.0-alpha.21;
  bootstrap 0.1.0-alpha.16: `path_copy` dereferences symlinks and preserves
  file modes so copied repositories keep executable launchers.
- Language 0.3.0-alpha.21 / compiler 0.3.0-alpha.26 / builtins 0.3.0-alpha.20;
  bootstrap 0.1.0-alpha.15: add `value_kind(value)` for runtime kind checks.
- Language 0.3.0-alpha.20 / compiler 0.3.0-alpha.25 / builtins 0.3.0-alpha.19;
  bootstrap 0.1.0-alpha.14: add `process_script_path()` for repository-relative
  tool paths.
- Language 0.3.0-alpha.19 / compiler 0.3.0-alpha.24 / builtins 0.3.0-alpha.18;
  bootstrap 0.1.0-alpha.13: add `process_spawn(options)` with working directory,
  byte stdin, captured byte output, inherit mode, and timeout.
- Language 0.3.0-alpha.18 / compiler 0.3.0-alpha.23 / builtins 0.3.0-alpha.17;
  bootstrap 0.1.0-alpha.12: add `path_is_exists`, `path_is_directory`,
  `directory_list`, `directory_create`, `path_copy`, and `path_remove` for tool
  file-tree work.
- Language 0.3.0-alpha.17 / compiler 0.3.0-alpha.22 / builtins 0.3.0-alpha.16;
  bootstrap 0.1.0-alpha.11: add `time_millis()` for integer epoch milliseconds.
- Language 0.3.0-alpha.16 / compiler 0.3.0-alpha.21 / builtins 0.3.0-alpha.15;
  bootstrap 0.1.0-alpha.10: rename the byte conversions to `text_to_bytes` and
  `text_from_bytes`.
- Language 0.3.0-alpha.15 / compiler 0.3.0-alpha.20 / builtins 0.3.0-alpha.14;
  bootstrap 0.1.0-alpha.9: add `hash_sha256(value)` for lowercase hexadecimal
  SHA-256 of text or byte lists.
- Language 0.3.0-alpha.14 / compiler 0.3.0-alpha.19 / builtins 0.3.0-alpha.13;
  bootstrap 0.1.0-alpha.8: add `text_bytes`, `bytes_text`, `file_read_bytes`,
  and `file_write_bytes` for UTF-8 and whole-file byte data.
- Language 0.3.0-alpha.13 / compiler 0.3.0-alpha.18 / builtins 0.3.0-alpha.12;
  bootstrap 0.1.0-alpha.7: add `json_parse(text)` for structured tool input,
  returning `ok` and `value` with JSON null as numeric zero.
- Compiler 0.3.0-alpha.17 / bootstrap 0.1.0-alpha.6: table-drive builtin names,
  parameter kinds, result kinds, imports, and adapter keys in M1. Behavior and
  emitted programs are unchanged; the metadata command output is byte-identical.
- Mini 0.1.0-alpha.9 / compiler 0.3.0-alpha.16: remove the handwritten T0 compiler
  modules, `compiler/adapters.ts`, `compiler/builtin-metadata.ts`,
  `compiler/types.ts`, `tools/generate-adapters.ts`, and their tests. Host adapter
  text in `compiler/src/00-constants.mini` is the source of truth; the generated
  compiler and its `metadata` command are the only compiler interfaces. Rewrite
  the fixed-point test around the bootstrap and drop the T0 application benchmark
  reference.
- Language server: format documents through the generated formatter tool instead
  of the duplicate TypeScript token renderer. Remove `tools/format.ts`; formatter
  tests cover the generated tool only.
- Compiler 0.3.0-alpha.15 / bootstrap 0.1.0-alpha.5: expose `metadata` from the
  generated compiler as deterministic builtin JSON (name, parameter kinds,
  result kind). Language-server hover and completion read that command instead
  of `compiler/builtin-metadata.ts`.
- Mini 0.1.0-alpha.8 / CLI 0.1.0-alpha.7: port `mini run` and `mini-run` to
  `tools/run.mini`. The generated tool creates a temporary module directory,
  compiles with the active compiler, runs Node with inherited standard streams,
  forwards program arguments, and removes its files. Behavior is unchanged.
- Language 0.3.0-alpha.12 / compiler 0.3.0-alpha.14 / builtins 0.3.0-alpha.11;
  bootstrap 0.1.0-alpha.4: add `process_exec_path()`, `path_temp_directory()`,
  `file_remove(path)`, and `directory_remove(path)` for tool process setup and
  cleanup. Regenerate the bootstrap and the generated tools.
- Language 0.3.0-alpha.11 / compiler 0.3.0-alpha.13 / builtins 0.3.0-alpha.10;
  bootstrap 0.1.0-alpha.3: add `process_run(command, args, mode)` for one-shot
  child processes with inherited environment, captured or inherited standard
  streams, and a map result carrying status, signal, stdout, stderr, and startup
  error. M1 and T0 lower the same adapter; regenerate the bootstrap and the
  generated tools.
- Mini 0.1.0-alpha.7 / format 0.1.0-alpha.3: port formatting to
  `tools/format.mini` composed with compiler parts `00`–`40`. `mini fmt` and
  `mini-format` run the generated tool with unchanged stdout, stdin, `--write`,
  `--check`, shebang, and comment behavior. The language server keeps its
  TypeScript token renderer until its own port. Replace T0-based formatter tests
  with generated-tool tests.
- Mini 0.1.0-alpha.6 / check 0.1.0-alpha.6: implement source checking as a
  generated Mini tool (`tools/check-source.mini`) composed with compiler parts
  `00`–`40`. `mini check SOURCE.mini` and `mini check -` run the generated tool;
  `mini check --docs` remains TypeScript. Add the tool to
  `tools/mini-tools.json`.
- Mini 0.1.0-alpha.5, compiler 0.3.0-alpha.12, bootstrap 0.1.0-alpha.2,
  check 0.1.0-alpha.5, format 0.1.0-alpha.2, lsp 0.1.0-alpha.4: verify the
  migrated tooling, self-hosted compiler, generated adapters, and shared builtin
  metadata.
- Share builtin signatures through `compiler/builtin-metadata.ts`; tooling
  hover/completion no longer imports T0 lowering callbacks. T0 lowering reads the
  same metadata.
- Define adapter JavaScript once in `compiler/adapters.ts`, share it with T0
  lowering, and generate `compiler/src/00-constants.mini` with
  `tools/generate-adapters.ts`; `mini check` rejects stale adapter text.
- Use short helper keys for compiler adapter emission instead of comparing
  full adapter text, and emit used adapters from a fixed ordered key list.
- Refactor compiler helper names: `token_new` instead of `new_token`, and
  `lex_fail`/`parser_fail` instead of the shared `fail`. No emitted-code
  behavior change.

- CLI 0.1.0-alpha.6 / Mini distribution 0.1.0-alpha.4: add `mini run SOURCE.mini
  [ARG]...` through a temporary generated TS module, and mark shebang output
  executable on supported platforms. Add `mini-run` and tool cases.
- Build M1 from ordered `compiler/src/*.mini` parts. The build tool is Mini
  source (`tools/build-m1.mini`) with tracked generated
  `tools/build-m1.generated.ts`; `compiler/m1.parts` is the order,
  `compiler/compiler.mini` is the canonical bootstrap source, and `mini check`
  rejects stale composition or generated TS. Generated Mini tools use the
  `*.generated.ts` suffix and stay outside the strict TypeScript check. No
  language/module change.
- Bootstrap/compiler 0.1.0-alpha.1 / 0.3.0-alpha.11; Mini distribution
  0.1.0-alpha.3: promote the generated T1 compiler from `compiler/compiler.mini`
  as `bootstrap/compiler.ts`. `config/bootstrap.json` and `config/compiler.json`
  select it; T0 remains the reference compiler. Tooling analysis now uses the
  active compiler's `tokens --comments` and `compile` commands.
- VS Code extension 0.3.3: expose language-server go-to-definition through
  VS Code's definition provider.
- Language server 0.1.0-alpha.3: add go-to-definition for document functions and
  variables.
- VS Code extension 0.3.2: expose language-server hover and completion through
  VS Code's hover and completion providers.
- Language server 0.1.0-alpha.2: add hover for functions, variables, and builtins
  with `///` documentation, and prefix-filtered completion for declarations,
  builtins, and keywords. Completion is suppressed in comments and text.
- Language/compiler 0.3.0-alpha.10: recognize an optional first-line shebang as
  a `shebang` token, preserve it in tokens/analysis/formatting, and emit a Node
  shebang before `"use strict";`. Sources without a shebang are unchanged.
- Language/compiler/builtins 0.3.0-alpha.9: add `json_to_text(value)` for compact
  deterministic JSON with sorted map keys; M1 uses it for JSON string quoting.
- Language/compiler/builtins 0.3.0-alpha.8: add `number_to_text(number)` for
  canonical safe-integer decimal text; M1 uses it instead of its decimal helper.
- Language/compiler/builtins 0.3.0-alpha.7: add `list_join(list, separator)`
  and replace M1's separate join helper.
- Language/compiler/builtins 0.3.0-alpha.6: add `list_copy(list)` with shallow
  copies and empty-list fallback.
- Language/compiler/builtins 0.3.0-alpha.5: add `map_copy(map)` with shallow
  text-keyed copies and empty-map fallback; M1 uses it for scope copies.
- Language/compiler/builtins 0.3.0-alpha.4: add `text_split(text, divider)` with
  literal-divider splitting, preserved empty fields, and empty-list fallbacks;
  M1 uses it for line splitting.
- Language/compiler/builtins 0.3.0-alpha.3: add `text_find(text, needle)` with
  first-position and `-1` fallback behavior, and replace M1 character-membership
  loops with it.
- Language/compiler/builtins 0.3.0-alpha.2: add `text_slice(text, start, end)`
  with zero-based end-exclusive bounds, clamping, negative bounds from the end,
  and empty-text fallbacks. M1 uses it for token spelling and text helpers.
- VS Code extension 0.3.1: report the attempted server command and offer to open
  `mini.serverPath` when the language server cannot start, and reject pending
  requests on launch failure instead of hanging activation.
- Verify the tooling workflow from an extracted source archive without `.git` or
  `node_modules`: repository docs check, source checking, formatting, and a live
  language-server session. Package and inspect the VSIX with its bundled client.
- Measure T1 against T0: all 322 active cases, 259 candidate scenarios, 222
  byte-identical compile/token checks, and 69 application checks pass. Builtin-era
  self-build wall time is slightly below T0 with about 2% higher RSS; large
  synthetic sources compile about 1.43x slower. Add candidate verification
  tooling and retry transient case-workspace cleanup.
- VS Code extension 0.3.0: connect to `mini-lang-server` for live diagnostics and
  document formatting, with `mini.serverPath` and `mini.nodePath` settings. The
  client is bundled into the VSIX; no checkout-local paths are required.
- Language server 0.1.0-alpha.1: add standalone `mini-lang-server` with LSP 3.17
  over stdio, full document sync, pushed diagnostics, whole-document formatting,
  UTF-16 positions, and `--version`. Diagnostics and formatting reuse the
  compiler analysis and shared formatter.
- Add the first Mini compiler source (`compiler/compiler.mini`) as a close T0
  port. The focused check proves `T0(M1)`, `T1(M1)`, and `T2(M1)` are
  byte-identical. T0 remains active; candidate performance evidence and bootstrap
  promotion are pending. No language or builtin contract changes.
- Formatter 0.1.0-alpha.1: add `mini fmt` / `mini-format` with stdout, stdin,
  `--write`, and `--check` modes; preserve comment tokens, source blank lines,
  literals, parentheses, and token order.
- Checker/cli 0.1.0-alpha.4: add `mini check SOURCE.mini` and `mini check -`
  source checking with compiler diagnostics, stdin display name `<stdin>`, and
  no generated artifacts. Formatter and language server commands remain future.
- Group 0.3.0, language/compiler/builtins 0.3.0-alpha.1: use object-backed maps
  with an empty prototype and no per-map metadata. Remove `map_length`;
  count with `list_length(map_keys(items))`. Map operations and argument order
  retain their contracts, including special text keys and shared values.
- Record four before/after map-runtime runs: 2,760 verified measured calls.
  Object maps reduce compiler pipeline wall time/RSS, increase its warm CPU,
  and slow template rendering and dependency traversal; preserve raw evidence.
- Record two clean application benchmark runs: 1,380 verified measured calls,
  CPU/RSS evidence, and material scanner/compiler costs relative to actual T0.
- Add ten paired Mini/handwritten-TS application benchmarks, independent result
  models, actual-T0 comparisons, and cold/warm wall, CPU, and memory measurements.
- Compiler/language 0.2.0-alpha.4: add `//` line comments and `///` documentation
  comments, preserve quoted markers and positions, document Mini samples and
  workload helpers, and add VS Code comment highlighting/toggling (0.2.0).
- Define M1 as Mini compiler source and T1 as its generated TS compiler; require
  the first M1 to preserve T0's structure, control flow, lookups, and data layout.
  Defer performance refactoring until parity and the fixed point are established.
- Audit generated-code performance with repeatable compiler workloads, record
  map/storage and TS-loading costs, and require actual-candidate performance
  evidence before retiring T0. Record a separate emitted-expression depth limit.
- Inventory T0's implementation, all built-in lowerings, and T1 equivalents.
- Freeze T0 feature growth, verify the port workload in Mini, and narrow the
  remaining self-hosting work to the compiler port, fixed point, and promotion.
- Focus reader documentation and cases on the current API.
- 0.2.0-alpha.3: list reads return zero for gaps and invalid targets/positions;
  negative indices count from the end.
- 0.2.0-alpha.2: text reads return empty text for non-text targets and invalid positions.
- Group 0.2.0: use consistent text_get/list_get reader names;
  advance language, compiler, and builtins to 0.2.0-alpha.1.
- T0 alpha.35 / builtins alpha.19: map reads use ordinary zero for missing keys.
- T0 alpha.34 / builtins alpha.18: map key snapshots, demonstrated by the map sample.
- Showcase all implemented built-ins in runnable samples, including list mutation.
- T0 alpha.33 / builtins alpha.17: map key counts, with a runnable map sample.
- Document grouped-tag audits, explicit remote publication, and immutable history.
- T0 alpha.32 / builtins alpha.16: map insertion/replacement with non-map no-ops.
- Adopt group 0.1.2 and product-vGROUP-vPRODUCT tags; keep product counters across groups.

- T0 alpha.31 / builtins alpha.15: `map_has` checks text-key membership without mutation.
- T0 alpha.30 / builtins alpha.14: `map_new()` creates empty maps.
- T0 alpha.29 / builtins alpha.13: list mutation with growth and uniform no-op rules.
- Investigate reserve versus list growth and exact versus defaulted argument counts.
- Separate parameter-sharing semantics from target-specific value representation.
- Propose local parameter rebinding and shared collections, with pending review cases.
- T0 alpha.28 / builtins alpha.12: zero-argument `list_new()` creates empty lists.
- Define group/product versioning, compatibility evidence, and the version inventory.
- Exclude records, structs, and classes from Mini's target; use simple collections.
- Document future formatter, documentation, help, and language-server commands.
- Assess remaining self-hosting semantics, compiler capabilities, and useful additions.
- Prepare independently versioned T0 preview releases with source provenance.
- T0 alpha.26 / builtins alpha.11: exact stderr output with `write_error`.
- T0 alpha.25 / builtins alpha.10: `process_exit`.
- T0 alpha.24 / builtins alpha.9: indexed list reads.
- T0 alpha.23 / builtins alpha.8: `list_length`.
- T0 alpha.22 / builtins alpha.7: `process_args` returns the program's text list.
- T0 alpha.21 / builtins alpha.6: `file_write`.
- T0 alpha.20 / builtins alpha.5: `file_read`.
- T0 alpha.19 / builtins alpha.4: indexed character reads.
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
- Use grouped names in the text-access proposal and cases.
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
- Language 0.3.0-alpha.19 / compiler 0.3.0-alpha.24 / builtins 0.3.0-alpha.18;
  bootstrap 0.1.0-alpha.13: add `process_spawn(options)` with working directory,
  byte stdin, captured byte output, inherit mode, and timeout.
- Language 0.3.0-alpha.18 / compiler 0.3.0-alpha.23 / builtins 0.3.0-alpha.17;
  bootstrap 0.1.0-alpha.12: add `path_is_exists`, `path_is_directory`,
  `directory_list`, `directory_create`, `path_copy`, and `path_remove` for tool
  file-tree work.
- Language 0.3.0-alpha.17 / compiler 0.3.0-alpha.22 / builtins 0.3.0-alpha.16;
  bootstrap 0.1.0-alpha.11: add `time_millis()` for integer epoch milliseconds.
- Language 0.3.0-alpha.16 / compiler 0.3.0-alpha.21 / builtins 0.3.0-alpha.15;
  bootstrap 0.1.0-alpha.10: rename the byte conversions to `text_to_bytes` and
  `text_from_bytes`.
- Language 0.3.0-alpha.15 / compiler 0.3.0-alpha.20 / builtins 0.3.0-alpha.14;
  bootstrap 0.1.0-alpha.9: add `hash_sha256(value)` for lowercase hexadecimal
  SHA-256 of text or byte lists.
- Language 0.3.0-alpha.14 / compiler 0.3.0-alpha.19 / builtins 0.3.0-alpha.13;
  bootstrap 0.1.0-alpha.8: add `text_bytes`, `bytes_text`, `file_read_bytes`,
  and `file_write_bytes` for UTF-8 and whole-file byte data.
- Language 0.3.0-alpha.13 / compiler 0.3.0-alpha.18 / builtins 0.3.0-alpha.12;
  bootstrap 0.1.0-alpha.7: add `json_parse(text)` for structured tool input,
  returning `ok` and `value` with JSON null as numeric zero.
- Compiler 0.3.0-alpha.17 / bootstrap 0.1.0-alpha.6: table-drive builtin names,
  parameter kinds, result kinds, imports, and adapter keys in M1. Behavior and
  emitted programs are unchanged; the metadata command output is byte-identical.
- Mini 0.1.0-alpha.9 / compiler 0.3.0-alpha.16: remove the handwritten T0 compiler
  modules, `compiler/adapters.ts`, `compiler/builtin-metadata.ts`,
  `compiler/types.ts`, `tools/generate-adapters.ts`, and their tests. Host adapter
  text in `compiler/src/00-constants.mini` is the source of truth; the generated
  compiler and its `metadata` command are the only compiler interfaces. Rewrite
  the fixed-point test around the bootstrap and drop the T0 application benchmark
  reference.
- Language server: format documents through the generated formatter tool instead
  of the duplicate TypeScript token renderer. Remove `tools/format.ts`; formatter
  tests cover the generated tool only.
- Compiler 0.3.0-alpha.15 / bootstrap 0.1.0-alpha.5: expose `metadata` from the
  generated compiler as deterministic builtin JSON (name, parameter kinds,
  result kind). Language-server hover and completion read that command instead
  of `compiler/builtin-metadata.ts`.
- Mini 0.1.0-alpha.8 / CLI 0.1.0-alpha.7: port `mini run` and `mini-run` to
  `tools/run.mini`. The generated tool creates a temporary module directory,
  compiles with the active compiler, runs Node with inherited standard streams,
  forwards program arguments, and removes its files. Behavior is unchanged.
- Language 0.3.0-alpha.12 / compiler 0.3.0-alpha.14 / builtins 0.3.0-alpha.11;
  bootstrap 0.1.0-alpha.4: add `process_exec_path()`, `path_temp_directory()`,
  `file_remove(path)`, and `directory_remove(path)` for tool process setup and
  cleanup. Regenerate the bootstrap and the generated tools.
- Language 0.3.0-alpha.11 / compiler 0.3.0-alpha.13 / builtins 0.3.0-alpha.10;
  bootstrap 0.1.0-alpha.3: add `process_run(command, args, mode)` for one-shot
  child processes with inherited environment, captured or inherited standard
  streams, and a map result carrying status, signal, stdout, stderr, and startup
  error. M1 and T0 lower the same adapter; regenerate the bootstrap and the
  generated tools.
- Mini 0.1.0-alpha.7 / format 0.1.0-alpha.3: port formatting to
  `tools/format.mini` composed with compiler parts `00`–`40`. `mini fmt` and
  `mini-format` run the generated tool with unchanged stdout, stdin, `--write`,
  `--check`, shebang, and comment behavior. The language server keeps its
  TypeScript token renderer until its own port. Replace T0-based formatter tests
  with generated-tool tests.
- Mini 0.1.0-alpha.6 / check 0.1.0-alpha.6: implement source checking as a
  generated Mini tool (`tools/check-source.mini`) composed with compiler parts
  `00`–`40`. `mini check SOURCE.mini` and `mini check -` run the generated tool;
  `mini check --docs` remains TypeScript. Add the tool to
  `tools/mini-tools.json`.
- Mini 0.1.0-alpha.5, compiler 0.3.0-alpha.12, bootstrap 0.1.0-alpha.2,
  check 0.1.0-alpha.5, format 0.1.0-alpha.2, lsp 0.1.0-alpha.4: verify the
  migrated tooling, self-hosted compiler, generated adapters, and shared builtin
  metadata.
- Share builtin signatures through `compiler/builtin-metadata.ts`; tooling
  hover/completion no longer imports T0 lowering callbacks. T0 lowering reads the
  same metadata.
- Define adapter JavaScript once in `compiler/adapters.ts`, share it with T0
  lowering, and generate `compiler/src/00-constants.mini` with
  `tools/generate-adapters.ts`; `mini check` rejects stale adapter text.
- Use short helper keys for compiler adapter emission instead of comparing
  full adapter text, and emit used adapters from a fixed ordered key list.
- Refactor compiler helper names: `token_new` instead of `new_token`, and
  `lex_fail`/`parser_fail` instead of the shared `fail`. No emitted-code
  behavior change.

- CLI 0.1.0-alpha.6 / Mini distribution 0.1.0-alpha.4: add `mini run SOURCE.mini
  [ARG]...` through a temporary generated TS module, and mark shebang output
  executable on supported platforms. Add `mini-run` and tool cases.
- Build M1 from ordered `compiler/src/*.mini` parts. The build tool is Mini
  source (`tools/build-m1.mini`) with tracked generated
  `tools/build-m1.generated.ts`; `compiler/m1.parts` is the order,
  `compiler/compiler.mini` is the canonical bootstrap source, and `mini check`
  rejects stale composition or generated TS. Generated Mini tools use the
  `*.generated.ts` suffix and stay outside the strict TypeScript check. No
  language/module change.
- Bootstrap/compiler 0.1.0-alpha.1 / 0.3.0-alpha.11; Mini distribution
  0.1.0-alpha.3: promote the generated T1 compiler from `compiler/compiler.mini`
  as `bootstrap/compiler.ts`. `config/bootstrap.json` and `config/compiler.json`
  select it; T0 remains the reference compiler. Tooling analysis now uses the
  active compiler's `tokens --comments` and `compile` commands.
- VS Code extension 0.3.3: expose language-server go-to-definition through
  VS Code's definition provider.
- Language server 0.1.0-alpha.3: add go-to-definition for document functions and
  variables.
- VS Code extension 0.3.2: expose language-server hover and completion through
  VS Code's hover and completion providers.
- Language server 0.1.0-alpha.2: add hover for functions, variables, and builtins
  with `///` documentation, and prefix-filtered completion for declarations,
  builtins, and keywords. Completion is suppressed in comments and text.
- Language/compiler 0.3.0-alpha.10: recognize an optional first-line shebang as
  a `shebang` token, preserve it in tokens/analysis/formatting, and emit a Node
  shebang before `"use strict";`. Sources without a shebang are unchanged.
- Language/compiler/builtins 0.3.0-alpha.9: add `json_to_text(value)` for compact
  deterministic JSON with sorted map keys; M1 uses it for JSON string quoting.
- Language/compiler/builtins 0.3.0-alpha.8: add `number_to_text(number)` for
  canonical safe-integer decimal text; M1 uses it instead of its decimal helper.
- Language/compiler/builtins 0.3.0-alpha.7: add `list_join(list, separator)`
  and replace M1's separate join helper.
- Language/compiler/builtins 0.3.0-alpha.6: add `list_copy(list)` with shallow
  copies and empty-list fallback.
- Language/compiler/builtins 0.3.0-alpha.5: add `map_copy(map)` with shallow
  text-keyed copies and empty-map fallback; M1 uses it for scope copies.
- Language/compiler/builtins 0.3.0-alpha.4: add `text_split(text, divider)` with
  literal-divider splitting, preserved empty fields, and empty-list fallbacks;
  M1 uses it for line splitting.
- Language/compiler/builtins 0.3.0-alpha.3: add `text_find(text, needle)` with
  first-position and `-1` fallback behavior, and replace M1 character-membership
  loops with it.
- Language/compiler/builtins 0.3.0-alpha.2: add `text_slice(text, start, end)`
  with zero-based end-exclusive bounds, clamping, negative bounds from the end,
  and empty-text fallbacks. M1 uses it for token spelling and text helpers.
- VS Code extension 0.3.1: report the attempted server command and offer to open
  `mini.serverPath` when the language server cannot start, and reject pending
  requests on launch failure instead of hanging activation.
- Verify the tooling workflow from an extracted source archive without `.git` or
  `node_modules`: repository docs check, source checking, formatting, and a live
  language-server session. Package and inspect the VSIX with its bundled client.
- Measure T1 against T0: all 322 active cases, 259 candidate scenarios, 222
  byte-identical compile/token checks, and 69 application checks pass. Builtin-era
  self-build wall time is slightly below T0 with about 2% higher RSS; large
  synthetic sources compile about 1.43x slower. Add candidate verification
  tooling and retry transient case-workspace cleanup.
- VS Code extension 0.3.0: connect to `mini-lang-server` for live diagnostics and
  document formatting, with `mini.serverPath` and `mini.nodePath` settings. The
  client is bundled into the VSIX; no checkout-local paths are required.
- Language server 0.1.0-alpha.1: add standalone `mini-lang-server` with LSP 3.17
  over stdio, full document sync, pushed diagnostics, whole-document formatting,
  UTF-16 positions, and `--version`. Diagnostics and formatting reuse the
  compiler analysis and shared formatter.
- Add the first Mini compiler source (`compiler/compiler.mini`) as a close T0
  port. The focused check proves `T0(M1)`, `T1(M1)`, and `T2(M1)` are
  byte-identical. T0 remains active; candidate performance evidence and bootstrap
  promotion are pending. No language or builtin contract changes.
- Formatter 0.1.0-alpha.1: add `mini fmt` / `mini-format` with stdout, stdin,
  `--write`, and `--check` modes; preserve comment tokens, source blank lines,
  literals, parentheses, and token order.
- Checker/cli 0.1.0-alpha.4: add `mini check SOURCE.mini` and `mini check -`
  source checking with compiler diagnostics, stdin display name `<stdin>`, and
  no generated artifacts. Formatter and language server commands remain future.
- Group 0.3.0, language/compiler/builtins 0.3.0-alpha.1: use object-backed maps
  with an empty prototype and no per-map metadata. Remove `map_length`;
  count with `list_length(map_keys(items))`. Map operations and argument order
  retain their contracts, including special text keys and shared values.
- Record four before/after map-runtime runs: 2,760 verified measured calls.
  Object maps reduce compiler pipeline wall time/RSS, increase its warm CPU,
  and slow template rendering and dependency traversal; preserve raw evidence.
- Record two clean application benchmark runs: 1,380 verified measured calls,
  CPU/RSS evidence, and material scanner/compiler costs relative to actual T0.
- Add ten paired Mini/handwritten-TS application benchmarks, independent result
  models, actual-T0 comparisons, and cold/warm wall, CPU, and memory measurements.
- Compiler/language 0.2.0-alpha.4: add `//` line comments and `///` documentation
  comments, preserve quoted markers and positions, document Mini samples and
  workload helpers, and add VS Code comment highlighting/toggling (0.2.0).
- Define M1 as Mini compiler source and T1 as its generated TS compiler; require
  the first M1 to preserve T0's structure, control flow, lookups, and data layout.
  Defer performance refactoring until parity and the fixed point are established.
- Audit generated-code performance with repeatable compiler workloads, record
  map/storage and TS-loading costs, and require actual-candidate performance
  evidence before retiring T0. Record a separate emitted-expression depth limit.
- Inventory T0's implementation, all built-in lowerings, and T1 equivalents.
- Freeze T0 feature growth, verify the port workload in Mini, and narrow the
  remaining self-hosting work to the compiler port, fixed point, and promotion.
- Focus reader documentation and cases on the current API.
- 0.2.0-alpha.3: list reads return zero for gaps and invalid targets/positions;
  negative indices count from the end.
- 0.2.0-alpha.2: text reads return empty text for non-text targets and invalid positions.
- Group 0.2.0: use consistent text_get/list_get reader names;
  advance language, compiler, and builtins to 0.2.0-alpha.1.
- T0 alpha.35 / builtins alpha.19: map reads use ordinary zero for missing keys.
- T0 alpha.34 / builtins alpha.18: map key snapshots, demonstrated by the map sample.
- Showcase all implemented built-ins in runnable samples, including list mutation.
- T0 alpha.33 / builtins alpha.17: map key counts, with a runnable map sample.
- Document grouped-tag audits, explicit remote publication, and immutable history.
- T0 alpha.32 / builtins alpha.16: map insertion/replacement with non-map no-ops.
- Adopt group 0.1.2 and product-vGROUP-vPRODUCT tags; keep product counters across groups.

- T0 alpha.31 / builtins alpha.15: `map_has` checks text-key membership without mutation.
- T0 alpha.30 / builtins alpha.14: `map_new()` creates empty maps.
- T0 alpha.29 / builtins alpha.13: list mutation with growth and uniform no-op rules.
- Investigate reserve versus list growth and exact versus defaulted argument counts.
- Separate parameter-sharing semantics from target-specific value representation.
- Propose local parameter rebinding and shared collections, with pending review cases.
- T0 alpha.28 / builtins alpha.12: zero-argument `list_new()` creates empty lists.
- Define group/product versioning, compatibility evidence, and the version inventory.
- Exclude records, structs, and classes from Mini's target; use simple collections.
- Document future formatter, documentation, help, and language-server commands.
- Assess remaining self-hosting semantics, compiler capabilities, and useful additions.
- Prepare independently versioned T0 preview releases with source provenance.
- T0 alpha.26 / builtins alpha.11: exact stderr output with `write_error`.
- T0 alpha.25 / builtins alpha.10: `process_exit`.
- T0 alpha.24 / builtins alpha.9: indexed list reads.
- T0 alpha.23 / builtins alpha.8: `list_length`.
- T0 alpha.22 / builtins alpha.7: `process_args` returns the program's text list.
- T0 alpha.21 / builtins alpha.6: `file_write`.
- T0 alpha.20 / builtins alpha.5: `file_read`.
- T0 alpha.19 / builtins alpha.4: indexed character reads.
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
- Use grouped names in the text-access proposal and cases.
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
