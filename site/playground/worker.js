/// Compile and run Mini source inside a browser worker.

const buildRevision = "";

globalThis.__miniSink = null;

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
    readFileSync(path) {
      if (path === 0) return globalThis.__miniStdin ?? "";
      const files = globalThis.__miniFiles ?? {};
      if (Object.prototype.hasOwnProperty.call(files, path)) return files[path];
      throw new Error("file access is not available in the playground: " + path);
    },
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
    writeSync(fd, text) {
      const sink = globalThis.__miniSink;
      if (typeof sink === "function") {
        sink(fd, String(text));
      } else if (fd === 2) {
        globalThis.__miniRuntimeError += String(text);
      } else {
        globalThis.__miniOutput += String(text);
      }
    },
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

/// Convert the compiler's line-list output into JavaScript source text.
function sourceText(value) {
  return Array.isArray(value) ? value.join("\n") : value;
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
    const play = source.includes('import "util/canvas";')
      && /\bcanvas_play\s*\(/.test(source);
    const still = !play
      && source.includes('import "util/canvas";')
      && /^canvas_draw\s*\(/m.test(source);
    const audio = source.includes('import "util/audio";');
    return {
      code: sourceText(emit_js_compile(prepared)),
      program: sourceText(emit_js_compile_program_only(prepared)),
      play,
      still,
      audio,
      diagnostic: "",
    };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    return { code: "", program: "", diagnostic: diagnostic || message };
  } finally {
    const compiler = await loadCompiler();
    compiler.emit_js_set_reference_mode(false);
    globalThis.__miniSink = null;
  }
}

/// Replace Node-only imports with the playground runtime.
function prepare(code, play, still, title, audio) {
  const prelude = [
    'const readFileSync = (path) => { if (path === 0) return globalThis.__miniStdin ?? ""; throw new Error("file access is not available in the playground: " + path); };',
    'const writeFileSync = () => { throw new Error("file access is not available in the playground"); };',
    'const writeSync = (fd, text) => { if (fd === 2) globalThis.__miniRuntimeError += String(text); else globalThis.__miniOutput += String(text); };',
  ].join("\n");
  const playBridge = play ? [
    "globalThis.__miniPlay = {",
    "  pixels: canvas_get_pixels,",
    '  init: typeof canvas_on_init === "function" ? canvas_on_init : null,',
    '  update: typeof canvas_on_update === "function" ? canvas_on_update : null,',
    '  keyDown: typeof canvas_on_key_down === "function" ? canvas_on_key_down : null,',
    '  keyUp: typeof canvas_on_key_up === "function" ? canvas_on_key_up : null,',
    '  pointerMove: typeof canvas_on_pointer_move === "function" ? canvas_on_pointer_move : null,',
    '  pointerDown: typeof canvas_on_pointer_down === "function" ? canvas_on_pointer_down : null,',
    '  pointerUp: typeof canvas_on_pointer_up === "function" ? canvas_on_pointer_up : null,',
    "};",
    "if (globalThis.__miniPlay.init) globalThis.__miniPlay.init();",
    "globalThis.__miniPlay.hasUpdate = Boolean(globalThis.__miniPlay.update);",
    "globalThis.__miniPlay.initialStatus = globalThis.__miniPlay.update ? globalThis.__miniPlay.update(0) : null;",
    "globalThis.__miniPlay.width = canvas_get_width();",
    "globalThis.__miniPlay.height = canvas_get_height();",
    "globalThis.__miniPlay.title = canvas_get_title();",
  ].join("\n") : "";
  const stillBridge = still ? [
    "globalThis.__miniCanvas = {",
    "  width: canvas_get_width(),",
    "  height: canvas_get_height(),",
    `  title: canvas_get_title() || ${JSON.stringify(title)},`,
    "  pixels: canvas_get_pixels(),",
    "};",
  ].join("\n") : "";
  const audioBridge = audio ? "globalThis.__miniAudioDrain = audio_tone_drain;" : "";
  return (code + "\n" + playBridge + "\n" + stillBridge + "\n" + audioBridge)
    .replace(/^#![^\n]*\n/, "")
    .replace(/import \{[^}]*\} from "node:fs";\n/, prelude + "\n");
}

/// Execute one compiled program and return its streams or runtime error.
async function runCode(code, stdin, args, play, still, title, audio) {
  globalThis.__miniOutput = "";
  globalThis.__miniRuntimeError = "";
  globalThis.__miniStdin = typeof stdin === "string" ? stdin : "";
  globalThis.process.argv = ["node", "mini"].concat(Array.isArray(args) ? args : []);
  const url = URL.createObjectURL(new Blob([prepare(code, play, still, title, audio)], { type: "text/javascript" }));
  try {
    await import(url);
    const session = globalThis.__miniPlay;
    return {
      ok: true,
      output: globalThis.__miniOutput,
      stderr: globalThis.__miniRuntimeError,
      canvas: globalThis.__miniCanvas ?? null,
      tones: globalThis.__miniAudioDrain ? globalThis.__miniAudioDrain() : [],
      play: session ? {
        width: session.width,
        height: session.height,
        title: session.title,
        pixels: session.pixels(),
        status: session.initialStatus,
        hasUpdate: session.hasUpdate,
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
      const status = globalThis.__miniPlay.update(data.dt);
      const tones = globalThis.__miniAudioDrain ? globalThis.__miniAudioDrain() : [];
      self.postMessage({ action: "step", status, pixels: globalThis.__miniPlay.pixels(), tones: tones });
      return;
    }
    if (data && data.action === "keydown" && globalThis.__miniPlay) {
      if (globalThis.__miniPlay.keyDown) globalThis.__miniPlay.keyDown(data.key);
      const tones = globalThis.__miniAudioDrain ? globalThis.__miniAudioDrain() : [];
      self.postMessage({ action: "keydown", pixels: globalThis.__miniPlay.pixels(), tones: tones });
      return;
    }
    if (data && data.action === "keyup" && globalThis.__miniPlay) {
      if (globalThis.__miniPlay.keyUp) globalThis.__miniPlay.keyUp(data.key);
      const tones = globalThis.__miniAudioDrain ? globalThis.__miniAudioDrain() : [];
      self.postMessage({ action: "keyup", pixels: globalThis.__miniPlay.pixels(), tones: tones });
      return;
    }
    if (data && data.action === "pointermove" && globalThis.__miniPlay) {
      if (globalThis.__miniPlay.pointerMove) globalThis.__miniPlay.pointerMove(data.x, data.y);
      const tones = globalThis.__miniAudioDrain ? globalThis.__miniAudioDrain() : [];
      self.postMessage({ action: "pointermove", pixels: globalThis.__miniPlay.pixels(), tones: tones });
      return;
    }
    if (data && (data.action === "pointerdown" || data.action === "pointerup") && globalThis.__miniPlay) {
      const handler = data.action === "pointerdown" ? globalThis.__miniPlay.pointerDown : globalThis.__miniPlay.pointerUp;
      if (handler) handler(data.x, data.y, data.button);
      const tones = globalThis.__miniAudioDrain ? globalThis.__miniAudioDrain() : [];
      self.postMessage({ action: data.action, pixels: globalThis.__miniPlay.pixels(), tones: tones });
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
    const result = await runCode(compiled.code, data.stdin, data.args, compiled.play, compiled.still, data.title, compiled.audio);
    self.postMessage({
      ok: result.ok,
      output: result.output,
      stderr: result.stderr,
      diagnostic: result.ok ? "" : result.error,
      code: compiled.code,
      program: compiled.program,
      canvas: result.canvas,
      play: result.play,
      tones: result.tones,
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
