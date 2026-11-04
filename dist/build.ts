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
function $mini_path_temp_directory() {
    const fs = process.getBuiltinModule("node:fs");
    const os = process.getBuiltinModule("node:os");
    return fs.mkdtempSync(os.tmpdir() + "/mini-");
}
function $mini_path_is_exists(path) {
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
function build_fail(message) {
    writeSync(2, (message + "\n"));
    process.exit(1);
    return 0;
}
function build_manifest(root) {
    let parsed = json_parse_file(path_join(root, "tools/mini-tools.json"));
    if (result_is_fail(parsed)) {
        build_fail($mini_map_get(parsed, "message"));
    }
    return $mini_map_get(parsed, "value");
}
function build_compiler(root) {
    let parsed = json_parse_file(path_join(root, "config/compiler.json"));
    if (result_is_fail(parsed)) {
        build_fail($mini_map_get(parsed, "message"));
    }
    return $mini_map_get($mini_map_get(parsed, "value"), "entry");
}
function build_compile(root, compiler, source) {
    let work = $mini_path_temp_directory();
    let output = path_join(work, "tool.generated.ts");
    let args = [];
    $mini_list_set(args, 0, compiler);
    $mini_list_set(args, 1, path_join(root, source));
    $mini_list_set(args, 2, output);
    let result = process_capture(process.execPath, args, root, []);
    if (($mini_map_get(result, "status") !== 0)) {
        $mini_path_remove(work);
        build_fail(((source + " failed:\n") + $mini_text_from_bytes($mini_map_get(result, "stderr"))));
    }
    let generated = readFileSync(output, "utf8");
    $mini_path_remove(work);
    return generated;
}
function build_executable(root, path) {
    let args = [];
    $mini_list_set(args, 0, "755");
    $mini_list_set(args, 1, path_join(root, path));
    process_capture("chmod", args, root, []);
    return 0;
}
function build_launcher(launcher) {
    if (($mini_value_kind($mini_map_get(launcher, "tool")) === "text")) {
        return ((("#!/usr/bin/env node\nimport { pathToFileURL } from 'node:url';\nimport { join } from 'node:path';\n" + "await import(pathToFileURL(join(import.meta.dirname, '..', '") + $mini_map_get(launcher, "tool")) + "')).href);\n");
    }
    return ("#!/usr/bin/env node\nimport { pathToFileURL } from 'node:url';\nimport { join } from 'node:path';\n" + "await import(pathToFileURL(join(import.meta.dirname, '..', 'dist/mini.ts')).href);\n");
}
function build_all(root) {
    let manifest = build_manifest(root);
    let compiler = build_compiler(root);
    let tools = $mini_map_get(manifest, "tools");
    let position = 0;
    while ((position < (tools).length)) {
        let tool = $mini_list_get(tools, position);
        let generated = build_compile(root, compiler, $mini_map_get(tool, "source"));
        let target = path_join(root, $mini_map_get(tool, "generated"));
        $mini_directory_create(path_parent(target));
        writeFileSync(target, generated, "utf8");
        build_executable(root, $mini_map_get(tool, "generated"));
        position = (position + 1);
    }
    let launchers = $mini_map_get(manifest, "launchers");
    position = 0;
    while ((position < (launchers).length)) {
        let launcher = $mini_list_get(launchers, position);
        let name = ("bin/" + $mini_map_get(launcher, "name"));
        writeFileSync(path_join(root, name), build_launcher(launcher), "utf8");
        build_executable(root, name);
        position = (position + 1);
    }
    return 0;
}
function build_check(root) {
    let manifest = build_manifest(root);
    let compiler = build_compiler(root);
    let tools = $mini_map_get(manifest, "tools");
    let position = 0;
    while ((position < (tools).length)) {
        let tool = $mini_list_get(tools, position);
        let target = path_join(root, $mini_map_get(tool, "generated"));
        let generated = build_compile(root, compiler, $mini_map_get(tool, "source"));
        if (((!$mini_path_is_exists(target)) || (readFileSync(target, "utf8") !== generated))) {
            build_fail(($mini_map_get(tool, "generated") + " is stale; run dist/build.ts"));
        }
        position = (position + 1);
    }
    let launchers = $mini_map_get(manifest, "launchers");
    position = 0;
    while ((position < (launchers).length)) {
        let launcher = $mini_list_get(launchers, position);
        let name = ("bin/" + $mini_map_get(launcher, "name"));
        if (((!$mini_path_is_exists(path_join(root, name))) || (readFileSync(path_join(root, name), "utf8") !== build_launcher(launcher)))) {
            build_fail((name + " is stale; run dist/build.ts"));
        }
        position = (position + 1);
    }
    return 0;
}
function build_run(root, check) {
    if (check) {
        return build_check(root);
    }
    return build_all(root);
}
function main() {
    let args = process.argv.slice(2);
    if ((((args).length > 1) || (((args).length === 1) && ($mini_list_get(args, 0) !== "--check")))) {
        writeSync(2, "usage: dist/build.ts [--check]\n");
        process.exit(1);
    }
    let check = ((args).length === 1);
    build_run(project_root(), check);
    return 0;
}
main();
