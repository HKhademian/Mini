/// Browser replacements for the Node file API used by the generated compiler.
///
/// The compiler itself never reads files without an import; diagnostics go
/// through writeSync(2), which the worker forwards to its diagnostic sink.
export function readFileSync(path) {
  if (path === 0) return globalThis.__miniStdin ?? "";
  const files = globalThis.__miniFiles ?? {};
  if (Object.prototype.hasOwnProperty.call(files, path)) return files[path];
  throw new Error("file access is not available in the playground: " + path);
}

export function writeFileSync(path) {
  throw new Error("file access is not available in the playground: " + path);
}

export function writeSync(fd, text) {
  const sink = globalThis.__miniSink;
  if (typeof sink === "function") sink(fd, String(text));
}
