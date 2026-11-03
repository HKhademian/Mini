# Mini for VS Code

Basic `.mini` file support: theme-aware syntax highlighting, light/dark M file
icons, and brace, parenthesis, and double-quote pairing. The language picker
shows **Mini**. File icon themes can override the supplied language icons.

Highlights `var`, `fn`, `return`, `if`, `else`, `while`, function declarations
and calls, identifiers, double-quoted strings, integers, booleans, punctuation,
assignment, and the arithmetic, comparison, and boolean operators in the draft.
Strings shield their contents from other rules; backslash escapes receive a
separate scope.

Highlighting follows the draft examples, including proposed expressions.
It does not select lexical rules or imply compiler support. String, escape,
number, and expression rules remain provisional. Comment syntax has not been
selected, so there is no comment highlighting or comment toggle yet. Candidate
built-in names are colored like ordinary calls.

This is a declarative TextMate extension with no runtime dependencies or
language server. It provides no diagnostics, completion, formatter, or runner.

## Install locally

From this directory, using the repository's Node 24.16.0:

```text
npm ci
node --test test/grammar.test.ts
./node_modules/.bin/vsce package --no-dependencies --allow-missing-repository --skip-license --out mini-0.1.0.vsix
```

In VS Code, open Extensions, choose **… → Install from VSIX…**, and select
`mini-0.1.0.vsix`. Open a `.mini` file. If needed, select **Change Language Mode →
Mini**. Nothing is published to the Marketplace; `mini-local` is a local
publisher identifier.

To preview from source, open this directory as the VS Code workspace and press
F5. The launch configuration opens an Extension Development Host with the
draft syntax sample. Use **Developer: Inspect Editor Tokens and Scopes** to inspect
theme colors and token scopes.

The focused checks use VS Code's TextMate tokenizer and Oniguruma engine.
Packaging excludes tests, development dependencies, and preview configuration.

Source contracts in the repository: `docs/language.md` and `docs/builtins.md`.
Implementation references: [syntax highlighting](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide),
[language configuration](https://code.visualstudio.com/api/language-extensions/language-configuration-guide),
and [VSIX packaging](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
