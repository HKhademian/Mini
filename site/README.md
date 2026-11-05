# Showcase site

Sources for the public landing page and playground.

## Local check

Build with Node after the generated tools exist, then serve the result:

```text
./bin/bootstrap
node site/build.ts
node site/serve.ts
```

Open <http://127.0.0.1:8080/> and <http://127.0.0.1:8080/playground/>. Use
`PORT=8090 node site/serve.ts` when 8080 is taken. The server reads only
`dist/site/`, sets `no-store`, and has no other dependencies.

Output goes to `dist/site/`, which is ignored by Git. The build compiles and
runs the samples, emits `playground/compiler.js` from `dist/compile.js`, and is
deterministic. It writes nothing else. The header wordmark and favicon come from
[`brand/`](../brand/README.md).

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
