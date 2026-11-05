# Showcase site

Sources for the public landing page. Build with Node after the generated tools
exist:

```text
./bin/bootstrap
node site/build.ts
```

Output goes to `dist/site/`, which is ignored by Git. The build compiles and
runs the samples during the build, so the page always shows real output. It
writes nothing else and is deterministic.

The build also emits `dist/site/playground/` from `site/playground/` and the
generated compiler. Web Workers require an HTTP origin, so serve `dist/site`
(for example with any static server) instead of opening the playground from
`file://`.
