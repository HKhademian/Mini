# Parameter passing proposal

Status: under review, not an accepted language decision. T0 currently emits
ordinary JavaScript parameters. List/map mutation and map lookup are available.
The review cases stay pending until the passing rule is accepted.

## Proposed rule

Each parameter is a local mutable binding initialized with its argument value.
Assignment replaces that local binding; it does not replace the caller's binding.
The same rule applies to every argument, including literals and expressions.

Lists and maps are shared mutable values. Passing, returning, or assigning one
does not clone its contents. Collection mutation is visible through every binding
that refers to the same collection. Rebinding one of those bindings leaves the
other bindings and the original collection unchanged.

Numbers, booleans, and text have no in-place mutation operation in the current
language. Replacing a parameter holding one leaves the caller's binding unchanged.
Text concatenation produces a result value; it does not edit existing text.

This model is often called pass-by-sharing. Sharing a collection is distinct
from passing a reference to the caller's variable slot.

For example, using the proposed map API:

```text
fn change(items) {
    map_set(items, "name", "shared");
    items = map_new();
    map_set(items, "name", "local");
    return map_get(items, "name");
}

var original = map_new();
map_set(original, "name", "old");
var result = change(original);
```

The original map's name becomes `"shared"`; `result` is `"local"`. Assigning
`items` to a new map does not replace `original`. These operations are available;
the parameter-rebinding contract itself remains under review.

## Target-independent representation

Choose behavior for Mini independently of the current JavaScript target. The
same parameter rule should remain small to implement in other backends.
Undeclared source types do not require every value to be a heap reference.

A uniform conceptual model is a local binding holding a value handle. Assignment
changes that binding's handle; a collection operation changes the shared
collection. A handle is a specification model, not a required pointer or wrapper.
It must not be confused with a reference to another binding's writable slot.

A native backend could use one tagged value representation, storing numbers and
booleans inline and references to immutable text and mutable collections.
An implementation could instead use references for every value, but the language
need not require scalar boxing or a particular memory-management mechanism.
Either representation must preserve the same observable behavior.

In particular, passing text need not copy its character storage. Its immutable
behavior is separate from whether its storage is shared. Lists/maps preserve
their identity across assignment, calls, and returns, without implicit cloning.

Ordinary JavaScript parameters already provide the proposed behavior. Literals
need no compiler-created reference cell. Calls still pass values/handles and use
ordinary call storage; this is not a guarantee that no bytes are copied or that
the runtime never allocates.

True reference parameters would additionally let an assignment replace the
caller's variable. This is a separate semantic choice even if every value is
physically stored through a reference. A backend needs a way to reference the
caller's writable slot, such as cells, addresses, or read/write accessors, plus
rules for literals, expressions, and repeated arguments. Prohibiting parameter
reassignment would instead require an additional compiler restriction. Local
reassignment needs neither mechanism.

For compiler state that several functions must update, a shared map can hold the
cursor, current token, and output. A function can also return a replacement scalar
and let its caller assign it. Neither requires reference-parameter syntax.

## Argument counts investigation

The accepted contract currently requires exactly one argument per parameter.
T0 checks this for both user functions and built-ins before emitting a call.
Whether a parameter can be omitted is independent of sharing and reassignment.

Allowing omitted trailing arguments is feasible without a special runtime calling
convention: the compiler already knows each function's arity and could emit the
missing default values at the call site. A native target need not receive a
physically incomplete call. Supplying more arguments than parameters is a
separate decision; this investigation does not propose accepting extras or holes
between supplied arguments.

The earlier investigation compared two possible defaults:

- `0` exists already and needs no new value kind. An omitted numeric counter
  could then behave exactly like an explicit zero. Zero is not empty text, false,
  an empty collection, or an absent value; the existing expression rules do not
  coerce between those kinds. No default can be selected by an undeclared
  parameter's intended kind without adding another rule.
- `null` could represent absence consistently across omitted arguments, missing
  map keys, and skipped list positions. Mini has not selected such a value yet.
  Its literal, equality, storage, and use in operations would need a contract;
  ordinary operations must not inherit accidental host-specific coercions.

If omission means the default, an omitted argument and that explicit default
are indistinguishable inside the function. Distinguishing them would require
additional argument-presence information. Also decide whether omission applies
to built-ins: a missing path or collection operand is not made useful merely by
substituting zero or null. Arbitrary default expressions and declaration syntax
are further features, not necessary for one universal default.

Collection lookup now selects ordinary numeric zero as its fallback; null is not
introduced. That does not make parameters optional. Retain exact arity for now;
revisit trailing omission only when compiler code demonstrates a recurring default.
The filling mechanism is small, but no omitted-argument behavior is accepted here.

## Review cases

Pending cases under [cases/language](../cases/language/) cover:

- `028-001`: scalar parameter reassignment leaves the caller unchanged; literals
  and expressions work as ordinary arguments.
- `028-002`: supplying the same binding twice creates independent parameter
  bindings; assigning one does not replace the other.
- `028-003`: map mutation is shared, including through an assignment alias;
  rebinding the parameter to a new map stays local.
- `028-004`: list mutation is shared while parameter rebinding stays local.

No new syntax or rejection rule is proposed. Existing arity and operand-kind
rejections remain covered by their current cases. This proposal does not select
collection element kinds, missing values, reserve behavior, or broader scope rules.
Approval must be followed by verification and activation of the applicable cases;
pending cases do not establish implementation support.
