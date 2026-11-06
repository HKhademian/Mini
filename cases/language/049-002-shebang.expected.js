#!/usr/bin/env node
"use strict";
import { writeSync } from "node:fs";
(writeSync(1, "ok\n"), 0);
