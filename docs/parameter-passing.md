# Parameter passing proposal

Status: under review, not an accepted language decision. T0 currently emits
ordinary TypeScript parameters. Maps and list mutation are unavailable, so the
collection cases below remain dependent on their implementations.

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
`items` to a new map does not replace `original`. Map operations in this example
are not implemented yet; existing keys and text values avoid deciding missing-key
or mixed-value behavior.

## Target-independent representation

Choose behavior for Mini independently of the current TypeScript target. The
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

Ordinary TypeScript parameters already provide the proposed behavior. Literals
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
