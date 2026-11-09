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
function text_length(source) {
    if (typeof source !== "string") return 0;
    const cache = text_length.cache ?? (text_length.cache = new Map());
    let characters = cache.get(source);
    if (!characters) { characters = Array.from(source); if (cache.size >= 64) cache.clear(); cache.set(source, characters); }
    return characters.length;
}
function text_get(source, index) { if (typeof source !== "string" || !Number.isInteger(index) || index < 0) return ""; text_length(source); return text_length.cache.get(source)[index] ?? ""; }
function text_to_code(source, index) { if (typeof source !== "string" || !Number.isInteger(index) || index < 0) return 0; text_length(source); const character = text_length.cache.get(source)[index]; return character === undefined ? 0 : character.codePointAt(0); }
function text_from_code(code) { if (typeof code !== "number" || !Number.isInteger(code) || code < 0 || code > 0x10FFFF || (code >= 0xD800 && code <= 0xDFFF)) return ""; return String.fromCodePoint(code); }
function text_to_codes(source) {

    let codes = list_new();
    if ((!value_is_text(source))) {
        return codes;
    }
    let position = 0;
    while ((position < text_length(source))) {
        list_set(codes, (codes).length, text_to_code(source, position));
        position = (position + 1);
    }
    return codes;
}
function text_to_chars(source) {

    let characters = list_new();
    if ((!value_is_text(source))) {
        return characters;
    }
    let position = 0;
    while ((position < text_length(source))) {
        list_set(characters, (characters).length, text_get(source, position));
        position = (position + 1);
    }
    return characters;
}
function text_from_codes(codes) {

    if ((!value_is_list(codes))) {
        return "";
    }
    let characters = list_new();
    let position = 0;
    while ((position < (codes).length)) {
        list_set(characters, (characters).length, text_from_code(list_get(codes, position)));
        position = (position + 1);
    }
    return list_join("", characters);
}
function text_from_chars(characters) {

    return list_join("", characters);
}
function text_merge() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    let values = $mini_fn_args;
    let output = "";
    let position = 0;
    while ((position < (values).length)) {
        let value = list_get(values, position);
        if (value_is_text(value)) {
            output = (output + value);
        }
        position = (position + 1);
    }
    return output;
}
function text_join() {
    const $mini_fn_args = Array.prototype.slice.call(arguments);

    let values = $mini_fn_args;
    if (((values).length === 0)) {
        return "";
    }
    let separator = list_get(values, 0);
    if ((!value_is_text(separator))) {
        return "";
    }
    let output = "";
    let position = 1;
    while ((position < (values).length)) {
        if ((position > 1)) {
            output = (output + separator);
        }
        let value = list_get(values, position);
        if (value_is_text(value)) {
            output = (output + value);
        }
        position = (position + 1);
    }
    return output;
}
function text_split_lines(source) {

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
    text_length(source); const characters = text_length.cache.get(source);
    if (start < 0) start = characters.length + start;
    if (end < 0) end = characters.length + end;
    if (start < 0) start = 0;
    if (end < 0) end = 0;
    if (start > characters.length) start = characters.length;
    if (end > characters.length) end = characters.length;
    if (end <= start) return "";
    return characters.slice(start, end).join("");
}
function text_indent_output(output) {

    let lines = text_split_lines(output);
    let result = list_new();
    let position = 0;
    while ((position < (lines).length)) {
        let line = list_get(lines, position);
        if ((text_length(line) > 0)) {
            list_set(result, (result).length, ("    " + line));
        }
        position = (position + 1);
    }
    return list_join("\n", result);
}
function text_ends_with(source, suffix) {

    let size = text_length(suffix);
    let length = text_length(source);
    if ((size > length)) {
        return false;
    }
    return (text_slice(source, (length - size), length) === suffix);
}
function text_is_letter(character) {

    return (text_find("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_", character) >= 0);
}
function text_is_digit(character) {

    return (text_find("0123456789", character) >= 0);
}
function text_is_identifier_part(character) {

    return (text_is_letter(character) || text_is_digit(character));
}
function text_is_two_character_symbol(value) {

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
function text_find(source, needle) { if (typeof source !== "string" || typeof needle !== "string") return -1; const found = source.indexOf(needle); return found < 0 ? -1 : Array.from(source.slice(0, found)).length; }
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
function join(left, right) {

    return (left + right);
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
    io_write_line(number_to_text((join("a", 0)).length));
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
}
$mini_main();
