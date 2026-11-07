#!/usr/bin/env node
"use strict";
import { writeSync } from "node:fs";
function io_write_line(text) {

    return (writeSync(1, (text + "\n")), 0);
    return 0;
}
io_write_line("ok");
