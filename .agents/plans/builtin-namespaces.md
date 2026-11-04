---
name: builtin-namespaces
status: proposed
created: 2026-11-04
todos:
  - id: descriptor
    content: Add a builtin descriptor API with emit templates and helper text in the registry
    status: pending
  - id: split
    content: Split the registry into one file per namespace, alphabetically included
    status: pending
  - id: bootstrap
    content: Rebuild the compiler, regenerate tools, and preserve the fixed point
    status: pending
  - id: verify
    content: Verify metadata, reference targets, cases, and unit tests
    status: pending
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

## Proposed layout

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

Each namespace file registers descriptors through one helper:

```mini
fn builtin_add(name, parameters, result, class, import_name, helper_key, helper_text, reference, emit_form) {
    // name list, sets, parameter/result maps, class, import, helper maps
}
```

`emit_form` is a template using positional arguments, for example:

```text
"$mini_text_slice({0}, {1}, {2})"
"writeSync(1, {0})"
"Date.now()"
```

The central `builtin_emit(name, args)` resolves the reference target first, then
substitutes argument code into the registered template. This keeps the lowering
next to the metadata instead of in one large conditional.

Helper adapter text moves out of `libs/compiler/constants.mini` into the
namespace file that owns the builtin.

## Aggregation

`builtins.mini` defines the shared tables and calls the namespace registration
functions in alphabetical order:

```mini
include "builtins/directory.mini";
include "builtins/file.mini";
...
```

Each namespace file contains:

- descriptor registrations;
- helper adapter text;
- reference targets.

## Bootstrap

No new host primitives are required. Build the new compiler with the old
compiler, verify two generations agree, promote it, regenerate tools, then run
`mini check`, `mini test`, and `mini test --unit`.

## Risks

- Emit templates must preserve exact generated output so existing cases and the
  fixed point remain stable.
- Helper text ordering must stay deterministic.
- Metadata output ordering becomes namespace order rather than registry order.
- Reference lowering must run before template substitution.
