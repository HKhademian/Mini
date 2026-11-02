# Bootstrap

[config/bootstrap.json](../config/bootstrap.json) is `null` until a real
compiler exists. `./bin/mini verify` fails clearly in that state.

The self-hosting requirement applies only to `mini-compile` / `minic` and the
generated compiler. Other tools may remain TypeScript indefinitely, including
the `mini` dispatcher and the verification/release harness. They are development
utilities, not prerequisites for running the generated compiler on Node.

Delivery uses compilation, not a runner:

```text
mini compile compiler.mini
node compiler.ts compile compiler.mini
```

Both write `compiler.ts` by default. An optional final argument selects another
output path. `mini-compile` and `minic` are aliases for `mini compile`.
The generated compiler implements the same `compile SOURCE.mini [OUTPUT.ts]`
interface and writes self-contained TypeScript. Node built-ins are available;
handwritten compiler helpers must not be required.

Primitive host I/O is allowed through [built-ins](builtins.md). These adapters
must not contain Mini parsing or compilation logic. Any library code used by
the compiler must be included in its source/build and generated bootstrap;
it must not introduce another prerequisite tool or package.

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

The verifier copies the shipped compiler and Mini source into an isolated
directory, invokes `node PREVIOUS.ts compile compiler.mini NEXT.ts` three times,
and requires each output file to equal the shipped compiler byte for byte.
It uses the last generation to compile and run every example scenario,
checking stdout, stderr, and exit status. Release metadata records source,
compiler, generation, example, and stream identities.

After replacement, compiler behavior lives in Mini. Regenerate the bootstrap;
never hand-edit it. Implement new syntax using old syntax first, promote that
compiler, then adopt the syntax in a separate atomic commit. Record the prior
builder tag/commit in release notes.

## Syntax migration

Keep enough language expressiveness for a readable, maintainable compiler.
Choose changes by their total implementation and migration cost, not by
construct count alone. Avoid both compiler contortions and elaborate language
machinery.

For example, a clone might move from `if cond then code endif` to
`if (cond) { code }`. This illustrates a migration, not selected Mini grammar:

1. Add parenthesized conditions while retaining the old form. Implement support
   using current syntax, generate the next bootstrap, and verify it.
2. Refactor the compiler source to use the new condition form; rebuild and verify.
3. Add braced blocks alongside the old block form. Generate and verify that
   bootstrap, then migrate compiler blocks in a separate increment.
4. Once compiler source and maintained consumers use the target form, remove
   legacy acceptance and verify the next bootstrap. Record the compatibility break.

Keep conditional behavior unchanged in this syntax-only example. At each
increment, check focused cases, the same-source fixed point, and the ordinary
example. Output may change between compiler versions; successive generations
for the same version must still match.

Keep each bridge local and temporary. No general syntax-translation framework
is required. Supporting new syntax and adopting it remain separate atomic commits.

Harness tests use synthetic reproducing programs. They test the verifier,
not actual Mini self-hosting.
