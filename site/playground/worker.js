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
    compiler = import("./imports.js?rev=" + buildRevision).then(({ files }) => {
      globalThis.__miniFiles = files;
      return import("./compiler.js?rev=" + buildRevision);
    });
  }
  return compiler;
}

/// Compile one source string and return its code or diagnostic text.
/// Return the expanded program tokens.
function buildTokens(lexTokenize, lexExpandImports, source) {
  const tokens = lexTokenize(source, "playground.mini", false);
  return lexExpandImports(tokens, "playground.mini", Object.create(null));
}

/// Compile one variant and return both the runnable and user-source code.
async function compileSource(source, portable) {
  const { lex_tokenize, lex_expand_imports, emit_js_compile, emit_js_compile_program_only, emit_js_set_reference_mode } = await loadCompiler();
  let diagnostic = "";
  globalThis.__miniSink = (fd, text) => {
    if (fd === 2) diagnostic += text;
  };
  try {
    emit_js_set_reference_mode(portable);
    const prepared = buildTokens(lex_tokenize, lex_expand_imports, source);
    const play = source.includes('import "common/play";')
      && /\bmini_play\s*\(/.test(source)
      && /\bfn\s+mini_play_update\s*\(/.test(source);
    return { code: emit_js_compile(prepared), program: emit_js_compile_program_only(prepared), play, diagnostic: "" };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    return { code: "", program: "", diagnostic: diagnostic || message };
  } finally {
    const compiler = await loadCompiler();
    compiler.emit_js_set_reference_mode(false);
    globalThis.__miniSink = () => {};
  }
}

/// Replace Node-only imports with the playground runtime.
function prepare(code, play) {
  const prelude = [
    'const readFileSync = (path) => { if (path === 0) return globalThis.__miniStdin ?? ""; throw new Error("file access is not available in the playground: " + path); };',
    'const writeFileSync = () => { throw new Error("file access is not available in the playground"); };',
    'const writeSync = (fd, text) => { if (fd === 2) globalThis.__miniRuntimeError += String(text); else globalThis.__miniOutput += String(text); };',
  ].join("\n");
  const playBridge = play ? [
    "globalThis.__miniPlay = {",
    "  width: mini_play_width(),",
    "  height: mini_play_height(),",
    "  title: mini_play_title(),",
    "  pixels: mini_play_pixels,",
    "  update: mini_play_update,",
    '  keyDown: typeof mini_play_onKeyDown === "function" ? mini_play_onKeyDown : null,',
    "};",
    "globalThis.__miniPlay.initialStatus = globalThis.__miniPlay.update();",
  ].join("\n") : "";
  return (code + "\n" + playBridge)
    .replace(/^#![^\n]*\n/, "")
    .replace(/import \{[^}]*\} from "node:fs";\n/, prelude + "\n");
}

/// Execute one compiled program and return its streams or runtime error.
async function runCode(code, stdin, args, play) {
  globalThis.__miniOutput = "";
  globalThis.__miniRuntimeError = "";
  globalThis.__miniStdin = typeof stdin === "string" ? stdin : "";
  globalThis.process.argv = ["node", "mini"].concat(Array.isArray(args) ? args : []);
  const url = URL.createObjectURL(new Blob([prepare(code, play)], { type: "text/javascript" }));
  try {
    await import(url);
    const session = globalThis.__miniPlay;
    return {
      ok: true,
      output: globalThis.__miniOutput,
      stderr: globalThis.__miniRuntimeError,
      play: session ? {
        width: session.width,
        height: session.height,
        title: session.title,
        pixels: session.pixels(),
        status: session.initialStatus,
      } : null,
    };
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
    if (data && data.action === "update" && globalThis.__miniPlay) {
      const status = globalThis.__miniPlay.update();
      self.postMessage({ action: "step", status, pixels: globalThis.__miniPlay.pixels() });
      return;
    }
    if (data && data.action === "keydown" && globalThis.__miniPlay) {
      if (globalThis.__miniPlay.keyDown) globalThis.__miniPlay.keyDown(data.key);
      self.postMessage({ action: "keydown" });
      return;
    }
    if (data && data.action === "stop") {
      globalThis.__miniPlay = null;
      return;
    }
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
    const result = await runCode(compiled.code, data.stdin, data.args, compiled.play);
    self.postMessage({
      ok: result.ok,
      output: result.output,
      stderr: result.stderr,
      diagnostic: result.ok ? "" : result.error,
      code: compiled.code,
      program: compiled.program,
      play: result.play,
    });
  } catch (error) {
    const detail = error && error.stack ? error.stack : String(error);
    if (globalThis.__miniPlay) {
      self.postMessage({ action: "failure", diagnostic: "Mini Play stopped: " + detail });
      return;
    }
    self.postMessage({ ok: false, output: "", stderr: "", diagnostic: "Worker failure: " + detail, code: "" });
  }
};
