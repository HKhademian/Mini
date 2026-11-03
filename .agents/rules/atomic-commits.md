# Atomic commits

- Always keep changes in atomic commits, including documentation and generated
  artifacts. One commit serves one coherent purpose.
- Include the related source, focused checks, and documentation needed to make
  that change complete. Split unrelated fixes, refactors, and release preparation.
- Inspect the diff and run checks appropriate to the change before committing.
  Documentation changes need link and consistency checks, not compiler tests.
- Stage explicit owned paths or hunks. Preserve unrelated and concurrent work.
- Commit a completed unit before moving to independent work. Report commit IDs
  and checks. If committing is blocked, report the exact uncommitted scope.
- Separate support and source adoption commits when each stays self-hosted.
  For breaking syntax, complete the temporary bridge, source conversion, and
  verified bootstrap promotion in one atomic migration. See
  [language evolution](../../docs/evolving-language.md).
- Tag every verified component version on its atomic commit before the next
  feature. Use annotated PRODUCT-vGROUP-vPRODUCT_VERSION tags. Product versions
  continue across groups; never reset their counters. Never move or reuse published
  tags. Do not amend others' commits or rewrite published history. Push release
  tags only when publishing is authorized.

Example: a compiler fix, its regression case, and its contract update belong
together; an unrelated CI improvement belongs in a separate commit.
