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
function $mini_map_copy(items) {
    if (items === null || typeof items !== "object" || Array.isArray(items)) return Object.create(null);
    return Object.assign(Object.create(null), items);
}
function $mini_number_to_text(value) {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "";
    return String(value);
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
let map_runtime = "const $mini_map_proto = { __proto__: null };\nfunction $mini_map_get(items, key) {\n    if (items === null || typeof items !== \"object\" || Array.isArray(items)) return 0;\n    const value = items[key];\n    return value !== undefined || key in items ? value : 0;\n}\nfunction $mini_map_has(items, key) {\n    return key in items;\n}\nfunction $mini_map_set(items, key, value) {\n    if (items !== null && typeof items === \"object\" && !Array.isArray(items)) items[key] = value;\n}\n";
let directory_remove_helper = "function $mini_directory_remove(path) {\n    const fs = process.getBuiltinModule(\"node:fs\");\n    if (path !== \"\" && fs.existsSync(path) && fs.statSync(path).isDirectory()) fs.rmdirSync(path);\n}\n";
let file_remove_helper = "function $mini_file_remove(path) {\n    const fs = process.getBuiltinModule(\"node:fs\");\n    if (path !== \"\" && fs.existsSync(path) && !fs.statSync(path).isDirectory()) fs.rmSync(path, { force: true });\n}\n";
let map_copy_helper = "function $mini_map_copy(items) {\n    if (items === null || typeof items !== \"object\" || Array.isArray(items)) return Object.create(null);\n    return Object.assign(Object.create(null), items);\n}\n";
let list_copy_helper = "function $mini_list_copy(items) {\n    if (!Array.isArray(items)) return [];\n    return items.slice();\n}\n";
let list_to_text_helper = "function $mini_list_to_text(items, separator) {\n    if (!Array.isArray(items) || typeof separator !== \"string\") return \"\";\n    let output = \"\";\n    for (let index = 0; index < items.length; index++) {\n        if (index > 0) output += separator;\n        const value = items[index];\n        if (typeof value === \"string\") output += value;\n    }\n    return output;\n}\n";
let list_get_helper = "function $mini_list_get(items, index) {\n    if (!Array.isArray(items)) return 0;\n    if (index < 0) index = items.length + index;\n    if (index >= 0 && index < items.length && index in items) return items[index];\n    return 0;\n}\n";
let list_set_helper = "function $mini_list_set(items, index, value) {\n    if (!Array.isArray(items)) return;\n    if (index < 0) index = items.length + index;\n    if (index >= 0) items[index] = value;\n}\n";
let json_to_text_helper = "function $mini_json_to_text(value) {\n    const seen = new Set();\n    function encode(item) {\n        if (typeof item === \"string\") return JSON.stringify(item);\n        if (typeof item === \"number\") return Number.isSafeInteger(item) ? String(item) : \"null\";\n        if (typeof item === \"boolean\") return item ? \"true\" : \"false\";\n        if (item === null || item === undefined) return \"null\";\n        if (typeof item !== \"object\") return \"null\";\n        if (seen.has(item)) throw 0;\n        seen.add(item);\n        let output;\n        if (Array.isArray(item)) {\n            const parts = [];\n            for (let index = 0; index < item.length; index++) parts.push(index in item ? encode(item[index]) : \"null\");\n            output = \"[\" + parts.join(\",\") + \"]\";\n        } else {\n            const parts = [];\n            for (const key of Object.keys(item).sort()) parts.push(JSON.stringify(key) + \":\" + encode(item[key]));\n            output = \"{\" + parts.join(\",\") + \"}\";\n        }\n        seen.delete(item);\n        return output;\n    }\n    try { return encode(value); } catch { return \"\"; }\n}\n";
let number_to_text_helper = "function $mini_number_to_text(value) {\n    if (typeof value !== \"number\" || !Number.isSafeInteger(value)) return \"\";\n    return String(value);\n}\n";
let process_run_helper = "function $mini_process_run(command, args, mode) {\n    const output = { __proto__: null, status: 1, signal: \"\", stdout: \"\", stderr: \"\", error: \"\" };\n    const child = process.getBuiltinModule(\"node:child_process\");\n    const result = child.spawnSync(command, Array.isArray(args) ? args.map(String) : [], {\n        stdio: mode === \"inherit\" ? \"inherit\" : \"pipe\",\n        encoding: \"utf8\",\n        maxBuffer: 32 * 1024 * 1024,\n    });\n    if (result.error) output.error = String(result.error.message);\n    if (result.status !== null) output.status = result.status;\n    if (typeof result.signal === \"string\") output.signal = result.signal;\n    output.stdout = typeof result.stdout === \"string\" ? result.stdout : \"\";\n    output.stderr = typeof result.stderr === \"string\" ? result.stderr : \"\";\n    return output;\n}\n";
let directory_temp_helper = "function $mini_directory_temp() {\n    const fs = process.getBuiltinModule(\"node:fs\");\n    const os = process.getBuiltinModule(\"node:os\");\n    return fs.mkdtempSync(os.tmpdir() + \"/mini-\");\n}\n";
let text_find_helper = "function $mini_text_find(text, needle) {\n    if (typeof text !== \"string\" || typeof needle !== \"string\") return -1;\n    return text.indexOf(needle);\n}\n";
let text_get_helper = "function $mini_text_get(text, index) {\n    if (typeof text === \"string\" && index >= 0 && index < text.length) return text[index];\n    return \"\";\n}\n";
let text_split_helper = "function $mini_text_split(text, divider) {\n    if (typeof text !== \"string\" || typeof divider !== \"string\") return [];\n    if (divider === \"\") return [text];\n    return text.split(divider);\n}\n";
let text_slice_helper = "function $mini_text_slice(source, start, end) {\n    if (typeof source !== \"string\") return \"\";\n    if (start < 0) start = source.length + start;\n    if (end < 0) end = source.length + end;\n    if (start < 0) start = 0;\n    if (end < 0) end = 0;\n    if (start > source.length) start = source.length;\n    if (end > source.length) end = source.length;\n    if (end <= start) return \"\";\n    return source.slice(start, end);\n}\n";
let json_parse_helper = "function $mini_json_parse(text) {\n    const result = { __proto__: null, ok: false, value: 0 };\n    if (typeof text !== \"string\") return result;\n    let parsed;\n    try { parsed = JSON.parse(text); } catch { return result; }\n    const clean = (item) => {\n        if (item === null) return 0;\n        if (Array.isArray(item)) return item.map(clean);\n        if (typeof item === \"object\") {\n            const out = { __proto__: null };\n            for (const key of Object.keys(item)) out[key] = clean(item[key]);\n            return out;\n        }\n        return item;\n    };\n    result.ok = true;\n    result.value = clean(parsed);\n    return result;\n}\n";
let text_bytes_helper = "function $mini_text_bytes(text) {\n    if (typeof text !== \"string\") return [];\n    return Array.from(Buffer.from(text, \"utf8\"));\n}\n";
let bytes_text_helper = "function $mini_bytes_text(bytes) {\n    if (!Array.isArray(bytes)) return \"\";\n    return Buffer.from(bytes.map(value => typeof value === \"number\" && Number.isInteger(value) ? value & 255 : 0)).toString(\"utf8\");\n}\n";
let file_read_bytes_helper = "function $mini_file_read_bytes(path) {\n    return Array.from(process.getBuiltinModule(\"node:fs\").readFileSync(path));\n}\n";
let file_write_bytes_helper = "function $mini_file_write_bytes(path, bytes) {\n    const values = Array.isArray(bytes) ? bytes.map(value => typeof value === \"number\" && Number.isInteger(value) ? value & 255 : 0) : [];\n    process.getBuiltinModule(\"node:fs\").writeFileSync(path, Buffer.from(values));\n}\n";
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
function token_new(kind, text, source, start, end, line, column, context) {
    let token = ({ __proto__: $mini_map_proto });
    $mini_map_set(token, "kind", kind);
    $mini_map_set(token, "text", text);
    $mini_map_set(token, "source", source);
    $mini_map_set(token, "start", start);
    $mini_map_set(token, "end", end);
    $mini_map_set(token, "line", line);
    $mini_map_set(token, "column", column);
    $mini_map_set(token, "context", context);
    return token;
}
function lex_advance(state) {
    let source = $mini_map_get(state, "text");
    let position = $mini_map_get(state, "position");
    let value = $mini_text_get(source, position);
    $mini_map_set(state, "position", (position + 1));
    if ((value === "\n")) {
        $mini_map_set(state, "line", ($mini_map_get(state, "line") + 1));
        $mini_map_set(state, "column", 1);
    } else {
        $mini_map_set(state, "column", ($mini_map_get(state, "column") + 1));
    }
    return value;
}
function lex_start(state) {
    let lines = $mini_map_get(state, "lines");
    let token = token_new("symbol", "", $mini_map_get(state, "source"), $mini_map_get(state, "position"), $mini_map_get(state, "position"), $mini_map_get(state, "line"), $mini_map_get(state, "column"), $mini_list_get(lines, ($mini_map_get(state, "line") - 1)));
    return token;
}
function diagnostic_fail(token, message) {
    let context = $mini_map_get(token, "context");
    let column = $mini_map_get(token, "column");
    let indent = "";
    let position = 0;
    while (((position < (column - 1)) && (position < (context).length))) {
        if (($mini_text_get(context, position) === "\t")) {
            indent = (indent + "\t");
        } else {
            indent = (indent + " ");
        }
        position = (position + 1);
    }
    writeSync(2, ((((((((((($mini_map_get(token, "source") + ":") + $mini_number_to_text($mini_map_get(token, "line"))) + ":") + $mini_number_to_text(column)) + ": ") + message) + "\n") + context) + "\n") + indent) + "^\n"));
    process.exit(1);
    return 0;
}
function lex_fail(token, message) {
    return diagnostic_fail(token, message);
}
function tokenize(source, source_name, include_comments) {
    let state = ({ __proto__: $mini_map_proto });
    $mini_map_set(state, "text", source);
    $mini_map_set(state, "source", source_name);
    $mini_map_set(state, "tokens", []);
    $mini_map_set(state, "lines", split_lines(source));
    $mini_map_set(state, "position", 0);
    $mini_map_set(state, "line", 1);
    $mini_map_set(state, "column", 1);
    if (((((source).length >= 2) && ($mini_text_get(source, 0) === "#")) && ($mini_text_get(source, 1) === "!"))) {
        let shebang_token = lex_start(state);
        $mini_map_set(shebang_token, "kind", "shebang");
        while (((($mini_map_get(state, "position") < (source).length) && ($mini_text_get(source, $mini_map_get(state, "position")) !== "\r")) && ($mini_text_get(source, $mini_map_get(state, "position")) !== "\n"))) {
            lex_advance(state);
        }
        $mini_map_set(shebang_token, "text", $mini_text_slice(source, $mini_map_get(shebang_token, "start"), $mini_map_get(state, "position")));
        $mini_map_set(shebang_token, "end", $mini_map_get(state, "position"));
        let initial_tokens = $mini_map_get(state, "tokens");
        $mini_list_set(initial_tokens, (initial_tokens).length, shebang_token);
    }
    while (($mini_map_get(state, "position") < (source).length)) {
        let character = $mini_text_get(source, $mini_map_get(state, "position"));
        if (($mini_text_find(" \t\r\n", character) >= 0)) {
            lex_advance(state);
        } else {
            if (((character === "/") && ($mini_text_get(source, ($mini_map_get(state, "position") + 1)) === "/"))) {
                let comment_token = lex_start(state);
                while (((($mini_map_get(state, "position") < (source).length) && ($mini_text_get(source, $mini_map_get(state, "position")) !== "\r")) && ($mini_text_get(source, $mini_map_get(state, "position")) !== "\n"))) {
                    lex_advance(state);
                }
                if (include_comments) {
                    $mini_map_set(comment_token, "kind", "comment");
                    $mini_map_set(comment_token, "text", $mini_text_slice(source, $mini_map_get(comment_token, "start"), $mini_map_get(state, "position")));
                    $mini_map_set(comment_token, "end", $mini_map_get(state, "position"));
                    let comment_tokens = $mini_map_get(state, "tokens");
                    $mini_list_set(comment_tokens, (comment_tokens).length, comment_token);
                }
            } else {
                let token = lex_start(state);
                if (is_letter(character)) {
                    $mini_map_set(token, "kind", "identifier");
                    while ((($mini_map_get(state, "position") < (source).length) && is_identifier_part($mini_text_get(source, $mini_map_get(state, "position"))))) {
                        lex_advance(state);
                    }
                    let spelling = $mini_text_slice(source, $mini_map_get(token, "start"), $mini_map_get(state, "position"));
                    if (((((((((spelling === "var") || (spelling === "fn")) || (spelling === "return")) || (spelling === "if")) || (spelling === "else")) || (spelling === "while")) || (spelling === "true")) || (spelling === "false"))) {
                        $mini_map_set(token, "kind", "keyword");
                    }
                } else {
                    if (is_digit(character)) {
                        $mini_map_set(token, "kind", "number");
                        while ((($mini_map_get(state, "position") < (source).length) && is_digit($mini_text_get(source, $mini_map_get(state, "position"))))) {
                            lex_advance(state);
                        }
                    } else {
                        if ((character === "\"")) {
                            $mini_map_set(token, "kind", "text");
                            lex_advance(state);
                            while ((($mini_map_get(state, "position") < (source).length) && ($mini_text_get(source, $mini_map_get(state, "position")) !== "\""))) {
                                let inner = $mini_text_get(source, $mini_map_get(state, "position"));
                                if (((inner === "\n") || (inner === "\r"))) {
                                    lex_fail(token, "unterminated text");
                                }
                                if ((inner === "\\")) {
                                    let escape = lex_start(state);
                                    lex_advance(state);
                                    if ((($mini_map_get(state, "position") === (source).length) || ($mini_text_find("\"\\nrt", $mini_text_get(source, $mini_map_get(state, "position"))) < 0))) {
                                        lex_fail(escape, "unknown text escape");
                                    }
                                }
                                lex_advance(state);
                            }
                            if (($mini_map_get(state, "position") === (source).length)) {
                                lex_fail(token, "unterminated text");
                            }
                            lex_advance(state);
                        } else {
                            if (is_two_character_symbol($mini_text_slice(source, $mini_map_get(state, "position"), ($mini_map_get(state, "position") + 2)))) {
                                lex_advance(state);
                                lex_advance(state);
                            } else {
                                if (($mini_text_find("=+-!<>(),;{}", character) >= 0)) {
                                    lex_advance(state);
                                } else {
                                    lex_fail(token, ("unexpected character " + $mini_json_to_text(character)));
                                }
                            }
                        }
                    }
                }
                $mini_map_set(token, "text", $mini_text_slice(source, $mini_map_get(token, "start"), $mini_map_get(state, "position")));
                $mini_map_set(token, "end", $mini_map_get(state, "position"));
                let tokens = $mini_map_get(state, "tokens");
                $mini_list_set(tokens, (tokens).length, token);
            }
        }
    }
    let end_token = lex_start(state);
    $mini_map_set(end_token, "kind", "eof");
    let end_tokens = $mini_map_get(state, "tokens");
    $mini_list_set(end_tokens, (end_tokens).length, end_token);
    return end_tokens;
}
function parser_fail(token, message) {
    return diagnostic_fail(token, message);
}
function expression_new(code, kind) {
    let expression = ({ __proto__: $mini_map_proto });
    $mini_map_set(expression, "code", code);
    $mini_map_set(expression, "kind", kind);
    return expression;
}
function parser_token(parser) {
    return $mini_list_get($mini_map_get(parser, "tokens"), $mini_map_get(parser, "position"));
}
function parser_peek(parser, offset) {
    return $mini_list_get($mini_map_get(parser, "tokens"), ($mini_map_get(parser, "position") + offset));
}
function parser_take(parser) {
    let token = parser_token(parser);
    $mini_map_set(parser, "position", ($mini_map_get(parser, "position") + 1));
    return token;
}
function parser_expect(parser, text) {
    if (($mini_map_get(parser_token(parser), "text") !== text)) {
        parser_fail(parser_token(parser), ("expected " + text));
    }
    parser_take(parser);
    return 0;
}
function parser_identifier(parser, message) {
    if (($mini_map_get(parser_token(parser), "kind") !== "identifier")) {
        parser_fail(parser_token(parser), message);
    }
    return parser_take(parser);
}
function parser_expression(parser) {
    let left = parser_conjunction(parser);
    while (($mini_map_get(parser_token(parser), "text") === "||")) {
        let operator = parser_take(parser);
        let right = parser_conjunction(parser);
        if (((($mini_map_get(left, "kind") !== "boolean") && ($mini_map_get(left, "kind") !== "unknown")) || (($mini_map_get(right, "kind") !== "boolean") && ($mini_map_get(right, "kind") !== "unknown")))) {
            parser_fail(operator, "|| needs booleans");
        }
        left = expression_new((((("(" + $mini_map_get(left, "code")) + " || ") + $mini_map_get(right, "code")) + ")"), "boolean");
    }
    return left;
}
function parser_conjunction(parser) {
    let left = parser_equality(parser);
    while (($mini_map_get(parser_token(parser), "text") === "&&")) {
        let operator = parser_take(parser);
        let right = parser_equality(parser);
        if (((($mini_map_get(left, "kind") !== "boolean") && ($mini_map_get(left, "kind") !== "unknown")) || (($mini_map_get(right, "kind") !== "boolean") && ($mini_map_get(right, "kind") !== "unknown")))) {
            parser_fail(operator, "&& needs booleans");
        }
        left = expression_new((((("(" + $mini_map_get(left, "code")) + " && ") + $mini_map_get(right, "code")) + ")"), "boolean");
    }
    return left;
}
function parser_equality(parser) {
    let left = parser_comparison(parser);
    while ((($mini_map_get(parser_token(parser), "text") === "==") || ($mini_map_get(parser_token(parser), "text") === "!="))) {
        let operator = parser_take(parser);
        let right = parser_comparison(parser);
        let left_kind = $mini_map_get(left, "kind");
        let right_kind = $mini_map_get(right, "kind");
        if ((((((((left_kind === "void") || (right_kind === "void")) || (left_kind === "list")) || (right_kind === "list")) || (left_kind === "map")) || (right_kind === "map")) || (((left_kind !== "unknown") && (right_kind !== "unknown")) && (left_kind !== right_kind)))) {
            parser_fail(operator, "equality needs matching scalar kinds");
        }
        let symbol = "===";
        if (($mini_map_get(operator, "text") === "!=")) {
            symbol = "!==";
        }
        left = expression_new((((((("(" + $mini_map_get(left, "code")) + " ") + symbol) + " ") + $mini_map_get(right, "code")) + ")"), "boolean");
    }
    return left;
}
function parser_comparison(parser) {
    let left = parser_additive(parser);
    while ((((($mini_map_get(parser_token(parser), "text") === "<") || ($mini_map_get(parser_token(parser), "text") === "<=")) || ($mini_map_get(parser_token(parser), "text") === ">")) || ($mini_map_get(parser_token(parser), "text") === ">="))) {
        let operator = parser_take(parser);
        let right = parser_additive(parser);
        if (((($mini_map_get(left, "kind") !== "number") && ($mini_map_get(left, "kind") !== "unknown")) || (($mini_map_get(right, "kind") !== "number") && ($mini_map_get(right, "kind") !== "unknown")))) {
            parser_fail(operator, "comparison needs numbers");
        }
        left = expression_new((((((("(" + $mini_map_get(left, "code")) + " ") + $mini_map_get(operator, "text")) + " ") + $mini_map_get(right, "code")) + ")"), "boolean");
    }
    return left;
}
function additive_kind(kind) {
    return (((kind === "number") || (kind === "text")) || (kind === "unknown"));
}
function parser_additive(parser) {
    let left = parser_unary(parser);
    while ((($mini_map_get(parser_token(parser), "text") === "+") || ($mini_map_get(parser_token(parser), "text") === "-"))) {
        let operator = parser_take(parser);
        let right = parser_unary(parser);
        let left_kind = $mini_map_get(left, "kind");
        let right_kind = $mini_map_get(right, "kind");
        if (($mini_map_get(operator, "text") === "-")) {
            if ((((left_kind !== "number") && (left_kind !== "unknown")) || ((right_kind !== "number") && (right_kind !== "unknown")))) {
                parser_fail(operator, "- needs two numbers");
            }
        } else {
            if ((((!additive_kind(left_kind)) || (!additive_kind(right_kind))) || (((left_kind !== "unknown") && (right_kind !== "unknown")) && (left_kind !== right_kind)))) {
                parser_fail(operator, "+ needs two numbers or two texts");
            }
        }
        let result_kind = left_kind;
        if ((left_kind === "unknown")) {
            result_kind = right_kind;
        }
        left = expression_new((((((("(" + $mini_map_get(left, "code")) + " ") + $mini_map_get(operator, "text")) + " ") + $mini_map_get(right, "code")) + ")"), result_kind);
    }
    return left;
}
function parser_unary(parser) {
    if ((($mini_map_get(parser_token(parser), "text") === "-") || ($mini_map_get(parser_token(parser), "text") === "!"))) {
        let operator = parser_take(parser);
        let value = parser_unary(parser);
        let kind = "boolean";
        if (($mini_map_get(operator, "text") === "-")) {
            kind = "number";
        }
        if ((($mini_map_get(value, "kind") !== kind) && ($mini_map_get(value, "kind") !== "unknown"))) {
            parser_fail(operator, (($mini_map_get(operator, "text") + " needs a ") + kind));
        }
        return expression_new(((("(" + $mini_map_get(operator, "text")) + $mini_map_get(value, "code")) + ")"), kind);
    }
    return parser_primary(parser);
}
function normalize_number(text) {
    let position = 0;
    while (((position < (text).length) && ($mini_text_get(text, position) === "0"))) {
        position = (position + 1);
    }
    if ((position === (text).length)) {
        return "0";
    }
    return $mini_text_slice(text, position, (text).length);
}
function parser_primary(parser) {
    let token = parser_take(parser);
    if (($mini_map_get(token, "text") === "(")) {
        let value = parser_expression(parser);
        parser_expect(parser, ")");
        return value;
    }
    if (($mini_map_get(token, "kind") === "number")) {
        return expression_new(normalize_number($mini_map_get(token, "text")), "number");
    }
    if (($mini_map_get(token, "kind") === "text")) {
        return expression_new($mini_map_get(token, "text"), "text");
    }
    if ((($mini_map_get(token, "text") === "true") || ($mini_map_get(token, "text") === "false"))) {
        return expression_new($mini_map_get(token, "text"), "boolean");
    }
    if ((($mini_map_get(token, "kind") === "identifier") && ($mini_map_get(parser_token(parser), "text") === "("))) {
        return parser_call(parser, token);
    }
    if ((($mini_map_get(token, "kind") === "identifier") && $mini_map_has($mini_map_get(parser, "variables"), $mini_map_get(token, "text")))) {
        return expression_new($mini_map_get(token, "text"), $mini_map_get($mini_map_get(parser, "variables"), $mini_map_get(token, "text")));
    }
    parser_fail(token, "expected expression");
    return expression_new("", "unknown");
}
function argument_code_list(args) {
    let codes = [];
    let position = 0;
    while ((position < (args).length)) {
        $mini_list_set(codes, (codes).length, $mini_map_get($mini_list_get(args, position), "code"));
        position = (position + 1);
    }
    return codes;
}
function argument_codes(args) {
    return $mini_list_to_text(argument_code_list(args), ", ");
}
function parser_call(parser, name) {
    let name_text = $mini_map_get(name, "text");
    let is_builtin = builtin_exists(name_text);
    let functions = $mini_map_get(parser, "functions");
    let has_user = $mini_map_has(functions, name_text);
    if (((!is_builtin) && (!has_user))) {
        parser_fail(name, ("unknown function " + name_text));
    }
    parser_expect(parser, "(");
    let args = [];
    if (($mini_map_get(parser_token(parser), "text") !== ")")) {
        $mini_list_set(args, (args).length, parser_expression(parser));
        while (($mini_map_get(parser_token(parser), "text") === ",")) {
            parser_take(parser);
            $mini_list_set(args, (args).length, parser_expression(parser));
        }
    }
    parser_expect(parser, ")");
    let arity = $mini_map_get($mini_map_get(functions, name_text), "arity");
    if (is_builtin) {
        arity = (builtin_parameters(name_text)).length;
    }
    if (((args).length !== arity)) {
        let suffix = "s";
        if ((arity === 1)) {
            suffix = "";
        }
        parser_fail(name, ((("expected " + $mini_number_to_text(arity)) + " argument") + suffix));
    }
    if ((!is_builtin)) {
        return expression_new((((name_text + "(") + argument_codes(args)) + ")"), $mini_map_get($mini_map_get(functions, name_text), "result"));
    }
    let parameters = builtin_parameters(name_text);
    let position = 0;
    while ((position < (parameters).length)) {
        let kind = $mini_list_get(parameters, position);
        let actual = $mini_map_get($mini_list_get(args, position), "kind");
        if ((kind === "unknown")) {
            if ((actual === "void")) {
                parser_fail(name, "expected value argument");
            }
        } else {
            if (((actual !== "unknown") && (actual !== kind))) {
                parser_fail(name, (("expected " + kind) + " argument"));
            }
        }
        position = (position + 1);
    }
    let imports = builtin_imports(name_text);
    position = 0;
    while ((position < (imports).length)) {
        $mini_map_set($mini_map_get(parser, "imports"), $mini_list_get(imports, position), true);
        position = (position + 1);
    }
    let helper = builtin_helper_key(name_text);
    if ((helper !== "")) {
        $mini_map_set($mini_map_get(parser, "helpers"), helper, true);
    }
    return expression_new(builtin_emit(name_text, argument_code_list(args)), builtin_result(name_text));
}
function parser_statement(parser) {
    if (($mini_map_get(parser_token(parser), "text") === "while")) {
        parser_take(parser);
        let while_condition = parser_condition(parser);
        return (((("while (" + $mini_map_get(while_condition, "code")) + ") ") + parser_block(parser)) + "\n");
    }
    if (($mini_map_get(parser_token(parser), "text") === "if")) {
        parser_take(parser);
        let if_condition = parser_condition(parser);
        let output = ((("if (" + $mini_map_get(if_condition, "code")) + ") ") + parser_block(parser));
        if (($mini_map_get(parser_token(parser), "text") === "else")) {
            parser_take(parser);
            output = ((output + " else ") + parser_block(parser));
        }
        return (output + "\n");
    }
    if (($mini_map_get(parser_token(parser), "text") === "fn")) {
        return parser_function_declaration(parser);
    }
    if (($mini_map_get(parser_token(parser), "text") === "return")) {
        let return_token = parser_take(parser);
        if ((!$mini_map_get(parser, "in_function"))) {
            parser_fail(return_token, "return outside function");
        }
        let return_value = parser_expression(parser);
        if (($mini_map_get(return_value, "kind") === "void")) {
            parser_fail(return_token, "expected a value");
        }
        parser_expect(parser, ";");
        $mini_map_set($mini_map_get(parser, "current"), "result", $mini_map_get(return_value, "kind"));
        $mini_map_set($mini_map_get(parser, "current"), "returned", true);
        return (("return " + $mini_map_get(return_value, "code")) + ";\n");
    }
    if ((($mini_map_get(parser_token(parser), "kind") === "identifier") && ($mini_map_get(parser_peek(parser, 1), "text") === "("))) {
        let call_value = parser_expression(parser);
        parser_expect(parser, ";");
        return ($mini_map_get(call_value, "code") + ";\n");
    }
    if (($mini_map_get(parser_token(parser), "text") !== "var")) {
        let assignment_name = parser_identifier(parser, "expected binding name");
        let variables = $mini_map_get(parser, "variables");
        if ((!$mini_map_has(variables, $mini_map_get(assignment_name, "text")))) {
            parser_fail(assignment_name, ("unknown binding " + $mini_map_get(assignment_name, "text")));
        }
        parser_expect(parser, "=");
        let assignment_value = parser_expression(parser);
        if (($mini_map_get(assignment_value, "kind") === "void")) {
            parser_fail(assignment_name, "expected a value");
        }
        parser_expect(parser, ";");
        $mini_map_set(variables, $mini_map_get(assignment_name, "text"), $mini_map_get(assignment_value, "kind"));
        return ((($mini_map_get(assignment_name, "text") + " = ") + $mini_map_get(assignment_value, "code")) + ";\n");
    }
    parser_expect(parser, "var");
    let declaration_name = parser_identifier(parser, "expected binding name");
    if (($mini_map_get(parser_token(parser), "text") !== "=")) {
        parser_fail(parser_token(parser), "expected initializer");
    }
    parser_take(parser);
    let declaration_value = parser_expression(parser);
    if (($mini_map_get(declaration_value, "kind") === "void")) {
        parser_fail(declaration_name, "expected a value");
    }
    parser_expect(parser, ";");
    $mini_map_set($mini_map_get(parser, "variables"), $mini_map_get(declaration_name, "text"), $mini_map_get(declaration_value, "kind"));
    return (((("let " + $mini_map_get(declaration_name, "text")) + " = ") + $mini_map_get(declaration_value, "code")) + ";\n");
}
function parser_condition(parser) {
    parser_expect(parser, "(");
    let start = parser_token(parser);
    let condition = parser_expression(parser);
    if ((($mini_map_get(condition, "kind") !== "boolean") && ($mini_map_get(condition, "kind") !== "unknown"))) {
        parser_fail(start, "condition must be boolean");
    }
    parser_expect(parser, ")");
    return condition;
}
function parser_block(parser) {
    parser_expect(parser, "{");
    let outer = $mini_map_get(parser, "variables");
    $mini_map_set(parser, "variables", $mini_map_copy(outer));
    $mini_map_set(parser, "depth", ($mini_map_get(parser, "depth") + 1));
    let output = "";
    while ((($mini_map_get(parser_token(parser), "text") !== "}") && ($mini_map_get(parser_token(parser), "kind") !== "eof"))) {
        output = (output + parser_statement(parser));
    }
    parser_expect(parser, "}");
    $mini_map_set(parser, "depth", ($mini_map_get(parser, "depth") - 1));
    $mini_map_set(parser, "variables", outer);
    let indented = indent_output(output);
    if ((indented === "")) {
        return "{\n}";
    }
    return (("{\n" + indented) + "\n}");
}
function parser_function_declaration(parser) {
    let token = parser_take(parser);
    if (($mini_map_get(parser, "depth") !== 0)) {
        parser_fail(token, "functions must be top-level");
    }
    let name = parser_identifier(parser, "expected function name");
    parser_expect(parser, "(");
    let parameters = [];
    if (($mini_map_get(parser_token(parser), "text") !== ")")) {
        $mini_list_set(parameters, (parameters).length, $mini_map_get(parser_identifier(parser, "expected parameter name"), "text"));
        while (($mini_map_get(parser_token(parser), "text") === ",")) {
            parser_take(parser);
            $mini_list_set(parameters, (parameters).length, $mini_map_get(parser_identifier(parser, "expected parameter name"), "text"));
        }
    }
    parser_expect(parser, ")");
    let info = $mini_map_get($mini_map_get(parser, "functions"), $mini_map_get(name, "text"));
    $mini_map_set(parser, "current", info);
    $mini_map_set(parser, "in_function", true);
    let outer = $mini_map_get(parser, "variables");
    $mini_map_set(parser, "variables", $mini_map_copy(outer));
    let position = 0;
    while ((position < (parameters).length)) {
        $mini_map_set($mini_map_get(parser, "variables"), $mini_list_get(parameters, position), "unknown");
        position = (position + 1);
    }
    let body = parser_block(parser);
    $mini_map_set(parser, "variables", outer);
    $mini_map_set(parser, "in_function", false);
    if ((!$mini_map_get(info, "returned"))) {
        parser_fail(name, "T0 functions require a value return");
    }
    return (((((("function " + $mini_map_get(name, "text")) + "(") + $mini_list_to_text(parameters, ", ")) + ") ") + body) + "\n");
}
function import_names(imports) {
    let output = "";
    if ($mini_map_has(imports, "readFileSync")) {
        output = (output + "readFileSync");
    }
    if ($mini_map_has(imports, "writeFileSync")) {
        if ((output !== "")) {
            output = (output + ", ");
        }
        output = (output + "writeFileSync");
    }
    if ($mini_map_has(imports, "writeSync")) {
        if ((output !== "")) {
            output = (output + ", ");
        }
        output = (output + "writeSync");
    }
    return output;
}
function helper_blocks(helpers) {
    let order = [];
    $mini_list_set(order, (order).length, "map_runtime");
    $mini_list_set(order, (order).length, "bytes_text");
    $mini_list_set(order, (order).length, "directory_remove");
    $mini_list_set(order, (order).length, "file_read_bytes");
    $mini_list_set(order, (order).length, "file_remove");
    $mini_list_set(order, (order).length, "file_write_bytes");
    $mini_list_set(order, (order).length, "json_parse");
    $mini_list_set(order, (order).length, "json_to_text");
    $mini_list_set(order, (order).length, "list_copy");
    $mini_list_set(order, (order).length, "list_get");
    $mini_list_set(order, (order).length, "list_set");
    $mini_list_set(order, (order).length, "list_to_text");
    $mini_list_set(order, (order).length, "map_copy");
    $mini_list_set(order, (order).length, "number_to_text");
    $mini_list_set(order, (order).length, "process_run");
    $mini_list_set(order, (order).length, "directory_temp");
    $mini_list_set(order, (order).length, "text_bytes");
    $mini_list_set(order, (order).length, "text_find");
    $mini_list_set(order, (order).length, "text_get");
    $mini_list_set(order, (order).length, "text_slice");
    $mini_list_set(order, (order).length, "text_split");
    let output = "";
    let position = 0;
    while ((position < (order).length)) {
        let key = $mini_list_get(order, position);
        if ($mini_map_has(helpers, key)) {
            output = (output + helper_text(key));
        }
        position = (position + 1);
    }
    return output;
}
function parser_program(parser) {
    let shebang = "";
    if (($mini_map_get(parser_token(parser), "kind") === "shebang")) {
        parser_take(parser);
        shebang = "#!/usr/bin/env node\n";
    }
    let output = "";
    while (($mini_map_get(parser_token(parser), "kind") !== "eof")) {
        output = (output + parser_statement(parser));
    }
    let imports = $mini_map_get(parser, "imports");
    let import_text = "";
    if (((Object.keys(imports)).length > 0)) {
        import_text = (("import { " + import_names(imports)) + " } from \"node:fs\";\n");
    }
    return ((((shebang + "\"use strict\";\n") + import_text) + helper_blocks($mini_map_get(parser, "helpers"))) + output);
}
function parser_new(tokens) {
    let parser = ({ __proto__: $mini_map_proto });
    $mini_map_set(parser, "tokens", tokens);
    $mini_map_set(parser, "position", 0);
    $mini_map_set(parser, "variables", ({ __proto__: $mini_map_proto }));
    $mini_map_set(parser, "functions", ({ __proto__: $mini_map_proto }));
    $mini_map_set(parser, "imports", ({ __proto__: $mini_map_proto }));
    $mini_map_set(parser, "helpers", ({ __proto__: $mini_map_proto }));
    $mini_map_set(parser, "depth", 0);
    $mini_map_set(parser, "in_function", false);
    $mini_map_set(parser, "current", ({ __proto__: $mini_map_proto }));
    let depth = 0;
    let index = 0;
    while ((index < (tokens).length)) {
        let token = $mini_list_get(tokens, index);
        if (($mini_map_get(token, "text") === "{")) {
            depth = (depth + 1);
        }
        if (($mini_map_get(token, "text") === "}")) {
            depth = (depth - 1);
        }
        if ((((depth === 0) && ($mini_map_get(token, "text") === "fn")) && ($mini_map_get($mini_list_get(tokens, (index + 1)), "kind") === "identifier"))) {
            let arity = 0;
            let cursor = (index + 3);
            while ((((cursor < (tokens).length) && ($mini_map_get($mini_list_get(tokens, cursor), "text") !== ")")) && ($mini_map_get($mini_list_get(tokens, cursor), "text") !== "{"))) {
                if (($mini_map_get($mini_list_get(tokens, cursor), "kind") === "identifier")) {
                    arity = (arity + 1);
                }
                cursor = (cursor + 1);
            }
            let info = ({ __proto__: $mini_map_proto });
            $mini_map_set(info, "arity", arity);
            $mini_map_set(info, "result", "unknown");
            $mini_map_set(info, "returned", false);
            $mini_map_set($mini_map_get(parser, "functions"), $mini_map_get($mini_list_get(tokens, (index + 1)), "text"), info);
        }
        index = (index + 1);
    }
    return parser;
}
function compile(tokens) {
    return parser_program(parser_new(tokens));
}
let builtin_names_list = [];
$mini_list_set(builtin_names_list, (builtin_names_list).length, "map_get");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "map_keys");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "map_set");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "map_has");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "map_new");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "map_copy");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "list_set");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "list_new");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "list_copy");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "json_to_text");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "number_to_text");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "list_to_text");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "write_error");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "process_exit");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "list_get");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "list_length");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "process_args");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "process_exec_path");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "directory_temp");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "file_remove");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "directory_remove");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "process_run");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "file_write");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "file_read");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "text_get");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "text_length");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "text_find");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "text_split");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "text_slice");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "readAll");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "write");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "json_parse");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "text_bytes");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "bytes_text");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "file_read_bytes");
$mini_list_set(builtin_names_list, (builtin_names_list).length, "file_write_bytes");
let builtin_name_set = ({ __proto__: $mini_map_proto });
$mini_map_set(builtin_name_set, "map_get", true);
$mini_map_set(builtin_name_set, "map_keys", true);
$mini_map_set(builtin_name_set, "map_set", true);
$mini_map_set(builtin_name_set, "map_has", true);
$mini_map_set(builtin_name_set, "map_new", true);
$mini_map_set(builtin_name_set, "map_copy", true);
$mini_map_set(builtin_name_set, "list_set", true);
$mini_map_set(builtin_name_set, "list_new", true);
$mini_map_set(builtin_name_set, "list_copy", true);
$mini_map_set(builtin_name_set, "json_to_text", true);
$mini_map_set(builtin_name_set, "number_to_text", true);
$mini_map_set(builtin_name_set, "list_to_text", true);
$mini_map_set(builtin_name_set, "write_error", true);
$mini_map_set(builtin_name_set, "process_exit", true);
$mini_map_set(builtin_name_set, "list_get", true);
$mini_map_set(builtin_name_set, "list_length", true);
$mini_map_set(builtin_name_set, "process_args", true);
$mini_map_set(builtin_name_set, "process_exec_path", true);
$mini_map_set(builtin_name_set, "directory_temp", true);
$mini_map_set(builtin_name_set, "file_remove", true);
$mini_map_set(builtin_name_set, "directory_remove", true);
$mini_map_set(builtin_name_set, "process_run", true);
$mini_map_set(builtin_name_set, "file_write", true);
$mini_map_set(builtin_name_set, "file_read", true);
$mini_map_set(builtin_name_set, "text_get", true);
$mini_map_set(builtin_name_set, "text_length", true);
$mini_map_set(builtin_name_set, "text_find", true);
$mini_map_set(builtin_name_set, "text_split", true);
$mini_map_set(builtin_name_set, "text_slice", true);
$mini_map_set(builtin_name_set, "readAll", true);
$mini_map_set(builtin_name_set, "write", true);
$mini_map_set(builtin_name_set, "json_parse", true);
$mini_map_set(builtin_name_set, "text_bytes", true);
$mini_map_set(builtin_name_set, "bytes_text", true);
$mini_map_set(builtin_name_set, "file_read_bytes", true);
$mini_map_set(builtin_name_set, "file_write_bytes", true);
let builtin_parameter_kinds = ({ __proto__: $mini_map_proto });
$mini_map_set(builtin_parameter_kinds, "map_get", "unknown,text");
$mini_map_set(builtin_parameter_kinds, "map_keys", "map");
$mini_map_set(builtin_parameter_kinds, "map_set", "unknown,text,unknown");
$mini_map_set(builtin_parameter_kinds, "map_has", "map,text");
$mini_map_set(builtin_parameter_kinds, "map_new", "");
$mini_map_set(builtin_parameter_kinds, "map_copy", "map");
$mini_map_set(builtin_parameter_kinds, "list_set", "unknown,number,unknown");
$mini_map_set(builtin_parameter_kinds, "list_new", "");
$mini_map_set(builtin_parameter_kinds, "list_copy", "list");
$mini_map_set(builtin_parameter_kinds, "json_to_text", "unknown");
$mini_map_set(builtin_parameter_kinds, "number_to_text", "number");
$mini_map_set(builtin_parameter_kinds, "list_to_text", "list,text");
$mini_map_set(builtin_parameter_kinds, "write_error", "text");
$mini_map_set(builtin_parameter_kinds, "process_exit", "number");
$mini_map_set(builtin_parameter_kinds, "list_get", "unknown,number");
$mini_map_set(builtin_parameter_kinds, "list_length", "list");
$mini_map_set(builtin_parameter_kinds, "process_args", "");
$mini_map_set(builtin_parameter_kinds, "process_exec_path", "");
$mini_map_set(builtin_parameter_kinds, "directory_temp", "");
$mini_map_set(builtin_parameter_kinds, "file_remove", "text");
$mini_map_set(builtin_parameter_kinds, "directory_remove", "text");
$mini_map_set(builtin_parameter_kinds, "process_run", "text,list,text");
$mini_map_set(builtin_parameter_kinds, "file_write", "text,text");
$mini_map_set(builtin_parameter_kinds, "file_read", "text");
$mini_map_set(builtin_parameter_kinds, "text_get", "unknown,number");
$mini_map_set(builtin_parameter_kinds, "text_length", "text");
$mini_map_set(builtin_parameter_kinds, "text_find", "text,text");
$mini_map_set(builtin_parameter_kinds, "text_split", "text,text");
$mini_map_set(builtin_parameter_kinds, "text_slice", "text,number,number");
$mini_map_set(builtin_parameter_kinds, "readAll", "");
$mini_map_set(builtin_parameter_kinds, "write", "text");
$mini_map_set(builtin_parameter_kinds, "json_parse", "text");
$mini_map_set(builtin_parameter_kinds, "text_bytes", "text");
$mini_map_set(builtin_parameter_kinds, "bytes_text", "list");
$mini_map_set(builtin_parameter_kinds, "file_read_bytes", "text");
$mini_map_set(builtin_parameter_kinds, "file_write_bytes", "text,list");
let builtin_result_kinds = ({ __proto__: $mini_map_proto });
$mini_map_set(builtin_result_kinds, "map_get", "unknown");
$mini_map_set(builtin_result_kinds, "map_keys", "list");
$mini_map_set(builtin_result_kinds, "map_set", "void");
$mini_map_set(builtin_result_kinds, "map_has", "boolean");
$mini_map_set(builtin_result_kinds, "map_new", "map");
$mini_map_set(builtin_result_kinds, "map_copy", "map");
$mini_map_set(builtin_result_kinds, "list_set", "void");
$mini_map_set(builtin_result_kinds, "list_new", "list");
$mini_map_set(builtin_result_kinds, "list_copy", "list");
$mini_map_set(builtin_result_kinds, "json_to_text", "text");
$mini_map_set(builtin_result_kinds, "number_to_text", "text");
$mini_map_set(builtin_result_kinds, "list_to_text", "text");
$mini_map_set(builtin_result_kinds, "write_error", "void");
$mini_map_set(builtin_result_kinds, "process_exit", "void");
$mini_map_set(builtin_result_kinds, "list_get", "unknown");
$mini_map_set(builtin_result_kinds, "list_length", "number");
$mini_map_set(builtin_result_kinds, "process_args", "list");
$mini_map_set(builtin_result_kinds, "process_exec_path", "text");
$mini_map_set(builtin_result_kinds, "directory_temp", "text");
$mini_map_set(builtin_result_kinds, "file_remove", "void");
$mini_map_set(builtin_result_kinds, "directory_remove", "void");
$mini_map_set(builtin_result_kinds, "process_run", "map");
$mini_map_set(builtin_result_kinds, "file_write", "void");
$mini_map_set(builtin_result_kinds, "file_read", "text");
$mini_map_set(builtin_result_kinds, "text_get", "text");
$mini_map_set(builtin_result_kinds, "text_length", "number");
$mini_map_set(builtin_result_kinds, "text_find", "number");
$mini_map_set(builtin_result_kinds, "text_split", "list");
$mini_map_set(builtin_result_kinds, "text_slice", "text");
$mini_map_set(builtin_result_kinds, "readAll", "text");
$mini_map_set(builtin_result_kinds, "write", "void");
$mini_map_set(builtin_result_kinds, "json_parse", "map");
$mini_map_set(builtin_result_kinds, "text_bytes", "list");
$mini_map_set(builtin_result_kinds, "bytes_text", "text");
$mini_map_set(builtin_result_kinds, "file_read_bytes", "list");
$mini_map_set(builtin_result_kinds, "file_write_bytes", "void");
let builtin_import_names = ({ __proto__: $mini_map_proto });
$mini_map_set(builtin_import_names, "map_get", "");
$mini_map_set(builtin_import_names, "map_keys", "");
$mini_map_set(builtin_import_names, "map_set", "");
$mini_map_set(builtin_import_names, "map_has", "");
$mini_map_set(builtin_import_names, "map_new", "");
$mini_map_set(builtin_import_names, "map_copy", "");
$mini_map_set(builtin_import_names, "list_set", "");
$mini_map_set(builtin_import_names, "list_new", "");
$mini_map_set(builtin_import_names, "list_copy", "");
$mini_map_set(builtin_import_names, "json_to_text", "");
$mini_map_set(builtin_import_names, "number_to_text", "");
$mini_map_set(builtin_import_names, "list_to_text", "");
$mini_map_set(builtin_import_names, "write_error", "writeSync");
$mini_map_set(builtin_import_names, "process_exit", "");
$mini_map_set(builtin_import_names, "list_get", "");
$mini_map_set(builtin_import_names, "list_length", "");
$mini_map_set(builtin_import_names, "process_args", "");
$mini_map_set(builtin_import_names, "process_exec_path", "");
$mini_map_set(builtin_import_names, "directory_temp", "");
$mini_map_set(builtin_import_names, "file_remove", "");
$mini_map_set(builtin_import_names, "directory_remove", "");
$mini_map_set(builtin_import_names, "process_run", "");
$mini_map_set(builtin_import_names, "file_write", "writeFileSync");
$mini_map_set(builtin_import_names, "file_read", "readFileSync");
$mini_map_set(builtin_import_names, "text_get", "");
$mini_map_set(builtin_import_names, "text_length", "");
$mini_map_set(builtin_import_names, "text_find", "");
$mini_map_set(builtin_import_names, "text_split", "");
$mini_map_set(builtin_import_names, "text_slice", "");
$mini_map_set(builtin_import_names, "readAll", "readFileSync");
$mini_map_set(builtin_import_names, "write", "writeSync");
$mini_map_set(builtin_import_names, "json_parse", "");
$mini_map_set(builtin_import_names, "text_bytes", "");
$mini_map_set(builtin_import_names, "bytes_text", "");
$mini_map_set(builtin_import_names, "file_read_bytes", "");
$mini_map_set(builtin_import_names, "file_write_bytes", "");
let builtin_helper_keys = ({ __proto__: $mini_map_proto });
$mini_map_set(builtin_helper_keys, "map_get", "map_runtime");
$mini_map_set(builtin_helper_keys, "map_keys", "");
$mini_map_set(builtin_helper_keys, "map_set", "map_runtime");
$mini_map_set(builtin_helper_keys, "map_has", "map_runtime");
$mini_map_set(builtin_helper_keys, "map_new", "map_runtime");
$mini_map_set(builtin_helper_keys, "map_copy", "map_copy");
$mini_map_set(builtin_helper_keys, "list_set", "list_set");
$mini_map_set(builtin_helper_keys, "list_new", "");
$mini_map_set(builtin_helper_keys, "list_copy", "list_copy");
$mini_map_set(builtin_helper_keys, "json_to_text", "json_to_text");
$mini_map_set(builtin_helper_keys, "number_to_text", "number_to_text");
$mini_map_set(builtin_helper_keys, "list_to_text", "list_to_text");
$mini_map_set(builtin_helper_keys, "write_error", "");
$mini_map_set(builtin_helper_keys, "process_exit", "");
$mini_map_set(builtin_helper_keys, "list_get", "list_get");
$mini_map_set(builtin_helper_keys, "list_length", "");
$mini_map_set(builtin_helper_keys, "process_args", "");
$mini_map_set(builtin_helper_keys, "process_exec_path", "");
$mini_map_set(builtin_helper_keys, "directory_temp", "directory_temp");
$mini_map_set(builtin_helper_keys, "file_remove", "file_remove");
$mini_map_set(builtin_helper_keys, "directory_remove", "directory_remove");
$mini_map_set(builtin_helper_keys, "process_run", "process_run");
$mini_map_set(builtin_helper_keys, "file_write", "");
$mini_map_set(builtin_helper_keys, "file_read", "");
$mini_map_set(builtin_helper_keys, "text_get", "text_get");
$mini_map_set(builtin_helper_keys, "text_length", "");
$mini_map_set(builtin_helper_keys, "text_find", "text_find");
$mini_map_set(builtin_helper_keys, "text_split", "text_split");
$mini_map_set(builtin_helper_keys, "text_slice", "text_slice");
$mini_map_set(builtin_helper_keys, "readAll", "");
$mini_map_set(builtin_helper_keys, "write", "");
$mini_map_set(builtin_helper_keys, "json_parse", "json_parse");
$mini_map_set(builtin_helper_keys, "text_bytes", "text_bytes");
$mini_map_set(builtin_helper_keys, "bytes_text", "bytes_text");
$mini_map_set(builtin_helper_keys, "file_read_bytes", "file_read_bytes");
$mini_map_set(builtin_helper_keys, "file_write_bytes", "file_write_bytes");
function builtin_names() {
    return $mini_list_copy(builtin_names_list);
}
function builtin_exists(name) {
    return $mini_map_has(builtin_name_set, name);
}
function builtin_parameters(name) {
    if ((!$mini_map_has(builtin_parameter_kinds, name))) {
        return [];
    }
    let kinds = $mini_map_get(builtin_parameter_kinds, name);
    if ((kinds === "")) {
        return [];
    }
    return $mini_text_split(kinds, ",");
}
function builtin_result(name) {
    if ($mini_map_has(builtin_result_kinds, name)) {
        return $mini_map_get(builtin_result_kinds, name);
    }
    return "text";
}
function builtin_imports(name) {
    if ((!$mini_map_has(builtin_import_names, name))) {
        return [];
    }
    let names = $mini_map_get(builtin_import_names, name);
    if ((names === "")) {
        return [];
    }
    return $mini_text_split(names, ",");
}
function builtin_helper_key(name) {
    if ($mini_map_has(builtin_helper_keys, name)) {
        return $mini_map_get(builtin_helper_keys, name);
    }
    return "";
}
function helper_text(key) {
    if ((key === "map_runtime")) {
        return map_runtime;
    }
    if ((key === "directory_remove")) {
        return directory_remove_helper;
    }
    if ((key === "directory_temp")) {
        return directory_temp_helper;
    }
    if ((key === "file_remove")) {
        return file_remove_helper;
    }
    if ((key === "json_to_text")) {
        return json_to_text_helper;
    }
    if ((key === "list_copy")) {
        return list_copy_helper;
    }
    if ((key === "list_get")) {
        return list_get_helper;
    }
    if ((key === "list_set")) {
        return list_set_helper;
    }
    if ((key === "list_to_text")) {
        return list_to_text_helper;
    }
    if ((key === "map_copy")) {
        return map_copy_helper;
    }
    if ((key === "number_to_text")) {
        return number_to_text_helper;
    }
    if ((key === "process_run")) {
        return process_run_helper;
    }
    if ((key === "text_find")) {
        return text_find_helper;
    }
    if ((key === "text_get")) {
        return text_get_helper;
    }
    if ((key === "text_slice")) {
        return text_slice_helper;
    }
    if ((key === "text_split")) {
        return text_split_helper;
    }
    if ((key === "json_parse")) {
        return json_parse_helper;
    }
    if ((key === "text_bytes")) {
        return text_bytes_helper;
    }
    if ((key === "bytes_text")) {
        return bytes_text_helper;
    }
    if ((key === "file_read_bytes")) {
        return file_read_bytes_helper;
    }
    if ((key === "file_write_bytes")) {
        return file_write_bytes_helper;
    }
    return "";
}
function builtin_emit(name, args) {
    let first = $mini_list_get(args, 0);
    let second = $mini_list_get(args, 1);
    if ((((((((((((((((((((((((name === "map_get") || (name === "map_set")) || (name === "map_has")) || (name === "list_set")) || (name === "list_get")) || (name === "text_get")) || (name === "text_slice")) || (name === "text_find")) || (name === "text_split")) || (name === "map_copy")) || (name === "list_copy")) || (name === "list_to_text")) || (name === "number_to_text")) || (name === "json_to_text")) || (name === "process_run")) || (name === "directory_temp")) || (name === "file_remove")) || (name === "directory_remove")) || (name === "json_parse")) || (name === "text_bytes")) || (name === "bytes_text")) || (name === "file_read_bytes")) || (name === "file_write_bytes"))) {
        return (((("$mini_" + name) + "(") + $mini_list_to_text(args, ", ")) + ")");
    }
    if ((name === "process_exec_path")) {
        return "process.execPath";
    }
    if ((name === "map_keys")) {
        return (("Object.keys(" + first) + ")");
    }
    if ((name === "map_new")) {
        return "({ __proto__: $mini_map_proto })";
    }
    if ((name === "list_new")) {
        return "[]";
    }
    if ((name === "write_error")) {
        return (("writeSync(2, " + first) + ")");
    }
    if ((name === "process_exit")) {
        return (("process.exit(" + first) + ")");
    }
    if ((name === "list_length")) {
        return (("(" + first) + ").length");
    }
    if ((name === "process_args")) {
        return "process.argv.slice(2)";
    }
    if ((name === "file_write")) {
        return (((("writeFileSync(" + first) + ", ") + second) + ", \"utf8\")");
    }
    if ((name === "file_read")) {
        return (("readFileSync(" + first) + ", \"utf8\")");
    }
    if ((name === "text_length")) {
        return (("(" + first) + ").length");
    }
    if ((name === "readAll")) {
        return "readFileSync(0, \"utf8\")";
    }
    if ((name === "write")) {
        return (("writeSync(1, " + first) + ")");
    }
    return "";
}
function check_source_fail(message) {
    writeSync(2, (message + "\n"));
    process.exit(1);
    return 0;
}
function main() {
    let args = process.argv.slice(2);
    if (((args).length !== 1)) {
        check_source_fail("usage: mini-check [--docs | SOURCE.mini | -]");
    }
    let path = $mini_list_get(args, 0);
    let name = path;
    let source = "";
    if ((path === "-")) {
        name = "<stdin>";
        source = readFileSync(0, "utf8");
    } else {
        if ((!text_ends_with(path, ".mini"))) {
            check_source_fail("Mini source must use .mini");
        }
        source = readFileSync(path, "utf8");
    }
    let tokens = tokenize(source, name, false);
    compile(tokens);
    return 0;
}
main();
