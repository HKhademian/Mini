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
function $mini_read_bytes(count) {
    if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) return [];
    const fs = process.getBuiltinModule("node:fs");
    const buffer = Buffer.alloc(count);
    const read = fs.readSync(0, buffer, 0, count, null);
    return Array.from(buffer.subarray(0, read));
}
function $mini_read_line() {
    const fs = process.getBuiltinModule("node:fs");
    const buffer = Buffer.alloc(1);
    const bytes = [];
    while (true) {
        const count = fs.readSync(0, buffer, 0, 1, null);
        if (count === 0) break;
        if (buffer[0] === 10) break;
        bytes.push(buffer[0]);
    }
    if (bytes.length > 0 && bytes[bytes.length - 1] === 13) bytes.pop();
    return Buffer.from(bytes).toString("utf8");
}
function $mini_directory_temp() {
    const fs = process.getBuiltinModule("node:fs");
    const os = process.getBuiltinModule("node:os");
    return fs.mkdtempSync(os.tmpdir() + "/mini-");
}
function $mini_path_exists(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.existsSync(path); } catch { return false; }
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
    if (($mini_value_kind(value) !== "list")) {
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
function result_ok() {
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "ok", true);
    $mini_map_set(result, "message", "");
    return result;
}
function result_fail(message) {
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "ok", false);
    $mini_map_set(result, "message", message);
    return result;
}
function json_file(path) {
    if ((!$mini_path_exists(path))) {
        return result_fail(("cannot read " + path));
    }
    let parsed = $mini_json_parse(readFileSync(path, "utf8"));
    if ((!$mini_map_get(parsed, "ok"))) {
        return result_fail(("invalid JSON: " + path));
    }
    let result = result_ok();
    $mini_map_set(result, "value", $mini_map_get(parsed, "value"));
    return result;
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
    let parsed = json_file(path_join(root, "config/compiler.json"));
    if ((!$mini_map_get(parsed, "ok"))) {
        result_fail($mini_map_get(parsed, "message"));
        return "";
    }
    return $mini_map_get($mini_map_get(parsed, "value"), "entry");
}
function lsp_log(message) {
    writeSync(2, (("mini-lang-server: " + message) + "\n"));
    return 0;
}
function lsp_number(text) {
    let value = 0;
    let position = 0;
    while ((position < (text).length)) {
        let digit = $mini_text_find("0123456789", $mini_text_get(text, position));
        if ((digit < 0)) {
            return value;
        }
        let scaled = (((((((((value + value) + value) + value) + value) + value) + value) + value) + value) + value);
        value = (scaled + digit);
        position = (position + 1);
    }
    return value;
}
function lsp_identifier_part(character) {
    return ($mini_text_find("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_", character) >= 0);
}
function lsp_offset_at(text, position) {
    let line = 0;
    let offset = 0;
    let target = $mini_map_get(position, "line");
    while ((line < target)) {
        let newline = $mini_text_find($mini_text_slice(text, offset, (text).length), "\n");
        if ((newline < 0)) {
            return (text).length;
        }
        offset = ((offset + newline) + 1);
        line = (line + 1);
    }
    let character = (offset + $mini_map_get(position, "character"));
    if ((character > (text).length)) {
        return (text).length;
    }
    return character;
}
function lsp_position_at(text, offset) {
    let line = 0;
    let start = 0;
    let position = 0;
    while (((position < offset) && (position < (text).length))) {
        if (($mini_text_get(text, position) === "\n")) {
            line = (line + 1);
            start = (position + 1);
        }
        position = (position + 1);
    }
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "line", line);
    $mini_map_set(result, "character", (offset - start));
    return result;
}
function lsp_range_of(token) {
    let start = ({ __proto__: $mini_map_proto });
    $mini_map_set(start, "line", ($mini_map_get(token, "line") - 1));
    $mini_map_set(start, "character", ($mini_map_get(token, "column") - 1));
    let finish = ({ __proto__: $mini_map_proto });
    $mini_map_set(finish, "line", ($mini_map_get(token, "line") - 1));
    $mini_map_set(finish, "character", (($mini_map_get(token, "column") - 1) + ($mini_map_get(token, "text")).length));
    let range = ({ __proto__: $mini_map_proto });
    $mini_map_set(range, "start", start);
    $mini_map_set(range, "end", finish);
    return range;
}
function lsp_diagnostic_range(text, diagnostic) {
    let start = lsp_position_at(text, $mini_map_get(diagnostic, "start"));
    let finish = lsp_position_at(text, $mini_map_get(diagnostic, "end"));
    if (($mini_map_get(diagnostic, "end") === $mini_map_get(diagnostic, "start"))) {
        let same = ({ __proto__: $mini_map_proto });
        $mini_map_set(same, "line", $mini_map_get(start, "line"));
        $mini_map_set(same, "character", ($mini_map_get(start, "character") + 1));
        finish = same;
    }
    let range = ({ __proto__: $mini_map_proto });
    $mini_map_set(range, "start", start);
    $mini_map_set(range, "end", finish);
    return range;
}
function lsp_root() {
    return project_root();
}
function lsp_run(command, args, directory, input) {
    return process_capture(command, args, directory, input);
}
function lsp_parse_diagnostic(stderr, text, name, tokens) {
    let newline = $mini_text_find(stderr, "\n");
    let first = stderr;
    if ((newline >= 0)) {
        first = $mini_text_slice(stderr, 0, newline);
    }
    let parts = $mini_text_split(first, ":");
    if (((parts).length < 4)) {
        let fallback = ({ __proto__: $mini_map_proto });
        $mini_map_set(fallback, "message", first);
        $mini_map_set(fallback, "source", name);
        $mini_map_set(fallback, "start", 0);
        $mini_map_set(fallback, "end", 0);
        return fallback;
    }
    let line = lsp_number($mini_list_get(parts, 1));
    let column = lsp_number($mini_list_get(parts, 2));
    let message = text_trim(list_join_from(parts, 3, ":"));
    let start = 0;
    let current = 1;
    let position = 0;
    while (((position < (text).length) && (current < line))) {
        if (($mini_text_get(text, position) === "\n")) {
            current = (current + 1);
            start = (position + 1);
        }
        position = (position + 1);
    }
    start = ((start + column) - 1);
    if ((start > (text).length)) {
        start = (text).length;
    }
    let end = (start + 1);
    if ((end > (text).length)) {
        end = (text).length;
    }
    let index = 0;
    while ((index < (tokens).length)) {
        if (($mini_map_get($mini_list_get(tokens, index), "start") === start)) {
            end = $mini_map_get($mini_list_get(tokens, index), "end");
        }
        index = (index + 1);
    }
    if ((message === "unterminated text")) {
        end = (text).length;
    }
    if ((message === "unknown text escape")) {
        end = (start + 2);
        if ((end > (text).length)) {
            end = (text).length;
        }
    }
    let diagnostic = ({ __proto__: $mini_map_proto });
    $mini_map_set(diagnostic, "message", message);
    $mini_map_set(diagnostic, "source", name);
    $mini_map_set(diagnostic, "start", start);
    $mini_map_set(diagnostic, "end", end);
    return diagnostic;
}
function lsp_analyze(text, name) {
    let root = lsp_root();
    let compiler = project_compiler_entry(root);
    let work = $mini_directory_temp();
    let input = path_join(work, "source.mini");
    let output = path_join(work, "program.ts");
    writeFileSync(input, text, "utf8");
    let token_args = [];
    $mini_list_set(token_args, 0, compiler);
    $mini_list_set(token_args, 1, "tokens");
    $mini_list_set(token_args, 2, "--comments");
    $mini_list_set(token_args, 3, input);
    let tokenized = lsp_run(process.execPath, token_args, root, []);
    let tokens = [];
    let diagnostics = [];
    if (($mini_map_get(tokenized, "status") !== 0)) {
        $mini_list_set(diagnostics, 0, lsp_parse_diagnostic($mini_text_from_bytes($mini_map_get(tokenized, "stderr")), text, name, tokens));
        $mini_path_remove(work);
        let failed = ({ __proto__: $mini_map_proto });
        $mini_map_set(failed, "tokens", tokens);
        $mini_map_set(failed, "diagnostics", diagnostics);
        return failed;
    }
    let parsed = $mini_json_parse($mini_text_from_bytes($mini_map_get(tokenized, "stdout")));
    if (($mini_map_get(parsed, "ok") && ($mini_value_kind($mini_map_get(parsed, "value")) === "list"))) {
        tokens = $mini_map_get(parsed, "value");
    }
    let compile_args = [];
    $mini_list_set(compile_args, 0, compiler);
    $mini_list_set(compile_args, 1, "compile");
    $mini_list_set(compile_args, 2, input);
    $mini_list_set(compile_args, 3, output);
    let compiled = lsp_run(process.execPath, compile_args, root, []);
    if (($mini_map_get(compiled, "status") !== 0)) {
        $mini_list_set(diagnostics, 0, lsp_parse_diagnostic($mini_text_from_bytes($mini_map_get(compiled, "stderr")), text, name, tokens));
    }
    $mini_path_remove(work);
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "tokens", tokens);
    $mini_map_set(result, "diagnostics", diagnostics);
    return result;
}
function lsp_is_comment(token) {
    return ($mini_map_get(token, "kind") === "comment");
}
function lsp_token_at(tokens, offset) {
    let position = 0;
    while ((position < (tokens).length)) {
        let token = $mini_list_get(tokens, position);
        if (((($mini_map_get(token, "kind") !== "eof") && ($mini_map_get(token, "start") <= offset)) && (offset < $mini_map_get(token, "end")))) {
            return token;
        }
        position = (position + 1);
    }
    return 0;
}
function lsp_doc_above(tokens, index) {
    let lines = [];
    let line = ($mini_map_get($mini_list_get(tokens, index), "line") - 1);
    let cursor = (index - 1);
    let done = false;
    while (((cursor >= 0) && (!done))) {
        let token = $mini_list_get(tokens, cursor);
        if ((((!lsp_is_comment(token)) || (!text_starts_with($mini_map_get(token, "text"), "///"))) || ($mini_map_get(token, "line") !== line))) {
            done = true;
        } else {
            let comment = text_trim($mini_text_slice($mini_map_get(token, "text"), 3, ($mini_map_get(token, "text")).length));
            $mini_list_set(lines, (lines).length, comment);
            line = (line - 1);
            cursor = (cursor - 1);
        }
    }
    return list_reverse(lines);
}
function lsp_declarations(tokens) {
    let result = [];
    let position = 0;
    while ((position < (tokens).length)) {
        let token = $mini_list_get(tokens, position);
        let text = $mini_map_get(token, "text");
        if ((($mini_map_get(token, "kind") === "keyword") && ((text === "fn") || (text === "var")))) {
            let name = $mini_list_get(tokens, (position + 1));
            if (($mini_map_get(name, "kind") === "identifier")) {
                let declaration = ({ __proto__: $mini_map_proto });
                $mini_map_set(declaration, "name", $mini_map_get(name, "text"));
                $mini_map_set(declaration, "token", name);
                $mini_map_set(declaration, "doc", lsp_doc_above(tokens, position));
                if ((text === "var")) {
                    $mini_map_set(declaration, "kind", "variable");
                    $mini_map_set(declaration, "signature", ("var " + $mini_map_get(name, "text")));
                } else {
                    let parameters = [];
                    let cursor = (position + 2);
                    while (((cursor < (tokens).length) && ($mini_map_get($mini_list_get(tokens, cursor), "text") !== ")"))) {
                        if (($mini_map_get($mini_list_get(tokens, cursor), "kind") === "identifier")) {
                            $mini_list_set(parameters, (parameters).length, $mini_map_get($mini_list_get(tokens, cursor), "text"));
                        }
                        cursor = (cursor + 1);
                    }
                    $mini_map_set(declaration, "kind", "function");
                    $mini_map_set(declaration, "signature", (((("fn " + $mini_map_get(name, "text")) + "(") + $mini_list_to_text(parameters, ", ")) + ")"));
                }
                $mini_list_set(result, (result).length, declaration);
            }
        }
        position = (position + 1);
    }
    return result;
}
let lsp_builtin_cache = 0;
function lsp_builtins() {
    if (($mini_value_kind(lsp_builtin_cache) === "map")) {
        return lsp_builtin_cache;
    }
    let root = lsp_root();
    let args = [];
    $mini_list_set(args, 0, project_compiler_entry(root));
    $mini_list_set(args, 1, "metadata");
    let result = lsp_run(process.execPath, args, root, []);
    let parsed = $mini_json_parse($mini_text_from_bytes($mini_map_get(result, "stdout")));
    let cache = ({ __proto__: $mini_map_proto });
    if ($mini_map_get(parsed, "ok")) {
        let entries = $mini_map_get($mini_map_get(parsed, "value"), "builtins");
        let position = 0;
        while ((position < (entries).length)) {
            let entry = $mini_list_get(entries, position);
            let info = ({ __proto__: $mini_map_proto });
            $mini_map_set(info, "parameters", $mini_map_get(entry, "parameters"));
            $mini_map_set(info, "result", $mini_map_get(entry, "result"));
            $mini_map_set(cache, $mini_map_get(entry, "name"), info);
            position = (position + 1);
        }
    }
    lsp_builtin_cache = cache;
    return cache;
}
function lsp_builtin_signature(name) {
    let info = $mini_map_get(lsp_builtins(), name);
    return ((((name + "(") + $mini_list_to_text($mini_map_get(info, "parameters"), ", ")) + ") -> ") + $mini_map_get(info, "result"));
}
function lsp_markdown(signature, doc) {
    let code = (("```mini\n" + signature) + "\n```");
    if (((doc).length === 0)) {
        return code;
    }
    return ((code + "\n\n") + $mini_list_to_text(doc, "\n"));
}
function lsp_find_declaration(tokens, name) {
    let found = 0;
    let declarations = lsp_declarations(tokens);
    let position = 0;
    while ((position < (declarations).length)) {
        if (($mini_map_get($mini_list_get(declarations, position), "name") === name)) {
            found = $mini_list_get(declarations, position);
        }
        position = (position + 1);
    }
    return found;
}
function lsp_hover(tokens, offset) {
    let token = lsp_token_at(tokens, offset);
    if (((token === 0) || ($mini_map_get(token, "kind") !== "identifier"))) {
        return 0;
    }
    let found = lsp_find_declaration(tokens, $mini_map_get(token, "text"));
    if ((found !== 0)) {
        let content = ({ __proto__: $mini_map_proto });
        $mini_map_set(content, "kind", "markdown");
        $mini_map_set(content, "value", lsp_markdown($mini_map_get(found, "signature"), $mini_map_get(found, "doc")));
        let hover = ({ __proto__: $mini_map_proto });
        $mini_map_set(hover, "contents", content);
        $mini_map_set(hover, "range", lsp_range_of(token));
        return hover;
    }
    if ($mini_map_has(lsp_builtins(), $mini_map_get(token, "text"))) {
        let builtin = ({ __proto__: $mini_map_proto });
        $mini_map_set(builtin, "kind", "markdown");
        $mini_map_set(builtin, "value", lsp_markdown(lsp_builtin_signature($mini_map_get(token, "text")), []));
        let builtin_hover = ({ __proto__: $mini_map_proto });
        $mini_map_set(builtin_hover, "contents", builtin);
        $mini_map_set(builtin_hover, "range", lsp_range_of(token));
        return builtin_hover;
    }
    return 0;
}
function lsp_definition(tokens, offset) {
    let token = lsp_token_at(tokens, offset);
    if (((token === 0) || ($mini_map_get(token, "kind") !== "identifier"))) {
        return 0;
    }
    return lsp_find_declaration(tokens, $mini_map_get(token, "text"));
}
function lsp_completions(tokens, text, offset) {
    let items = [];
    let token = lsp_token_at(tokens, offset);
    if (((token !== 0) && (($mini_map_get(token, "kind") === "comment") || ($mini_map_get(token, "kind") === "text")))) {
        return items;
    }
    let start = offset;
    while (((start > 0) && lsp_identifier_part($mini_text_get(text, (start - 1))))) {
        start = (start - 1);
    }
    let prefix = $mini_text_slice(text, start, offset);
    let seen = ({ __proto__: $mini_map_proto });
    let declarations = lsp_declarations(tokens);
    let position = 0;
    while ((position < (declarations).length)) {
        let declaration = $mini_list_get(declarations, position);
        let name = $mini_map_get(declaration, "name");
        if (((!$mini_map_has(seen, name)) && text_starts_with(name, prefix))) {
            $mini_map_set(seen, name, true);
            let item = ({ __proto__: $mini_map_proto });
            $mini_map_set(item, "label", name);
            if (($mini_map_get(declaration, "kind") === "function")) {
                $mini_map_set(item, "kind", 3);
            } else {
                $mini_map_set(item, "kind", 6);
            }
            $mini_map_set(item, "detail", $mini_map_get(declaration, "signature"));
            $mini_map_set(item, "insertText", name);
            if ((($mini_map_get(declaration, "doc")).length > 0)) {
                let documentation = ({ __proto__: $mini_map_proto });
                $mini_map_set(documentation, "kind", "markdown");
                $mini_map_set(documentation, "value", $mini_list_to_text($mini_map_get(declaration, "doc"), "\n"));
                $mini_map_set(item, "documentation", documentation);
            }
            $mini_list_set(items, (items).length, item);
        }
        position = (position + 1);
    }
    let builtins = lsp_builtins();
    let names = Object.keys(builtins);
    position = 0;
    while ((position < (names).length)) {
        let builtin_name = $mini_list_get(names, position);
        if (((!$mini_map_has(seen, builtin_name)) && text_starts_with(builtin_name, prefix))) {
            $mini_map_set(seen, builtin_name, true);
            let builtin_item = ({ __proto__: $mini_map_proto });
            $mini_map_set(builtin_item, "label", builtin_name);
            $mini_map_set(builtin_item, "kind", 3);
            $mini_map_set(builtin_item, "detail", lsp_builtin_signature(builtin_name));
            $mini_map_set(builtin_item, "insertText", builtin_name);
            $mini_list_set(items, (items).length, builtin_item);
        }
        position = (position + 1);
    }
    let keywords = [];
    $mini_list_set(keywords, 0, "var");
    $mini_list_set(keywords, 1, "fn");
    $mini_list_set(keywords, 2, "return");
    $mini_list_set(keywords, 3, "if");
    $mini_list_set(keywords, 4, "else");
    $mini_list_set(keywords, 5, "while");
    $mini_list_set(keywords, 6, "true");
    $mini_list_set(keywords, 7, "false");
    position = 0;
    while ((position < (keywords).length)) {
        let keyword = $mini_list_get(keywords, position);
        if (((!$mini_map_has(seen, keyword)) && text_starts_with(keyword, prefix))) {
            $mini_map_set(seen, keyword, true);
            let keyword_item = ({ __proto__: $mini_map_proto });
            $mini_map_set(keyword_item, "label", keyword);
            $mini_map_set(keyword_item, "kind", 14);
            $mini_map_set(keyword_item, "insertText", keyword);
            $mini_list_set(items, (items).length, keyword_item);
        }
        position = (position + 1);
    }
    return items;
}
function lsp_send(body) {
    writeSync(1, ((("Content-Length: " + $mini_number_to_text(($mini_text_to_bytes(body)).length)) + "\r\n\r\n") + body));
    return 0;
}
function lsp_reply(id, result) {
    lsp_send((((("{\"jsonrpc\":\"2.0\",\"id\":" + $mini_json_to_text(id)) + ",\"result\":") + result) + "}"));
    return 0;
}
function lsp_reply_error(id, code, message) {
    lsp_send((((((("{\"jsonrpc\":\"2.0\",\"id\":" + $mini_json_to_text(id)) + ",\"error\":{\"code\":") + $mini_number_to_text(code)) + ",\"message\":") + $mini_json_to_text(message)) + "}}"));
    return 0;
}
function lsp_notify(method, params) {
    lsp_send((((("{\"jsonrpc\":\"2.0\",\"method\":" + $mini_json_to_text(method)) + ",\"params\":") + params) + "}"));
    return 0;
}
function lsp_publish(uri, version, diagnostics) {
    let params = ({ __proto__: $mini_map_proto });
    $mini_map_set(params, "uri", uri);
    if ((version >= 0)) {
        $mini_map_set(params, "version", version);
    }
    $mini_map_set(params, "diagnostics", diagnostics);
    lsp_notify("textDocument/publishDiagnostics", $mini_json_to_text(params));
    return 0;
}
function lsp_format_text(text) {
    let root = lsp_root();
    let args = [];
    $mini_list_set(args, 0, path_join(root, "dist/format.ts"));
    $mini_list_set(args, 1, "-");
    let result = lsp_run(process.execPath, args, root, $mini_text_to_bytes(text));
    if (($mini_map_get(result, "status") === 0)) {
        return $mini_text_from_bytes($mini_map_get(result, "stdout"));
    }
    return 0;
}
function lsp_diagnose(documents, uri, text, version) {
    let document = $mini_map_get(documents, uri);
    if ((($mini_value_kind(document) !== "map") || ($mini_map_get(document, "version") !== version))) {
        return 0;
    }
    let outcome = lsp_analyze(text, uri);
    if (($mini_map_get($mini_map_get(documents, uri), "version") !== version)) {
        return 0;
    }
    let diagnostics = [];
    let source = $mini_map_get(outcome, "diagnostics");
    let position = 0;
    while ((position < (source).length)) {
        let diagnostic = $mini_list_get(source, position);
        let entry = ({ __proto__: $mini_map_proto });
        $mini_map_set(entry, "range", lsp_diagnostic_range(text, diagnostic));
        $mini_map_set(entry, "severity", 1);
        $mini_map_set(entry, "source", "mini");
        $mini_map_set(entry, "message", $mini_map_get(diagnostic, "message"));
        $mini_list_set(diagnostics, (diagnostics).length, entry);
        position = (position + 1);
    }
    lsp_publish(uri, version, diagnostics);
    return 0;
}
function lsp_formatting(documents, params) {
    let uri = $mini_map_get($mini_map_get(params, "textDocument"), "uri");
    let document = $mini_map_get(documents, uri);
    if (($mini_value_kind(document) !== "map")) {
        return "null";
    }
    let text = $mini_map_get(document, "text");
    let outcome = lsp_analyze(text, uri);
    if ((($mini_map_get(outcome, "diagnostics")).length > 0)) {
        return "null";
    }
    let formatted = lsp_format_text(text);
    if ((($mini_value_kind(formatted) !== "text") || (formatted === text))) {
        return "null";
    }
    let range = ({ __proto__: $mini_map_proto });
    let start = ({ __proto__: $mini_map_proto });
    $mini_map_set(start, "line", 0);
    $mini_map_set(start, "character", 0);
    $mini_map_set(range, "start", start);
    $mini_map_set(range, "end", lsp_position_at(text, (text).length));
    let edit = ({ __proto__: $mini_map_proto });
    $mini_map_set(edit, "range", range);
    $mini_map_set(edit, "newText", formatted);
    let edits = [];
    $mini_list_set(edits, 0, edit);
    return $mini_json_to_text(edits);
}
function lsp_hover_reply(documents, params) {
    let text_document = $mini_map_get(params, "textDocument");
    let position = $mini_map_get(params, "position");
    if ((($mini_value_kind(text_document) !== "map") || ($mini_value_kind(position) !== "map"))) {
        return "null";
    }
    let document = $mini_map_get(documents, $mini_map_get(text_document, "uri"));
    if (($mini_value_kind(document) !== "map")) {
        return "null";
    }
    let text = $mini_map_get(document, "text");
    let outcome = lsp_analyze(text, $mini_map_get(text_document, "uri"));
    let hover = lsp_hover($mini_map_get(outcome, "tokens"), lsp_offset_at(text, position));
    if ((hover === 0)) {
        return "null";
    }
    return $mini_json_to_text(hover);
}
function lsp_completion_reply(documents, params) {
    let text_document = $mini_map_get(params, "textDocument");
    let position = $mini_map_get(params, "position");
    if ((($mini_value_kind(text_document) !== "map") || ($mini_value_kind(position) !== "map"))) {
        return "{\"isIncomplete\":false,\"items\":[]}";
    }
    let document = $mini_map_get(documents, $mini_map_get(text_document, "uri"));
    if (($mini_value_kind(document) !== "map")) {
        return "{\"isIncomplete\":false,\"items\":[]}";
    }
    let text = $mini_map_get(document, "text");
    let outcome = lsp_analyze(text, $mini_map_get(text_document, "uri"));
    let reply = ({ __proto__: $mini_map_proto });
    $mini_map_set(reply, "isIncomplete", false);
    $mini_map_set(reply, "items", lsp_completions($mini_map_get(outcome, "tokens"), text, lsp_offset_at(text, position)));
    return $mini_json_to_text(reply);
}
function lsp_definition_reply(documents, params) {
    let text_document = $mini_map_get(params, "textDocument");
    let position = $mini_map_get(params, "position");
    if ((($mini_value_kind(text_document) !== "map") || ($mini_value_kind(position) !== "map"))) {
        return "null";
    }
    let document = $mini_map_get(documents, $mini_map_get(text_document, "uri"));
    if (($mini_value_kind(document) !== "map")) {
        return "null";
    }
    let text = $mini_map_get(document, "text");
    let outcome = lsp_analyze(text, $mini_map_get(text_document, "uri"));
    let declaration = lsp_definition($mini_map_get(outcome, "tokens"), lsp_offset_at(text, position));
    if ((declaration === 0)) {
        return "null";
    }
    let reply = ({ __proto__: $mini_map_proto });
    $mini_map_set(reply, "uri", $mini_map_get(text_document, "uri"));
    $mini_map_set(reply, "range", lsp_range_of($mini_map_get(declaration, "token")));
    return $mini_json_to_text(reply);
}
function lsp_notification(documents, shutting_down, method, params) {
    if ((method === "initialized")) {
        return 0;
    }
    if ((method === "exit")) {
        if (shutting_down) {
            process.exit(0);
        }
        process.exit(1);
    }
    if ((method === "textDocument/didOpen")) {
        let text_document = $mini_map_get(params, "textDocument");
        let uri = $mini_map_get(text_document, "uri");
        let document = ({ __proto__: $mini_map_proto });
        $mini_map_set(document, "text", $mini_map_get(text_document, "text"));
        $mini_map_set(document, "version", $mini_map_get(text_document, "version"));
        $mini_map_set(documents, uri, document);
        lsp_diagnose(documents, uri, $mini_map_get(document, "text"), $mini_map_get(document, "version"));
        return 0;
    }
    if ((method === "textDocument/didChange")) {
        let changed = $mini_map_get(params, "textDocument");
        let uri = $mini_map_get(changed, "uri");
        let document = $mini_map_get(documents, uri);
        if (($mini_value_kind(document) !== "map")) {
            return 0;
        }
        let changes = $mini_map_get(params, "contentChanges");
        if (((changes).length === 0)) {
            return 0;
        }
        let change = $mini_list_get(changes, ((changes).length - 1));
        $mini_map_set(document, "text", $mini_map_get(change, "text"));
        $mini_map_set(document, "version", $mini_map_get(changed, "version"));
        $mini_map_set(documents, uri, document);
        lsp_diagnose(documents, uri, $mini_map_get(document, "text"), $mini_map_get(document, "version"));
        return 0;
    }
    if ((method === "textDocument/didClose")) {
        let closed = $mini_map_get($mini_map_get(params, "textDocument"), "uri");
        $mini_map_set(documents, closed, 0);
        lsp_publish(closed, (-1), []);
        return 0;
    }
    return 0;
}
function lsp_request(documents, shutting_down, id, method, params) {
    if (shutting_down) {
        lsp_reply_error(id, (-32600), "server is shutting down");
        return 0;
    }
    if ((method === "initialize")) {
        let capabilities = ({ __proto__: $mini_map_proto });
        $mini_map_set(capabilities, "textDocumentSync", 1);
        $mini_map_set(capabilities, "documentFormattingProvider", true);
        $mini_map_set(capabilities, "hoverProvider", true);
        let completion = ({ __proto__: $mini_map_proto });
        $mini_map_set(completion, "resolveProvider", false);
        $mini_map_set(capabilities, "completionProvider", completion);
        $mini_map_set(capabilities, "definitionProvider", true);
        let versions = $mini_map_get($mini_json_parse(readFileSync(path_join(lsp_root(), "config/versions.json"), "utf8")), "value");
        let server_info = ({ __proto__: $mini_map_proto });
        $mini_map_set(server_info, "name", "mini-lang-server");
        $mini_map_set(server_info, "version", ((("lsp-v" + $mini_map_get(versions, "group")) + "-v") + $mini_map_get(versions, "lsp")));
        let result = ({ __proto__: $mini_map_proto });
        $mini_map_set(result, "capabilities", capabilities);
        $mini_map_set(result, "serverInfo", server_info);
        lsp_reply(id, $mini_json_to_text(result));
        return 0;
    }
    if ((method === "shutdown")) {
        lsp_reply(id, "null");
        return 1;
    }
    if ((method === "textDocument/formatting")) {
        lsp_reply(id, lsp_formatting(documents, params));
        return 0;
    }
    if ((method === "textDocument/hover")) {
        lsp_reply(id, lsp_hover_reply(documents, params));
        return 0;
    }
    if ((method === "textDocument/completion")) {
        lsp_reply(id, lsp_completion_reply(documents, params));
        return 0;
    }
    if ((method === "textDocument/definition")) {
        lsp_reply(id, lsp_definition_reply(documents, params));
        return 0;
    }
    lsp_reply_error(id, (-32601), ("method not found: " + method));
    return 0;
}
function lsp_read_message() {
    let length = (-1);
    let done = false;
    while ((!done)) {
        let line = $mini_read_line();
        if ((line === "")) {
            done = true;
        } else {
            if (text_starts_with(line, "Content-Length:")) {
                length = lsp_number(text_trim($mini_text_slice(line, 15, (line).length)));
            }
        }
    }
    if ((length < 0)) {
        return 0;
    }
    let body = $mini_text_from_bytes($mini_read_bytes(length));
    let parsed = $mini_json_parse(body);
    if ((!$mini_map_get(parsed, "ok"))) {
        lsp_log("invalid JSON message");
        return ({ __proto__: $mini_map_proto });
    }
    return $mini_map_get(parsed, "value");
}
function lsp_version() {
    let versions = $mini_map_get($mini_json_parse(readFileSync(path_join(lsp_root(), "config/versions.json"), "utf8")), "value");
    return ((("lsp-v" + $mini_map_get(versions, "group")) + "-v") + $mini_map_get(versions, "lsp"));
}
function lsp_serve() {
    let documents = ({ __proto__: $mini_map_proto });
    let shutting_down = false;
    let running = true;
    while (running) {
        let message = lsp_read_message();
        if ((message === 0)) {
            running = false;
        } else {
            if ($mini_map_has(message, "method")) {
                let method = $mini_map_get(message, "method");
                let params = $mini_map_get(message, "params");
                if ($mini_map_has(message, "id")) {
                    let shutdown = lsp_request(documents, shutting_down, $mini_map_get(message, "id"), method, params);
                    if ((method === "shutdown")) {
                        shutting_down = true;
                    }
                } else {
                    lsp_notification(documents, shutting_down, method, params);
                }
            }
        }
    }
    if ((!shutting_down)) {
        return 1;
    }
    return 0;
}
function main() {
    let args = process.argv.slice(2);
    if ((((args).length === 1) && ($mini_list_get(args, 0) === "--version"))) {
        writeSync(1, (lsp_version() + "\n"));
        return 0;
    }
    if (((args).length !== 0)) {
        lsp_log("usage: mini-lang-server [--version]");
        process.exit(1);
    }
    process.exit(lsp_serve());
    return 0;
}
main();
