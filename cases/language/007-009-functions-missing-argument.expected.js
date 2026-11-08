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
function $mini_number_to_text(value) {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "";
    return String(value);
}
function $mini_text_find(text, needle) {
    if (typeof text !== "string" || typeof needle !== "string") return -1;
    return text.indexOf(needle);
}
function $mini_text_get(text, index) {
    if (typeof text === "string" && index >= 0 && index < text.length) return text[index];
    return "";
}
function $mini_text_split(text, divider) {
    if (typeof text !== "string" || typeof divider !== "string") return [];
    if (divider === "") return [text];
    return text.split(divider);
}
function $mini_to_text(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return $mini_number_to_text(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value !== null && typeof value === "object") return $mini_json_to_text(value);
    return String(value);
}
function $mini_value_kind(value) {
    if (typeof value === "string") return "text";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "list";
    if (value !== null && typeof value === "object") return "map";
    return "other";
}
function panic(message) {

    (writeSync(2, (message + "\n")), 0);
    (process.exit(1), 0);
    return 0;
}
function value_is_text(value) {

    return ($mini_value_kind(value) === "text");
}
function value_is_number(value) {

    return ($mini_value_kind(value) === "number");
}
function value_is_boolean(value) {

    return ($mini_value_kind(value) === "boolean");
}
function value_is_list(value) {

    return ($mini_value_kind(value) === "list");
}
function value_is_map(value) {

    return ($mini_value_kind(value) === "map");
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
        if (($mini_value_kind(list_get(value, position)) !== "text")) {
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
function split_lines(source) {

    let lines = $mini_text_split(source, "\n");
    let position = 0;
    while ((position < ((lines).length - 1))) {
        let line = list_get(lines, position);
        if ((((line).length > 0) && ($mini_text_get(line, ((line).length - 1)) === "\r"))) {
            list_set(lines, position, text_slice(line, 0, ((line).length - 1)));
        }
        position = (position + 1);
    }
    return lines;
}
function text_slice(source, start, end) {
    if (typeof source !== "string" || !Number.isInteger(start) || !Number.isInteger(end)) return "";
    if (start < 0) start = source.length + start;
    if (end < 0) end = source.length + end;
    if (start < 0) start = 0;
    if (end < 0) end = 0;
    if (start > source.length) start = source.length;
    if (end > source.length) end = source.length;
    if (end <= start) return "";
    return source.slice(start, end);
}
function indent_output(output) {

    let lines = split_lines(output);
    let result = list_new();
    let position = 0;
    while ((position < (lines).length)) {
        let line = list_get(lines, position);
        if (((line).length > 0)) {
            list_set(result, (result).length, ("    " + line));
        }
        position = (position + 1);
    }
    return list_join(result, "\n");
}
function text_ends_with(source, suffix) {

    let size = (suffix).length;
    let length = (source).length;
    if ((size > length)) {
        return false;
    }
    return (text_slice(source, (length - size), length) === suffix);
}
function is_letter(character) {

    return ($mini_text_find("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_", character) >= 0);
}
function is_digit(character) {

    return ($mini_text_find("0123456789", character) >= 0);
}
function is_identifier_part(character) {

    return (is_letter(character) || is_digit(character));
}
function is_two_character_symbol(value) {

    return (((((((value === "==") || (value === "!=")) || (value === "<=")) || (value === ">=")) || (value === "&&")) || (value === "||")) || (value === ":="));
}
function text_starts_with(source, prefix) {

    let size = (prefix).length;
    if ((size > (source).length)) {
        return false;
    }
    return (text_slice(source, 0, size) === prefix);
}
function text_chomp(text) {

    let length = (text).length;
    while (((length > 0) && (($mini_text_get(text, (length - 1)) === "\n") || ($mini_text_get(text, (length - 1)) === "\r")))) {
        length = (length - 1);
    }
    return text_slice(text, 0, length);
}
function text_trim_end(text) {

    let length = (text).length;
    while ((length > 0)) {
        let character = $mini_text_get(text, (length - 1));
        if ((((character === " ") || (character === "\t")) || (character === "\r"))) {
            length = (length - 1);
        } else {
            return text_slice(text, 0, length);
        }
    }
    return "";
}
function text_trim(text) {

    let start = 0;
    let end = (text).length;
    while (((start < end) && ($mini_text_find(" \t\r\n", $mini_text_get(text, start)) >= 0))) {
        start = (start + 1);
    }
    while (((end > start) && ($mini_text_find(" \t\r\n", $mini_text_get(text, (end - 1))) >= 0))) {
        end = (end - 1);
    }
    return text_slice(text, start, end);
}
function number_add(a, b) {
    if (typeof a !== "number" || typeof b !== "number") return 0;
    return a + b;
}
function number_sub(a, b) {
    if (typeof a !== "number" || typeof b !== "number") return 0;
    return a - b;
}
function number_min(a, b) {
    if (typeof a !== "number" || typeof b !== "number") return 0;
    return Math.min(a, b);
}
function number_max(a, b) {
    if (typeof a !== "number" || typeof b !== "number") return 0;
    return Math.max(a, b);
}
function number_mul(a, b) {
    if (typeof a !== "number" || typeof b !== "number") return 0;
    return a * b;
}
function number_div(a, b) {
    if (typeof a !== "number" || typeof b !== "number" || b === 0) return 0;
    return Math.trunc(a / b);
}
function number_mod(a, b) {
    if (typeof a !== "number" || typeof b !== "number" || b === 0) return 0;
    return a % b;
}
function number_floor(value) {
    if (typeof value !== "number") return 0;
    return Math.floor(value);
}
function number_pow(a, b) {
    if (typeof a !== "number" || typeof b !== "number" || !Number.isInteger(b) || b < 0) return 0;
    return Math.pow(a, b);
}
function number_from_text(text) {
    if (typeof text !== "string" || !/^-?[0-9]+$/.test(text)) return 0;
    const value = Number(text);
    return Number.isSafeInteger(value) ? value : 0;
}
function number_to_text(value) {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "";
    return String(value);
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
function join(left, right) {

    return (left + right);
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

}
function $mini_file_5() {

}
function $mini_file_6() {
    io_write_line(number_to_text((join("a", 0)).length));
}
function $mini_main() {
    $mini_file_0();
    $mini_file_1();
    $mini_file_2();
    $mini_file_3();
    $mini_file_4();
    $mini_file_5();
    $mini_file_6();
}
$mini_main();
