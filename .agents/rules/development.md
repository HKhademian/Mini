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
- Prefix compiler emitter helpers by backend, such as `emit_c_`; includes share
  Mini's top-level namespace, so generic target prefixes are insufficient.
- Before self-hosting, keep the handwritten TypeScript compiler minimal and port
  it to MiniLang immediately. After replacement, implement compiler behavior in
  MiniLang and regenerate the bootstrap; never hand-edit generated compiler code.
- The compiler source is the mini source; the generated compiler is promoted
  from it. Keep compiler changes close to the verified first-port boundaries:
  preserve routine boundaries, conditions, evaluation order,
  call structure, lookups, named fields, and collection roles unless a verified
  change justifies more. Make only the adaptations mini requires and document
  necessary deviations in the port history. Defer redesign and optimization
  until the corresponding change is verified; a reproduced blocker warrants the
  smallest documented change.
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
  Keep compiler support extremely granular: one feature, its indexed cases, and one
  atomic commit and annotated version tag. Never let drafts accumulate without
  compiler support.
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
- Keep Mini source well documented: use `///` for file purpose and declaration
  responsibilities, inputs, returned values, and shared-state changes where
  relevant. A leading `///` block documents the next declaration by default;
  it is file documentation when a header `//` comment or following `include`
  closes the file-doc section first. Put file documentation before imports.
  Without an include boundary, use `//` to separate file documentation from
  declarations. Blank lines do not separate documentation sections. Use `//` to
  explain non-obvious implementation decisions. Keep the compiler source's
  correspondence to the verified port boundaries clear in its documentation.
  Mini has line comments only; do not introduce
  block comments or documentation tags.
- Keep this project self-contained; do not reference the predecessor project.
- In `libs/` sources, resolve library imports such as `core/io.mini`,
  `compiler/lexer.mini`, and `pure/json.mini` from the `libs/` root, regardless
  of the importing file's folder. Use `./` for neighbors and child folders. Do
  not import from a parent directory with `../`.

- Build/test orchestration uses TypeScript run directly by Node or Mini only.
- The C target emits native C from the Mini-written compiler. Generated C and
  focused C host fixtures are allowed for native target verification; compiler
  and runner logic remain Mini. Keep native build/test orchestration in Mini
  or direct Node TypeScript, and do not hand-edit generated output.
- Use extensionless Node shebang commands under bin/; do not route tools through npm.
- Mini source uses .mini. Keep case manifests and source separate. Tool cases
  invoke actual bin/ commands through the shared runner; never add per-case
  executable wrappers. Stream fields are objects with text, bytes, or file plus
  optional SHA-256. Prefer external files for substantial stream payloads.
- Keep each tool independently versioned. Use mini for the project version key.
- Keep the root lean. Follow CONTRIBUTING.md and docs/cases.md for layout,
  verification, examples, samples, and benchmarks.

- Follow docs/functions.md for common functions and host I/O behavior. Distinguish
  accepted function behavior; host adapters must not implement the compiler.

- Put standard-library source under std/, with Mini code in .mini files. Keep
  its verification manifests/streams under cases/; create directories when needed.
