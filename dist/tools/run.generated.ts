#!/usr/bin/env node
"use strict";
import { writeFileSync, writeSync } from "node:fs";
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
function $mini_directory_remove(path) {
    const fs = process.getBuiltinModule("node:fs");
    if (path !== "" && fs.existsSync(path) && fs.statSync(path).isDirectory()) fs.rmdirSync(path);
}
function $mini_file_remove(path) {
    const fs = process.getBuiltinModule("node:fs");
    if (path !== "" && fs.existsSync(path) && !fs.statSync(path).isDirectory()) fs.rmSync(path, { force: true });
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
function $mini_process_run(command, args, mode) {
    const output = { __proto__: null, status: 1, signal: "", stdout: "", stderr: "", error: "" };
    const child = process.getBuiltinModule("node:child_process");
    const result = child.spawnSync(command, Array.isArray(args) ? args.map(String) : [], {
        stdio: mode === "inherit" ? "inherit" : "pipe",
        encoding: "utf8",
        maxBuffer: 32 * 1024 * 1024,
    });
    if (result.error) output.error = String(result.error.message);
    if (result.status !== null) output.status = result.status;
    if (typeof result.signal === "string") output.signal = result.signal;
    output.stdout = typeof result.stdout === "string" ? result.stdout : "";
    output.stderr = typeof result.stderr === "string" ? result.stderr : "";
    return output;
}
function $mini_directory_temp() {
    const fs = process.getBuiltinModule("node:fs");
    const os = process.getBuiltinModule("node:os");
    return fs.mkdtempSync(os.tmpdir() + "/mini-");
}
function run_cleanup(directory) {
    $mini_file_remove((directory + "/program.ts"));
    $mini_file_remove((directory + "/package.json"));
    $mini_directory_remove(directory);
    return 0;
}
function run_program(compiler, source, forwarded) {
    let directory = $mini_directory_temp();
    if (((directory).length === 0)) {
        writeSync(2, "cannot create a temporary directory\n");
        process.exit(1);
    }
    let output = (directory + "/program.ts");
    writeFileSync((directory + "/package.json"), "{\"type\":\"module\"}\n", "utf8");
    let compile_args = [];
    $mini_list_set(compile_args, 0, compiler);
    $mini_list_set(compile_args, 1, "compile");
    $mini_list_set(compile_args, 2, source);
    $mini_list_set(compile_args, 3, output);
    let compiled = $mini_process_run(process.execPath, compile_args, "inherit");
    if (($mini_map_get(compiled, "status") !== 0)) {
        run_cleanup(directory);
        process.exit($mini_map_get(compiled, "status"));
    }
    let run_args = [];
    $mini_list_set(run_args, 0, output);
    let position = 0;
    while ((position < (forwarded).length)) {
        $mini_list_set(run_args, (run_args).length, $mini_list_get(forwarded, position));
        position = (position + 1);
    }
    let executed = $mini_process_run(process.execPath, run_args, "inherit");
    run_cleanup(directory);
    return $mini_map_get(executed, "status");
}
function main() {
    let args = process.argv.slice(2);
    if (((args).length < 2)) {
        writeSync(2, "usage: mini-run SOURCE.mini [ARG]...\n");
        process.exit(1);
    }
    let forwarded = [];
    let position = 2;
    while ((position < (args).length)) {
        $mini_list_set(forwarded, (forwarded).length, $mini_list_get(args, position));
        position = (position + 1);
    }
    process.exit(run_program($mini_list_get(args, 0), $mini_list_get(args, 1), forwarded));
    return 0;
}
main();
