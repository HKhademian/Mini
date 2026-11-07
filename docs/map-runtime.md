# Object-backed maps

Group 0.3.0, language/compiler/builtins 0.3.0-alpha.1.

mini maps use ordinary JS objects whose shared prototype is an empty object with
a null prototype. Children retain ordinary object storage while inheriting no
string properties or `__proto__` setter. The prototype is created once per
generated program. Map values have no wrapper, brand, size field, or other
per-map metadata.

The shared adapter block in `libs/compiler/builtins/map.mini` provides map
get, has, and set. It is emitted once when needed. Text keys such as `__proto__`,
`constructor`, `toString`, empty text, and numeric-looking text remain ordinary
keys. Reads preserve zero, false, empty text, and collection references; missing
reads return zero. Arrays and primitives are rejected by the tolerant getter
and setter. Among mini's values, non-array objects are maps; foreign-host object
interop is not a selected language interface.

Membership uses a small function so the receiver expression evaluates before
the key expression, once each. Enumeration uses `Object.keys`, returning a fresh
ordinary list. Enumeration order remains unspecified.

Count keys with `list_length(map_keys(items))`. The compiler workloads do not
need a dedicated count operation. Counting allocates a snapshot when requested;
writes do not pay bookkeeping costs. Group 0.3.0 removes the redundant count
builtin and updates its samples/cases to use the composition.

This changes runtime storage and primitive lowering, without reorganizing the
mini applications or the compiler's own scanner/parser. Their named fields, call
structure, scopes, and lookups remain recognizable. Other targets can choose
their own representation while preserving these contracts.

The [application benchmark suite](application-performance.md) verifies the same
independent outputs before comparing execution, CPU, and memory. The original
[Map-backed results](application-performance-results.md) remain an immutable
baseline; they do not describe this backend's performance.

The [before/after measurements](map-runtime-performance.md) show lower compiler
pipeline elapsed time and RSS, higher warm CPU, and slower template/dependency
workloads. Object storage is a measured tradeoff, not a universal speedup.
