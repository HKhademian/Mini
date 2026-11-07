#!/usr/bin/env node
"use strict";
import { writeSync } from "node:fs";
function $mini_io_write() {
    const values = Array.prototype.slice.call(arguments);
    let text = "";
    for (const value of values) {
        if (typeof value === "string") text += value;
        else if (typeof value === "number") text += $mini_number_to_text(value);
        else if (typeof value === "boolean") text += value ? "true" : "false";
        else if (value !== null && typeof value === "object") text += $mini_json_to_text(value);
        else text += String(value);
    }
    writeSync(1, text);
    return 0;
}
function $mini_json_to_text(value) {
    const seen = new Set();
    function encode(item) {
        if (typeof item === "string") return JSON.stringify(item);
        if (typeof item === "number") return Number.isSafeInteger(item) ? String(item) : "null";
        if (typeof item === "boolean") return item ? "true" : "false";
        if (item === null || item === undefined) return "null";
        if (typeof item !== "object") return "null";
        if (seen.has(item)) throw 0;
        seen.add(item);
        let output;
        if (Array.isArray(item)) {
            const parts = [];
            for (let index = 0; index < item.length; index++) parts.push(index in item ? encode(item[index]) : "null");
            output = "[" + parts.join(",") + "]";
        } else {
            const parts = [];
            for (const key of Object.keys(item).sort()) parts.push(JSON.stringify(key) + ":" + encode(item[key]));
            output = "{" + parts.join(",") + "}";
        }
        seen.delete(item);
        return output;
    }
    try { return encode(value); } catch { return ""; }
}
function $mini_list_get(items, index) {
    if (!Array.isArray(items)) return 0;
    if (index < 0) index = items.length + index;
    if (index >= 0 && index < items.length && index in items) return items[index];
    return 0;
}
function $mini_number_to_text(value) {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "";
    return String(value);
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
