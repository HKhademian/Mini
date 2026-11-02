# MiniLang

MiniLang exists to reach self-hosting with the smallest practical, readable,
expandable, maintainable language and compiler. Its first deliverable is a small
bootstrap foundation that other people can clone to develop their own languages
while remaining self-hosted from the beginning. This is its primary purpose;
broad general-purpose programming is outside MiniLang's objective.

Self-hosting is the first milestone. Language maturity comes afterward.

This document records the project direction. No grammar or compiler has been
implemented yet. “Smallest” is an engineering goal, not a claim of a proven
absolute minimum.

## The first deliverable

The initial package needs only:

- A tiny language sufficient to express its own compiler.
- That compiler's source, written entirely in the tiny language.
- A runnable generated compiler, used as the bootstrap.
- A short, reproducible way to rebuild and check it.
- A small example tool showing that the compiler compiles more than itself.

The compiler receives source and emits a runnable program. For the initial
direction, that program is readable TypeScript executed by Node. Native binary
output is unnecessary for the first milestone.

Node remains a runtime dependency. Self-hosting here means that MiniLang's
compiler is written in MiniLang and compiles itself; it does not require writing
a new runtime or eliminating Node.

## Initial implementation direction

Use a small handwritten, strongly typed TypeScript compiler to get started.
Use a Node version that can execute the required TypeScript directly. Select
and verify that version when implementation begins.

Emit readable TypeScript with predictable formatting. Keep the translation
direct enough that a person can understand the relationship between source and
output. Avoid build machinery, dependencies, intermediate representations, or
compiler layers unless the self-hosting implementation actually needs them.

Choose familiar syntax that makes the compiler small and easy to change.
MiniLang does not inherit LiteScript's syntax or feature set. Strong typing of
the handwritten TypeScript implementation does not, by itself, require adding
a type checker or an elaborate type system to MiniLang.

The exact syntax, value model, compiler structure, and small set of runtime
operations remain to be chosen through implementation. They should be driven
by the compiler's actual needs.

## What counts as self-hosting

For one unchanged MiniLang compiler source `S`:

```text
Compiler1 = Compiler0(S)
Compiler2 = Compiler1(S)
Compiler3 = Compiler2(S)
```

`Compiler0` is the handwritten TypeScript implementation. There is no
requirement for its own code to equal any generated compiler.

The first release gate is:

1. Each generated compiler runs on the chosen runtime.
2. Each compiles the complete compiler source without help from Compiler0.
3. Compiler1, Compiler2, and Compiler3 are byte-for-byte identical generated
   artifacts, including any required runtime support.
4. The generated compiler also compiles and runs the small example tool.

Keep output deterministic: no timestamps, random identifiers, or machine-local
paths in generated artifacts. Compare actual files; successful compilation
alone does not establish equality.

This checks a compilation fixed point for the compiler source. It does not
prove correctness for every program. The same-source equality applies within
one compiler version; an intentional compiler change may change its output.

## Replace the handwritten bootstrap

Once the first release gate passes, promote the verified generated compiler to
the distributed bootstrap. A fresh checkout must rebuild using that artifact
and the documented runtime, without the handwritten compiler.

Remove Compiler0 from the active build and bootstrap path. Historical source
may remain in version history; it must not remain a required tool or a fallback.
The generated bootstrap must contain all MiniLang-specific compiler logic it
needs. Calling back into a handwritten compiler does not complete replacement.

The bootstrap artifact and its corresponding MiniLang source must stay
together so that the shipped bootstrap can reproduce itself.

## Grow while staying self-hosted

Every improvement is a small increment:

1. Use the current generated bootstrap to compile the revised compiler source.
2. Use the resulting compiler to rebuild the same revised source twice more.
3. Check the generated artifacts for equality and run a small example relevant
   to the change.
4. Promote the verified generated compiler to the next bootstrap and ship it
   with the corresponding source.

When introducing syntax, first implement support using syntax the current
bootstrap already accepts. Promote that compiler before rewriting the compiler
source to use the new syntax. Keep each increment small enough to inspect and
refactor the compiler to match the language as it evolves.

Do not revive the handwritten compiler to get past a difficult migration.
Cloned language projects follow the same process with their own source and
generated bootstrap.

## Keep the initial scope tiny

Add a language feature only when a concrete part of the self-hosting compiler
needs it and a simpler implementation would not serve the goal better. Prefer
less compiler code and fewer rules over saving a few characters of syntax.

The initial implementation handles the known compiler source and a small,
documented input subset. Advanced mathematics, Unicode support, optimization,
rich diagnostics, extensive invalid-input handling, additional safety systems,
and speculative edge cases are outside the first milestone. Incidental host
runtime behavior is acceptable where no language behavior needs to be defined.

The small rebuild-and-equality check is necessary evidence for the project's
central promise. It should remain small too.

## Supporting tools

The features needed to compile the compiler may already be enough to write
other tools in MiniLang. Such tools can be written in MiniLang from the
beginning wherever the existing feature set supports them.

Other tooling can be written in TypeScript. Keep that code small, readable,
and straightforward to replace incrementally with MiniLang as the language
allows. A TypeScript tool does not create a requirement to expand MiniLang
just to port it immediately.

Replacing the handwritten compiler bootstrap is required for the self-hosting
milestone. Replacing every supporting TypeScript tool is not. Supporting tools
must not retain compiler logic that the self-hosted compiler depends on to
compile itself.

## First implementation sequence

1. Sketch the compiler's simplest source-scanning and output-writing algorithm.
2. Derive only the syntax and runtime operations that algorithm needs.
3. Implement the minimal TypeScript bootstrap and port the compiler to MiniLang
   immediately, adding only what prevents the port from compiling itself.
4. Reach the fixed point, verify the example tool, and replace the bootstrap.
5. Publish the tiny self-hosted foundation before expanding the language.

Until that sequence is implemented and verified, self-hosting remains a goal,
not a completed capability.
