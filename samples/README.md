# Samples

All samples compile and run with T0. Sources and JSON cases stay separate.
Descriptions name the main features and built-ins; case links verify output.

```text
./bin/mini compile samples/009-list-mutation.mini
node samples/009-list-mutation.mini.ts
./bin/mini verify cases/language/029-008-list-mutation-sample.case.json
```

- [001-bindings.mini](001-bindings.mini): Binding initialization and cursor assignment. [Cases](../cases/language/003-002-bindings-sample.case.json).
- [002-expressions.mini](002-expressions.mini): Arithmetic, comparison, booleans, and text concatenation. [Cases](../cases/language/015-002-expressions-sample.case.json).
- [003-io.mini](003-io.mini): Copy stdin to stdout with `readAll` and `write`. [Cases](../cases/language/005-002-io-sample.case.json).
- [004-text.mini](004-text.mini): Scan with `text_length` and `text_get`, replacing tabs and newlines with spaces. [Cases](../cases/language/019-004-text-sample.case.json).
- [005-file.mini](005-file.mini): Copy and print a file with `file_read` and `file_write`. [Cases](../cases/language/021-003-file-sample.case.json).
- [006-list.mini](006-list.mini): Pass `process_args()` to a function and join its elements with `list_length` and `list_get`. [Cases](../cases/language/024-003-list-sample.case.json).
- [007-exit.mini](007-exit.mini): Use `process_exit` when an argument is missing. [Cases](../cases/language/025-004-process-exit-sample.case.json).
- [008-diagnostic.mini](008-diagnostic.mini): Use `write_error` before an unsuccessful exit. [Cases](../cases/language/026-003-write-error-sample.case.json).
- [009-list-mutation.mini](009-list-mutation.mini): Use `list_new` and `list_set` for growth, replacement, negative indices, and mixed/nested values. [Cases](../cases/language/029-008-list-mutation-sample.case.json).
- [010-map.mini](010-map.mini): Use `map_new`, `map_set`, `map_get`, `map_has`, `map_length`, and `map_keys`; read replacement values, distinguish missing keys, and snapshot keys. [Cases](../cases/language/033-005-map-sample.case.json).
- [011-read-defaults.mini](011-read-defaults.mini): Use ordinary empty text and zero for unavailable reads, without null. [Cases](../cases/language/037-007-read-defaults-sample.case.json).
