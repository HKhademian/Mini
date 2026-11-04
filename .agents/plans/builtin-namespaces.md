---
name: builtin-namespaces
status: completed
created: 2026-11-04
todos:
  - id: descriptor
    content: Add a builtin descriptor API with emit templates and helper text in the registry
    status: completed
  - id: split
    content: Split the registry into one file per namespace, alphabetically included
    status: completed
  - id: bootstrap
    content: Rebuild the compiler, regenerate tools, and preserve the fixed point
    status: completed
  - id: verify
    content: Verify metadata, reference targets, cases, and unit tests
    status: completed
plans:
  requires: []
  blocks: []
  parallel: []
---

# Builtin namespace files

## Goal

Keep each namespace's metadata, helper implementation, and lowering text next to
each other, and split the monolithic builtin registry into one file per
namespace.

## Implemented layout

```text
libs/compiler/builtins.mini          shared tables, lookup, dispatch
libs/compiler/builtins/directory.mini
libs/compiler/builtins/file.mini
libs/compiler/builtins/hash.mini
libs/compiler/builtins/io.mini
libs/compiler/builtins/json.mini
libs/compiler/builtins/list.mini
libs/compiler/builtins/map.mini
libs/compiler/builtins/number.mini
libs/compiler/builtins/path.mini
libs/compiler/builtins/process.mini
libs/compiler/builtins/text.mini
libs/compiler/builtins/time.mini
libs/compiler/builtins/value.mini
```

Namespaces are included and registered alphabetically. Entries inside each file
are alphabetical by builtin name.

## Descriptor API

Each namespace file calls `builtin_add` directly at top level:

```mini
builtin_add(name, parameters, result, layer, import_name, helper_key, helper_text, reference, emit_form)
```

`emit_form` is a template using positional arguments:

```text
"$mini_text_slice({0}, {1}, {2})"
"writeSync(1, {0})"
"Date.now()"
```

The central `builtin_emit(name, args)` resolves the reference target first, then
substitutes argument code into the registered template.

There are no per-namespace register functions and no `builtins_register_all`
wrapper. Include order is registration order.

Helper adapter text lives in the namespace file. Unique helpers are inline
string literals in their `builtin_add` call; the shared `map_runtime` block is
kept in one variable because four map builtins use it.

`libs/compiler/constants.mini` was removed; its helper text moved into the
namespace files.

## Aggregation

`builtins.mini` defines the shared tables and `builtin_add`, then includes the
namespace files alphabetically:

```mini
include "builtins/directory.mini";
include "builtins/file.mini";
...
```

## Bootstrap

No new host primitives were required. The new compiler was built with the old
compiler, two generations agreed, it was promoted, tools were regenerated, and
`mini check`, `mini test`, and `mini test --unit` passed.

## Risks

- Emit templates must preserve exact generated output so existing cases and the
  fixed point remain stable.
- Helper text ordering must stay deterministic.
- Metadata output ordering becomes namespace order rather than registry order.
- Reference lowering must run before template substitution.
