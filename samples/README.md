# Samples

All samples compile and run with the generated compiler. Sources and JSON
cases stay separate.
Descriptions name the main features and built-ins; case links verify output.
Sources use `///` for file/function documentation and `//` for implementation notes.

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
- [006-list.mini](006-list.mini): Read command-line arguments as a list, print its length, and visit each item with `list_get`. [Cases](../cases/language/024-003-list-sample.case.json).
- [007-exit.mini](007-exit.mini): Use `process_exit` when an argument is missing. [Cases](../cases/language/025-004-process-exit-sample.case.json).
- [008-diagnostic.mini](008-diagnostic.mini): Use `write_error` before an unsuccessful exit. [Cases](../cases/language/026-003-write-error-sample.case.json).
- [009-list-mutation.mini](009-list-mutation.mini): Use `list_new` and `list_set` for growth, replacement, negative indices, and mixed/nested values. [Cases](../cases/language/029-008-list-mutation-sample.case.json).
- [010-map.mini](010-map.mini): Use `map_new`, `map_set`, `map_get`, `map_has`, and `map_keys`; count the key list with `list_length`, read replacement values, distinguish missing keys, and snapshot keys. [Cases](../cases/language/033-005-map-sample.case.json).
- [011-read-defaults.mini](011-read-defaults.mini): Use `text_get`, `list_get`, and `map_get` defaults, read gaps as zero, and use a negative list index, without null. [Cases](../cases/language/037-007-read-defaults-sample.case.json).
- [012-comments.mini](012-comments.mini): Document a function with `///` and explain implementation choices with `//`, both alone and after code. [Case](../cases/language/039-002-comments-sample.case.json).
- [013-text-slice.mini](013-text-slice.mini): Read text and print slices with clamping, negative bounds, and an empty reversed range. [Cases](../cases/language/041-005-text-slice-sample.case.json).
- [014-text-find.mini](014-text-find.mini): Read text and report whether it contains two sample words. [Cases](../cases/language/042-005-text-find-sample.case.json).
- [015-text-split.mini](015-text-split.mini): Read comma-separated text and print each field on its own line. [Cases](../cases/language/043-005-text-split-sample.case.json).
- [016-map-copy.mini](016-map-copy.mini): Copy a map and show that changing the copy leaves the original intact. [Cases](../cases/language/044-004-map-copy-sample.case.json).
- [017-list-copy.mini](017-list-copy.mini): Copy a list and show that changing the copy leaves the original intact. [Cases](../cases/language/045-004-list-copy-sample.case.json).
- [018-list-join.mini](018-list-join.mini): Build a list with `list_of` and join its words with `list_join`. [Cases](../cases/language/046-004-list-join-sample.case.json).
- [019-number-to-text.mini](019-number-to-text.mini): Print canonical decimal text for zero, a positive number, and a negative number. [Cases](../cases/language/047-003-number-to-text-sample.case.json).
- [020-json-to-text.mini](020-json-to-text.mini): Build a map and print compact deterministic JSON text. [Cases](../cases/language/048-004-json-to-text-sample.case.json).
- [021-shebang.mini](021-shebang.mini): Use a first-line shebang header and print a line. [Cases](../cases/language/049-004-shebang-sample.case.json).
- [022-process-run.mini](022-process-run.mini): Run Node once, capture its output and status, and print them. [Cases](../cases/language/049-004-process-run-sample.case.json).
- [023-host-files.mini](023-host-files.mini): Write a note in a fresh temporary directory, read it back, and clean up. [Cases](../cases/language/050-003-host-files-sample.case.json).
- [024-json-read.mini](024-json-read.mini): Parse standard-input JSON and print its name field. [Cases](../cases/language/051-003-json-read-sample.case.json).

## Showcase samples

The curated online-playground samples live in [showcase/](showcase/). Each one
has a matching case under [cases/showcase/](../cases/showcase/) and runs in
`mini test`; the site catalog is generated from the same files, so a sample
cannot drift from its verified output.

- [breakout-board.mini](showcase/breakout-board.mini): Animate a bouncing ball and move the paddle on a ten-by-ten pixel board. [Case](../cases/showcase/breakout-board.case.json).
- [frogger-board.mini](showcase/frogger-board.mini): Move Frogger between animated road and river lanes on a ten-by-ten pixel board. [Case](../cases/showcase/frogger-board.case.json).
