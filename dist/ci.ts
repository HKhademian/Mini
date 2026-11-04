#!/usr/bin/env node
"use strict";
import { readFileSync, writeSync } from "node:fs";
const $mini_map_proto = { __proto__: null };
function $mini_map_get(items, key) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return 0;
    const value = items[key];
    return value !== undefined || key in items ? value : 0;
}
function $mini_map_set(items, key, value) {
    if (items !== null && typeof items === "object" && !Array.isArray(items)) items[key] = value;
}
function $mini_directory_list(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.readdirSync(path).sort(); } catch { return []; }
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
function $mini_path_is_exists(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.existsSync(path); } catch { return false; }
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
function ci_root() {
    let workspace = (process.env["GITHUB_WORKSPACE"] ?? "");
    if ((workspace !== "")) {
        return workspace;
    }
    let pwd = (process.env["PWD"] ?? "");
    if ((pwd !== "")) {
        return pwd;
    }
    return project_root();
}
function ci_run(root, command, args, directory) {
    let options = ({ __proto__: $mini_map_proto });
    $mini_map_set(options, "command", command);
    $mini_map_set(options, "arguments", args);
    $mini_map_set(options, "mode", "capture");
    $mini_map_set(options, "directory", directory);
    $mini_map_set(options, "timeout", 0);
    let result = $mini_process_spawn(options);
    let stdout = $mini_text_from_bytes($mini_map_get(result, "stdout"));
    let stderr = $mini_text_from_bytes($mini_map_get(result, "stderr"));
    if (((stdout).length > 0)) {
        writeSync(1, stdout);
    }
    if (((stderr).length > 0)) {
        writeSync(2, stderr);
    }
    if (($mini_map_get(result, "status") !== 0)) {
        process.exit($mini_map_get(result, "status"));
    }
    return 0;
}
function ci_args1(a) {
    let result = [];
    $mini_list_set(result, 0, a);
    return result;
}
function ci_args2(a, b) {
    let result = [];
    $mini_list_set(result, 0, a);
    $mini_list_set(result, 1, b);
    return result;
}
function ci_args3(a, b, c) {
    let result = [];
    $mini_list_set(result, 0, a);
    $mini_list_set(result, 1, b);
    $mini_list_set(result, 2, c);
    return result;
}
function ci_args4(a, b, c, d) {
    let result = [];
    $mini_list_set(result, 0, a);
    $mini_list_set(result, 1, b);
    $mini_list_set(result, 2, c);
    $mini_list_set(result, 3, d);
    return result;
}
function ci_mini(root, args) {
    return ci_run(root, path_join(root, "bin/mini"), args, root);
}
function ci_node(root, args, directory) {
    return ci_run(root, process.execPath, args, directory);
}
function ci_fail(message) {
    writeSync(2, (message + "\n"));
    process.exit(1);
    return 0;
}
function ci_task_name(text) {
    if (text_ends_with(text, "\n")) {
        return $mini_text_slice(text, 0, ((text).length - 1));
    }
    return text;
}
function ci_package(root) {
    let tag = "";
    if ((((process.env["GITHUB_EVENT_NAME"] ?? "") === "push") && ((process.env["GITHUB_REF_TYPE"] ?? "") === "tag"))) {
        tag = (process.env["GITHUB_REF_NAME"] ?? "");
    }
    let args = [];
    $mini_list_set(args, 0, "release");
    $mini_list_set(args, 1, path_join(root, "dist/release"));
    if ((tag !== "")) {
        $mini_list_set(args, 2, tag);
    }
    return ci_mini(root, args);
}
function ci_publish(root) {
    if ((((process.env["GITHUB_EVENT_NAME"] ?? "") !== "push") || ((process.env["GITHUB_REF_TYPE"] ?? "") !== "tag"))) {
        ci_fail("publish requires a pushed tag");
    }
    let tag = (process.env["GITHUB_REF_NAME"] ?? "");
    if ((tag === "")) {
        ci_fail("publish requires GITHUB_REF_NAME");
    }
    let directory = path_join(root, "dist/release");
    let parsed = json_parse_file(path_join(directory, "manifest.json"));
    if (result_is_fail(parsed)) {
        ci_fail($mini_map_get(parsed, "message"));
    }
    let manifest = $mini_map_get(parsed, "value");
    if (($mini_map_get(manifest, "tag") !== tag)) {
        ci_fail(("manifest tag does not match " + tag));
    }
    let files = $mini_directory_list(directory);
    let args = [];
    $mini_list_set(args, 0, "release");
    $mini_list_set(args, 1, "create");
    $mini_list_set(args, 2, tag);
    let position = 0;
    while ((position < (files).length)) {
        $mini_list_set(args, (args).length, path_join(directory, $mini_list_get(files, position)));
        position = (position + 1);
    }
    $mini_list_set(args, (args).length, "--draft");
    $mini_list_set(args, (args).length, "--verify-tag");
    $mini_list_set(args, (args).length, "--latest=false");
    $mini_list_set(args, (args).length, "--title");
    $mini_list_set(args, (args).length, $mini_map_get(manifest, "title"));
    $mini_list_set(args, (args).length, "--notes-file");
    $mini_list_set(args, (args).length, path_join(directory, "RELEASE-NOTES.md"));
    let version = $mini_map_get($mini_map_get(manifest, "releasedComponent"), "version");
    if (($mini_text_find(version, "-") >= 0)) {
        $mini_list_set(args, (args).length, "--prerelease");
    }
    ci_run(root, "gh", args, root);
    let edit = [];
    $mini_list_set(edit, 0, "release");
    $mini_list_set(edit, 1, "edit");
    $mini_list_set(edit, 2, tag);
    $mini_list_set(edit, 3, "--draft=false");
    $mini_list_set(edit, 4, "--latest=false");
    return ci_run(root, "gh", edit, root);
}
function ci_task(root, task) {
    if ((task === "install")) {
        ci_run(root, "npm", ci_args4("ci", "--ignore-scripts", "--no-audit", "--no-fund"), root);
        return ci_run(root, "npm", ci_args4("ci", "--ignore-scripts", "--no-audit", "--no-fund"), path_join(root, "editors/vscode"));
    }
    if ((task === "check")) {
        return ci_mini(root, ci_args1("check"));
    }
    if ((task === "test")) {
        ci_mini(root, ci_args1("test"));
        ci_mini(root, ci_args2("test", "--unit"));
        ci_node(root, ci_args2("--test", "test/format.test.ts"), root);
        ci_node(root, ci_args2("--test", "test/lang-server.test.ts"), root);
        ci_run(root, "npm", ci_args2("run", "check"), path_join(root, "editors/vscode"));
        ci_node(root, ci_args2("--test", "test/grammar.test.ts"), path_join(root, "editors/vscode"));
        ci_node(root, ci_args2("--test", "test/release.test.ts"), root);
        return ci_node(root, ci_args2("test/performance/application-performance.ts", "--check"), root);
    }
    if ((task === "bench")) {
        ci_mini(root, ci_args3("bench", ".cache/bench-ci.json", "tooling.check"));
        return ci_mini(root, ci_args3("bench", ".cache/bench-compiler-ci.json", "compiler.bindings-emission"));
    }
    if ((task === "package")) {
        return ci_package(root);
    }
    if ((task === "publish")) {
        return ci_publish(root);
    }
    return ci_fail(("unknown CI task: " + task));
}
function main() {
    let args = process.argv.slice(2);
    if (((args).length !== 1)) {
        writeSync(2, "usage: dist/ci.ts TASK_FILE\n");
        process.exit(1);
    }
    let task = ci_task_name(readFileSync($mini_list_get(args, 0), "utf8"));
    process.exit(ci_task(ci_root(), task));
    return 0;
}
main();
