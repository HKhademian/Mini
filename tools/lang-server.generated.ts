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
function text_starts_with(source, prefix) {
    let size = (prefix).length;
    if ((size > (source).length)) {
        return false;
    }
    return ($mini_text_slice(source, 0, size) === prefix);
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
function lsp_trim(text) {
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
function lsp_join_from(items, start, separator) {
    let parts = [];
    let position = start;
    while ((position < (items).length)) {
        $mini_list_set(parts, (parts).length, $mini_list_get(items, position));
        position = (position + 1);
    }
    return $mini_list_to_text(parts, separator);
}
function lsp_reverse(items) {
    let result = [];
    let position = ((items).length - 1);
    while ((position >= 0)) {
        $mini_list_set(result, (result).length, $mini_list_get(items, position));
        position = (position - 1);
    }
    return result;
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
    return case_root();
}
function lsp_run(command, args, directory, input) {
    return case_run(command, args, directory, input);
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
    let message = lsp_trim(lsp_join_from(parts, 3, ":"));
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
    let compiler = case_compiler_entry(root);
    let work = $mini_directory_temp();
    let input = case_path_join(work, "source.mini");
    let output = case_path_join(work, "program.ts");
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
            let comment = lsp_trim($mini_text_slice($mini_map_get(token, "text"), 3, ($mini_map_get(token, "text")).length));
            $mini_list_set(lines, (lines).length, comment);
            line = (line - 1);
            cursor = (cursor - 1);
        }
    }
    return lsp_reverse(lines);
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
    $mini_list_set(args, 0, case_compiler_entry(root));
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
    $mini_list_set(args, 0, case_path_join(case_path_join(root, "tools"), "format.generated.ts"));
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
        let versions = $mini_map_get($mini_json_parse(readFileSync(case_path_join(lsp_root(), "config/versions.json"), "utf8")), "value");
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
                length = lsp_number(lsp_trim($mini_text_slice(line, 15, (line).length)));
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
function main() {
    let args = process.argv.slice(2);
    if ((((args).length === 1) && ($mini_list_get(args, 0) === "--version"))) {
        let versions = $mini_map_get($mini_json_parse(readFileSync(case_path_join(lsp_root(), "config/versions.json"), "utf8")), "value");
        writeSync(1, (((("lsp-v" + $mini_map_get(versions, "group")) + "-v") + $mini_map_get(versions, "lsp")) + "\n"));
        return 0;
    }
    if (((args).length !== 0)) {
        lsp_log("usage: mini-lang-server [--version]");
        process.exit(1);
    }
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
        process.exit(1);
    }
    return 0;
}
main();
