#!/usr/bin/env node
"use strict";
function process_panic(message) { process.getBuiltinModule("node:fs").writeSync(2, Buffer.from((typeof message === "string" ? message : "") + "\n", "utf8")); process.exit(1); return 0; }
function process_env(name) { return process.env[name] ?? ""; }
function process_exec_path() { return process.execPath; }
function process_exit(status) { process.exit(status); return 0; }
function process_script_path() { return process.argv[1] ?? ""; }
function process_spawn(options) {
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
function value_kind(value) { if (typeof value === "string") return "text"; if (typeof value === "number") return "number"; if (typeof value === "boolean") return "boolean"; if (Array.isArray(value)) return "list"; if (value !== null && typeof value === "object") return "map"; return "other"; }
function value_is_text(value) {

    return (value_kind(value) === "text");
}
function value_is_number(value) {

    return (value_kind(value) === "number");
}
function value_is_boolean(value) {

    return (value_kind(value) === "boolean");
}
function value_is_list(value) {

    return (value_kind(value) === "list");
}
function value_is_map(value) {

    return (value_kind(value) === "map");
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
function list_merge() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    let sources = $mini_fn_args;
    let result = list_new();
    let source_index = 0;
    while ((source_index < (sources).length)) {
        let source = list_get(sources, source_index);
        if (value_is_list(source)) {
            let item_index = 0;
            while ((item_index < (source).length)) {
                list_set(result, (result).length, list_get(source, item_index));
                item_index = (item_index + 1);
            }
        }
        source_index = (source_index + 1);
    }
    return result;
}
function list_join(separator, ...sources) {
    if (typeof separator !== "string") return "";
    let output = "";
    let hasItem = false;
    for (const items of sources) {
        if (!Array.isArray(items)) continue;
        for (const value of items) {
            if (hasItem) output += separator;
            if (typeof value === "string") output += value;
            hasItem = true;
        }
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
    return list_join(separator, parts);
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
        if ((value_kind(list_get(value, position)) !== "text")) {
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
function io_read_all() { return process.getBuiltinModule("node:fs").readFileSync(0, "utf8"); }
function io_read_bytes(count) { if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) return []; const fs = process.getBuiltinModule("node:fs"); const buffer = Buffer.alloc(count); const read = fs.readSync(0, buffer, 0, count, null); return Array.from(buffer.subarray(0, read)); }
function io_read_line() { const fs = process.getBuiltinModule("node:fs"); const buffer = Buffer.alloc(1); const bytes = []; while (true) { const count = fs.readSync(0, buffer, 0, 1, null); if (count === 0 || buffer[0] === 10) break; bytes.push(buffer[0]); } if (bytes.length > 0 && bytes[bytes.length - 1] === 13) bytes.pop(); return Buffer.from(bytes).toString("utf8"); }
function io_write(...values) {
    function normalize(value) {
        if (Array.isArray(value)) return value.map(normalize);
        if (value !== null && typeof value === "object") {
            const result = Object.create(null);
            for (const key of Object.keys(value).sort()) result[key] = normalize(value[key]);
            return result;
        }
        return value;
    }
    function display(value) {
        if (typeof value === "string") return value;
        if (typeof value === "number") return Number.isSafeInteger(value) ? String(value) : "";
        if (typeof value === "boolean") return value ? "true" : "false";
        if (Array.isArray(value) || (value !== null && typeof value === "object")) return JSON.stringify(normalize(value));
        return "0";
    }
    let text = "";
    for (const value of values) text += display(value);
    process.getBuiltinModule("node:fs").writeSync(1, Buffer.from(text, "utf8"));
    return 0;
}
function io_write_error(...values) {
    function normalize(value) {
        if (Array.isArray(value)) return value.map(normalize);
        if (value !== null && typeof value === "object") {
            const result = Object.create(null);
            for (const key of Object.keys(value).sort()) result[key] = normalize(value[key]);
            return result;
        }
        return value;
    }
    function display(value) {
        if (typeof value === "string") return value;
        if (typeof value === "number") return Number.isSafeInteger(value) ? String(value) : "";
        if (typeof value === "boolean") return value ? "true" : "false";
        if (Array.isArray(value) || (value !== null && typeof value === "object")) return JSON.stringify(normalize(value));
        return "0";
    }
    let text = "";
    for (const value of values) text += display(value);
    process.getBuiltinModule("node:fs").writeSync(2, Buffer.from(text, "utf8"));
    return 0;
}
function io_write_line() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    let values = $mini_fn_args;
    let position = 0;
    while ((position < (values).length)) {
        io_write(list_get(values, position));
        position = (position + 1);
    }
    return io_write("\n");
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
    io_write_line("ok");
}
function $mini_main() {
    $mini_file_0();
    $mini_file_1();
    $mini_file_2();
    $mini_file_3();
    $mini_file_4();
}
$mini_main();
