#!/usr/bin/env node
"use strict";
import { writeSync } from "node:fs";
function $mini_io_write() {
    const values = Array.prototype.slice.call(arguments);
    let text = "";
    for (const value of values) {
        if (typeof value === "string") text += value;
        else if (value !== null && typeof value === "object") text += JSON.stringify(value);
        else text += String(value);
    }
    writeSync(1, text);
    return 0;
}
function $mini_list_get(items, index) {
    if (!Array.isArray(items)) return 0;
    if (index < 0) index = items.length + index;
    if (index >= 0 && index < items.length && index in items) return items[index];
    return 0;
}
function io_write_line() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    let values = $mini_fn_args;
    let position = 0;
    while ((position < (values).length)) {
        $mini_io_write($mini_list_get(values, position));
        position = (position + 1);
    }
    return $mini_io_write("\n");
}
io_write_line("ok");
