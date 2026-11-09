# Function and emitter behavior

Mini has one kind of callable: a function declared with `fn`. A function's Mini
body defines its behavior. Functions in `libs/common/` are available through
the ordinary import graph, along with other imported declarations.

## Target implementations

An emitter may replace selected same-name function bodies with implementations
for its target. That replacement is implicit: source code keeps calling the
same function and importing the source that declares it. The compiler does not
maintain a second API declaration or classify functions by implementation
strategy.

A target implementation must preserve the function's Mini-visible behavior,
including argument handling, value kinds, side effects, and return values. Mini
functions always produce a value; operations without a meaningful result use
zero. A host implementation must return a Mini value as well, even when the
underlying native operation is conventionally void.

When a target cannot provide an operation, the function body may call `panic`.
Other functions can provide a Mini implementation directly. Both remain regular
functions in source and use the same call rules.

## Host boundary

Mini code itself does not access operating-system streams, files, processes, or
clocks. Those operations are expressed as functions in `libs/common/`; an
emitter supplies a same-name target implementation where available. This keeps
source behavior and target replacement attached to the same function name.
