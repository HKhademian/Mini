# mini for VS Code

`.mini` file support: theme-aware syntax highlighting, light/dark file icons,
brace, parenthesis, and double-quote pairing, live compiler diagnostics, hover
with `///` documentation, completion, go-to-definition, and document formatting.
The language picker shows **mini**. File icon themes can override the supplied
language icons. The build regenerates both supplied icons from the canonical
mini monogram in `brand/mini-mark.svg`.

Highlights `import`, `:=`, `fn`, `return`, `if`, `else`, `while`, function declarations
and calls, identifiers, double-quoted strings, integers, booleans, punctuation,
assignment, and the arithmetic, comparison, and boolean operators in the draft.
Strings shield their contents from other rules; backslash escapes receive a
separate scope. Line comments (`//`) and documentation comments (`///`) receive
separate comment scopes and shield their contents from code highlighting. A
header `//` or `import` can separate file docs from declaration docs;
declaration comments remain available to hover.

Highlighting follows the accepted forms in the language draft. It does not imply
compiler support. The accepted text escapes are `\"`, `\\`, `\n`, `\r`, and `\t`;
other escapes receive an invalid scope. The line-comment toggle uses `//`;
there is no block-comment toggle. Built-in names use ordinary call highlighting.

## Language server

The extension starts the standalone `mini-lang-server` and uses it for
diagnostics and whole-document formatting. Install the server from a mini source
distribution so `mini-lang-server` is on `PATH`, or set an explicit script path.

Settings:

- `mini.serverPath`: path to a `mini-lang-server` script. Empty (the default)
  runs `mini-lang-server` from `PATH`.
- `mini.nodePath`: Node executable used when `mini.serverPath` names a script.
  Defaults to `node`.

For a checkout, set `mini.serverPath` to the absolute path of
`bin/mini-lang-server`, for example:

```json
{
  "mini.serverPath": "/path/to/MiniLang/bin/mini-lang-server",
  "mini.nodePath": "node"
}
```

If the server cannot start, the extension reports the attempted command and
offers to open the setting.

Diagnostics update as you type, including unsaved and untitled documents.
Hover a function or variable to see its signature and `///` documentation.
Completion offers document declarations, common functions, and keywords.
Ctrl+click or **Go to Definition** jumps to a document function or variable
declaration. Formatting uses the same fixed style as `mini fmt`; enable
**Format On Save** or run **Format Document**. Invalid source is not reformatted.

## Install locally

From this directory, using the repository's Node 24.16.0:

```text
npm ci
npm run check
npm run build
node --test test/grammar.test.ts
node node_modules/@vscode/vsce/vsce package --no-dependencies --allow-missing-repository --skip-license --out mini-0.5.0-v0.3.8.vsix
```

In VS Code, open Extensions, choose **… → Install from VSIX…**, and select
`mini-0.5.0-v0.3.8.vsix`. Open a `.mini` file. If needed, select **Change Language Mode →
mini**. Nothing is published to the Marketplace; `mini-local` is a local
publisher identifier.

To preview from source, open this directory as the VS Code workspace and press
F5. The launch configuration opens an Extension Development Host with the
draft syntax sample. Use **Developer: Inspect Editor Tokens and Scopes** to inspect
theme colors and token scopes.

The focused checks use VS Code's TextMate tokenizer and Oniguruma engine.
Packaging excludes tests, development dependencies, and preview configuration.
CI runs these checks on Linux and macOS. The independent version is recorded in
`config/versions.json`, `package.json`, and `package-lock.json`; update them
together when editor behavior changes. `vscode-vGROUP-vPRODUCT` identifies extension releases. The package version is
the product version; the tag and VSIX filename include the group as well.
Tagged GitHub releases include an installable VSIX, the source archive, and
checksums. Local tagged packaging uses `mini release`; see `docs/releases.md`
in the repository. Build an untagged local VSIX with the command above.

Source contracts in the repository: `docs/language.md` and `docs/functions.md`.
Implementation references: [syntax highlighting](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide),
[language configuration](https://code.visualstudio.com/api/language-extensions/language-configuration-guide),
and [VSIX packaging](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
