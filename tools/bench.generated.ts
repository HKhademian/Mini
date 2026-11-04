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
function $mini_directory_temp() {
    const fs = process.getBuiltinModule("node:fs");
    const os = process.getBuiltinModule("node:os");
    return fs.mkdtempSync(os.tmpdir() + "/mini-");
}
function $mini_path_copy(from, to) {
    process.getBuiltinModule("node:fs").cpSync(from, to, { recursive: true, force: true, dereference: true });
}
function $mini_path_exists(path) {
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
function case_ok() {
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "ok", true);
    $mini_map_set(result, "message", "");
    return result;
}
function case_fail(message) {
    let result = ({ __proto__: $mini_map_proto });
    $mini_map_set(result, "ok", false);
    $mini_map_set(result, "message", message);
    return result;
}
function case_root() {
    let script = process.argv[1];
    return case_path_parent(case_path_parent(script));
}
function case_path_join(left, right) {
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
function case_path_parent(path) {
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
function case_path_basename(path) {
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
function case_path_is_absolute(path) {
    if (text_starts_with(path, "/")) {
        return true;
    }
    return ((((path).length > 2) && ($mini_text_get(path, 1) === ":")) && (($mini_text_get(path, 2) === "/") || ($mini_text_get(path, 2) === "\\")));
}
function case_path_normalize(path) {
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
function case_path_resolve(base, path) {
    if (case_path_is_absolute(path)) {
        return case_path_normalize(path);
    }
    return case_path_normalize(case_path_join(base, path));
}
function case_list_has(items, value) {
    let position = 0;
    while ((position < (items).length)) {
        if (($mini_list_get(items, position) === value)) {
            return true;
        }
        position = (position + 1);
    }
    return false;
}
function case_is_text_list(value) {
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
function case_json_file(path) {
    if ((!$mini_path_exists(path))) {
        return case_fail(("cannot read " + path));
    }
    let parsed = $mini_json_parse(readFileSync(path, "utf8"));
    if ((!$mini_map_get(parsed, "ok"))) {
        return case_fail(("invalid JSON: " + path));
    }
    let result = case_ok();
    $mini_map_set(result, "value", $mini_map_get(parsed, "value"));
    return result;
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
    if (($mini_value_kind(stream) !== "map")) {
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
    if (($mini_value_kind(stream) !== "map")) {
        return case_fail("stream must be an object");
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
        return case_fail("one stream representation required");
    }
    let bytes = [];
    if ($mini_map_has(stream, "text")) {
        if (($mini_value_kind($mini_map_get(stream, "text")) !== "text")) {
            return case_fail("stream text must be a string");
        }
        bytes = $mini_text_to_bytes($mini_map_get(stream, "text"));
    } else {
        if ($mini_map_has(stream, "bytes")) {
            bytes = $mini_map_get(stream, "bytes");
            if (($mini_value_kind(bytes) !== "list")) {
                return case_fail("invalid stream bytes");
            }
            let position = 0;
            while ((position < (bytes).length)) {
                let value = $mini_list_get(bytes, position);
                if (((($mini_value_kind(value) !== "number") || (value < 0)) || (value > 255))) {
                    return case_fail("invalid stream bytes");
                }
                position = (position + 1);
            }
        } else {
            if (($mini_value_kind($mini_map_get(stream, "file")) !== "text")) {
                return case_fail("invalid stream");
            }
            let file = case_path_resolve(directory, $mini_map_get(stream, "file"));
            if ((!$mini_path_exists(file))) {
                return case_fail(("cannot read " + file));
            }
            bytes = $mini_file_read_bytes(file);
        }
    }
    if ($mini_map_has(stream, "hash")) {
        let expected = $mini_map_get(stream, "hash");
        if ((expected !== ("sha256:" + $mini_hash_sha256(bytes)))) {
            return case_fail("stream hash differs");
        }
    }
    let result = case_ok();
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
    if ((!$mini_map_get(bytes, "ok"))) {
        return "";
    }
    return $mini_text_from_bytes($mini_map_get(bytes, "bytes"));
}
function case_load_case(path) {
    let parsed = case_json_file(path);
    if ((!$mini_map_get(parsed, "ok"))) {
        return parsed;
    }
    let spec = $mini_map_get(parsed, "value");
    let id = $mini_map_get(spec, "id");
    if ((((!$mini_map_has(spec, "id")) || ($mini_value_kind(id) !== "text")) || ((id).length === 0))) {
        return case_fail(("case ID required: " + path));
    }
    let kind = $mini_map_get(spec, "kind");
    if ((!case_list_has(case_kinds(), kind))) {
        return case_fail(("invalid case kind: " + id));
    }
    if (($mini_map_has(spec, "pending") && (((kind === "tool") || ($mini_value_kind($mini_map_get(spec, "pending")) !== "text")) || (($mini_map_get(spec, "pending")).length === 0)))) {
        return case_fail("pending needs a language case and reason");
    }
    let directory = case_path_parent(path);
    if ((kind === "tool")) {
        let tool = $mini_map_get(spec, "tool");
        if (((((!$mini_map_has(spec, "tool")) || ($mini_value_kind(tool) !== "text")) || ($mini_text_find(tool, "/") >= 0)) || (!$mini_path_exists(case_path_join(case_path_join(case_root(), "bin"), tool))))) {
            return case_fail(("unknown tool: " + id));
        }
    } else {
        let source = $mini_map_get(spec, "source");
        if (((((!$mini_map_has(spec, "source")) || ($mini_value_kind(source) !== "text")) || (!text_ends_with(source, ".mini"))) || (!$mini_path_exists(case_path_resolve(directory, source))))) {
            return case_fail(("case source missing: " + id));
        }
    }
    if (((!$mini_map_has(spec, "features")) || (!case_is_text_list($mini_map_get(spec, "features"))))) {
        return case_fail(("features must be a list: " + id));
    }
    if ((((!$mini_map_has(spec, "cases")) || ($mini_value_kind($mini_map_get(spec, "cases")) !== "list")) || (($mini_map_get(spec, "cases")).length === 0))) {
        return case_fail(("case scenarios required: " + id));
    }
    let scenarios = $mini_map_get(spec, "cases");
    let names = ({ __proto__: $mini_map_proto });
    let position = 0;
    while ((position < (scenarios).length)) {
        let scenario = $mini_list_get(scenarios, position);
        let name = $mini_map_get(scenario, "name");
        if (((((($mini_value_kind(scenario) !== "map") || (!$mini_map_has(scenario, "name"))) || ($mini_value_kind(name) !== "text")) || ((name).length === 0)) || $mini_map_has(names, name))) {
            return case_fail(("scenario names must be unique: " + id));
        }
        $mini_map_set(names, name, true);
        let check = case_validate_scenario(spec, kind, scenario, directory);
        if ((!$mini_map_get(check, "ok"))) {
            return check;
        }
        position = (position + 1);
    }
    let fixture = ({ __proto__: $mini_map_proto });
    $mini_map_set(fixture, "path", path);
    $mini_map_set(fixture, "definition", spec);
    let result = case_ok();
    $mini_map_set(result, "fixture", fixture);
    return result;
}
function case_validate_scenario(spec, kind, scenario, directory) {
    let id = $mini_map_get(spec, "id");
    let name = $mini_map_get(scenario, "name");
    let prefix = (((id + "/") + name) + ": ");
    if (((((!$mini_map_has(scenario, "exitCode")) || ($mini_value_kind($mini_map_get(scenario, "exitCode")) !== "number")) || ($mini_map_get(scenario, "exitCode") < 0)) || ($mini_map_get(scenario, "exitCode") > 255))) {
        return case_fail((prefix + "invalid exit status"));
    }
    if (($mini_map_has(scenario, "args") && (!case_is_text_list($mini_map_get(scenario, "args"))))) {
        return case_fail((prefix + "invalid arguments"));
    }
    let streams = [];
    $mini_list_set(streams, 0, "stdin");
    $mini_list_set(streams, 1, "stdout");
    $mini_list_set(streams, 2, "stderr");
    let position = 0;
    while ((position < (streams).length)) {
        let key = $mini_list_get(streams, position);
        if ((!$mini_map_has(scenario, key))) {
            return case_fail("invalid stream");
        }
        let bytes = case_stream_bytes($mini_map_get(scenario, key), directory);
        if ((!$mini_map_get(bytes, "ok"))) {
            return case_fail($mini_map_get(bytes, "message"));
        }
        position = (position + 1);
    }
    let runnable = (((kind === "feature") || (kind === "sample")) || (kind === "example"));
    if (($mini_map_has(scenario, "inputFiles") || $mini_map_has(scenario, "outputFiles"))) {
        if ((!runnable)) {
            return case_fail((prefix + "file fixtures need a runnable Mini case"));
        }
        let groups = [];
        $mini_list_set(groups, 0, "inputFiles");
        $mini_list_set(groups, 1, "outputFiles");
        position = 0;
        while ((position < (groups).length)) {
            let group_key = $mini_list_get(groups, position);
            if ($mini_map_has(scenario, group_key)) {
                let files = $mini_map_get(scenario, group_key);
                if (($mini_value_kind(files) !== "map")) {
                    return case_fail((prefix + "file fixtures must be an object"));
                }
                let keys = Object.keys(files);
                let index = 0;
                while ((index < (keys).length)) {
                    let file_name = $mini_list_get(keys, index);
                    if (((((file_name).length === 0) || case_path_is_absolute(file_name)) || ($mini_text_find(file_name, "..") >= 0))) {
                        return case_fail("file fixture paths must stay inside the case workspace");
                    }
                    if ((!case_stream_valid($mini_map_get(files, file_name)))) {
                        return case_fail("invalid stream");
                    }
                    index = (index + 1);
                }
            }
            position = (position + 1);
        }
    }
    if (($mini_map_has(scenario, "artifact") && ((kind !== "compile") || (!case_stream_valid($mini_map_get(scenario, "artifact")))))) {
        return case_fail((prefix + "only compile cases compare generated artifacts"));
    }
    if (($mini_map_has(scenario, "workspace") && (kind !== "tool"))) {
        return case_fail((prefix + "invalid workspace"));
    }
    if ($mini_map_has(scenario, "tag")) {
        let tag = $mini_map_get(scenario, "tag");
        if (((((((!$mini_map_has(scenario, "workspace")) || ($mini_value_kind(tag) !== "map")) || (!$mini_map_has(tag, "name"))) || ($mini_value_kind($mini_map_get(tag, "name")) !== "text")) || (!$mini_map_has(tag, "annotated"))) || ($mini_value_kind($mini_map_get(tag, "annotated")) !== "boolean"))) {
            return case_fail((prefix + "invalid fixture tag"));
        }
    }
    if (($mini_map_has(scenario, "files") && (!case_is_text_list($mini_map_get(scenario, "files"))))) {
        return case_fail((prefix + "invalid artifact paths"));
    }
    return case_ok();
}
function case_collect(directory, filter, fixtures, ids) {
    let entries = $mini_directory_list(directory);
    let position = 0;
    while ((position < (entries).length)) {
        let name = $mini_list_get(entries, position);
        let path = case_path_join(directory, name);
        if ($mini_path_is_directory(path)) {
            let nested = case_collect(path, filter, fixtures, ids);
            if ((!$mini_map_get(nested, "ok"))) {
                return nested;
            }
        } else {
            if (text_ends_with(name, ".case.json")) {
                let loaded = case_load_case(path);
                if ((!$mini_map_get(loaded, "ok"))) {
                    return loaded;
                }
                let fixture = $mini_map_get(loaded, "fixture");
                let id = $mini_map_get($mini_map_get(fixture, "definition"), "id");
                if ($mini_map_has(ids, id)) {
                    return case_fail("duplicate case IDs");
                }
                $mini_map_set(ids, id, true);
                if (((filter === "") || ($mini_text_find(id, filter) >= 0))) {
                    $mini_list_set(fixtures, (fixtures).length, fixture);
                }
            }
        }
        position = (position + 1);
    }
    return case_ok();
}
function case_load_cases(filter, project_root) {
    let fixtures = [];
    let ids = ({ __proto__: $mini_map_proto });
    let collected = case_collect(case_path_join(project_root, "cases"), filter, fixtures, ids);
    if ((!$mini_map_get(collected, "ok"))) {
        return collected;
    }
    if (((fixtures).length === 0)) {
        return case_fail(("no cases match: " + filter));
    }
    let result = case_ok();
    $mini_map_set(result, "fixtures", fixtures);
    return result;
}
function case_compiler_entry(project_root) {
    let parsed = case_json_file(case_path_join(project_root, "config/compiler.json"));
    if ((!$mini_map_get(parsed, "ok"))) {
        return "";
    }
    return $mini_map_get($mini_map_get(parsed, "value"), "entry");
}
function case_run(command, args, directory, input) {
    let options = ({ __proto__: $mini_map_proto });
    $mini_map_set(options, "command", command);
    $mini_map_set(options, "arguments", args);
    $mini_map_set(options, "directory", directory);
    $mini_map_set(options, "input", input);
    $mini_map_set(options, "timeout", 30000);
    return $mini_process_spawn(options);
}
function case_entry_excluded(name) {
    return ((((name === ".git") || (name === "node_modules")) || (name === "dist")) || (name === ".cache"));
}
function case_copy_tree(from, to) {
    if ($mini_path_is_directory(from)) {
        $mini_directory_create(to);
        let entries = $mini_directory_list(from);
        let position = 0;
        while ((position < (entries).length)) {
            let name = $mini_list_get(entries, position);
            if ((!case_entry_excluded(name))) {
                case_copy_tree(case_path_join(from, name), case_path_join(to, name));
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
    return case_run("git", git_args, directory, []);
}
function case_tool_workspace(project_root, scenario, work) {
    let directory = case_path_join(work, "project");
    case_copy_tree(project_root, directory);
    let init = case_git(directory, case_text_list3("init", "-b", "main"));
    if (($mini_map_get(init, "status") !== 0)) {
        return case_fail(("git init failed: " + $mini_text_from_bytes($mini_map_get(init, "stderr"))));
    }
    let added = case_git(directory, case_text_list2("add", "."));
    if (($mini_map_get(added, "status") !== 0)) {
        return case_fail(("git add failed: " + $mini_text_from_bytes($mini_map_get(added, "stderr"))));
    }
    let committed = case_git(directory, case_text_list3("commit", "-m", "case fixture"));
    if (($mini_map_get(committed, "status") !== 0)) {
        return case_fail(("git commit failed: " + $mini_text_from_bytes($mini_map_get(committed, "stderr"))));
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
            return case_fail(("git tag failed: " + $mini_text_from_bytes($mini_map_get(tagged, "stderr"))));
        }
    }
    if (($mini_map_get(scenario, "workspace") === "dirty")) {
        writeFileSync(case_path_join(directory, "uncommitted.txt"), "dirty\n", "utf8");
    }
    let result = case_ok();
    $mini_map_set(result, "directory", directory);
    return result;
}
function case_text_list2(first, second) {
    let items = [];
    $mini_list_set(items, 0, first);
    $mini_list_set(items, 1, second);
    return items;
}
function case_text_list3(first, second, third) {
    let items = [];
    $mini_list_set(items, 0, first);
    $mini_list_set(items, 1, second);
    $mini_list_set(items, 2, third);
    return items;
}
function case_verify_scenario(fixture, scenario, project_root, compiler_override) {
    let definition = $mini_map_get(fixture, "definition");
    let directory = case_path_parent($mini_map_get(fixture, "path"));
    let id = $mini_map_get(definition, "id");
    let name = $mini_map_get(scenario, "name");
    let prefix = (((id + "/") + name) + ": ");
    let input = case_stream_bytes($mini_map_get(scenario, "stdin"), directory);
    if ((!$mini_map_get(input, "ok"))) {
        return case_fail((prefix + $mini_map_get(input, "message")));
    }
    let work = $mini_directory_temp();
    if (((work).length === 0)) {
        return case_fail((prefix + "cannot create a temporary directory"));
    }
    let result = case_verify_in_work(fixture, scenario, project_root, compiler_override, work, prefix);
    $mini_path_remove(work);
    return result;
}
function case_verify_in_work(fixture, scenario, project_root, compiler_override, work, prefix) {
    let definition = $mini_map_get(fixture, "definition");
    let kind = $mini_map_get(definition, "kind");
    let directory = case_path_parent($mini_map_get(fixture, "path"));
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
            if ((!$mini_map_get(prepared, "ok"))) {
                return case_fail((prefix + $mini_map_get(prepared, "message")));
            }
            workspace = $mini_map_get(prepared, "directory");
        }
        let command_args = [];
        $mini_list_set(command_args, 0, case_path_join(case_path_join(workspace, "bin"), $mini_map_get(definition, "tool")));
        let position = 0;
        while ((position < (args).length)) {
            $mini_list_set(command_args, (command_args).length, $mini_list_get(args, position));
            position = (position + 1);
        }
        result = case_run(process.execPath, command_args, workspace, $mini_map_get(input, "bytes"));
    } else {
        let source = case_path_resolve(directory, $mini_map_get(definition, "source"));
        let compiler = compiler_override;
        if ((compiler === "")) {
            compiler = case_compiler_entry(project_root);
        }
        let output = case_path_join(work, "program.mini.ts");
        let compile_args = [];
        $mini_list_set(compile_args, 0, compiler);
        $mini_list_set(compile_args, 1, "compile");
        $mini_list_set(compile_args, 2, source);
        $mini_list_set(compile_args, 3, output);
        result = case_run(process.execPath, compile_args, project_root, []);
        if ((($mini_map_get(result, "status") === 0) && $mini_path_exists(output))) {
            artifact = $mini_hash_sha256($mini_file_read_bytes(output));
        }
        if (((kind === "compile") && $mini_map_has(scenario, "artifact"))) {
            let expected = case_stream_bytes($mini_map_get(scenario, "artifact"), directory);
            if ((!$mini_map_get(expected, "ok"))) {
                return case_fail((prefix + $mini_map_get(expected, "message")));
            }
            if (((!$mini_path_exists(output)) || (!case_bytes_equal($mini_file_read_bytes(output), $mini_map_get(expected, "bytes"))))) {
                return case_fail((prefix + "generated artifact differs"));
            }
        }
        if (((kind === "reject") && $mini_path_exists(output))) {
            return case_fail((prefix + "rejection created an output artifact"));
        }
        if (((kind !== "reject") && (kind !== "compile"))) {
            if (($mini_map_get(result, "status") !== 0)) {
                return case_fail((prefix + $mini_text_from_bytes($mini_map_get(result, "stderr"))));
            }
            let files = case_path_join(work, "files");
            $mini_directory_create(files);
            let prepared_files = case_write_input_files(scenario, directory, files, prefix);
            if ((!$mini_map_get(prepared_files, "ok"))) {
                return prepared_files;
            }
            let run_args = [];
            $mini_list_set(run_args, 0, output);
            let position = 0;
            while ((position < (args).length)) {
                $mini_list_set(run_args, (run_args).length, $mini_list_get(args, position));
                position = (position + 1);
            }
            result = case_run(process.execPath, run_args, files, $mini_map_get(input, "bytes"));
            let checked_files = case_check_output_files(scenario, directory, files, prefix);
            if ((!$mini_map_get(checked_files, "ok"))) {
                return checked_files;
            }
        }
    }
    if (($mini_map_get(result, "status") !== $mini_map_get(scenario, "exitCode"))) {
        return case_fail(((prefix + "exit status") + case_diagnostic(result)));
    }
    let stdout = case_stream_bytes($mini_map_get(scenario, "stdout"), directory);
    if ((!case_bytes_equal($mini_map_get(result, "stdout"), $mini_map_get(stdout, "bytes")))) {
        return case_fail((prefix + "stdout"));
    }
    let stderr = case_stream_bytes($mini_map_get(scenario, "stderr"), directory);
    if ((!case_bytes_equal($mini_map_get(result, "stderr"), $mini_map_get(stderr, "bytes")))) {
        return case_fail((prefix + "stderr"));
    }
    if ((kind === "reject")) {
        if ((($mini_map_get(scenario, "exitCode") === 0) || (($mini_map_get(result, "stdout")).length !== 0))) {
            return case_fail((prefix + "rejection result"));
        }
    }
    if ($mini_map_has(scenario, "files")) {
        let files = $mini_map_get(scenario, "files");
        let position = 0;
        while ((position < (files).length)) {
            if ((!$mini_path_exists(case_path_resolve(workspace, $mini_list_get(files, position))))) {
                return case_fail(("missing artifact: " + $mini_list_get(files, position)));
            }
            position = (position + 1);
        }
    }
    let done = case_ok();
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
        return case_ok();
    }
    let inputs = $mini_map_get(scenario, "inputFiles");
    let names = Object.keys(inputs);
    let position = 0;
    while ((position < (names).length)) {
        let name = $mini_list_get(names, position);
        let stream = case_stream_bytes($mini_map_get(inputs, name), directory);
        if ((!$mini_map_get(stream, "ok"))) {
            return case_fail((prefix + $mini_map_get(stream, "message")));
        }
        let target = case_path_join(files, name);
        $mini_directory_create(case_path_parent(target));
        $mini_file_write_bytes(target, $mini_map_get(stream, "bytes"));
        position = (position + 1);
    }
    return case_ok();
}
function case_check_output_files(scenario, directory, files, prefix) {
    if ((!$mini_map_has(scenario, "outputFiles"))) {
        return case_ok();
    }
    let outputs = $mini_map_get(scenario, "outputFiles");
    let names = Object.keys(outputs);
    let position = 0;
    while ((position < (names).length)) {
        let name = $mini_list_get(names, position);
        let expected = case_stream_bytes($mini_map_get(outputs, name), directory);
        if ((!$mini_map_get(expected, "ok"))) {
            return case_fail((prefix + $mini_map_get(expected, "message")));
        }
        let target = case_path_join(files, name);
        if (((!$mini_path_exists(target)) || (!case_bytes_equal($mini_file_read_bytes(target), $mini_map_get(expected, "bytes"))))) {
            return case_fail(((prefix + "file ") + name));
        }
        position = (position + 1);
    }
    return case_ok();
}
function case_case_identity(fixture, project_root) {
    let definition = $mini_map_get(fixture, "definition");
    let directory = case_path_parent($mini_map_get(fixture, "path"));
    let source = "";
    if (($mini_map_get(definition, "kind") === "tool")) {
        source = case_path_join(case_path_join(project_root, "bin"), $mini_map_get(definition, "tool"));
    } else {
        source = case_path_resolve(directory, $mini_map_get(definition, "source"));
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
function bench_sorted(samples) {
    let result = $mini_list_copy(samples);
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
function bench_compiler_hash(root) {
    let parsed = $mini_json_parse(readFileSync(case_path_join(root, "config/compiler.json"), "utf8"));
    if ((!$mini_map_get(parsed, "ok"))) {
        bench_fail("invalid config/compiler.json");
    }
    let sources = $mini_map_get($mini_map_get(parsed, "value"), "sources");
    let parts = [];
    let position = 0;
    while ((position < (sources).length)) {
        let path = $mini_list_get(sources, position);
        $mini_list_set(parts, (parts).length, ((path + "\n") + readFileSync(case_path_join(root, path), "utf8")));
        position = (position + 1);
    }
    return $mini_hash_sha256($mini_list_to_text(parts, "\n"));
}
function bench_platform() {
    let code = "process.stdout.write(JSON.stringify({node:process.version,platform:process.platform,architecture:process.arch}))";
    let args = [];
    $mini_list_set(args, 0, "-e");
    $mini_list_set(args, 1, code);
    let result = case_run(process.execPath, args, case_root(), []);
    let parsed = $mini_json_parse($mini_text_from_bytes($mini_map_get(result, "stdout")));
    if ((!$mini_map_get(parsed, "ok"))) {
        return ({ __proto__: $mini_map_proto });
    }
    return $mini_map_get(parsed, "value");
}
function bench_commit(root) {
    if ((!$mini_path_exists(case_path_join(root, ".git")))) {
        return "";
    }
    let args = [];
    $mini_list_set(args, 0, "rev-parse");
    $mini_list_set(args, 1, "HEAD");
    let result = case_run("git", args, root, []);
    return bench_trim($mini_text_from_bytes($mini_map_get(result, "stdout")));
}
function bench_trim(text) {
    let length = (text).length;
    while (((length > 0) && (($mini_text_get(text, (length - 1)) === "\n") || ($mini_text_get(text, (length - 1)) === "\r")))) {
        length = (length - 1);
    }
    return $mini_text_slice(text, 0, length);
}
function main() {
    let args = process.argv.slice(2);
    if ((((args).length < 1) || ((args).length > 2))) {
        bench_fail("usage: mini-bench OUTPUT [FILTER]");
    }
    let root = case_root();
    let output = case_path_resolve("", $mini_list_get(args, 0));
    let filter = "";
    if (((args).length === 2)) {
        filter = $mini_list_get(args, 1);
    }
    if ($mini_path_exists(output)) {
        bench_fail("benchmark output already exists; choose a new report path");
    }
    let selected = case_load_cases(filter, root);
    if ((!$mini_map_get(selected, "ok"))) {
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
                    if ((!$mini_map_get(warmed, "ok"))) {
                        bench_fail($mini_map_get(warmed, "message"));
                    }
                    warmup_index = (warmup_index + 1);
                }
                let samples = [];
                let sample_index = 0;
                while ((sample_index < sample_count)) {
                    let started = Date.now();
                    let measured = case_verify_scenario(fixture, scenario, root, "");
                    if ((!$mini_map_get(measured, "ok"))) {
                        bench_fail($mini_map_get(measured, "message"));
                    }
                    $mini_list_set(samples, (samples).length, (Date.now() - started));
                    sample_index = (sample_index + 1);
                }
                let sorted = bench_sorted(samples);
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
    let versions_parsed = $mini_json_parse(readFileSync(case_path_join(root, "config/versions.json"), "utf8"));
    let report = ({ __proto__: $mini_map_proto });
    $mini_map_set(report, "node", $mini_map_get(host, "node"));
    $mini_map_set(report, "platform", $mini_map_get(host, "platform"));
    $mini_map_set(report, "architecture", $mini_map_get(host, "architecture"));
    $mini_map_set(report, "commit", bench_commit(root));
    if ($mini_map_get(versions_parsed, "ok")) {
        $mini_map_set(report, "versions", $mini_map_get(versions_parsed, "value"));
    }
    $mini_map_set(report, "compiler", bench_compiler_hash(root));
    $mini_map_set(report, "scope", "fresh-process wall time including startup, IO, verification, and compilation for program cases");
    $mini_map_set(report, "results", results);
    $mini_directory_create(case_path_parent(output));
    writeFileSync(output, ($mini_json_to_text(report) + "\n"), "utf8");
    writeSync(1, (((("Wrote " + $mini_number_to_text((results).length)) + " benchmark results to ") + output) + "\n"));
    return 0;
}
main();
