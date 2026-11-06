#!/usr/bin/env node
/// Serve the built showcase for local checks.
///
/// The playground uses a module worker, which browsers block on file:// URLs.
/// Run this after `./site/build.ts` and open the printed address.
import { createServer, type ServerResponse } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..", "dist", "site");
const configured = process.env["PORT"];
const port = configured === undefined ? 8080 : Number(configured);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    process.stderr.write("PORT must be an integer between 1 and 65535\n");
    process.exit(1);
}

if (!existsSync(root)) {
    process.stderr.write("dist/site is missing; run ./site/build.ts first\n");
    process.exit(1);
}

const contentTypes: Record<string, string> = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};

/// Write a short plain-text response.
function respond(response: ServerResponse, status: number, message: string): void {
    response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
    response.end(message);
}

createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const file = resolve(root, "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname));
    if (file !== root && !file.startsWith(root + sep)) {
        respond(response, 403, "forbidden");
        return;
    }
    if (!existsSync(file)) {
        respond(response, 404, "not found");
        return;
    }
    if (statSync(file).isDirectory()) {
        response.writeHead(301, { location: url.pathname + "/" });
        response.end();
        return;
    }
    response.writeHead(200, {
        "content-type": contentTypes[extname(file)] ?? "application/octet-stream",
        "cache-control": "no-store",
    });
    response.end(readFileSync(file));
}).listen(port, "127.0.0.1", () => {
    process.stdout.write(`site:       http://127.0.0.1:${port}/\n`);
    process.stdout.write(`playground: http://127.0.0.1:${port}/playground/\n`);
});
