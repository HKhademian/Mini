/// Compile and run Mini source inside a browser worker.

globalThis.__miniSink = () => {};

/// Return the small process surface the generated compiler expects.
function processStub() {
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
      throw new Error("host module " + name + " is not available in the playground");
    },
  };
}

let compiler = null;

/// Load the compiler once with the process stub in place.
function loadCompiler() {
  if (compiler === null) {
    globalThis.process = processStub();
    compiler = import("./compiler.js");
  }
  return compiler;
}

/// Compile one source string and return its code or diagnostic text.
async function compileSource(source) {
  const { tokenize, expand_includes, compile } = await loadCompiler();
  let diagnostic = "";
  globalThis.__miniSink = (fd, text) => {
    if (fd === 2) diagnostic += text;
  };
  try {
    const tokens = tokenize(source, "playground.mini", false);
    const expanded = expand_includes(tokens, "playground.mini", [], Object.create(null));
    return { code: compile(expanded), diagnostic: "" };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    return { code: "", diagnostic: diagnostic || message };
  } finally {
    globalThis.__miniSink = () => {};
  }
}

/// Replace Node-only imports with the playground runtime.
function prepare(code) {
  const prelude = [
    'const readFileSync = () => { throw new Error("file access is not available in the playground"); };',
    'const writeFileSync = () => { throw new Error("file access is not available in the playground"); };',
    'const writeSync = (fd, text) => { if (fd === 2) globalThis.__miniRuntimeError += String(text); else globalThis.__miniOutput += String(text); };',
  ].join("\n");
  return code
    .replace(/^#![^\n]*\n/, "")
    .replace(/import \{[^}]*\} from "node:fs";\n/, prelude + "\n");
}

/// Execute one compiled program and return its streams or runtime error.
async function runCode(code) {
  globalThis.__miniOutput = "";
  globalThis.__miniRuntimeError = "";
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
    const compiled = await compileSource(data.source);
    if (compiled.code === "") {
      self.postMessage({ ok: false, output: "", stderr: "", diagnostic: compiled.diagnostic, code: "" });
      return;
    }
    const result = await runCode(compiled.code);
    self.postMessage({
      ok: result.ok,
      output: result.output,
      stderr: result.stderr,
      diagnostic: result.ok ? "" : result.error,
      code: compiled.code,
    });
  } catch (error) {
    const detail = error && error.stack ? error.stack : String(error);
    self.postMessage({ ok: false, output: "", stderr: "", diagnostic: "Worker failure: " + detail, code: "" });
  }
};
