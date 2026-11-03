#!/usr/bin/env node
"use strict";
import { readFileSync, writeFileSync, writeSync } from "node:fs";
function $mini_list_get(items, index) {
    if (!Array.isArray(items)) return 0;
    if (index < 0) index = items.length + index;
    if (index >= 0 && index < items.length && index in items) return items[index];
    return 0;
}
function $mini_text_split(text, divider) {
    if (typeof text !== "string" || typeof divider !== "string") return [];
    if (divider === "") return [text];
    return text.split(divider);
}
let manifest = readFileSync("compiler/m1.parts", "utf8");
let parts = $mini_text_split(manifest, "\n");
let output = "";
let position = 0;
while ((position < (parts).length)) {
    let part = $mini_list_get(parts, position);
    if (((part).length > 0)) {
        output = (output + readFileSync(part, "utf8"));
    }
    position = (position + 1);
}
let args = process.argv.slice(2);
if ((((args).length === 1) && ($mini_list_get(args, 0) === "--check"))) {
    if ((readFileSync("compiler/compiler.mini", "utf8") !== output)) {
        writeSync(2, "compiler/compiler.mini is stale; run node tools/build-m1.generated.ts\n");
        process.exit(1);
    }
} else {
    if (((args).length !== 0)) {
        writeSync(2, "usage: node tools/build-m1.generated.ts [--check]\n");
        process.exit(1);
    }
    writeFileSync("compiler/compiler.mini", output, "utf8");
}
