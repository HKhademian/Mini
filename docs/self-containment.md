# Builtins, purity, and self-containment

mini is self-hosted, but it is not self-contained. The compiler is written in
mini; it still runs on a host runtime and lowers a small set of builtins to host
code. This page separates the operations that must remain host code from the
ones that are only fast paths, and records how a pure reference mode can prove
that distinction.

## Builtins are host code

A builtin contract is a name the compiler recognizes and type-checks. Its public
Mini implementation lives under `libs/common/` and provides the canonical
fallback, including a panic when the target needs a representation primitive.
Emitters may register a same-name host implementation or call-site lowering.
The contract registry lives in [libs/compiler/builtins.mini](../libs/compiler/builtins.mini);
JavaScript overrides live under `libs/compiler/emit-js/overrides/`.

Builtins fall into three practical layers:

1. the irreducible host boundary;
2. representation primitives and performance shortcuts;
3. library functions that should be written in mini.

The layer is a design decision, not a property of the name.

## Irreducible host boundary

These operations cannot be expressed in mini because they are the boundary to
the operating system or host runtime:

| Operation | Why it is host-only |
| --- | --- |
| `io_write`, `io_write_error`, `io_read_all`, `io_read_line`, `io_read_bytes` | Standard streams |
| `file_read`, `file_write`, `file_read_bytes`, `file_write_bytes` | File contents; same-name panic fallbacks in `libs/common/file.mini` and JavaScript/C host overrides |
| `path_temp_directory` | Filesystem mutation |
| `directory_list`, `directory_create`, `path_is_exists`, `path_is_directory`, `path_copy`, `path_remove` | Filesystem queries and mutation; same-name panic fallbacks in `common/path` and JS/C host overrides |
| `process_exit` | Process interface |
| `process_spawn`, `process_exec_path`, `process_script_path`, `process_env` | Child processes and host environment |
| `time_millis` | Host clock |
| `value_kind` | Runtime representation introspection; same-name Mini panic fallback in `libs/common/value.mini` |

Every pure or reference mode still needs these operations. Removing them would
require a different runtime, not a different mini program.

`hash_sha256` is also host-only today, but for a different reason: see
[Numeric core](#numeric-core-and-hash).

## Representation primitives

Some builtins expose the runtime's value representation rather than implement an
algorithm:

```text
text_length, text_get
list_length, list_get, list_set, list_new, list_copy, list_truncate
map_get, map_set, map_keys, map_has, map_new, map_copy
```

These are candidates for a trusted core. They are not shortcuts in the same
sense as `text_find`: a pure implementation cannot inspect native string or
array storage without one of them.

`list_length` is the clearest example. It lowers to `(items).length`, the
JavaScript array's internal size. A mini-side list with a stored `length` field
does not remove the primitive:

```mini
fn counted_length(items) {
    return map_get(items, "length");
}
```

That version still trusts `map_get`, `map_set`, and host-backed map storage. It
also exposes the representation unless the language has opaque records or
closures. A linked list could compute length by traversal, but then every length
read is O(n), and the traversal still needs a storage primitive.

So `list_length` belongs to the trusted core. A counted-list library can exist
on top of that core, but it is a library representation, not a replacement for
the language's native lists.

## Performance shortcuts

These operations are expressible in mini given the trusted core, but the host
version avoids allocation, interpretation, or traversal:

| Builtin | Pure alternative | Main cost of purity |
| --- | --- | --- |
| `text_slice`, `text_find`, `text_split` | Character and array loops | Slower per call, more allocation |
| `text_to_bytes`, `text_from_bytes` | UTF-8 encoder/decoder | Large constant factor |
| `number_to_text`, `list_join` | Formatting/unboxing loops | Slower, subtle formatting rules |
| `json_parse`, `json_to_text` | Recursive parser/serializer | Large implementation, slower |
| `list_copy`, `map_copy` | Explicit traversal | Slower on large values |
| `hash_sha256` | SHA-256 in mini | Needs arithmetic and bitwise primitives |

The boundary between this layer and the trusted core is a choice. A smaller
trusted core means more mini code and slower execution. A larger core means
fewer primitives to prove, but more host code in the trusted base.

## Library functions

Anything above the representation layer should normally be a mini library, not
a builtin:

- `text_trim`, `text_join`, and other text conveniences;
- `process_run`, a text-stream wrapper over `process_spawn`;
- path composition and normalization helpers;
- case helpers and repository utilities;
- application-level parsing and formatting.

The rule is:

> Add a builtin when the operation is a host boundary or a measured hot path
> that cannot be expressed efficiently from the trusted core. Otherwise put it
> in `libs/`.

A fast-path builtin should have a pure mini counterpart and an equivalence test
before it is considered stable.

## Reference implementations

The idea of an "inactive implementation" is better described as a **reference
implementation** or **pure backend**.

Library implementations use the public API name in `libs/common/`. A target
may replace that implementation implicitly through its emitter registry; source
programs call one name and import one API. Library APIs are being moved into `libs/common/` under their public names.

Current reference coverage:

| Builtin | Reference status |
| --- | --- |
| `text_slice`, `text_find`, `text_split` | Same-name Mini implementations in `libs/common/text.mini`; JS host overrides registered under `libs/compiler/emit-js/overrides` |
| `list_copy`, `list_join` | Same-name Mini implementations in `libs/common/list.mini`; JS host overrides registered under `libs/compiler/emit-js/overrides` |
| `map_copy` | Same-name Mini implementation in `libs/common/map.mini`; JS host override registered under `libs/compiler/emit-js/overrides` |
| `json_parse`, `json_to_text` | Same-name Mini implementations in `libs/common/json.mini`; JS host overrides registered under `libs/compiler/emit-js/overrides` |
| `text_to_bytes`, `text_from_bytes` | Same-name Mini implementations in `libs/common/text.mini`; JS host overrides registered under `libs/compiler/emit-js/overrides` |
| `number_to_text` | Same-name Mini implementation in `libs/common/number.mini`; JS host override registered under `libs/compiler/emit-js/overrides` |
| `hash_sha256` | Pending: needs bitwise/shift operations and an integer model |

The registry records operation classes. Target overrides are implicit and do
not add a second public dependency or function name. `test/reference.test.mini` compiles and runs the implemented reference
paths against the host paths and compares streams and statuses.

Reference mode is not dead code. It is a second semantic implementation used to:

- check that the fast path and the pure implementation agree;
- prove the compiler can build itself without selected fast paths;
- measure how small the trusted core can become;
- catch representation assumptions in the compiler and tools.

The equivalence suite should compile and run the same cases in both modes,
compare stdout, stderr, and status, and verify the bootstrap fixed point in
reference mode.

## What cannot become pure yet

### Host boundary

Standard streams, files, directories, paths, processes, environment, the clock,
and runtime kind introspection remain host operations. A reference mode still
links them.

### Numeric core and hash

`hash_sha256` cannot be implemented in mini today because mini still has no
bitwise or shift operations, and its numeric width and overflow model is not
settled. Multiplication, division, modulo, floor, and power now exist in the
`number_*` namespace, each with a pure reference implementation. A pure SHA-256
still needs at least:

```mini
number_bit_and(a, b)
number_bit_or(a, b)
number_bit_xor(a, b)
number_bit_not(a)
number_shift_left(a, count)
number_shift_right(a, count)
```

These names are illustrative; operators could be added instead. The hard part is
not the spelling but the semantics:

- Are numbers 32-bit integers, 53-bit safe integers, doubles, or a tagged union?
- What happens on overflow?
- What is division by zero?
- What is the sign of a negative modulo?
- Are shifts arithmetic or logical, and what is the shift width?
- How do these interact with existing `+`, `-`, and comparisons?

Until those questions are answered, `hash_sha256` remains a host/crypto
primitive. Renaming it to `crypto_sha256` would clarify the namespace but would
not remove the arithmetic requirement.

### Large pure implementations

JSON parsing, serialization, and UTF-8 conversion use Mini fallbacks under
`libs/common/`; emitters may replace those functions under the same public names.

## Self-hosting versus self-contained

| Property | Meaning | Current state |
| --- | --- | --- |
| Self-hosted | The compiler source is mini and rebuilds itself | Yes; `tools/compiler.mini` builds `dist/compile.js` |
| Hosted | The compiler runs on a host runtime | Yes; generated JavaScript on Node |
| Self-contained | No host beyond the language runtime | No |
| Mini fallback available | Imported APIs provide Mini implementations selected when host overrides are disabled | Partial |

Self-hosting is about the language in which the compiler is written.
Self-containment is about the runtime surface the compiled program needs. mini
achieves the first and should make the second explicit rather than claiming it
is complete.

The practical target is a **minimal trusted core**:

```text
value representation and indexing
standard streams
files, directories, paths
processes and environment
clock
```

Everything else should be a mini library or a performance builtin with a pure
reference implementation.

## Next steps

1. Add `essential`, `representation`, `performance`, and `library` metadata to
   the builtin registry.
2. Add same-name Mini fallbacks under `libs/common/` for replaceable operations.
3. Add a `--reference` compiler mode that selects them.
4. Add equivalence cases that run both modes.
5. Decide the numeric model before attempting a pure `hash_sha256`.
6. Document the trusted core and keep new builtins out of it unless they meet
   the host-boundary or hot-path rule.
