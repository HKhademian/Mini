# mini

Build your own language from a working, self-hosted compiler.

mini is a small language and compiler foundation for people who want to shape a
language around their own needs. Its compiler is written in mini, compiles to
readable JavaScript, and verifies that it can rebuild itself after changes.

## Try it

The browser playground is published through GitHub Pages for this repository. It lets you edit and run mini programs without installing anything.

To run mini locally, use Node.js 22.18.0 or newer:

```text
git clone <repository-url>
cd Mini
./bin/bootstrap
./bin/mini run samples/lists/018-list-join.mini
```

The sample builds a list and prints `one | two | three`. The compiler and
runtime use Node's built-in modules; no packages are needed to run the generated
tools.

## What you get

- A compiler written in mini that generates readable JavaScript and C11.
- A command-line tool to check, format, compile, run, and test programs.
- A browser playground with runnable examples and generated JavaScript.
- A self-hosting check that verifies successive compiler generations match.
- A focused language with functions, control flow, text, lists, maps, and JSON.

mini is alpha software, intended as a foundation to extend rather than a
general-purpose application language. Read [why mini](docs/why-mini.md) for its
goals and tradeoffs.

## Learn more

- [Getting started](docs/getting-started.md): install a release and run a program.
- [Language draft](docs/language.md): current syntax and built-in contracts.
- [Samples](samples/README.md): small programs with expected results.
- [Growing a language](docs/evolving-language.md): add features while preserving self-hosting.
- [Compiler reference](docs/compiler.md): compiler commands and generated output.
- [C target and embedding](docs/c-target-and-embedding.md): initial C output and
  the native bootstrap and path to a mini-written script runner.
- [Releases](docs/releases.md): artifacts and verification.
- [VS Code support](editors/vscode/README.md): syntax support and language server.

For repository development, see [contributing](CONTRIBUTING.md). mini is
licensed under [Apache-2.0](LICENSE).
