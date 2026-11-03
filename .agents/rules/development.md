# Development guidance

- mini is a tiny bootstrap foundation for other language projects. Minimize
  combined language/compiler complexity, not construct count. Keep enough
  expressiveness for readable compiler code and small self-hosted migrations.
- Weigh concrete readability and migration benefits against implementation cost.
  Use local, temporary syntax bridges; support new forms before adopting them.
- Use shared named kind/stage constants and derived types, not repeated literal
  unions. Use Node-compatible enum-like as-const objects without TS transforms.
- Keep code short, readable, direct, and easy to port. Avoid speculative layers,
  dependencies, edge-case handling, and safety systems.
- Before self-hosting, keep the handwritten TypeScript compiler minimal and port
  it to MiniLang immediately. After replacement, implement compiler behavior in
  MiniLang and regenerate the bootstrap; never hand-edit generated compiler code.
- Self-hosting applies only to the compiler path. Other tools may remain
  TypeScript until Mini or a cloned language can replace them conveniently.
  They must not hide compiler logic needed for self-hosting.
- Preserve the fixed point and ordinary example when changing compiler code or
  its generated bootstrap. Follow docs/evolving-language.md: a breaking bridge
  stays temporary until its migrated source and generated compiler self-host.
  Never revive the handwritten compiler to bypass a migration.
- Use focused checks for actual behavior. Do not add a large test matrix or
  invent language semantics solely to satisfy tooling.
- Create multiple cases with every language construct proposal, before compiler
  support: separate .mini sources, JSON manifests, and expected streams. Cover
  valid forms, input variants, rejections, and interactions. Mark unsupported
  cases pending; review provisional diagnostics when implementing support.
- Balance single-construct and combination coverage. Each case should check a
  distinct rule or interaction; reuse fixtures and avoid redundant matrices.
- Update VS Code support with syntax changes. Bump its independent version
  when editor behavior changes; keep the registry, package, and lockfile aligned.
- After approval, implement and verify the feature before the next proposal.
  Keep T0 support extremely granular: one feature, its indexed cases, and one
  atomic commit. Never let drafts accumulate without compiler support.
  Leave unresolved rules explicitly open.
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

- Executable project code uses TypeScript run directly by Node or Mini only.
- Use extensionless Node shebang commands under bin/; do not route tools through npm.
- Mini source uses .mini. Keep case manifests and source separate. Tool cases
  invoke actual bin/ commands through the shared runner; never add per-case
  executable wrappers. Stream fields are objects with text, bytes, or file plus
  optional SHA-256. Prefer external files for substantial stream payloads.
- Keep each tool independently versioned. Use mini for the project version key.
- Keep the root lean. Follow CONTRIBUTING.md and docs/cases.md for layout,
  verification, examples, samples, and benchmarks.

- Follow docs/builtins.md for primitive I/O and library scope. Distinguish
  accepted and proposed contracts; host adapters must not implement the compiler.

- Put standard-library source under std/, with Mini code in .mini files. Keep
  its verification manifests/streams under cases/; create directories when needed.
