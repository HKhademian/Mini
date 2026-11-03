# Samples

[001-bindings.mini](001-bindings.mini) declares text and numeric bindings and
updates a cursor. It needs no input and produces no output. Its
[case](../cases/language/003-002-bindings-sample.case.json) will check compilation and
execution when the compiler is available; it is currently pending.

[002-expressions.mini](002-expressions.mini) illustrates arithmetic,
comparisons, booleans, and text concatenation without I/O. Its
[case](../cases/language/expressions-sample.case.json) is pending compiler support.

[003-io.mini](003-io.mini) copies input to output using text I/O
operations. Its [case](../cases/language/005-002-io-sample.case.json) covers empty text,
a word, and multiline input, pending compiler support.

[004-text.mini](004-text.mini) scans input and replaces tabs and newline characters
with spaces. Its [case](../cases/language/text-sample.case.json) combines text
access, functions, loops, and branches, pending compiler support.

[005-file.mini](005-file.mini) copies a text file and prints the copied content.
Its [case](../cases/language/file-sample.case.json) covers creation, replacement,
and newline preservation, pending compiler support.

[006-list.mini](006-list.mini) passes the argument list to a function and prints
its elements in order, separated by `|`. Its
[case](../cases/language/list-sample.case.json) covers no arguments, ordinary
values, and empty/space-containing values, pending compiler support.

[007-exit.mini](007-exit.mini) prints the first argument or terminates with
status 2 when none is supplied. Its
[case](../cases/language/process-exit-sample.case.json) combines termination,
functions, and list access, pending compiler support.

[008-diagnostic.mini](008-diagnostic.mini) reports a missing argument to stderr
and exits with status 2; otherwise it prints the argument. Its
[case](../cases/language/write-error-sample.case.json) combines diagnostics,
termination, and list access, pending diagnostic-output approval and compiler
support.
