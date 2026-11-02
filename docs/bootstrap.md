# Bootstrap

[config/bootstrap.json](../config/bootstrap.json) is `null` until a real
compiler exists. `./bin/mini verify` fails clearly in that state.

Compiler interface: `mini-compile < source.mini > program.ts`.
The generated compiler runs as `node COMPILER.ts`, reads complete source from
stdin, and emits self-contained TypeScript to stdout. Node built-ins are
available. Handwritten compiler helpers must not be required.

At first promotion, assign language/compiler/bootstrap versions and configure:

```json
{
  "compiler": "bootstrap/compiler.ts",
  "source": "compiler/compiler.mini",
  "example": "cases/examples/hello.case.json"
}
```

These are illustrative paths. The example uses the [case format](cases.md):
Mini source and each input/output stream remain separate files.

The verifier copies the shipped compiler into an isolated directory, rebuilds
three generations, and requires each to equal the shipped compiler byte for
byte. It uses the last generation to compile and run every example scenario,
checking stdout, stderr, and exit status. Release metadata records source,
compiler, generation, example, and stream identities.

After replacement, compiler behavior lives in Mini. Regenerate the bootstrap;
never hand-edit it. Implement new syntax using old syntax first, promote that
compiler, then adopt the syntax in a separate atomic commit. Record the prior
builder tag/commit in release notes.

Harness tests use synthetic reproducing programs. They test the verifier,
not actual Mini self-hosting.
