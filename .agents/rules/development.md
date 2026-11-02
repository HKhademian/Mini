# Development guidance

- MiniLang is a tiny bootstrap foundation for other language projects. Add only
  what its self-hosting compiler needs.
- Keep code short, readable, direct, and easy to port. Avoid speculative layers,
  dependencies, edge-case handling, and safety systems.
- Before self-hosting, keep the handwritten TypeScript compiler minimal and port
  it to MiniLang immediately. After replacement, implement compiler behavior in
  MiniLang and regenerate the bootstrap; never hand-edit generated compiler code.
- TypeScript supporting tools are allowed. Keep them straightforward to replace
  incrementally; they must not hide compiler logic needed for self-hosting.
- Preserve the fixed point and ordinary example when changing compiler code or
  its generated bootstrap. Implement syntax support before adopting it in the
  compiler source. Never revive the handwritten compiler to bypass a migration.
- Use focused checks for actual behavior. Do not add a large test matrix or
  invent language semantics solely to satisfy tooling.
- Keep docs accurate about implemented, proposed, and unavailable capabilities.
  Document usage, runtime requirements, and changed contracts with the code.
- Once available, use the repository's documented check, test, bootstrap, and
  packaging commands. Record failures and unavailable gates honestly.
- Keep component versions independent. Leave unimplemented components unassigned;
  never imply that adding release automation makes the compiler self-hosted.
- Treat generated releases and published tags as immutable. Corrections need a
  new version. Verify the exact source and artifact identities before packaging.

- Keep code, docs, comments, commits, and chat messages concise, clear, and direct.
- Keep this project self-contained; do not reference the predecessor project.
