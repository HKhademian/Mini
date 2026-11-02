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
- Keep new feature support and later adoption in compiler source separately
  reviewable, with a working bootstrap between them.
- Do not amend others' commits or rewrite published history. Create and push
  release tags only when the user authorizes that release.

Example: a compiler fix, its regression case, and its contract update belong
together; an unrelated CI improvement belongs in a separate commit.
