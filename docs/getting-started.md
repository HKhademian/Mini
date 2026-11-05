# Getting started

mini ships as a source distribution that runs on Node without installed
packages. You need Node.js 22.18.0 or newer (`node -v`); see
[runtime requirements](runtime.md).

## Get a distribution

Download `minilang-TAG.tar.gz` from a release, or build a local snapshot with
`./bin/mini release dist/release` in a checkout. Extract it into an empty
directory:

```text
mkdir mini
tar -xzf minilang-TAG.tar.gz -C mini
cd mini
```

The archive root is the distribution: `bin/`, `dist/`, `docs/`, `libs/`, and
`tools/` sit at the top level. Do not extract over an existing checkout.

## Verify the download

The release places `SHA256SUMS` beside the archive. From the directory that
contains the downloaded files:

```text
sha256sum -c SHA256SUMS       # Linux
shasum -a 256 -c SHA256SUMS   # macOS
```

Every listed asset must report `OK` before you extract it.

## Check the install

```text
./bin/mini --version
./bin/mini check --docs
```

`check --docs` validates versions, documentation, cases, and the bootstrap
without `npm install`. It prints nothing per file and ends with
`Repository checks and bootstrap fixed point passed.`

## First program

Create `hello.mini`:

```text
/// Return a greeting line.
fn greeting(name) {
    return "hello, " + name + "\n";
}
io_write(greeting("mini"));
```

Then check and run it:

```text
./bin/mini check hello.mini
./bin/mini run hello.mini
```

`check` prints nothing and exits 0 for valid source; `run` prints:

```text
hello, mini
```

`mini run` compiles to a temporary module and executes it with Node, forwarding
program arguments and standard streams.

## Compile it

```text
./bin/mini compile hello.mini
node hello.mini.js
```

`compile` writes `hello.mini.js` by default; an explicit output path overrides
it. The result is plain JavaScript, not TypeScript. Generated `.mini.js` files
are ignored by Git.

## Next steps

- Read [why mini exists](why-mini.md) before choosing it as a foundation.
- Browse [samples](../samples/README.md) and the [language draft](language.md).
- To grow your own language, follow [language evolution](evolving-language.md).
- For repository work, install the locked development dependencies and rebuild
  the generated tools:

  ```text
  npm ci
  ./bin/bootstrap
  ./bin/mini check
  ./bin/mini test
  ```

`dist/` and generated `bin/` commands are ignored by Git; [bin/bootstrap](../bin/bootstrap)
is the only tracked executable under `bin/`. See [contributing](../CONTRIBUTING.md)
and [releases](releases.md).
