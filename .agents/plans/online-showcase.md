---
name: online-showcase
status: proposed
created: 2026-11-04
todos:
  - id: phase-1-landing
    content: "Phase 1 — Build the static landing page with real sample output"
    status: pending
  - id: phase-2-pages
    content: "Phase 2 — Deploy the site to GitHub Pages under the repository path"
    status: pending
  - id: phase-3-docs
    content: "Phase 3 — Decide and add the documentation surface"
    status: pending
  - id: phase-4-browser-spike
    content: "Phase 4 — Spike a browser build of the compiler"
    status: pending
  - id: phase-5-playground
    content: "Phase 5 — Ship the in-browser playground"
    status: pending
plans:
  requires: []
  blocks: []
  parallel: []
---

# Online showcase

## Mission

Give Mini a public surface comparable to [c3-lang.org](https://c3-lang.org/) and
[salamlang.github.io/Salam](https://salamlang.github.io/Salam/): a landing page
that shows the language and its real output, documentation navigation, and an
in-browser playground where a visitor can edit and run Mini without installing
anything.

This plan covers the site only. It does not change language or compiler scope.

## Current state

- README, `docs/`, `samples/`, and a working source distribution exist; there is
  no site, no Pages workflow, and the repository is private.
- `docs/versioning.md` records playground delivery as undecided and `site` is not
  a registered product.
- The compiler emits plain JavaScript and the CLI is Node-coupled through file,
  process, and `Buffer` use. The tokenizer and emitter cores are portable.

## Decisions already made

- Host on GitHub Pages under the repository subpath, in the style of Salam's
  `/Salam/` site. A custom domain comes later, if at all.
- Ship the static showcase before attempting the browser playground.
- Plan the milestone before implementation, in this file.

## Non-goals

- No marketing claims beyond what [why-mini.md](../../docs/why-mini.md) already
  states; no benchmark leaderboard, no AI assistant, no community chat.
- No analytics, accounts, telemetry, or server process in phase 1.
- No documentation rewrite. The site presents existing docs; it does not become
  a second source of truth.
- No new language syntax for the playground. The playground compiles the accepted
  language; it does not extend it.

## Architecture

### Sources and output

```text
site/            hand-authored template, styles, assets, sample list
site/build.ts    direct Node TypeScript build; not a shipped Mini tool
dist/site/       generated site, ignored by Git and uploaded by Pages
```

`site/build.ts` runs with Node only and is not added to the tool manifest, so it
creates no product version stream. If it later becomes a user-facing command, it
moves to Mini and registers a `site` stream together with its version, cases, and
release selector.

The build is deterministic: the same inputs produce byte-identical output. It
fails on missing samples, unknown placeholders, or a sample that does not compile
or run, instead of emitting a broken page.

### Sample output

Landing samples are generated, not copied by hand. The build compiles a curated
list of `samples/*.mini` with the active compiler, runs the result with fixed
standard input, and embeds the source and captured output. A sample that needs
arguments, files, or processes is excluded.

### Assets and layout

Reuse the VS Code mark ([editors/vscode/icons/mini-light.svg](../../editors/vscode/icons/mini-light.svg)).
One page, sections in this order: hero with one-sentence purpose and install
command; "what it is" drawn from `docs/why-mini.md`; two or three sample tabs
with output; the fixed-point/self-hosting explanation; links to docs, samples,
and releases; footer with the Apache-2.0 license. Light and dark themes; no
fonts or scripts from third parties.

All internal links are relative so the site works under both `/` and `/Mini/`.

## Phases

### Phase 1 — Landing page

Deliver `site/` and `site/build.ts`, producing `dist/site/index.html` plus
assets. Include the install command from [getting-started.md](../../docs/getting-started.md)
and generated sample output.

**Verify:** `./bin/mini check`; `node site/build.ts` twice and compare output;
`./bin/mini run` matches each embedded sample output; every internal link
resolves; open `dist/site/index.html` from the filesystem and check light/dark.

### Phase 2 — GitHub Pages

Add `.github/workflows/pages.yml`: check out, bootstrap, install locked
development dependencies, run checks, build the site, upload `dist/site` with
`actions/upload-pages-artifact`, deploy with `actions/deploy-pages`. Permissions:
`contents: read`, `pages: write`, `id-token: write`; one concurrency group.

Repository settings must enable Pages with "GitHub Actions" as the source. The
site is only reachable when the repository is public, so this phase can land
before that. The workflow does not publish a release and does not touch tags.

**Verify:** workflow succeeds on a branch push; the deployed `/Mini/` URL serves
the page and assets; no absolute `/`-rooted asset or link is broken.

### Phase 3 — Documentation surface

Choose one:

1. Link the landing page to the docs rendered by GitHub. Cheapest, no duplicate
   content, but leaves the site without navigation.
2. Render a controlled Markdown subset in `site/build.ts` (headings, paragraphs,
   lists, fences, inline code, links, tables) and fail on any unsupported
   construct. Keeps one source, costs a renderer and its tests.
3. Adopt a static-site generator or Markdown dependency. Fastest for rich docs,
   adds a build dependency and a second configuration to maintain.

Recommendation: option 1 for the first public launch, then option 2 for the
pages that need site navigation. Record the choice here before implementing.

### Phase 4 — Browser compiler spike

A time-boxed spike, not a commitment. Questions to answer:

- Can the tokenizer/emitter run as a browser ES module with `node:fs`,
  `process`, and `Buffer` shimmed? The compiler entry calls `main()` on load, so
  the bundle needs an entry that appends `export { tokenize, compile, ... }` to
  the generated module, or a new Mini entry without the CLI.
- Do lexer/parser failures reach a catchable path, or do they call
  `process_exit`? The shim must turn diagnostics into thrown values the UI can
  render.
- Can emitted programs run with `node:fs` aliased to a `writeSync` shim that
  writes to an output pane, in a Web Worker with a timeout?
- Which builtins are unavailable (files, processes, network, time) and how does
  the UI say so?

The spike is successful only if a visitor can edit, compile, and run at least
bindings, control flow, functions, text, and lists with correct diagnostics, in
a browser, from a bundle built by the repository.

**Verify:** a checked-in sample program produces the same output in the browser
as `./bin/mini run`; a syntax error shows the compiler's line and message; an
unsupported builtin fails with a clear message, not a blank page.

### Phase 5 — Playground

If the spike succeeds, add the editor page: textarea or CodeMirror-free editor,
Run/Reset, output pane, error pane, sample picker, and a worker isolation
boundary. No file persistence, no sharing links, no server execution. State the
limits on the page.

Register the `play`/`site` product only when it becomes a released command; the
playground pins the compiler and language versions it was built from and shows
them.

## Risks

- **Markdown duplication** if Phase 3 renders docs. Mitigate by rendering from
  `docs/*.md` at build time and failing on unsupported syntax.
- **Browser incompatibility**: `Buffer`, `process.getBuiltinModule`, includes,
  and file builtins are the likely blockers. Isolate them in shims and keep the
  playground scope explicit.
- **Supply chain**: a bundler or Markdown package added for the site becomes a
  build dependency. Pin it in the root lockfile and keep it out of the shipped
  distribution.
- **Pages base path**: absolute URLs break under `/Mini/`. Use relative links and
  test the deployed path, not only localhost.
- **Scope creep**: the playground can absorb weeks. Phases 1–2 must ship first.
- **Private repository**: Pages is only public once the repository is. Do not
  promise a URL before then.

## Open decisions

1. Documentation rendering: option 1, 2, or 3 above.
2. Whether `site/build.ts` stays a TypeScript build script or becomes a Mini tool.
3. Playground entry: appended exports to the generated compiler or a new Mini
   entry that exposes a compile function.
4. Bundler: add `esbuild` as a root development dependency, or reuse the editor's
   locked copy.
5. Whether the playground ships in the first public release or after it.

## References

- [C3 site](https://c3-lang.org/) and [C3 playground](https://play.c3-lang.org/)
- [Salam site](https://salamlang.github.io/Salam/) and [Salam editor](https://editor.salamlang.ir)
- [runtime requirements](../../docs/runtime.md)
- [why Mini exists](../../docs/why-mini.md)
- [getting started](../../docs/getting-started.md)
- [tooling direction](../../docs/tooling.md)
