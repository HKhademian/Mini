#!/usr/bin/env node
"use strict";
import { readFileSync, writeSync } from "node:fs";
function $mini_io_write() {
    const values = Array.prototype.slice.call(arguments);
    let text = "";
    for (const value of values) text += $mini_to_text(value);
    writeSync(1, text);
    return 0;
}
function $mini_number_to_text(value) {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "";
    return String(value);
}
function $mini_path_is_exists(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.existsSync(path); } catch { return false; }
}
function $mini_to_text(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return $mini_number_to_text(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value !== null && typeof value === "object") return json_to_text(value);
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
function map_new() { return Object.create(null); }
function map_get(items, key) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return 0;
    return Object.prototype.hasOwnProperty.call(items, key) ? items[key] : 0;
}
function map_set(items, key, value) {
    if (items !== null && typeof items === "object" && !Array.isArray(items) && typeof key === "string") items[key] = value;
    return 0;
}
function map_has(items, key) {
    return items !== null && typeof items === "object" && !Array.isArray(items) && typeof key === "string" && Object.prototype.hasOwnProperty.call(items, key);
}
function map_keys(items) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return [];
    return Object.keys(items);
}
function map_delete(items, key) {
    if (items !== null && typeof items === "object" && !Array.isArray(items) && typeof key === "string") delete items[key];
    return 0;
}
function map_copy(items) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return Object.create(null);
    return Object.assign(Object.create(null), items);
}
function map_of() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    let entries = $mini_fn_args;
    let result = map_new();
    let position = 0;
    while ((position < (entries).length)) {
        let key = list_get(entries, position);
        let value = 0;
        if (((position + 1) < (entries).length)) {
            value = list_get(entries, (position + 1));
        }
        map_set(result, key, value);
        position = (position + 2);
    }
    return result;
}
function text_length(source) { return typeof source === "string" ? source.length : 0; }
function text_get(source, index) { if (typeof source === "string" && Number.isInteger(index) && index >= 0 && index < source.length) return source[index]; return ""; }
function text_code(source) { return typeof source === "string" && source.length > 0 ? source.codePointAt(0) : 0; }
function text_from_code(code) { if (typeof code !== "number" || !Number.isInteger(code) || code < 0 || code > 0x10FFFF || (code >= 0xD800 && code <= 0xDFFF)) return ""; return String.fromCodePoint(code); }
function split_lines(source) {

    let lines = text_split(source, "\n");
    let position = 0;
    while ((position < ((lines).length - 1))) {
        let line = list_get(lines, position);
        if (((text_length(line) > 0) && (text_get(line, (text_length(line) - 1)) === "\r"))) {
            list_set(lines, position, text_slice(line, 0, (text_length(line) - 1)));
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
        if ((text_length(line) > 0)) {
            list_set(result, (result).length, ("    " + line));
        }
        position = (position + 1);
    }
    return list_join(result, "\n");
}
function text_ends_with(source, suffix) {

    let size = text_length(suffix);
    let length = text_length(source);
    if ((size > length)) {
        return false;
    }
    return (text_slice(source, (length - size), length) === suffix);
}
function is_letter(character) {

    return (text_find("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_", character) >= 0);
}
function is_digit(character) {

    return (text_find("0123456789", character) >= 0);
}
function is_identifier_part(character) {

    return (is_letter(character) || is_digit(character));
}
function is_two_character_symbol(value) {

    return (((((((value === "==") || (value === "!=")) || (value === "<=")) || (value === ">=")) || (value === "&&")) || (value === "||")) || (value === ":="));
}
function text_starts_with(source, prefix) {

    let size = text_length(prefix);
    if ((size > text_length(source))) {
        return false;
    }
    return (text_slice(source, 0, size) === prefix);
}
function text_chomp(text) {

    let length = text_length(text);
    while (((length > 0) && ((text_get(text, (length - 1)) === "\n") || (text_get(text, (length - 1)) === "\r")))) {
        length = (length - 1);
    }
    return text_slice(text, 0, length);
}
function text_trim_end(text) {

    let length = text_length(text);
    while ((length > 0)) {
        let character = text_get(text, (length - 1));
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
    let end = text_length(text);
    while (((start < end) && (text_find(" \t\r\n", text_get(text, start)) >= 0))) {
        start = (start + 1);
    }
    while (((end > start) && (text_find(" \t\r\n", text_get(text, (end - 1))) >= 0))) {
        end = (end - 1);
    }
    return text_slice(text, start, end);
}
function text_find_from(text, needle, start) {

    let text_size = text_length(text);
    let needle_size = text_length(needle);
    if ((needle_size === 0)) {
        if ((start <= text_size)) {
            return start;
        }
        return (-1);
    }
    let position = start;
    while (((position + needle_size) <= text_size)) {
        let offset = 0;
        let matched = true;
        while ((offset < needle_size)) {
            if ((text_get(text, (position + offset)) !== text_get(needle, offset))) {
                matched = false;
                offset = needle_size;
            } else {
                offset = (offset + 1);
            }
        }
        if (matched) {
            return position;
        }
        position = (position + 1);
    }
    return (-1);
}
function text_find(source, needle) { return typeof source === "string" && typeof needle === "string" ? source.indexOf(needle) : -1; }
function text_split(source, divider) { if (typeof source !== "string" || typeof divider !== "string") return []; if (divider === "") return [source]; return source.split(divider); }
function text_byte_at(bytes, index) {

    if ((((!value_is_list(bytes)) || (index < 0)) || (index >= (bytes).length))) {
        return 0;
    }
    let value = list_get(bytes, index);
    if (((!value_is_number(value)) || (number_floor(value) !== value))) {
        return 0;
    }
    let byte = number_mod(value, 256);
    if ((byte < 0)) {
        byte = (byte + 256);
    }
    return byte;
}
function text_byte_push(bytes, value) {

    list_set(bytes, (bytes).length, value);
    return 0;
}
function text_to_bytes(source) { return typeof source === "string" ? Array.from(Buffer.from(source, "utf8")) : []; }
function text_from_bytes(bytes) { if (!Array.isArray(bytes)) return ""; return Buffer.from(bytes.map(value => typeof value === "number" && Number.isInteger(value) ? value & 255 : 0)).toString("utf8"); }
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
function result_ok(value, message) {

    let result = map_new();
    map_set(result, "ok", true);
    map_set(result, "value", value);
    map_set(result, "message", message);
    return result;
}
function result_fail(message) {

    let result = map_new();
    map_set(result, "ok", false);
    map_set(result, "value", 0);
    map_set(result, "message", message);
    return result;
}
function result_is_ok(result) {

    if ((!value_is_map(result))) {
        return false;
    }
    return (map_get(result, "ok") === true);
}
function result_is_fail(result) {

    return (!result_is_ok(result));
}
function result_get_message(result) {

    if ((!value_is_map(result))) {
        return "";
    }
    return map_get(result, "message");
}
function result_set_message(result, message) {

    if (value_is_map(result)) {
        map_set(result, "message", message);
    }
    return result;
}
function result_get_value(result) {

    if ((!value_is_map(result))) {
        return 0;
    }
    return map_get(result, "value");
}
function result_set_value(result, value) {

    if (value_is_map(result)) {
        map_set(result, "value", value);
    }
    return result;
}
function json_parse_file(path) {

    if ((!$mini_path_is_exists(path))) {
        return result_fail(("cannot read " + path));
    }
    let parsed = json_parse(readFileSync(path, "utf8"));
    if (result_is_fail(parsed)) {
        return result_fail(("invalid JSON: " + path));
    }
    return result_ok(result_get_value(parsed), 0);
}
function json_parse_result(ok, value) {

    let result = map_new();
    map_set(result, "ok", ok);
    map_set(result, "value", value);
    return result;
}
function json_space(character) {

    return ((((character === " ") || (character === "\t")) || (character === "\n")) || (character === "\r"));
}
function json_skip(state) {

    while (((map_get(state, "position") < text_length(map_get(state, "text"))) && json_space(text_get(map_get(state, "text"), map_get(state, "position"))))) {
        map_set(state, "position", (map_get(state, "position") + 1));
    }
    return 0;
}
function json_fail(state) {

    map_set(state, "ok", false);
    return 0;
}
function json_peek(state) {

    let position = map_get(state, "position");
    if ((position >= text_length(map_get(state, "text")))) {
        return "";
    }
    return text_get(map_get(state, "text"), position);
}
function json_take(state, expected) {

    if ((json_peek(state) !== expected)) {
        return json_fail(state);
    }
    map_set(state, "position", (map_get(state, "position") + 1));
    return 0;
}
function json_hex_value(character) {

    let digit = text_find("0123456789abcdef", character);
    if ((digit >= 0)) {
        return digit;
    }
    digit = text_find("0123456789ABCDEF", character);
    return digit;
}
function json_hex4(state) {

    let value = 0;
    let count = 0;
    while ((count < 4)) {
        let digit = json_hex_value(json_peek(state));
        if ((digit < 0)) {
            json_fail(state);
            return 0;
        }
        value = (number_mul(value, 16) + digit);
        map_set(state, "position", (map_get(state, "position") + 1));
        count = (count + 1);
    }
    return value;
}
function json_string(state) {

    json_take(state, "\"");
    let parts = list_new();
    while ((map_get(state, "ok") && (map_get(state, "position") < text_length(map_get(state, "text"))))) {
        let character = json_peek(state);
        if ((character === "\"")) {
            map_set(state, "position", (map_get(state, "position") + 1));
            return list_join(parts, "");
        }
        if ((character === "\\")) {
            map_set(state, "position", (map_get(state, "position") + 1));
            let escaped = json_peek(state);
            map_set(state, "position", (map_get(state, "position") + 1));
            if ((escaped === "\"")) {
                list_set(parts, (parts).length, "\"");
            } else {
                if ((escaped === "\\")) {
                    list_set(parts, (parts).length, "\\");
                } else {
                    if ((escaped === "/")) {
                        list_set(parts, (parts).length, "/");
                    } else {
                        if ((escaped === "b")) {
                            list_set(parts, (parts).length, text_from_code(8));
                        } else {
                            if ((escaped === "f")) {
                                list_set(parts, (parts).length, text_from_code(12));
                            } else {
                                if ((escaped === "n")) {
                                    list_set(parts, (parts).length, "\n");
                                } else {
                                    if ((escaped === "r")) {
                                        list_set(parts, (parts).length, "\r");
                                    } else {
                                        if ((escaped === "t")) {
                                            list_set(parts, (parts).length, "\t");
                                        } else {
                                            if ((escaped === "u")) {
                                                let code = json_hex4(state);
                                                if (((((code >= 55296) && (code <= 56319)) && (json_peek(state) === "\\")) && (text_get(map_get(state, "text"), (map_get(state, "position") + 1)) === "u"))) {
                                                    map_set(state, "position", (map_get(state, "position") + 2));
                                                    let low = json_hex4(state);
                                                    if (((low >= 56320) && (low <= 57343))) {
                                                        code = ((65536 + number_mul((code - 55296), 1024)) + (low - 56320));
                                                    } else {
                                                        json_fail(state);
                                                    }
                                                }
                                                list_set(parts, (parts).length, text_from_code(code));
                                            } else {
                                                json_fail(state);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            list_set(parts, (parts).length, character);
            map_set(state, "position", (map_get(state, "position") + 1));
        }
    }
    json_fail(state);
    return "";
}
function json_number(state) {

    let start = map_get(state, "position");
    if ((json_peek(state) === "-")) {
        map_set(state, "position", (map_get(state, "position") + 1));
    }
    if ((text_find("0123456789", json_peek(state)) < 0)) {
        json_fail(state);
        return 0;
    }
    while ((text_find("0123456789", json_peek(state)) >= 0)) {
        map_set(state, "position", (map_get(state, "position") + 1));
    }
    if ((((json_peek(state) === ".") || (json_peek(state) === "e")) || (json_peek(state) === "E"))) {
        json_fail(state);
        return 0;
    }
    return number_from_text(text_slice(map_get(state, "text"), start, map_get(state, "position")));
}
function json_array(state) {

    json_take(state, "[");
    let result = list_new();
    json_skip(state);
    if ((json_peek(state) === "]")) {
        map_set(state, "position", (map_get(state, "position") + 1));
        return result;
    }
    while (map_get(state, "ok")) {
        let value = json_value(state);
        if ((!map_get(state, "ok"))) {
            return result;
        }
        list_set(result, (result).length, value);
        json_skip(state);
        if ((json_peek(state) === "]")) {
            map_set(state, "position", (map_get(state, "position") + 1));
            return result;
        }
        json_take(state, ",");
        json_skip(state);
    }
    return result;
}
function json_object(state) {

    json_take(state, "{");
    let result = map_new();
    json_skip(state);
    if ((json_peek(state) === "}")) {
        map_set(state, "position", (map_get(state, "position") + 1));
        return result;
    }
    while (map_get(state, "ok")) {
        json_skip(state);
        let key = json_string(state);
        json_skip(state);
        json_take(state, ":");
        json_skip(state);
        let value = json_value(state);
        if ((!map_get(state, "ok"))) {
            return result;
        }
        map_set(result, key, value);
        json_skip(state);
        if ((json_peek(state) === "}")) {
            map_set(state, "position", (map_get(state, "position") + 1));
            return result;
        }
        json_take(state, ",");
    }
    return result;
}
function json_value(state) {

    json_skip(state);
    let character = json_peek(state);
    if ((character === "\"")) {
        return json_string(state);
    }
    if ((character === "[")) {
        return json_array(state);
    }
    if ((character === "{")) {
        return json_object(state);
    }
    if (((character === "-") || (text_find("0123456789", character) >= 0))) {
        return json_number(state);
    }
    if (text_starts_with(text_slice(map_get(state, "text"), map_get(state, "position"), text_length(map_get(state, "text"))), "true")) {
        map_set(state, "position", (map_get(state, "position") + 4));
        return true;
    }
    if (text_starts_with(text_slice(map_get(state, "text"), map_get(state, "position"), text_length(map_get(state, "text"))), "false")) {
        map_set(state, "position", (map_get(state, "position") + 5));
        return false;
    }
    if (text_starts_with(text_slice(map_get(state, "text"), map_get(state, "position"), text_length(map_get(state, "text"))), "null")) {
        map_set(state, "position", (map_get(state, "position") + 4));
        return 0;
    }
    json_fail(state);
    return 0;
}
function json_parse(text) {
    const result = Object.create(null);
    result.ok = false;
    result.value = 0;
    if (typeof text !== "string") return result;
    let parsed;
    try { parsed = JSON.parse(text); } catch { return result; }
    const clean = (item) => {
        if (item === null) return 0;
        if (typeof item === "number") { if (!Number.isSafeInteger(item)) throw 0; return item; }
        if (Array.isArray(item)) return item.map(clean);
        if (typeof item === "object") {
            const out = Object.create(null);
            for (const key of Object.keys(item)) out[key] = clean(item[key]);
            return out;
        }
        return item;
    };
    try { result.value = clean(parsed); } catch { return result; }
    result.ok = true;
    return result;
}
function json_escape(text) {

    let parts = list_of("\"");
    let position = 0;
    while ((position < text_length(text))) {
        let character = text_get(text, position);
        if ((character === "\"")) {
            list_set(parts, (parts).length, "\\\"");
        } else {
            if ((character === "\\")) {
                list_set(parts, (parts).length, "\\\\");
            } else {
                if ((text_code(character) === 8)) {
                    list_set(parts, (parts).length, "\\b");
                } else {
                    if ((text_code(character) === 12)) {
                        list_set(parts, (parts).length, "\\f");
                    } else {
                        if ((character === "\n")) {
                            list_set(parts, (parts).length, "\\n");
                        } else {
                            if ((character === "\r")) {
                                list_set(parts, (parts).length, "\\r");
                            } else {
                                if ((character === "\t")) {
                                    list_set(parts, (parts).length, "\\t");
                                } else {
                                    if ((text_code(character) < 32)) {
                                        let code = text_code(character);
                                        let digits = "0123456789abcdef";
                                        list_set(parts, (parts).length, (("\\u00" + text_get(digits, number_div(code, 16))) + text_get(digits, number_mod(code, 16))));
                                    } else {
                                        list_set(parts, (parts).length, character);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        position = (position + 1);
    }
    list_set(parts, (parts).length, "\"");
    return list_join(parts, "");
}
function json_encode(value, seen, state) {

    if (value_is_text(value)) {
        return json_escape(value);
    }
    if (value_is_number(value)) {
        if ((number_to_text(value) === "")) {
            return "null";
        }
        return number_to_text(value);
    }
    if (value_is_boolean(value)) {
        if (value) {
            return "true";
        }
        return "false";
    }
    if ((value_is_list(value) || value_is_map(value))) {
        if (list_contains(seen, value)) {
            map_set(state, "ok", false);
            return "";
        }
        list_push_back(seen, value);
        let parts = list_new();
        if (value_is_list(value)) {
            list_set(parts, (parts).length, "[");
            let position = 0;
            while ((position < (value).length)) {
                if ((position > 0)) {
                    list_set(parts, (parts).length, ",");
                }
                list_set(parts, (parts).length, json_encode(list_get(value, position), seen, state));
                if ((!map_get(state, "ok"))) {
                    return "";
                }
                position = (position + 1);
            }
            list_set(parts, (parts).length, "]");
        } else {
            list_set(parts, (parts).length, "{");
            let keys = list_sorted(map_keys(value));
            let index = 0;
            while ((index < (keys).length)) {
                if ((index > 0)) {
                    list_set(parts, (parts).length, ",");
                }
                let key = list_get(keys, index);
                list_set(parts, (parts).length, (json_escape(key) + ":"));
                list_set(parts, (parts).length, json_encode(map_get(value, key), seen, state));
                if ((!map_get(state, "ok"))) {
                    return "";
                }
                index = (index + 1);
            }
            list_set(parts, (parts).length, "}");
        }
        list_pop_back(seen);
        return list_join(parts, "");
    }
    return "null";
}
function json_to_text(value) {
    const seen = new Set();
    function encode(item) {
        if (typeof item === "string") return JSON.stringify(item);
        if (typeof item === "number") { const text = number_to_text(item); return text === "" ? "null" : text; }
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

}
function $mini_file_5() {

}
function $mini_file_6() {

}
function $mini_file_7() {

}
function $mini_file_8() {

}
function $mini_file_9() {
    io_write_line("ok");
}
function $mini_main() {
    $mini_file_0();
    $mini_file_1();
    $mini_file_2();
    $mini_file_3();
    $mini_file_4();
    $mini_file_5();
    $mini_file_6();
    $mini_file_7();
    $mini_file_8();
    $mini_file_9();
}
$mini_main();
