# Runtime requirements

mini requires Node.js 22.18.0 or newer. Development and release builds pin
24.16.0 in [.node-version](../.node-version); CI runs the strict checks and case
suites on that pin and on the 22.18.0 minimum.

The floor comes from the handwritten TypeScript sources that Node runs directly,
not from the compiler path. `test/*.ts`, `test/performance/*.ts`, and
`cases/applications/*.ts` import `.ts` paths and need type stripping. Node
enabled type stripping by default in 22.18.0; 22.17.0 rejects those imports with
`ERR_UNKNOWN_FILE_EXTENSION`. Node 24.0 through 24.2 emit the type-stripping
experimental warning, which pollutes stderr comparisons; use 22.18.0 or 24.3.0
and newer.

## Generated JavaScript

Generated artifacts are plain JavaScript named with `.js`:
`dist/compile.js`, `dist/build.js`, and the other tools. The compiler emits the
same untyped text it always did; the `.ts` names came from the retired
handwritten compiler and never added type checking. Generated files are excluded
from the strict TypeScript check.

Node never strips types for the compiler path. Running the generated compiler
needs `import.meta.dirname` (20.11.0); compiled programs that call
`process.getBuiltinModule` need 22.3.0. The project still supports one range,
because the handwritten sources set the higher floor.

Do not rename generated output back to `.ts`. A `.ts` name would make Node load
the type stripper again and raise the distribution floor without adding types.
