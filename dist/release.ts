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
function $mini_value_kind(value) {
    if (typeof value === "string") return "text";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "list";
    if (value !== null && typeof value === "object") return "map";
    return "other";
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
function result_is_ok(result) {
    if ((!value_is_map(result))) {
        return false;
    }
    return ($mini_map_get(result, "ok") === true);
}
function result_is_fail(result) {
    return (!result_is_ok(result));
}
function json_file(path) {
    if ((!$mini_path_exists(path))) {
        return result_fail(("cannot read " + path));
    }
    let parsed = $mini_json_parse(readFileSync(path, "utf8"));
    if (result_is_fail(parsed)) {
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
    if (result_is_fail(parsed)) {
        result_fail($mini_map_get(parsed, "message"));
        return "";
    }
    return $mini_map_get($mini_map_get(parsed, "value"), "entry");
}
function release_fail(message) {
    writeSync(2, (message + "\n"));
    process.exit(1);
    return 0;
}
function release_run(command, args, directory) {
    let result = process_capture(command, args, directory, []);
    if (($mini_map_get(result, "status") !== 0)) {
        release_fail((((((command + " ") + $mini_list_to_text(args, " ")) + " failed:\n") + $mini_text_from_bytes($mini_map_get(result, "stdout"))) + $mini_text_from_bytes($mini_map_get(result, "stderr"))));
    }
    let done = result_ok();
    $mini_map_set(done, "stdout", $mini_map_get(result, "stdout"));
    $mini_map_set(done, "stderr", $mini_map_get(result, "stderr"));
    return done;
}
function release_check(check, directory) {
    let result = process_capture(process.execPath, list_of2(check, "--docs"), directory, []);
    if (($mini_map_get(result, "status") !== 0)) {
        release_fail((((path_basename(check) + " failed:\n") + $mini_text_from_bytes($mini_map_get(result, "stdout"))) + $mini_text_from_bytes($mini_map_get(result, "stderr"))));
    }
    return 0;
}
function release_text_list1(value) {
    let items = [];
    $mini_list_set(items, 0, value);
    return items;
}
function release_json(path) {
    let parsed = json_file(path);
    if (result_is_fail(parsed)) {
        release_fail($mini_map_get(parsed, "message"));
    }
    return $mini_map_get(parsed, "value");
}
function release_component(name) {
    if ((name === "lang")) {
        return "language";
    }
    if (((((((((((((((name === "mini") || (name === "compiler")) || (name === "bootstrap")) || (name === "builtins")) || (name === "std")) || (name === "check")) || (name === "format")) || (name === "verify")) || (name === "release")) || (name === "test")) || (name === "bench")) || (name === "cli")) || (name === "lsp")) || (name === "vscode"))) {
        return name;
    }
    return "";
}
function release_select(tag, current) {
    let parts = $mini_text_split(tag, "-v");
    if (((parts).length !== 3)) {
        release_fail(("invalid component tag: " + tag));
    }
    let component = release_component($mini_list_get(parts, 0));
    if ((component === "")) {
        release_fail(("invalid component tag: " + tag));
    }
    let group = $mini_list_get(parts, 1);
    let version = $mini_list_get(parts, 2);
    if ((group !== $mini_map_get(current, "group"))) {
        release_fail("tag must match assigned group version");
    }
    if ((($mini_value_kind($mini_map_get(current, component)) !== "text") || ($mini_map_get(current, component) !== version))) {
        release_fail((("tag must match assigned " + component) + " version"));
    }
    let selected = ({ __proto__: $mini_map_proto });
    $mini_map_set(selected, "component", component);
    $mini_map_set(selected, "group", group);
    $mini_map_set(selected, "version", version);
    return selected;
}
function release_compiler_hash(active) {
    let sources = $mini_map_get(active, "sources");
    let parts = [];
    let position = 0;
    while ((position < (sources).length)) {
        let path = $mini_list_get(sources, position);
        $mini_list_set(parts, (parts).length, ((path + "\n") + readFileSync(path_join(project_root(), path), "utf8")));
        position = (position + 1);
    }
    return $mini_hash_sha256($mini_list_to_text(parts, "\n"));
}
function release_node_version(root) {
    let args = [];
    $mini_list_set(args, 0, "-v");
    let result = process_capture(process.execPath, args, root, []);
    return text_chomp($mini_text_from_bytes($mini_map_get(result, "stdout")));
}
function release_vscode(directory, output, tooling) {
    let current = release_json(path_join(directory, "config/versions.json"));
    let version = $mini_map_get(current, "vscode");
    if ((!value_is_text(version))) {
        release_fail("VS Code extension version is unassigned");
    }
    let packager = path_join(tooling, "editors/vscode/node_modules/@vscode/vsce/vsce");
    let bundler = path_join(tooling, "editors/vscode/node_modules/esbuild/bin/esbuild");
    if ((!$mini_path_exists(packager))) {
        release_fail("install VS Code development dependencies with npm ci in editors/vscode");
    }
    if ((!$mini_path_exists(bundler))) {
        release_fail("install the VS Code extension bundler with npm ci in editors/vscode");
    }
    let extension = path_join(directory, "editors/vscode");
    $mini_directory_create(path_join(extension, "dist"));
    let bundle_args = [];
    $mini_list_set(bundle_args, 0, bundler);
    $mini_list_set(bundle_args, 1, path_join(extension, "src/extension.ts"));
    $mini_list_set(bundle_args, 2, "--bundle");
    $mini_list_set(bundle_args, 3, "--platform=node");
    $mini_list_set(bundle_args, 4, "--format=cjs");
    $mini_list_set(bundle_args, 5, "--external:vscode");
    $mini_list_set(bundle_args, 6, ("--outfile=" + path_join(extension, "dist/extension.cjs")));
    release_run(process.execPath, bundle_args, extension);
    $mini_directory_create(output);
    let file = (((("mini-" + $mini_map_get(current, "group")) + "-v") + version) + ".vsix");
    let destination = path_join(output, file);
    if ($mini_path_exists(destination)) {
        release_fail("VSIX output already exists");
    }
    let package_args = [];
    $mini_list_set(package_args, 0, packager);
    $mini_list_set(package_args, 1, "package");
    $mini_list_set(package_args, 2, "--no-dependencies");
    $mini_list_set(package_args, 3, "--allow-missing-repository");
    $mini_list_set(package_args, 4, "--skip-license");
    $mini_list_set(package_args, 5, "--out");
    $mini_list_set(package_args, 6, destination);
    release_run(process.execPath, package_args, extension);
    let asset = ({ __proto__: $mini_map_proto });
    $mini_map_set(asset, "file", file);
    $mini_map_set(asset, "sha256", $mini_hash_sha256($mini_file_read_bytes(destination)));
    return asset;
}
function release_notes(output, title, label, commit, changelog) {
    writeFileSync(path_join(output, "RELEASE-NOTES.md"), ((((((("# " + title) + "\n\nVersion: ") + label) + "\n\nSource: ") + commit) + "\n\nBootstrap: verified fixed point\n\n") + changelog), "utf8");
    return 0;
}
function release_checksums(output) {
    let assets = $mini_directory_list(output);
    let lines = [];
    let position = 0;
    while ((position < (assets).length)) {
        let name = $mini_list_get(assets, position);
        $mini_list_set(lines, (lines).length, ((($mini_hash_sha256($mini_file_read_bytes(path_join(output, name))) + "  ") + name) + "\n"));
        position = (position + 1);
    }
    writeFileSync(path_join(output, "SHA256SUMS"), $mini_list_to_text(lines, ""), "utf8");
    return 0;
}
function release_prepare(directory, output, tag) {
    if ((!path_is_absolute(output))) {
        output = path_join(directory, output);
    }
    let released = 0;
    let status = release_run("git", list_of2("status", "--porcelain"), directory);
    if ((text_chomp($mini_text_from_bytes($mini_map_get(status, "stdout"))) !== "")) {
        release_fail("release needs a clean checkout");
    }
    let head = release_run("git", list_of2("rev-parse", "HEAD"), directory);
    let commit = text_chomp($mini_text_from_bytes($mini_map_get(head, "stdout")));
    let current = release_json(path_join(directory, "config/versions.json"));
    let active = release_json(path_join(directory, "config/compiler.json"));
    if ((tag !== "")) {
        released = release_select(tag, current);
        let type = release_run("git", list_of3("cat-file", "-t", ("refs/tags/" + tag)), directory);
        if ((text_chomp($mini_text_from_bytes($mini_map_get(type, "stdout"))) !== "tag")) {
            release_fail("release tag must be annotated");
        }
        let tagged = release_run("git", list_of2("rev-parse", (("refs/tags/" + tag) + "^{commit}")), directory);
        if ((text_chomp($mini_text_from_bytes($mini_map_get(tagged, "stdout"))) !== commit)) {
            release_fail("release tag must match the current commit");
        }
    }
    let bootstrap_config = release_json(path_join(directory, "config/bootstrap.json"));
    let available = value_is_map(bootstrap_config);
    let compiler_release = false;
    if ((released !== 0)) {
        let component = $mini_map_get(released, "component");
        compiler_release = ((((component === "mini") || (component === "language")) || (component === "compiler")) || (component === "bootstrap"));
    }
    if (((!available) && compiler_release)) {
        release_fail("this release requires a verified compiler bootstrap");
    }
    $mini_directory_create(output);
    if ((($mini_directory_list(output)).length !== 0)) {
        release_fail("release output directory must be empty");
    }
    let work = $mini_directory_temp();
    let source = path_join(work, "source");
    $mini_directory_create(source);
    let tracked = path_join(work, "source.tar");
    let archive_result = release_run("git", list_of3("archive", "--format=tar", commit), directory);
    $mini_file_write_bytes(tracked, $mini_map_get(archive_result, "stdout"));
    let extract_args = [];
    $mini_list_set(extract_args, 0, "-xf");
    $mini_list_set(extract_args, 1, tracked);
    $mini_list_set(extract_args, 2, "-C");
    $mini_list_set(extract_args, 3, source);
    release_run("tar", extract_args, work);
    release_check(path_join(source, "bin/mini-check"), source);
    let bootstrap = 0;
    if (available) {
        let verify_args = list_of2(path_join(source, "dist/verify.ts"), source);
        let verified = release_run(process.execPath, verify_args, source);
        let parsed = $mini_json_parse($mini_text_from_bytes($mini_map_get(verified, "stdout")));
        if (result_is_ok(parsed)) {
            bootstrap = $mini_map_get(parsed, "value");
        }
    }
    let label = ("snapshot-" + $mini_text_slice(commit, 0, 12));
    if ((tag !== "")) {
        label = tag;
    }
    let title = label;
    let vsix = 0;
    if (((released !== 0) && ($mini_map_get(released, "component") === "vscode"))) {
        vsix = release_vscode(source, output, directory);
    }
    let active_copy = ({ __proto__: $mini_map_proto });
    $mini_map_set(active_copy, "entry", $mini_map_get(active, "entry"));
    $mini_map_set(active_copy, "sources", $mini_map_get(active, "sources"));
    $mini_map_set(active_copy, "example", $mini_map_get(active, "example"));
    $mini_map_set(active_copy, "hash", release_compiler_hash(active));
    let manifest = ({ __proto__: $mini_map_proto });
    $mini_map_set(manifest, "schemaVersion", 2);
    $mini_map_set(manifest, "title", title);
    $mini_map_set(manifest, "tag", tag);
    $mini_map_set(manifest, "commit", commit);
    $mini_map_set(manifest, "group", $mini_map_get(current, "group"));
    $mini_map_set(manifest, "componentVersions", current);
    $mini_map_set(manifest, "releasedComponent", released);
    $mini_map_set(manifest, "compiler", active_copy);
    $mini_map_set(manifest, "node", release_node_version(directory));
    $mini_map_set(manifest, "bootstrap", bootstrap);
    $mini_map_set(manifest, "vsix", vsix);
    if ($mini_path_exists(path_join(source, "RELEASE.json"))) {
        release_fail("RELEASE.json is reserved for packaged metadata");
    }
    let record = ($mini_json_to_text(manifest) + "\n");
    writeFileSync(path_join(source, "RELEASE.json"), record, "utf8");
    let archive = (("minilang-" + label) + ".tar.gz");
    let pack_args = [];
    $mini_list_set(pack_args, 0, "-czf");
    $mini_list_set(pack_args, 1, path_join(output, archive));
    $mini_list_set(pack_args, 2, "-C");
    $mini_list_set(pack_args, 3, source);
    $mini_list_set(pack_args, 4, ".");
    release_run("tar", pack_args, work);
    let extracted = path_join(work, "extracted");
    $mini_directory_create(extracted);
    let unpack_args = [];
    $mini_list_set(unpack_args, 0, "-xf");
    $mini_list_set(unpack_args, 1, path_join(output, archive));
    $mini_list_set(unpack_args, 2, "-C");
    $mini_list_set(unpack_args, 3, extracted);
    release_run("tar", unpack_args, work);
    release_check(path_join(extracted, "bin/mini-check"), extracted);
    writeFileSync(path_join(output, "manifest.json"), record, "utf8");
    release_notes(output, title, label, commit, readFileSync(path_join(source, "CHANGELOG.md"), "utf8"));
    release_checksums(output);
    $mini_path_remove(work);
    return 0;
}
function main() {
    let args = process.argv.slice(2);
    if ((((args).length < 1) || ((args).length > 2))) {
        writeSync(2, "usage: mini-release OUTPUT [TAG]\n");
        process.exit(1);
    }
    let directory = project_root();
    let output = path_normalize($mini_list_get(args, 0));
    let tag = "";
    if (((args).length === 2)) {
        tag = $mini_list_get(args, 1);
    }
    release_prepare(directory, output, tag);
    return 0;
}
main();
