#!/usr/bin/env node
"use strict";
import { readFileSync, writeFileSync, writeSync } from "node:fs";
const $mini_map_proto = { __proto__: null };
function $mini_map_get(items, key) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return 0;
    const value = items[key];
    return value !== undefined || key in items ? value : 0;
}
function $mini_map_has(items, key) {
    return key in items;
}
function $mini_map_set(items, key, value) {
    if (items !== null && typeof items === "object" && !Array.isArray(items)) items[key] = value;
}
function $mini_directory_create(path) {
    process.getBuiltinModule("node:fs").mkdirSync(path, { recursive: true });
}
function $mini_directory_list(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.readdirSync(path).sort(); } catch { return []; }
}
function $mini_file_read_bytes(path) {
    return Array.from(process.getBuiltinModule("node:fs").readFileSync(path));
}
function $mini_file_write_bytes(path, bytes) {
    const values = Array.isArray(bytes) ? bytes.map(value => typeof value === "number" && Number.isInteger(value) ? value & 255 : 0) : [];
    process.getBuiltinModule("node:fs").writeFileSync(path, Buffer.from(values));
}
function $mini_hash_sha256(value) {
    const crypto = process.getBuiltinModule("node:crypto");
    const bytes = Array.isArray(value)
        ? Buffer.from(value.map(item => typeof item === "number" && Number.isInteger(item) ? item & 255 : 0))
        : Buffer.from(typeof value === "string" ? value : String(value), "utf8");
    return crypto.createHash("sha256").update(bytes).digest("hex");
}
function $mini_json_parse(text) {
    const result = { __proto__: null, ok: false, value: 0 };
    if (typeof text !== "string") return result;
    let parsed;
    try { parsed = JSON.parse(text); } catch { return result; }
    const clean = (item) => {
        if (item === null) return 0;
        if (Array.isArray(item)) return item.map(clean);
        if (typeof item === "object") {
            const out = { __proto__: null };
            for (const key of Object.keys(item)) out[key] = clean(item[key]);
            return out;
        }
        return item;
    };
    result.ok = true;
    result.value = clean(parsed);
    return result;
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
function $mini_list_copy(items) {
    if (!Array.isArray(items)) return [];
    return items.slice();
}
function $mini_list_get(items, index) {
    if (!Array.isArray(items)) return 0;
    if (index < 0) index = items.length + index;
    if (index >= 0 && index < items.length && index in items) return items[index];
    return 0;
}
function $mini_list_set(items, index, value) {
    if (!Array.isArray(items)) return;
    if (index < 0) index = items.length + index;
    if (index >= 0) items[index] = value;
}
function $mini_list_to_text(items, separator) {
    if (!Array.isArray(items) || typeof separator !== "string") return "";
    let output = "";
    for (let index = 0; index < items.length; index++) {
        if (index > 0) output += separator;
        const value = items[index];
        if (typeof value === "string") output += value;
    }
    return output;
}
function $mini_number_to_text(value) {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "";
    return String(value);
}
function $mini_process_spawn(options) {
    const output = { __proto__: null, status: 1, signal: "", stdout: [], stderr: [], error: "" };
    const child = process.getBuiltinModule("node:child_process");
    const settings = options !== null && typeof options === "object" ? options : {};
    const command = typeof settings.command === "string" ? settings.command : "";
    const args = Array.isArray(settings.arguments) ? settings.arguments.map(String) : [];
    const mode = settings.mode === "inherit" ? "inherit" : "capture";
    const directory = typeof settings.directory === "string" && settings.directory !== "" ? settings.directory : undefined;
    const timeout = typeof settings.timeout === "number" && settings.timeout > 0 ? settings.timeout : undefined;
    const input = Array.isArray(settings.input)
        ? Buffer.from(settings.input.map(value => typeof value === "number" && Number.isInteger(value) ? value & 255 : 0))
        : undefined;
    const result = child.spawnSync(command, args, {
        cwd: directory,
        stdio: mode === "inherit" ? "inherit" : "pipe",
        input: mode === "inherit" ? undefined : input,
        timeout,
        maxBuffer: 64 * 1024 * 1024,
    });
    if (result.error) output.error = String(result.error.message);
    if (result.status !== null) output.status = result.status;
    if (typeof result.signal === "string") output.signal = result.signal;
    if (mode !== "inherit") {
        output.stdout = result.stdout ? Array.from(result.stdout) : [];
        output.stderr = result.stderr ? Array.from(result.stderr) : [];
    }
    return output;
}
function $mini_path_temp_directory() {
    const fs = process.getBuiltinModule("node:fs");
    const os = process.getBuiltinModule("node:os");
    return fs.mkdtempSync(os.tmpdir() + "/mini-");
}
function $mini_path_copy(from, to) {
    process.getBuiltinModule("node:fs").cpSync(from, to, { recursive: true, force: true, dereference: true });
}
function $mini_path_is_exists(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.existsSync(path); } catch { return false; }
}
function $mini_path_is_directory(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.statSync(path).isDirectory(); } catch { return false; }
}
function $mini_path_remove(path) {
    process.getBuiltinModule("node:fs").rmSync(path, { recursive: true, force: true });
}
function $mini_text_find(text, needle) {
    if (typeof text !== "string" || typeof needle !== "string") return -1;
    return text.indexOf(needle);
}
function $mini_text_from_bytes(bytes) {
    if (!Array.isArray(bytes)) return "";
    return Buffer.from(bytes.map(value => typeof value === "number" && Number.isInteger(value) ? value & 255 : 0)).toString("utf8");
}
function $mini_text_get(text, index) {
    if (typeof text === "string" && index >= 0 && index < text.length) return text[index];
    return "";
}
function $mini_text_slice(source, start, end) {
    if (typeof source !== "string") return "";
    if (start < 0) start = source.length + start;
    if (end < 0) end = source.length + end;
    if (start < 0) start = 0;
    if (end < 0) end = 0;
    if (start > source.length) start = source.length;
    if (end > source.length) end = source.length;
    if (end <= start) return "";
    return source.slice(start, end);
}
function $mini_text_split(text, divider) {
    if (typeof text !== "string" || typeof divider !== "string") return [];
    if (divider === "") return [text];
    return text.split(divider);
}
function $mini_text_to_bytes(text) {
    if (typeof text !== "string") return [];
    return Array.from(Buffer.from(text, "utf8"));
}
function $mini_value_kind(value) {
    if (typeof value === "string") return "text";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "list";
    if (value !== null && typeof value === "object") return "map";
    return "other";
}
function split_lines(source) {
    let lines = $mini_text_split(source, "\n");
    let position = 0;
    while ((position < ((lines).length - 1))) {
        let line = $mini_list_get(lines, position);
        if ((((line).length > 0) && ($mini_text_get(line, ((line).length - 1)) === "\r"))) {
            $mini_list_set(lines, position, $mini_text_slice(line, 0, ((line).length - 1)));
        }
        position = (position + 1);
    }
    return lines;
}
function indent_output(output) {
    let lines = split_lines(output);
    let result = "";
    let first = true;
    let position = 0;
    while ((position < (lines).length)) {
        let line = $mini_list_get(lines, position);
        if (((line).length > 0)) {
            if ((!first)) {
                result = (result + "\n");
            }
            result = ((result + "    ") + line);
            first = false;
        }
        position = (position + 1);
    }
    return result;
}
function basename(path) {
    let position = ((path).length - 1);
    while ((position >= 0)) {
        if (($mini_text_get(path, position) === "/")) {
            return $mini_text_slice(path, (position + 1), (path).length);
        }
        position = (position - 1);
    }
    return path;
}
function text_ends_with(source, suffix) {
    let size = (suffix).length;
    let length = (source).length;
    if ((size > length)) {
        return false;
    }
    return ($mini_text_slice(source, (length - size), length) === suffix);
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
    return ((((((value === "==") || (value === "!=")) || (value === "<=")) || (value === ">=")) || (value === "&&")) || (value === "||"));
}
function text_starts_with(source, prefix) {
    let size = (prefix).length;
    if ((size > (source).length)) {
        return false;
    }
    return ($mini_text_slice(source, 0, size) === prefix);
}
function dirname(path) {
    let position = ((path).length - 1);
    while ((position >= 0)) {
        let character = $mini_text_get(path, position);
        if (((character === "/") || (character === "\\"))) {
            return $mini_text_slice(path, 0, position);
        }
        position = (position - 1);
    }
    return "";
}
function normalize_path(path) {
    let absolute = text_starts_with(path, "/");
    let parts = $mini_text_split(path, "/");
    let stack = [];
    let position = 0;
    while ((position < (parts).length)) {
        let part = $mini_list_get(parts, position);
        if (((part !== "") && (part !== "."))) {
            if ((part === "..")) {
                if ((((stack).length > 0) && ($mini_list_get(stack, ((stack).length - 1)) !== ".."))) {
                    let kept = [];
                    let index = 0;
                    while ((index < ((stack).length - 1))) {
                        $mini_list_set(kept, (kept).length, $mini_list_get(stack, index));
                        index = (index + 1);
                    }
                    stack = kept;
                } else {
                    if ((!absolute)) {
                        $mini_list_set(stack, (stack).length, "..");
                    }
                }
            } else {
                $mini_list_set(stack, (stack).length, part);
            }
        }
        position = (position + 1);
    }
    let output = $mini_list_to_text(stack, "/");
    if (absolute) {
        return ("/" + output);
    }
    return output;
}
function text_chomp(text) {
    let length = (text).length;
    while (((length > 0) && (($mini_text_get(text, (length - 1)) === "\n") || ($mini_text_get(text, (length - 1)) === "\r")))) {
        length = (length - 1);
    }
    return $mini_text_slice(text, 0, length);
}
function text_trim_end(text) {
    let length = (text).length;
    while ((length > 0)) {
        let character = $mini_text_get(text, (length - 1));
        if ((((character === " ") || (character === "\t")) || (character === "\r"))) {
            length = (length - 1);
        } else {
            return $mini_text_slice(text, 0, length);
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
    return $mini_text_slice(text, start, end);
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
function value_is_other(value) {
    return ($mini_value_kind(value) === "other");
}
function list_has_text(items, value) {
    let position = 0;
    while ((position < (items).length)) {
        if (($mini_list_get(items, position) === value)) {
            return true;
        }
        position = (position + 1);
    }
    return false;
}
function list_join_from(items, start, separator) {
    let parts = [];
    let position = start;
    while ((position < (items).length)) {
        $mini_list_set(parts, (parts).length, $mini_list_get(items, position));
        position = (position + 1);
    }
    return $mini_list_to_text(parts, separator);
}
function list_reverse(items) {
    let result = [];
    let position = ((items).length - 1);
    while ((position >= 0)) {
        $mini_list_set(result, (result).length, $mini_list_get(items, position));
        position = (position - 1);
    }
    return result;
}
function list_sorted(items) {
    let result = $mini_list_copy(items);
    let position = 0;
    while ((position < (result).length)) {
        let cursor = (position + 1);
        while ((cursor < (result).length)) {
            if (($mini_list_get(result, cursor) < $mini_list_get(result, position))) {
                let hold = $mini_list_get(result, position);
                $mini_list_set(result, position, $mini_list_get(result, cursor));
                $mini_list_set(result, cursor, hold);
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
        if (($mini_list_get(items, position) === value)) {
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
        if (($mini_value_kind($mini_list_get(value, position)) !== "text")) {
            return false;
        }
        position = (position + 1);
    }
    return true;
}
function list_of2(first, second) {
    let result = [];
    $mini_list_set(result, 0, first);
    $mini_list_set(result, 1, second);
    return result;
}
function list_of3(first, second, third) {
    let result = [];
    $mini_list_set(result, 0, first);
    $mini_list_set(result, 1, second);
    $mini_list_set(result, 2, third);
    return result;
}
function path_join(left, right) {
    if ((left === "")) {
        return right;
    }
    if ((right === "")) {
        return left;
    }
    if ((text_ends_with(left, "/") || text_ends_with(left, "\\"))) {
        return (left + right);
    }
    return ((left + "/") + right);
}
function path_parent(path) {
    let position = ((path).length - 1);
    while ((position >= 0)) {
        let character = $mini_text_get(path, position);
        if (((character === "/") || (character === "\\"))) {
            return $mini_text_slice(path, 0, position);
        }
        position = (position - 1);
    }
    return "";
}
function path_basename(path) {
    let position = ((path).length - 1);
    while ((position >= 0)) {
        let character = $mini_text_get(path, position);
        if (((character === "/") || (character === "\\"))) {
            return $mini_text_slice(path, (position + 1), (path).length);
        }
        position = (position - 1);
    }
    return path;
}
function path_is_absolute(path) {
    if (text_starts_with(path, "/")) {
        return true;
    }
    return ((((path).length > 2) && ($mini_text_get(path, 1) === ":")) && (($mini_text_get(path, 2) === "/") || ($mini_text_get(path, 2) === "\\")));
}
function path_normalize(path) {
    let absolute = text_starts_with(path, "/");
    let parts = $mini_text_split(path, "/");
    let stack = [];
    let position = 0;
    while ((position < (parts).length)) {
        let part = $mini_list_get(parts, position);
        if (((part === "") || (part === "."))) {
        } else {
            if ((part === "..")) {
                if ((((stack).length > 0) && ($mini_list_get(stack, ((stack).length - 1)) !== ".."))) {
                    $mini_list_set(stack, ((stack).length - 1), "");
                    $mini_list_set(stack, (stack).length, "");
                    let kept = [];
                    let index = 0;
                    while ((index < (stack).length)) {
                        if (($mini_list_get(stack, index) !== "")) {
                            $mini_list_set(kept, (kept).length, $mini_list_get(stack, index));
                        }
                        index = (index + 1);
                    }
                    stack = kept;
                } else {
                    if ((!absolute)) {
                        $mini_list_set(stack, (stack).length, part);
                    }
                }
            } else {
                $mini_list_set(stack, (stack).length, part);
            }
        }
        position = (position + 1);
    }
    let output = $mini_list_to_text(stack, "/");
    if (absolute) {
        return ("/" + output);
    }
    return output;
}
function path_resolve(base, path) {
    if (path_is_absolute(path)) {
        return path_normalize(path);
    }
    return path_normalize(path_join(base, path));
}
function process_capture(command, args, directory, input) {
    let options = ({ __proto__: $mini_map_proto });
    $mini_map_set(options, "command", command);
    $mini_map_set(options, "arguments", args);
    $mini_map_set(options, "directory", directory);
    $mini_map_set(options, "input", input);
    $mini_map_set(options, "timeout", 30000);
    return $mini_process_spawn(options);
}
function result_ok(value, message) {
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "ok", true);
    $mini_map_set(result, "value", value);
    $mini_map_set(result, "message", message);
    return result;
}
function result_fail(message) {
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "ok", false);
    $mini_map_set(result, "value", 0);
    $mini_map_set(result, "message", message);
    return result;
}
function result_is_ok(result) {
    if ((!value_is_map(result))) {
        return false;
    }
    return ($mini_map_get(result, "ok") === true);
}
function result_is_fail(result) {
    return (!result_is_ok(result));
}
function result_get_message(result) {
    if ((!value_is_map(result))) {
        return "";
    }
    return $mini_map_get(result, "message");
}
function result_set_message(result, message) {
    if (value_is_map(result)) {
        $mini_map_set(result, "message", message);
    }
    return result;
}
function result_get_value(result) {
    if ((!value_is_map(result))) {
        return 0;
    }
    return $mini_map_get(result, "value");
}
function result_set_value(result, value) {
    if (value_is_map(result)) {
        $mini_map_set(result, "value", value);
    }
    return result;
}
function json_parse_file(path) {
    if ((!$mini_path_is_exists(path))) {
        return result_fail(("cannot read " + path));
    }
    let parsed = $mini_json_parse(readFileSync(path, "utf8"));
    if (result_is_fail(parsed)) {
        return result_fail(("invalid JSON: " + path));
    }
    return result_ok($mini_map_get(parsed, "value"), "");
}
function project_root() {
    let script = process.argv[1];
    let base = path_parent(path_parent(script));
    if ((path_basename(base) === "dist")) {
        return path_parent(base);
    }
    return base;
}
function project_compiler_entry(root) {
    let parsed = json_parse_file(path_join(root, "config/compiler.json"));
    if (result_is_fail(parsed)) {
        result_fail($mini_map_get(parsed, "message"));
        return "";
    }
    return $mini_map_get($mini_map_get(parsed, "value"), "entry");
}
function case_kinds() {
    let kinds = [];
    $mini_list_set(kinds, 0, "tool");
    $mini_list_set(kinds, 1, "feature");
    $mini_list_set(kinds, 2, "reject");
    $mini_list_set(kinds, 3, "compile");
    $mini_list_set(kinds, 4, "sample");
    $mini_list_set(kinds, 5, "example");
    return kinds;
}
function case_stream_valid(stream) {
    if ((!value_is_map(stream))) {
        return false;
    }
    let count = 0;
    if ($mini_map_has(stream, "text")) {
        count = (count + 1);
    }
    if ($mini_map_has(stream, "bytes")) {
        count = (count + 1);
    }
    if ($mini_map_has(stream, "file")) {
        count = (count + 1);
    }
    return (count === 1);
}
function case_stream_bytes(stream, directory) {
    if ((!value_is_map(stream))) {
        return result_fail("stream must be an object");
    }
    let count = 0;
    if ($mini_map_has(stream, "text")) {
        count = (count + 1);
    }
    if ($mini_map_has(stream, "bytes")) {
        count = (count + 1);
    }
    if ($mini_map_has(stream, "file")) {
        count = (count + 1);
    }
    if ((count !== 1)) {
        return result_fail("one stream representation required");
    }
    let bytes = [];
    if ($mini_map_has(stream, "text")) {
        if (($mini_value_kind($mini_map_get(stream, "text")) !== "text")) {
            return result_fail("stream text must be a string");
        }
        bytes = $mini_text_to_bytes($mini_map_get(stream, "text"));
    } else {
        if ($mini_map_has(stream, "bytes")) {
            bytes = $mini_map_get(stream, "bytes");
            if ((!value_is_list(bytes))) {
                return result_fail("invalid stream bytes");
            }
            let position = 0;
            while ((position < (bytes).length)) {
                let value = $mini_list_get(bytes, position);
                if ((((!value_is_number(value)) || (value < 0)) || (value > 255))) {
                    return result_fail("invalid stream bytes");
                }
                position = (position + 1);
            }
        } else {
            if (($mini_value_kind($mini_map_get(stream, "file")) !== "text")) {
                return result_fail("invalid stream");
            }
            let file = path_resolve(directory, $mini_map_get(stream, "file"));
            if ((!$mini_path_is_exists(file))) {
                return result_fail(("cannot read " + file));
            }
            bytes = $mini_file_read_bytes(file);
        }
    }
    if ($mini_map_has(stream, "hash")) {
        let expected = $mini_map_get(stream, "hash");
        if ((expected !== ("sha256:" + $mini_hash_sha256(bytes)))) {
            return result_fail("stream hash differs");
        }
    }
    let result = result_ok(0, "");
    $mini_map_set(result, "bytes", bytes);
    return result;
}
function case_bytes_equal(left, right) {
    if (((left).length !== (right).length)) {
        return false;
    }
    let position = 0;
    while ((position < (left).length)) {
        if (($mini_list_get(left, position) !== $mini_list_get(right, position))) {
            return false;
        }
        position = (position + 1);
    }
    return true;
}
function case_stream_text(stream, directory) {
    let bytes = case_stream_bytes(stream, directory);
    if (result_is_fail(bytes)) {
        return "";
    }
    return $mini_text_from_bytes($mini_map_get(bytes, "bytes"));
}
function case_load_case(path) {
    let parsed = json_parse_file(path);
    if (result_is_fail(parsed)) {
        return parsed;
    }
    let spec = $mini_map_get(parsed, "value");
    let id = $mini_map_get(spec, "id");
    if ((((!$mini_map_has(spec, "id")) || (!value_is_text(id))) || ((id).length === 0))) {
        return result_fail(("case ID required: " + path));
    }
    let kind = $mini_map_get(spec, "kind");
    if ((!list_contains(case_kinds(), kind))) {
        return result_fail(("invalid case kind: " + id));
    }
    if (($mini_map_has(spec, "pending") && (((kind === "tool") || ($mini_value_kind($mini_map_get(spec, "pending")) !== "text")) || (($mini_map_get(spec, "pending")).length === 0)))) {
        return result_fail("pending needs a language case and reason");
    }
    let directory = path_parent(path);
    if ((kind === "tool")) {
        let tool = $mini_map_get(spec, "tool");
        if (((((!$mini_map_has(spec, "tool")) || (!value_is_text(tool))) || ($mini_text_find(tool, "/") >= 0)) || (!$mini_path_is_exists(path_join(path_join(project_root(), "bin"), tool))))) {
            return result_fail(("unknown tool: " + id));
        }
    } else {
        let source = $mini_map_get(spec, "source");
        if (((((!$mini_map_has(spec, "source")) || (!value_is_text(source))) || (!text_ends_with(source, ".mini"))) || (!$mini_path_is_exists(path_resolve(directory, source))))) {
            return result_fail(("case source missing: " + id));
        }
    }
    if (((!$mini_map_has(spec, "features")) || (!list_is_text($mini_map_get(spec, "features"))))) {
        return result_fail(("features must be a list: " + id));
    }
    if ((((!$mini_map_has(spec, "cases")) || ($mini_value_kind($mini_map_get(spec, "cases")) !== "list")) || (($mini_map_get(spec, "cases")).length === 0))) {
        return result_fail(("case scenarios required: " + id));
    }
    let scenarios = $mini_map_get(spec, "cases");
    let names = ({ __proto__: $mini_map_proto });
    let position = 0;
    while ((position < (scenarios).length)) {
        let scenario = $mini_list_get(scenarios, position);
        let name = $mini_map_get(scenario, "name");
        if ((((((!value_is_map(scenario)) || (!$mini_map_has(scenario, "name"))) || (!value_is_text(name))) || ((name).length === 0)) || $mini_map_has(names, name))) {
            return result_fail(("scenario names must be unique: " + id));
        }
        $mini_map_set(names, name, true);
        let check = case_validate_scenario(spec, kind, scenario, directory);
        if (result_is_fail(check)) {
            return check;
        }
        position = (position + 1);
    }
    let fixture = ({ __proto__: $mini_map_proto });
    $mini_map_set(fixture, "path", path);
    $mini_map_set(fixture, "definition", spec);
    let result = result_ok(0, "");
    $mini_map_set(result, "fixture", fixture);
    return result;
}
function case_validate_scenario(spec, kind, scenario, directory) {
    let id = $mini_map_get(spec, "id");
    let name = $mini_map_get(scenario, "name");
    let prefix = (((id + "/") + name) + ": ");
    if (((((!$mini_map_has(scenario, "exitCode")) || ($mini_value_kind($mini_map_get(scenario, "exitCode")) !== "number")) || ($mini_map_get(scenario, "exitCode") < 0)) || ($mini_map_get(scenario, "exitCode") > 255))) {
        return result_fail((prefix + "invalid exit status"));
    }
    if (($mini_map_has(scenario, "args") && (!list_is_text($mini_map_get(scenario, "args"))))) {
        return result_fail((prefix + "invalid arguments"));
    }
    let streams = [];
    $mini_list_set(streams, 0, "stdin");
    $mini_list_set(streams, 1, "stdout");
    $mini_list_set(streams, 2, "stderr");
    let position = 0;
    while ((position < (streams).length)) {
        let key = $mini_list_get(streams, position);
        if ((!$mini_map_has(scenario, key))) {
            return result_fail("invalid stream");
        }
        let bytes = case_stream_bytes($mini_map_get(scenario, key), directory);
        if (result_is_fail(bytes)) {
            return result_fail($mini_map_get(bytes, "message"));
        }
        position = (position + 1);
    }
    let runnable = (((kind === "feature") || (kind === "sample")) || (kind === "example"));
    if (($mini_map_has(scenario, "inputFiles") || $mini_map_has(scenario, "outputFiles"))) {
        if ((!runnable)) {
            return result_fail((prefix + "file fixtures need a runnable Mini case"));
        }
        let groups = [];
        $mini_list_set(groups, 0, "inputFiles");
        $mini_list_set(groups, 1, "outputFiles");
        position = 0;
        while ((position < (groups).length)) {
            let group_key = $mini_list_get(groups, position);
            if ($mini_map_has(scenario, group_key)) {
                let files = $mini_map_get(scenario, group_key);
                if ((!value_is_map(files))) {
                    return result_fail((prefix + "file fixtures must be an object"));
                }
                let keys = Object.keys(files);
                let index = 0;
                while ((index < (keys).length)) {
                    let file_name = $mini_list_get(keys, index);
                    if (((((file_name).length === 0) || path_is_absolute(file_name)) || ($mini_text_find(file_name, "..") >= 0))) {
                        return result_fail("file fixture paths must stay inside the case workspace");
                    }
                    if ((!case_stream_valid($mini_map_get(files, file_name)))) {
                        return result_fail("invalid stream");
                    }
                    index = (index + 1);
                }
            }
            position = (position + 1);
        }
    }
    if (($mini_map_has(scenario, "artifact") && ((kind !== "compile") || (!case_stream_valid($mini_map_get(scenario, "artifact")))))) {
        return result_fail((prefix + "only compile cases compare generated artifacts"));
    }
    if (($mini_map_has(scenario, "workspace") && (kind !== "tool"))) {
        return result_fail((prefix + "invalid workspace"));
    }
    if ($mini_map_has(scenario, "tag")) {
        let tag = $mini_map_get(scenario, "tag");
        if (((((((!$mini_map_has(scenario, "workspace")) || (!value_is_map(tag))) || (!$mini_map_has(tag, "name"))) || ($mini_value_kind($mini_map_get(tag, "name")) !== "text")) || (!$mini_map_has(tag, "annotated"))) || ($mini_value_kind($mini_map_get(tag, "annotated")) !== "boolean"))) {
            return result_fail((prefix + "invalid fixture tag"));
        }
    }
    if (($mini_map_has(scenario, "files") && (!list_is_text($mini_map_get(scenario, "files"))))) {
        return result_fail((prefix + "invalid artifact paths"));
    }
    return result_ok(0, "");
}
function case_collect(directory, filter, fixtures, ids) {
    let entries = $mini_directory_list(directory);
    let position = 0;
    while ((position < (entries).length)) {
        let name = $mini_list_get(entries, position);
        let path = path_join(directory, name);
        if ($mini_path_is_directory(path)) {
            let nested = case_collect(path, filter, fixtures, ids);
            if (result_is_fail(nested)) {
                return nested;
            }
        } else {
            if (text_ends_with(name, ".case.json")) {
                let loaded = case_load_case(path);
                if (result_is_fail(loaded)) {
                    return loaded;
                }
                let fixture = $mini_map_get(loaded, "fixture");
                let id = $mini_map_get($mini_map_get(fixture, "definition"), "id");
                if ($mini_map_has(ids, id)) {
                    return result_fail("duplicate case IDs");
                }
                $mini_map_set(ids, id, true);
                if (((filter === "") || ($mini_text_find(id, filter) >= 0))) {
                    $mini_list_set(fixtures, (fixtures).length, fixture);
                }
            }
        }
        position = (position + 1);
    }
    return result_ok(0, "");
}
function case_load_cases(filter, project_root) {
    let fixtures = [];
    let ids = ({ __proto__: $mini_map_proto });
    let collected = case_collect(path_join(project_root, "cases"), filter, fixtures, ids);
    if (result_is_fail(collected)) {
        return collected;
    }
    if (((fixtures).length === 0)) {
        return result_fail(("no cases match: " + filter));
    }
    let result = result_ok(0, "");
    $mini_map_set(result, "fixtures", fixtures);
    return result;
}
function case_entry_excluded(name) {
    return (((name === ".git") || (name === "node_modules")) || (name === ".cache"));
}
function case_copy_tree(from, to) {
    if ($mini_path_is_directory(from)) {
        $mini_directory_create(to);
        let entries = $mini_directory_list(from);
        let position = 0;
        while ((position < (entries).length)) {
            let name = $mini_list_get(entries, position);
            if (((!case_entry_excluded(name)) && (!((name === "release") && (path_basename(from) === "dist"))))) {
                case_copy_tree(path_join(from, name), path_join(to, name));
            }
            position = (position + 1);
        }
    } else {
        $mini_path_copy(from, to);
    }
    return 0;
}
function case_git(directory, args) {
    let git_args = [];
    $mini_list_set(git_args, 0, "-c");
    $mini_list_set(git_args, 1, "user.name=Case fixture");
    $mini_list_set(git_args, 2, "-c");
    $mini_list_set(git_args, 3, "user.email=fixture@example.invalid");
    $mini_list_set(git_args, 4, "-c");
    $mini_list_set(git_args, 5, "commit.gpgSign=false");
    $mini_list_set(git_args, 6, "-c");
    $mini_list_set(git_args, 7, "tag.gpgSign=false");
    $mini_list_set(git_args, 8, "-c");
    $mini_list_set(git_args, 9, "maintenance.auto=false");
    $mini_list_set(git_args, 10, "-c");
    $mini_list_set(git_args, 11, "gc.auto=0");
    let position = 0;
    while ((position < (args).length)) {
        $mini_list_set(git_args, (git_args).length, $mini_list_get(args, position));
        position = (position + 1);
    }
    return process_capture("git", git_args, directory, []);
}
function case_tool_workspace(project_root, scenario, work) {
    let directory = path_join(work, "project");
    case_copy_tree(project_root, directory);
    let init = case_git(directory, list_of3("init", "-b", "main"));
    if (($mini_map_get(init, "status") !== 0)) {
        return result_fail(("git init failed: " + $mini_text_from_bytes($mini_map_get(init, "stderr"))));
    }
    let added = case_git(directory, list_of2("add", "."));
    if (($mini_map_get(added, "status") !== 0)) {
        return result_fail(("git add failed: " + $mini_text_from_bytes($mini_map_get(added, "stderr"))));
    }
    let committed = case_git(directory, list_of3("commit", "-m", "case fixture"));
    if (($mini_map_get(committed, "status") !== 0)) {
        return result_fail(("git commit failed: " + $mini_text_from_bytes($mini_map_get(committed, "stderr"))));
    }
    if ($mini_map_has(scenario, "tag")) {
        let tag = $mini_map_get(scenario, "tag");
        let tag_args = [];
        $mini_list_set(tag_args, 0, "tag");
        if ($mini_map_get(tag, "annotated")) {
            $mini_list_set(tag_args, 1, "-a");
            $mini_list_set(tag_args, 2, $mini_map_get(tag, "name"));
            $mini_list_set(tag_args, 3, "-m");
            $mini_list_set(tag_args, 4, $mini_map_get(tag, "name"));
        } else {
            $mini_list_set(tag_args, 1, $mini_map_get(tag, "name"));
        }
        let tagged = case_git(directory, tag_args);
        if (($mini_map_get(tagged, "status") !== 0)) {
            return result_fail(("git tag failed: " + $mini_text_from_bytes($mini_map_get(tagged, "stderr"))));
        }
    }
    if (($mini_map_get(scenario, "workspace") === "dirty")) {
        writeFileSync(path_join(directory, "uncommitted.txt"), "dirty\n", "utf8");
    }
    let result = result_ok(0, "");
    $mini_map_set(result, "directory", directory);
    return result;
}
function case_verify_scenario(fixture, scenario, project_root, compiler_override) {
    let definition = $mini_map_get(fixture, "definition");
    let directory = path_parent($mini_map_get(fixture, "path"));
    let id = $mini_map_get(definition, "id");
    let name = $mini_map_get(scenario, "name");
    let prefix = (((id + "/") + name) + ": ");
    let input = case_stream_bytes($mini_map_get(scenario, "stdin"), directory);
    if (result_is_fail(input)) {
        return result_fail((prefix + $mini_map_get(input, "message")));
    }
    let work = $mini_path_temp_directory();
    if (((work).length === 0)) {
        return result_fail((prefix + "cannot create a temporary directory"));
    }
    let result = case_verify_in_work(fixture, scenario, project_root, compiler_override, work, prefix);
    $mini_path_remove(work);
    return result;
}
function case_verify_in_work(fixture, scenario, project_root, compiler_override, work, prefix) {
    let definition = $mini_map_get(fixture, "definition");
    let kind = $mini_map_get(definition, "kind");
    let directory = path_parent($mini_map_get(fixture, "path"));
    let input = case_stream_bytes($mini_map_get(scenario, "stdin"), directory);
    let args = [];
    if ($mini_map_has(scenario, "args")) {
        args = $mini_map_get(scenario, "args");
    }
    let workspace = project_root;
    let result = ({ __proto__: $mini_map_proto });
    let artifact = "";
    if ((kind === "tool")) {
        if ($mini_map_has(scenario, "workspace")) {
            let prepared = case_tool_workspace(project_root, scenario, work);
            if (result_is_fail(prepared)) {
                return result_fail((prefix + $mini_map_get(prepared, "message")));
            }
            workspace = $mini_map_get(prepared, "directory");
        }
        let command_args = [];
        $mini_list_set(command_args, 0, path_join(path_join(workspace, "bin"), $mini_map_get(definition, "tool")));
        let position = 0;
        while ((position < (args).length)) {
            $mini_list_set(command_args, (command_args).length, $mini_list_get(args, position));
            position = (position + 1);
        }
        result = process_capture(process.execPath, command_args, workspace, $mini_map_get(input, "bytes"));
    } else {
        let source = path_resolve(directory, $mini_map_get(definition, "source"));
        let compiler = compiler_override;
        if ((compiler === "")) {
            compiler = project_compiler_entry(project_root);
        }
        let output = path_join(work, "program.mini.ts");
        let compile_args = [];
        $mini_list_set(compile_args, 0, compiler);
        $mini_list_set(compile_args, 1, "compile");
        $mini_list_set(compile_args, 2, source);
        $mini_list_set(compile_args, 3, output);
        result = process_capture(process.execPath, compile_args, project_root, []);
        if ((($mini_map_get(result, "status") === 0) && $mini_path_is_exists(output))) {
            artifact = $mini_hash_sha256($mini_file_read_bytes(output));
        }
        if (((kind === "compile") && $mini_map_has(scenario, "artifact"))) {
            let expected = case_stream_bytes($mini_map_get(scenario, "artifact"), directory);
            if (result_is_fail(expected)) {
                return result_fail((prefix + $mini_map_get(expected, "message")));
            }
            if (((!$mini_path_is_exists(output)) || (!case_bytes_equal($mini_file_read_bytes(output), $mini_map_get(expected, "bytes"))))) {
                return result_fail((prefix + "generated artifact differs"));
            }
        }
        if (((kind === "reject") && $mini_path_is_exists(output))) {
            return result_fail((prefix + "rejection created an output artifact"));
        }
        if (((kind !== "reject") && (kind !== "compile"))) {
            if (($mini_map_get(result, "status") !== 0)) {
                return result_fail((prefix + $mini_text_from_bytes($mini_map_get(result, "stderr"))));
            }
            let files = path_join(work, "files");
            $mini_directory_create(files);
            let prepared_files = case_write_input_files(scenario, directory, files, prefix);
            if (result_is_fail(prepared_files)) {
                return prepared_files;
            }
            let run_args = [];
            $mini_list_set(run_args, 0, output);
            let position = 0;
            while ((position < (args).length)) {
                $mini_list_set(run_args, (run_args).length, $mini_list_get(args, position));
                position = (position + 1);
            }
            result = process_capture(process.execPath, run_args, files, $mini_map_get(input, "bytes"));
            let checked_files = case_check_output_files(scenario, directory, files, prefix);
            if (result_is_fail(checked_files)) {
                return checked_files;
            }
        }
    }
    if (($mini_map_get(result, "status") !== $mini_map_get(scenario, "exitCode"))) {
        return result_fail(((prefix + "exit status") + case_diagnostic(result)));
    }
    let stdout = case_stream_bytes($mini_map_get(scenario, "stdout"), directory);
    if ((!case_bytes_equal($mini_map_get(result, "stdout"), $mini_map_get(stdout, "bytes")))) {
        return result_fail((prefix + "stdout"));
    }
    let stderr = case_stream_bytes($mini_map_get(scenario, "stderr"), directory);
    if ((!case_bytes_equal($mini_map_get(result, "stderr"), $mini_map_get(stderr, "bytes")))) {
        return result_fail((prefix + "stderr"));
    }
    if ((kind === "reject")) {
        if ((($mini_map_get(scenario, "exitCode") === 0) || (($mini_map_get(result, "stdout")).length !== 0))) {
            return result_fail((prefix + "rejection result"));
        }
    }
    if ($mini_map_has(scenario, "files")) {
        let files = $mini_map_get(scenario, "files");
        let position = 0;
        while ((position < (files).length)) {
            if ((!$mini_path_is_exists(path_resolve(workspace, $mini_list_get(files, position))))) {
                return result_fail(("missing artifact: " + $mini_list_get(files, position)));
            }
            position = (position + 1);
        }
    }
    let done = result_ok(0, "");
    $mini_map_set(done, "artifact", artifact);
    return done;
}
function case_diagnostic(result) {
    let error = $mini_map_get(result, "error");
    if (((error).length > 0)) {
        return (": " + error);
    }
    let stderr = $mini_text_from_bytes($mini_map_get(result, "stderr"));
    if (((stderr).length > 0)) {
        return (": " + stderr);
    }
    return "";
}
function case_write_input_files(scenario, directory, files, prefix) {
    if ((!$mini_map_has(scenario, "inputFiles"))) {
        return result_ok(0, "");
    }
    let inputs = $mini_map_get(scenario, "inputFiles");
    let names = Object.keys(inputs);
    let position = 0;
    while ((position < (names).length)) {
        let name = $mini_list_get(names, position);
        let stream = case_stream_bytes($mini_map_get(inputs, name), directory);
        if (result_is_fail(stream)) {
            return result_fail((prefix + $mini_map_get(stream, "message")));
        }
        let target = path_join(files, name);
        $mini_directory_create(path_parent(target));
        $mini_file_write_bytes(target, $mini_map_get(stream, "bytes"));
        position = (position + 1);
    }
    return result_ok(0, "");
}
function case_check_output_files(scenario, directory, files, prefix) {
    if ((!$mini_map_has(scenario, "outputFiles"))) {
        return result_ok(0, "");
    }
    let outputs = $mini_map_get(scenario, "outputFiles");
    let names = Object.keys(outputs);
    let position = 0;
    while ((position < (names).length)) {
        let name = $mini_list_get(names, position);
        let expected = case_stream_bytes($mini_map_get(outputs, name), directory);
        if (result_is_fail(expected)) {
            return result_fail((prefix + $mini_map_get(expected, "message")));
        }
        let target = path_join(files, name);
        if (((!$mini_path_is_exists(target)) || (!case_bytes_equal($mini_file_read_bytes(target), $mini_map_get(expected, "bytes"))))) {
            return result_fail(((prefix + "file ") + name));
        }
        position = (position + 1);
    }
    return result_ok(0, "");
}
function case_case_identity(fixture, project_root) {
    let definition = $mini_map_get(fixture, "definition");
    let directory = path_parent($mini_map_get(fixture, "path"));
    let source = "";
    if (($mini_map_get(definition, "kind") === "tool")) {
        source = path_join(path_join(project_root, "bin"), $mini_map_get(definition, "tool"));
    } else {
        source = path_resolve(directory, $mini_map_get(definition, "source"));
    }
    let streams = [];
    let scenarios = $mini_map_get(definition, "cases");
    let position = 0;
    while ((position < (scenarios).length)) {
        let scenario = $mini_list_get(scenarios, position);
        let entry = ({ __proto__: $mini_map_proto });
        $mini_map_set(entry, "name", $mini_map_get(scenario, "name"));
        $mini_map_set(entry, "stdin", $mini_hash_sha256($mini_map_get(case_stream_bytes($mini_map_get(scenario, "stdin"), directory), "bytes")));
        $mini_map_set(entry, "stdout", $mini_hash_sha256($mini_map_get(case_stream_bytes($mini_map_get(scenario, "stdout"), directory), "bytes")));
        $mini_map_set(entry, "stderr", $mini_hash_sha256($mini_map_get(case_stream_bytes($mini_map_get(scenario, "stderr"), directory), "bytes")));
        if ($mini_map_has(scenario, "artifact")) {
            $mini_map_set(entry, "artifact", $mini_hash_sha256($mini_map_get(case_stream_bytes($mini_map_get(scenario, "artifact"), directory), "bytes")));
        }
        if ($mini_map_has(scenario, "inputFiles")) {
            $mini_map_set(entry, "inputFiles", case_file_hashes($mini_map_get(scenario, "inputFiles"), directory));
        }
        if ($mini_map_has(scenario, "outputFiles")) {
            $mini_map_set(entry, "outputFiles", case_file_hashes($mini_map_get(scenario, "outputFiles"), directory));
        }
        $mini_list_set(streams, (streams).length, entry);
        position = (position + 1);
    }
    let identity = ({ __proto__: $mini_map_proto });
    $mini_map_set(identity, "manifest", $mini_hash_sha256($mini_file_read_bytes($mini_map_get(fixture, "path"))));
    $mini_map_set(identity, "source", $mini_hash_sha256($mini_file_read_bytes(source)));
    $mini_map_set(identity, "streams", streams);
    return identity;
}
function case_file_hashes(files, directory) {
    let hashes = ({ __proto__: $mini_map_proto });
    let names = Object.keys(files);
    let position = 0;
    while ((position < (names).length)) {
        let name = $mini_list_get(names, position);
        $mini_map_set(hashes, name, $mini_hash_sha256($mini_map_get(case_stream_bytes($mini_map_get(files, name), directory), "bytes")));
        position = (position + 1);
    }
    return hashes;
}
function bench_fail(message) {
    writeSync(2, (message + "\n"));
    process.exit(1);
    return 0;
}
function bench_half(value) {
    let remainder = value;
    let half = 0;
    while ((remainder >= 2)) {
        remainder = (remainder - 2);
        half = (half + 1);
    }
    return half;
}
function bench_compiler_hash(root) {
    let parsed = $mini_json_parse(readFileSync(path_join(root, "config/compiler.json"), "utf8"));
    if (result_is_fail(parsed)) {
        bench_fail("invalid config/compiler.json");
    }
    let sources = $mini_map_get($mini_map_get(parsed, "value"), "sources");
    let parts = [];
    let position = 0;
    while ((position < (sources).length)) {
        let path = $mini_list_get(sources, position);
        $mini_list_set(parts, (parts).length, ((path + "\n") + readFileSync(path_join(root, path), "utf8")));
        position = (position + 1);
    }
    return $mini_hash_sha256($mini_list_to_text(parts, "\n"));
}
function bench_platform() {
    let code = "process.stdout.write(JSON.stringify({node:process.version,platform:process.platform,architecture:process.arch}))";
    let args = [];
    $mini_list_set(args, 0, "-e");
    $mini_list_set(args, 1, code);
    let result = process_capture(process.execPath, args, project_root(), []);
    let parsed = $mini_json_parse($mini_text_from_bytes($mini_map_get(result, "stdout")));
    if (result_is_fail(parsed)) {
        return ({ __proto__: $mini_map_proto });
    }
    return $mini_map_get(parsed, "value");
}
function bench_commit(root) {
    if ((!$mini_path_is_exists(path_join(root, ".git")))) {
        return "";
    }
    let args = [];
    $mini_list_set(args, 0, "rev-parse");
    $mini_list_set(args, 1, "HEAD");
    let result = process_capture("git", args, root, []);
    return text_chomp($mini_text_from_bytes($mini_map_get(result, "stdout")));
}
function bench_run(root, output, filter) {
    if ($mini_path_is_exists(output)) {
        bench_fail("benchmark output already exists; choose a new report path");
    }
    let selected = case_load_cases(filter, root);
    if (result_is_fail(selected)) {
        bench_fail($mini_map_get(selected, "message"));
    }
    let fixtures = $mini_map_get(selected, "fixtures");
    let results = [];
    let fixture_index = 0;
    while ((fixture_index < (fixtures).length)) {
        let fixture = $mini_list_get(fixtures, fixture_index);
        let definition = $mini_map_get(fixture, "definition");
        if ($mini_map_has(definition, "benchmark")) {
            let settings = $mini_map_get(definition, "benchmark");
            let warmups = $mini_map_get(settings, "warmups");
            let sample_count = $mini_map_get(settings, "samples");
            let identity = case_case_identity(fixture, root);
            let scenarios = $mini_map_get(definition, "cases");
            let scenario_index = 0;
            while ((scenario_index < (scenarios).length)) {
                let scenario = $mini_list_get(scenarios, scenario_index);
                let warmup_index = 0;
                while ((warmup_index < warmups)) {
                    let warmed = case_verify_scenario(fixture, scenario, root, "");
                    if (result_is_fail(warmed)) {
                        bench_fail($mini_map_get(warmed, "message"));
                    }
                    warmup_index = (warmup_index + 1);
                }
                let samples = [];
                let sample_index = 0;
                while ((sample_index < sample_count)) {
                    let started = Date.now();
                    let measured = case_verify_scenario(fixture, scenario, root, "");
                    if (result_is_fail(measured)) {
                        bench_fail($mini_map_get(measured, "message"));
                    }
                    $mini_list_set(samples, (samples).length, (Date.now() - started));
                    sample_index = (sample_index + 1);
                }
                let sorted = list_sorted(samples);
                let row = ({ __proto__: $mini_map_proto });
                $mini_map_set(row, "id", $mini_map_get(definition, "id"));
                $mini_map_set(row, "scenario", $mini_map_get(scenario, "name"));
                $mini_map_set(row, "kind", $mini_map_get(definition, "kind"));
                $mini_map_set(row, "identity", identity);
                $mini_map_set(row, "warmups", warmups);
                $mini_map_set(row, "milliseconds", samples);
                $mini_map_set(row, "medianMilliseconds", $mini_list_get(sorted, bench_half((sorted).length)));
                $mini_list_set(results, (results).length, row);
                scenario_index = (scenario_index + 1);
            }
        }
        fixture_index = (fixture_index + 1);
    }
    if (((results).length === 0)) {
        bench_fail("no benchmark cases selected");
    }
    let host = bench_platform();
    let versions_parsed = $mini_json_parse(readFileSync(path_join(root, "config/versions.json"), "utf8"));
    let report = ({ __proto__: $mini_map_proto });
    $mini_map_set(report, "node", $mini_map_get(host, "node"));
    $mini_map_set(report, "platform", $mini_map_get(host, "platform"));
    $mini_map_set(report, "architecture", $mini_map_get(host, "architecture"));
    $mini_map_set(report, "commit", bench_commit(root));
    if (result_is_ok(versions_parsed)) {
        $mini_map_set(report, "versions", $mini_map_get(versions_parsed, "value"));
    }
    $mini_map_set(report, "compiler", bench_compiler_hash(root));
    $mini_map_set(report, "scope", "fresh-process wall time including startup, IO, verification, and compilation for program cases");
    $mini_map_set(report, "results", results);
    $mini_directory_create(path_parent(output));
    writeFileSync(output, ($mini_json_to_text(report) + "\n"), "utf8");
    return (results).length;
}
function main() {
    let args = process.argv.slice(2);
    if ((((args).length < 1) || ((args).length > 2))) {
        writeSync(2, "usage: mini-bench OUTPUT [FILTER]\n");
        process.exit(1);
    }
    let root = project_root();
    let output = path_resolve("", $mini_list_get(args, 0));
    let filter = "";
    if (((args).length === 2)) {
        filter = $mini_list_get(args, 1);
    }
    let count = bench_run(root, output, filter);
    writeSync(1, (((("Wrote " + $mini_number_to_text(count)) + " benchmark results to ") + output) + "\n"));
    return 0;
}
main();
