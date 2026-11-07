"use strict";
import { writeSync } from "node:fs";
function $mini_io_write() {
    const values = Array.prototype.slice.call(arguments);
    let text = "";
    for (const value of values) text += $mini_to_text(value);
    writeSync(1, text);
    return 0;
}
function $mini_json_to_text(value) {
    const seen = new Set();
    function encode(item) {
        if (typeof item === "string") return JSON.stringify(item);
        if (typeof item === "number") { const text = $mini_number_to_text(item); return text === "" ? "null" : text; }
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
function $mini_to_text(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return $mini_number_to_text(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value !== null && typeof value === "object") return $mini_json_to_text(value);
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
function join(left, right) {

    return (left + right);
}
function $mini_file_0() {

}
function $mini_file_1() {
    io_write_line($mini_number_to_text((join("a", 0)).length));
}
function $mini_main() {
    $mini_file_0();
    $mini_file_1();
}
$mini_main();
