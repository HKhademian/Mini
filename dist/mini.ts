#!/usr/bin/env node
"use strict";
import { readFileSync, writeSync } from "node:fs";
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
function $mini_path_exists(path) {
    const fs = process.getBuiltinModule("node:fs");
    try { return fs.existsSync(path); } catch { return false; }
}
function $mini_text_find(text, needle) {
    if (typeof text !== "string" || typeof needle !== "string") return -1;
    return text.indexOf(needle);
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
    if (($mini_value_kind(result) !== "map")) {
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
function mini_compiler(root) {
    let parsed = json_file(path_join(root, "config/compiler.json"));
    if (result_is_fail(parsed)) {
        writeSync(2, ($mini_map_get(parsed, "message") + "\n"));
        process.exit(1);
    }
    return $mini_map_get($mini_map_get(parsed, "value"), "entry");
}
function mini_versions(root) {
    let parsed = json_file(path_join(root, "config/versions.json"));
    if (result_is_fail(parsed)) {
        writeSync(2, ($mini_map_get(parsed, "message") + "\n"));
        process.exit(1);
    }
    return $mini_map_get(parsed, "value");
}
function mini_tag(root, component) {
    let current = mini_versions(root);
    return ((((component + "-v") + $mini_map_get(current, "group")) + "-v") + $mini_map_get(current, component));
}
function mini_component(command) {
    if ((((((((command === "check") || (command === "format")) || (command === "verify")) || (command === "release")) || (command === "test")) || (command === "bench")) || (command === "lsp"))) {
        return command;
    }
    if (((command === "compile") || (command === "minic"))) {
        return "compiler";
    }
    if ((command === "run")) {
        return "cli";
    }
    return "";
}
function mini_spawn(root, tool, args) {
    let command_args = [];
    $mini_list_set(command_args, 0, path_join(root, tool));
    let position = 0;
    while ((position < (args).length)) {
        $mini_list_set(command_args, (command_args).length, $mini_list_get(args, position));
        position = (position + 1);
    }
    let options = ({ __proto__: $mini_map_proto });
    $mini_map_set(options, "command", process.execPath);
    $mini_map_set(options, "arguments", command_args);
    $mini_map_set(options, "directory", root);
    $mini_map_set(options, "mode", "inherit");
    return $mini_map_get($mini_process_spawn(options), "status");
}
function mini_rest(items, start) {
    let result = [];
    let position = start;
    while ((position < (items).length)) {
        $mini_list_set(result, (result).length, $mini_list_get(items, position));
        position = (position + 1);
    }
    return result;
}
function mini_usage(message) {
    writeSync(2, (message + "\n"));
    return 1;
}
function mini_help() {
    writeSync(1, "mini: tiny self-hosting foundation for language projects\n");
    writeSync(1, "Usage: mini check [--docs | SOURCE.mini | -] | fmt [--write | --check] SOURCE.mini | run SOURCE.mini [ARG]... | test [FILTER] | bench OUTPUT [FILTER] | verify [CASE.json] | release OUTPUT [TAG] | compile SOURCE.mini [OUTPUT.ts] | build [--check] | ci TASK_FILE\n");
    writeSync(1, "Aliases: mini-check, mini-format, mini-run, mini-test, mini-bench, mini-verify, mini-release, mini-compile, minic\n");
    return 0;
}
function mini_command(root, command, args) {
    if ((command === "build")) {
        return mini_spawn(root, "dist/build.ts", args);
    }
    if ((command === "ci")) {
        return mini_spawn(root, "dist/ci.ts", args);
    }
    if ((command === "check")) {
        if ((((args).length === 0) || (((args).length === 1) && ($mini_list_get(args, 0) === "--docs")))) {
            return mini_spawn(root, "dist/check.ts", args);
        }
        if (((args).length !== 1)) {
            return mini_usage("usage: mini-check [--docs | SOURCE.mini | -]");
        }
        let path = $mini_list_get(args, 0);
        if (((path !== "-") && (!$mini_path_exists(path)))) {
            return mini_usage(("cannot read " + path));
        }
        return mini_spawn(root, "dist/check-source.ts", args);
    }
    if ((command === "format")) {
        let format_path = "";
        let position = 0;
        while ((position < (args).length)) {
            let arg = $mini_list_get(args, position);
            if (((arg !== "--write") && (arg !== "--check"))) {
                format_path = arg;
            }
            position = (position + 1);
        }
        if ((((format_path !== "") && (format_path !== "-")) && (!$mini_path_exists(format_path)))) {
            return mini_usage(("cannot read " + format_path));
        }
        return mini_spawn(root, "dist/format.ts", args);
    }
    if ((command === "run")) {
        if (((args).length < 1)) {
            return mini_usage("usage: mini-run SOURCE.mini [ARG]...");
        }
        let source = $mini_list_get(args, 0);
        if ((!text_ends_with(source, ".mini"))) {
            return mini_usage("Mini source must use .mini");
        }
        let run_args = [];
        $mini_list_set(run_args, 0, mini_compiler(root));
        $mini_list_set(run_args, 1, source);
        let position = 1;
        while ((position < (args).length)) {
            $mini_list_set(run_args, (run_args).length, $mini_list_get(args, position));
            position = (position + 1);
        }
        return mini_spawn(root, "dist/run.ts", run_args);
    }
    if ((command === "test")) {
        return mini_spawn(root, "dist/test.ts", args);
    }
    if ((command === "bench")) {
        if (((args).length < 1)) {
            return mini_usage("usage: mini-bench OUTPUT [FILTER]");
        }
        return mini_spawn(root, "dist/bench.ts", args);
    }
    if ((command === "verify")) {
        if (((args).length === 0)) {
            return mini_spawn(root, "dist/verify.ts", []);
        }
        let file_args = [];
        $mini_list_set(file_args, 0, "--file");
        $mini_list_set(file_args, 1, $mini_list_get(args, 0));
        return mini_spawn(root, "dist/test.ts", file_args);
    }
    if ((command === "release")) {
        if (((args).length < 1)) {
            return mini_usage("usage: mini-release OUTPUT [TAG]");
        }
        let status = mini_spawn(root, "dist/release.ts", args);
        if ((status === 0)) {
            writeSync(1, "Release prepared.\n");
        }
        return status;
    }
    if ((command === "compile")) {
        let compiler = path_join(root, mini_compiler(root));
        if ((((args).length > 0) && ($mini_list_get(args, 0) === "--tokens"))) {
            let token_args = [];
            $mini_list_set(token_args, 0, "tokens");
            $mini_list_set(token_args, 1, $mini_list_get(args, 1));
            return mini_spawn(root, mini_compiler(root), token_args);
        }
        if (((args).length < 1)) {
            return mini_usage("usage: mini-compile SOURCE.mini [OUTPUT.ts]");
        }
        let source = $mini_list_get(args, 0);
        if ((!text_ends_with(source, ".mini"))) {
            return mini_usage("Mini source must use .mini");
        }
        let output = (source + ".ts");
        if (((args).length > 1)) {
            output = $mini_list_get(args, 1);
        }
        let compile_args = [];
        $mini_list_set(compile_args, 0, source);
        $mini_list_set(compile_args, 1, output);
        let status = mini_spawn(root, mini_compiler(root), compile_args);
        if (((status === 0) && text_starts_with(readFileSync(source, "utf8"), "#!"))) {
            let chmod_args = [];
            $mini_list_set(chmod_args, 0, "755");
            $mini_list_set(chmod_args, 1, output);
            process_capture("chmod", chmod_args, root, []);
        }
        return status;
    }
    return mini_usage(("unknown command: " + command));
}
function mini_run(executable, args, root) {
    if (((executable === "mini.ts") || (executable === "mini.generated.ts"))) {
        executable = "mini";
    }
    let command = executable;
    let rest = args;
    if ((executable === "mini")) {
        if ((((args).length === 0) || ($mini_list_get(args, 0) === "--help"))) {
            return mini_help();
        }
        if (($mini_list_get(args, 0) === "--version")) {
            writeSync(1, (((mini_tag(root, "mini") + "\n") + mini_tag(root, "cli")) + "\n"));
            return 0;
        }
        command = $mini_list_get(args, 0);
        rest = mini_rest(args, 1);
    } else {
        if ((executable === "minic")) {
            command = "compile";
        } else {
            if (text_starts_with(executable, "mini-")) {
                command = $mini_text_slice(executable, 5, (executable).length);
            }
        }
    }
    if ((command === "fmt")) {
        command = "format";
    }
    if ((((rest).length === 1) && ($mini_list_get(rest, 0) === "--version"))) {
        let component = mini_component(command);
        if ((component !== "")) {
            writeSync(1, (mini_tag(root, component) + "\n"));
            return 0;
        }
    }
    return mini_command(root, command, rest);
}
function main() {
    let script = process.argv[1];
    let executable = path_basename(script);
    process.exit(mini_run(executable, process.argv.slice(2), project_root()));
    return 0;
}
main();
