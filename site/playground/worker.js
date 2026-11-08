/// Compile and run Mini source inside a browser worker.

const buildRevision = "";

globalThis.__miniSink = () => {};

/// Minimal UTF-8 Buffer for text_to_bytes and text_from_bytes.
class MiniBuffer extends Uint8Array {
  toString(encoding) {
    const name = encoding === "utf8" || encoding === "utf-8" || encoding === undefined ? "utf-8" : encoding;
    return new TextDecoder(name).decode(this);
  }
}

globalThis.Buffer = {
  from(value, encoding) {
    if (typeof value === "string") return new MiniBuffer(new TextEncoder().encode(value));
    return new MiniBuffer(Uint8Array.from(Array.isArray(value) ? value : []));
  },
  alloc(count) {
    return new MiniBuffer(count);
  },
};

/// Return the small process surface the generated compiler expects.
function processStub() {
  const fileAccessUnavailable = () => {
    throw new Error("file access is not available in the playground");
  };
  const browserFileSystem = {
    existsSync(path) {
      return Object.prototype.hasOwnProperty.call(globalThis.__miniFiles ?? {}, path);
    },
    statSync() { return { isDirectory: () => false, isFile: () => false }; },
    readdirSync: fileAccessUnavailable,
    readSync: fileAccessUnavailable,
    mkdtempSync: fileAccessUnavailable,
    mkdirSync: fileAccessUnavailable,
    rmSync: fileAccessUnavailable,
    cpSync: fileAccessUnavailable,
    writeFileSync: fileAccessUnavailable,
  };
  return {
    argv: ["node", "mini"],
    env: {},
    execPath: "browser",
    exit(code) {
      const error = new Error("process.exit(" + code + ")");
      error.exitCode = code;
      throw error;
    },
    getBuiltinModule(name) {
      if (name === "node:fs") return browserFileSystem;
      throw new Error("host module " + name + " is not available in the playground");
    },
  };
}

let compiler = null;

/// Load the compiler once with the process stub in place.
function loadCompiler() {
  if (compiler === null) {
    globalThis.process = processStub();
    compiler = import("./includes.js?rev=" + buildRevision).then(({ files }) => {
      globalThis.__miniFiles = files;
      return import("./compiler.js?rev=" + buildRevision);
    });
  }
  return compiler;
}

/// Compile one source string and return its code or diagnostic text.
/// Return the expanded program tokens, optionally with the pure reference.
function buildTokens(lexTokenize, lexExpandIncludes, source, portable, referenceTokens) {
  const tokens = lexTokenize(source, "playground.mini", false);
  const expanded = lexExpandIncludes(tokens, "playground.mini", [], Object.create(null));
  if (!portable) return expanded;
  const combined = expanded.filter(token => token.kind !== "eof").concat(referenceTokens);
  return combined.concat([{ kind: "eof", text: "", source: "playground.mini", start: 0, end: 0, line: 1, column: 1, context: "" }]);
}

/// Compile one variant and return both the runnable and user-source code.
async function compileSource(source, portable) {
  const { lex_tokenize, lex_expand_includes, emit_js_compile, emit_js_compile_program_only } = await loadCompiler();
  let diagnostic = "";
  globalThis.__miniSink = (fd, text) => {
    if (fd === 2) diagnostic += text;
  };
  try {
    const referenceTokens = portable ? (await import("./reference.js?rev=" + buildRevision)).referenceTokens : [];
    const prepared = buildTokens(lex_tokenize, lex_expand_includes, source, portable, referenceTokens);
    return { code: emit_js_compile(prepared), program: emit_js_compile_program_only(prepared), diagnostic: "" };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    return { code: "", program: "", diagnostic: diagnostic || message };
  } finally {
    globalThis.__miniSink = () => {};
  }
}

/// Replace Node-only imports with the playground runtime.
function prepare(code) {
  const prelude = [
    'const readFileSync = (path) => { if (path === 0) return globalThis.__miniStdin ?? ""; throw new Error("file access is not available in the playground: " + path); };',
    'const writeFileSync = () => { throw new Error("file access is not available in the playground"); };',
    'const writeSync = (fd, text) => { if (fd === 2) globalThis.__miniRuntimeError += String(text); else globalThis.__miniOutput += String(text); };',
  ].join("\n");
  return code
    .replace(/^#![^\n]*\n/, "")
    .replace(/import \{[^}]*\} from "node:fs";\n/, prelude + "\n");
}

/// Execute one compiled program and return its streams or runtime error.
async function runCode(code, stdin, args) {
  globalThis.__miniOutput = "";
  globalThis.__miniRuntimeError = "";
  globalThis.__miniStdin = typeof stdin === "string" ? stdin : "";
  globalThis.process.argv = ["node", "mini"].concat(Array.isArray(args) ? args : []);
  const url = URL.createObjectURL(new Blob([prepare(code)], { type: "text/javascript" }));
  try {
    await import(url);
    return { ok: true, output: globalThis.__miniOutput, stderr: globalThis.__miniRuntimeError };
  } catch (error) {
    return {
      ok: false,
      output: globalThis.__miniOutput,
      stderr: globalThis.__miniRuntimeError,
      error: error && error.message ? error.message : String(error),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

self.onmessage = async (event) => {
  try {
    const data = event.data;
    if (!data || typeof data.source !== "string") return;
    const compiled = await compileSource(data.source, data.portable === true);
    if (compiled.code === "") {
      self.postMessage({ ok: false, output: "", stderr: "", diagnostic: compiled.diagnostic, code: "", program: "" });
      return;
    }
    if (data.compileOnly === true) {
      self.postMessage({ ok: true, output: "", stderr: "", diagnostic: "", code: compiled.code, program: compiled.program });
      return;
    }
    const result = await runCode(compiled.code, data.stdin, data.args);
    self.postMessage({
      ok: result.ok,
      output: result.output,
      stderr: result.stderr,
      diagnostic: result.ok ? "" : result.error,
      code: compiled.code,
      program: compiled.program,
    });
  } catch (error) {
    const detail = error && error.stack ? error.stack : String(error);
    self.postMessage({ ok: false, output: "", stderr: "", diagnostic: "Worker failure: " + detail, code: "" });
  }
};
