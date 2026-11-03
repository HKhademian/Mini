# Build your language from mini

Start with mini's compiler source and verified generated bootstrap. Change the
language in small increments, rewriting the compiler to match as you go. Each
completed increment ships a compiler that can compile its own current source.
Supporting tools can remain TypeScript.

This is mini's main use. T0 is being implemented in [small increments](compiler.md); the
workflow below describes how to use that foundation once available.

## Change syntax without keeping both forms

Suppose S1 uses `if cond then code endif` and your target S2 uses
`if (cond) { code }`. These forms illustrate a migration, not selected grammar.

Keep C1, the verified S1 compiler, as the active bootstrap while preparing the
change. Work with temporary copies so it stays paired with its original source.

1. Write the new compiler implementation using S1. Change its parser to accept
   S2 and reject S1. C1 can compile this source because its program syntax is
   still S1; the syntax its parser accepts is a separate concern.
2. Compile it with C1 to produce C2. C2 is a temporary migration compiler. It
   accepts S2 but cannot compile its own S1 source yet.
3. Rewrite that same compiler implementation in S2. Preserve its behavior;
   also migrate any Mini library code it uses and its ordinary example.
4. Compile the S2 source with C2 to produce C3. Rebuild the unchanged S2 source
   with C3 and then C4, producing C4 and C5.

In a temporary migration directory, the build sequence is:

```text
node C1.ts compile compiler-v2-s1.mini C2.ts
node C2.ts compile compiler-v2-s2.mini C3.ts
node C3.ts compile compiler-v2-s2.mini C4.ts
node C4.ts compile compiler-v2-s2.mini C5.ts
```

Require C3, C4, and C5 to be byte-identical. C2 need not equal C3 because they
were built from different source forms. Compile and run the ordinary example
with the resulting compiler, and run the focused language cases.

## Promote a complete increment

Promote C3 together with its S2 source only after verification. Update
[bootstrap configuration](bootstrap.md), cases, affected examples, and
[component versions](versioning.md). Record the prior bootstrap and migration
source/artifact identities in the release notes.

Bridge creation, source conversion, and final bootstrap promotion form one
atomic migration. C2 alone is not a completed self-hosting milestone. Keep C1
active until the verified replacement pair is ready.

Use separate [JSON cases](cases.md) for accepted S2 programs and rejected S1
forms. Then run the project checks and `mini verify` against the promoted pair.
Same-source fixed-point equality applies within each completed version;
generated output may change between versions.

## Smaller compatible steps

You can instead temporarily accept both forms. When each intermediate compiler
can compile its own source, support and source adoption can be separate atomic
commits. Remove old acceptance after migrating maintained consumers.

Choose the route with the simplest compiler and manageable changes. Neither
permanent legacy syntax nor a general translation framework is required.
