# Showcase site

Sources for the public landing page and playground.

The build and serve scripts are handwritten TypeScript support code run directly
by Node, not compiler output; the compiler's generated JavaScript goes to
`dist/`.

## Local check

Build with Node after the generated tools exist, then serve the result:

```text
./bin/bootstrap
./site/build.ts
./site/serve.ts
```

Open <http://127.0.0.1:8080/> and <http://127.0.0.1:8080/playground/>. Use
`PORT=8090 ./site/serve.ts` when 8080 is taken. The server reads only
`dist/site/`, sets `no-store`, and has no other dependencies.

Output goes to `dist/site/`, which is ignored by Git. The build compiles and
runs the samples, emits `playground/compiler.js` from `dist/compile.js`, and is
deterministic. It writes nothing else. The header wordmark and favicon come from
[`brand/`](../brand/README.md).

Both pages show the full source revision, with the 12-character prefix in bold,
linked to its commit. `build.json` records the full commit and short revision.

Opening `dist/site/index.html` from `file://` shows the landing page, but the
playground needs an HTTP origin because it uses a module worker.

## Publishing to GitHub Pages

The site deploys from `.github/workflows/pages.yml` on pushes to `main` and by
manual dispatch. It runs only when the repository is public or a manual run is
requested.

1. Make the repository public: **Settings → General → Danger Zone → Change
   repository visibility → Make public**.
2. Enable Pages: **Settings → Pages → Build and deployment → Source → GitHub
   Actions**.
3. Push `main`, or run **Actions → Pages → Run workflow**.
4. The first deployment prints the URL, normally
   `https://OWNER.github.io/Mini/`.

All links and assets are relative, so the repository subpath works without a
build setting. A custom domain can be added later in the same Pages settings.

Before making the repository public, confirm the licence and that no secrets or
private references remain in the tree or history.

## Syntax highlighting

Code blocks are highlighted through the compiler's own lexer, not a duplicate
grammar. [`highlight.js`](highlight.js) maps lexer token kinds to CSS classes
(`tk-kw`, `tk-fn`, `tk-call`, `tk-str`, `tk-num`, `tk-com`, `tk-op`) and is
copied into `dist/site/` so the playground uses the same module as the build.
Invalid source falls back to escaped plain text, so a page never renders a
broken fragment. The build strips the compiler's CLI entry before loading it.

## Generated-code modes

The playground switches between two JavaScript views of the same program:

- **Program only** (default): generated JavaScript for the user's source,
  without expanded library files or host setup. It is for reading and is not
  runnable on its own.
- **Runtime + program**: the adapters and expanded libraries the program uses,
  then the program. This is what runs.

The views are compiled on demand. **Play** sits beside the Output tab and runs
the program; **Compile only** sits beside the JavaScript tab and updates the
generated view without running it. Switching views does not rerun or change the
selected panel. The build bundles `libs/` into
`playground/includes.js`, allowing examples to expand library includes in the
browser. Other filesystem access remains unavailable. A third, **Portable**
view is present but hidden. It appends the whole `libs/pure/reference.mini` so a
program depends on language semantics rather than host adapters. The build
expands that reference once into `playground/reference.js`. Keep Portable hidden
until a host-independent runtime is a supported product.

The footer reads compiler, language, and `play` product versions from the
registry. `play` is currently unassigned. Syntax highlighting ships as part of
the playground and has no independent version.
