# Builtins, purity, and self-containment

mini is self-hosted, but it is not self-contained. The compiler is written in
mini; it still runs on a host runtime and lowers a small set of builtins to host
code. This page separates the operations that must remain host code from the
ones that are only fast paths, and records how a pure reference mode can prove
that distinction.

## Builtins are host code

A builtin is a name the compiler recognizes and replaces with generated
JavaScript or an adapter helper. It is not written in mini. The registry lives in
[libs/compiler/builtins.mini](../libs/compiler/builtins.mini); adapter text and
lowering live next to each namespace under `libs/compiler/builtins/`.

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
| `file_read`, `file_write`, `file_read_bytes`, `file_write_bytes` | File contents |
| `file_remove`, `path_temp_directory`, `directory_remove` | Filesystem mutation |
| `directory_list`, `directory_create`, `path_is_exists`, `path_is_directory`, `path_copy`, `path_remove` | Filesystem queries and mutation |
| `process_exit` | Process interface |
| `process_spawn`, `process_exec_path`, `process_script_path`, `process_env` | Child processes and host environment |
| `time_millis` | Host clock |
| `value_kind` | Runtime representation introspection |

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
| `number_to_text`, `list_to_text` | Formatting/unboxing loops | Slower, subtle formatting rules |
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

Implemented layout:

```text
libs/pure/text.mini      pure_text_slice, pure_text_find, pure_text_split
libs/pure/list.mini      pure_list_copy
libs/pure/map.mini       pure_map_copy
libs/pure/reference.mini include aggregator
```

Compiler modes:

```text
compiler source.mini output.js               host fast paths (default)
compiler --reference source.mini output.js   pure reference implementations
```

In reference mode, a replaceable performance builtin lowers to its `pure_*`
helper and the compiler appends the pure library to the compilation unit. The
default build keeps the host fast paths.

Current reference coverage:

| Builtin | Reference status |
| --- | --- |
| `text_slice`, `text_find`, `text_split` | Implemented in `libs/pure/text.mini` |
| `list_copy` | Implemented in `libs/pure/list.mini` |
| `map_copy` | Implemented in `libs/pure/map.mini` |
| `json_parse`, `json_to_text` | Implemented in `libs/pure/json.mini`; pure parsing currently accepts integer numbers only |
| `text_to_bytes`, `text_from_bytes` | Implemented in `libs/pure/bytes.mini` |
| `number_to_text` | Implemented in `libs/pure/number.mini` |
| `list_to_text` | Implemented in `libs/pure/list.mini` |
| `hash_sha256` | Pending: needs bitwise/shift operations and an integer model |

`compiler metadata` reports each builtin's `class` (`essential`,
`representation`, `performance`, or `library`) and its `reference` target, if
any. `test/reference.test.mini` compiles and runs the implemented reference
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

```text
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

`json_parse`, `json_to_text`, and UTF-8 conversion are pure-able, but they are
large enough that they should be introduced as reference implementations first,
with performance measurements, before becoming defaults.

## Self-hosting versus self-contained

| Property | Meaning | Current state |
| --- | --- | --- |
| Self-hosted | The compiler source is mini and rebuilds itself | Yes; `tools/compiler.mini` builds `dist/compile.js` |
| Hosted | The compiler runs on a host runtime | Yes; generated JavaScript on Node |
| Self-contained | No host beyond the language runtime | No |
| Pure reference-capable | Performance builtins have mini implementations selected by a mode | Not yet; proposed |

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
2. Create `libs/pure/` reference implementations for the performance layer.
3. Add a `--reference` compiler mode that selects them.
4. Add equivalence cases that run both modes.
5. Decide the numeric model before attempting a pure `hash_sha256`.
6. Document the trusted core and keep new builtins out of it unless they meet
   the host-boundary or hot-path rule.
