#!/usr/bin/env node
"use strict";
import { writeSync } from "node:fs";
function $mini_io_write() {
    function normalize(value) {
        if (Array.isArray(value)) return value.map(normalize);
        if (value !== null && typeof value === "object") {
            const result = Object.create(null);
            for (const key of Object.keys(value).sort()) result[key] = normalize(value[key]);
            return result;
        }
        return value;
    }
    const values = Array.prototype.slice.call(arguments);
    let text = "";
    for (const value of values) {
        if (typeof value === "string") text += value;
        else if (typeof value === "number") text += Number.isSafeInteger(value) ? String(value) : "";
        else if (typeof value === "boolean") text += value ? "true" : "false";
        else if (Array.isArray(value) || (value !== null && typeof value === "object")) text += JSON.stringify(normalize(value));
    }
    writeSync(1, text);
    return 0;
}
function panic(message) {

    (writeSync(2, (message + "\n")), 0);
    (process.exit(1), 0);
    return 0;
}
function value_kind(value) { if (typeof value === "string") return "text"; if (typeof value === "number") return "number"; if (typeof value === "boolean") return "boolean"; if (Array.isArray(value)) return "list"; if (value !== null && typeof value === "object") return "map"; return "other"; }
function value_is_text(value) {

    return (value_kind(value) === "text");
}
function value_is_number(value) {

    return (value_kind(value) === "number");
}
function value_is_boolean(value) {

    return (value_kind(value) === "boolean");
}
function value_is_list(value) {

    return (value_kind(value) === "list");
}
function value_is_map(value) {

    return (value_kind(value) === "map");
}
function list_new() { return []; }
function list_get(items, index) {
    if (!Array.isArray(items) || !Number.isInteger(index)) return 0;
    if (index < 0) index = items.length + index;
    return index >= 0 && index < items.length && index in items ? items[index] : 0;
}
function list_length(items) { return Array.isArray(items) ? items.length : 0; }
function list_set(items, index, value) {
    if (!Array.isArray(items) || !Number.isInteger(index)) return 0;
    if (index < 0) index = items.length + index;
    if (index >= 0) items[index] = value;
    return 0;
}
function list_truncate(items, length) {
    if (Array.isArray(items) && Number.isInteger(length) && length >= 0 && length < items.length) items.length = length;
    return 0;
}
function list_copy(items) { return Array.isArray(items) ? items.slice() : []; }
function list_join(items, separator) {
    if (!Array.isArray(items) || typeof separator !== "string") return "";
    let output = "";
    for (let index = 0; index < items.length; index++) {
        if (index > 0) output += separator;
        const value = items[index];
        if (typeof value === "string") output += value;
    }
    return output;
}
function list_has_text(items, value) {

    let position = 0;
    while ((position < (items).length)) {
        if ((list_get(items, position) === value)) {
            return true;
        }
        position = (position + 1);
    }
    return false;
}
function list_join_from(items, start, separator) {

    let parts = list_new();
    let position = start;
    while ((position < (items).length)) {
        list_set(parts, (parts).length, list_get(items, position));
        position = (position + 1);
    }
    return list_join(parts, separator);
}
function list_reverse(items) {

    let result = list_new();
    let position = ((items).length - 1);
    while ((position >= 0)) {
        list_set(result, (result).length, list_get(items, position));
        position = (position - 1);
    }
    return result;
}
function list_sorted(items) {

    let result = list_copy(items);
    let position = 0;
    while ((position < (result).length)) {
        let cursor = (position + 1);
        while ((cursor < (result).length)) {
            if ((list_get(result, cursor) < list_get(result, position))) {
                let hold = list_get(result, position);
                list_set(result, position, list_get(result, cursor));
                list_set(result, cursor, hold);
            }
            cursor = (cursor + 1);
        }
        position = (position + 1);
    }
    return result;
}
function list_contains(items, value) {

    let position = 0;
    while ((position < (items).length)) {
        if ((list_get(items, position) === value)) {
            return true;
        }
        position = (position + 1);
    }
    return false;
}
function list_is_text(value) {

    if ((!value_is_list(value))) {
        return false;
    }
    let position = 0;
    while ((position < (value).length)) {
        if ((value_kind(list_get(value, position)) !== "text")) {
            return false;
        }
        position = (position + 1);
    }
    return true;
}
function list_push_back(items, value) {

    if (value_is_list(items)) {
        list_set(items, (items).length, value);
    }
    return 0;
}
function list_push_front(items, value) {

    if ((!value_is_list(items))) {
        return 0;
    }
    let position = (items).length;
    while ((position > 0)) {
        list_set(items, position, list_get(items, (position - 1)));
        position = (position - 1);
    }
    list_set(items, 0, value);
    return 0;
}
function list_pop_back(items) {

    if (((!value_is_list(items)) || ((items).length === 0))) {
        return 0;
    }
    let length = (items).length;
    let value = list_get(items, (length - 1));
    list_truncate(items, (length - 1));
    return value;
}
function list_pop_front(items) {

    if (((!value_is_list(items)) || ((items).length === 0))) {
        return 0;
    }
    let length = (items).length;
    let value = list_get(items, 0);
    let position = 0;
    while ((position < (length - 1))) {
        list_set(items, position, list_get(items, (position + 1)));
        position = (position + 1);
    }
    list_truncate(items, (length - 1));
    return value;
}
function list_of() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    return $mini_fn_args;
}
function list_rest(items, count) {

    let result = list_new();
    let position = count;
    while ((position < (items).length)) {
        list_set(result, (result).length, list_get(items, position));
        position = (position + 1);
    }
    return result;
}
function io_read_all() {

    return panic("io_read_all requires a host implementation");
}
function io_read_bytes(count) {

    return panic("io_read_bytes requires a host implementation");
}
function io_read_line() {

    return panic("io_read_line requires a host implementation");
}
function io_write() {

    return panic("io_write requires a host implementation");
}
function io_write_error(message) {

    return panic("io_write_error requires a host implementation");
}
function io_write_line() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    let values = $mini_fn_args;
    let position = 0;
    while ((position < (values).length)) {
        $mini_io_write(list_get(values, position));
        position = (position + 1);
    }
    return $mini_io_write("\n");
}
function $mini_file_0() {

}
function $mini_file_1() {

}
function $mini_file_2() {

}
function $mini_file_3() {

}
function $mini_file_4() {
    io_write_line("ok");
}
function $mini_main() {
    $mini_file_0();
    $mini_file_1();
    $mini_file_2();
    $mini_file_3();
    $mini_file_4();
}
$mini_main();
