# Why mini

mini is a language and compiler foundation for people who want to build their
own language and keep its compiler self-hosted as it changes.

The compiler source is written in mini and generates readable JavaScript for
Node. Each compiler update is checked through successive, matching generations;
the final compiler must also build a working example. This makes self-hosting a
repeatable development property.

## What it includes

- A focused language with functions, control flow, text, lists, maps, and JSON.
- Commands to check, format, compile, run, and test programs.
- Cases for accepted behavior, rejected programs, and feature interactions.
- A browser playground with examples and generated JavaScript.
- A source distribution that runs on Node 22.18.0 or newer without npm packages.

## Who it is for

mini suits language builders who want a working compiler base and a clear path
for evolving it. It is designed as a starting point to extend, rather than a
general-purpose language for application development.

The language stays focused so its compiler remains readable and changes remain
manageable. Records, structs, classes, and a standard library are outside its
current scope. JavaScript on Node is the compiler's current target.

## Growing a language from it

1. Review the [language draft](language.md) and [compiler reference](compiler.md).
2. Add cases for a feature before implementing it.
3. Implement one feature at a time and preserve the self-hosting check.
4. Use [language evolution](evolving-language.md) for breaking changes.

See the [runnable samples](../samples/README.md) and [VS Code support](../editors/vscode/README.md).

## Status

mini is alpha software; its language contracts continue to evolve. See the
[version inventory](versioning.md) and [runtime requirements](runtime.md) for
current details.
