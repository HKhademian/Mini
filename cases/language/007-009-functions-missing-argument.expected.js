"use strict";
import { writeSync } from "node:fs";
function $mini_number_to_text(value) {
    if (typeof value !== "number" || !Number.isSafeInteger(value)) return "";
    return String(value);
}
function io_write_line(text) {

    return (writeSync(1, (text + "\n")), 0);
    return 0;
}
function join(left, right) {

    return (left + right);
    return 0;
}
io_write_line($mini_number_to_text((join("a", 0)).length));
