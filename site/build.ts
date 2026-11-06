#!/usr/bin/env node
/// Build the static showcase into dist/site.
import { spawnSync } from "node:child_process";
import { highlight, type Token } from "./highlight.js";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

type PlaygroundEntry = {
    readonly id: string;
    readonly group: string;
    readonly label: string;
    readonly note: string;
    readonly args: readonly string[];
    readonly stdin: string;
    readonly file?: string;
    readonly source?: string;
};

type Sample = {
    readonly id: string;
    readonly title: string;
    readonly note: string;
    readonly file: string;
    readonly args: readonly string[];
    readonly stdin: string;
};

type RenderedSample = Sample & {
    readonly source: string;
    readonly output: string;
};

type PlaygroundSample = {
    readonly id: string;
    readonly group: string;
    readonly label: string;
    readonly note: string;
    readonly source: string;
    readonly args: readonly string[];
    readonly stdin: string;
};

const root = dirname(import.meta.dirname);
function readRepositoryUrl(): string {
    const configured = process.env["GITHUB_REPOSITORY"]?.trim();
    if (configured !== undefined && configured !== "") {
        return `https://github.com/${configured}`;
    }
    const result = spawnSync("git", ["remote", "get-url", "github"], { cwd: root, encoding: "utf8" });
    if (result.status !== 0) return "";
    const match = result.stdout.trim().match(/(?:github\.com[:/])([^/]+\/[^/]+?)(?:\.git)?$/);
    return match === null ? "" : `https://github.com/${match[1]}`;
}
const repo = readRepositoryUrl();

/// Load the generated compiler so pages highlight through the real lexer.
/// The CLI entry is stripped first; importing it directly would run main().
const compilerModule = await import(browserCompilerModule()) as {
    readonly tokenize: (source: string, name: string, comments: boolean) => readonly Token[];
};

const tokenize = (source: string, name: string, comments: boolean): readonly Token[] => compilerModule.tokenize(source, name, comments);
const output = join(root, "dist", "site");
const brandWordmark = readFileSync(join(root, "brand", "mini-wordmark.svg"), "utf8");
const playgroundSamples = JSON.parse(
    readFileSync(join(root, "site", "playground", "samples.json"), "utf8"),
) as readonly PlaygroundEntry[];

const heroSample: Sample = {
    id: "json",
    title: "Maps and JSON",
    note: "Build a map and print compact JSON.",
    file: "samples/020-json-to-text.mini",
    args: [],
    stdin: "",
};

const samples: readonly Sample[] = [
    {
        id: "lists",
        title: "Lists",
        note: "Join list items with a visible separator.",
        file: "samples/018-list-to-text.mini",
        args: [],
        stdin: "",
    },
    {
        id: "arguments",
        title: "Program arguments",
        note: "Forward command-line arguments to the program.",
        file: "samples/006-list.mini",
        args: ["alpha", "beta", "gamma"],
        stdin: "",
    },
    {
        id: "text",
        title: "Text and stdin",
        note: "Normalize tabs and line endings from standard input.",
        file: "samples/004-text.mini",
        args: [],
        stdin: "alpha\tbeta\ngamma",
    },
];

const whyCards: readonly (readonly [string, string])[] = [
    [
        "Clone and grow",
        "{{name}} is the starting point for your language, not the finished language. Start from the reviewed contract and add only what your target needs.",
    ],
    [
        "Self-hosting kept honest",
        "Every compiler change must keep three generations byte-identical, and the final compiler must compile an example that runs.",
    ],
    [
        "Small on purpose",
        "No records, classes, or standard library yet. Syntax and builtins stay small so the compiler and its migrations stay readable.",
    ],
];

const docs: readonly (readonly [string, string, string])[] = [
    [
        "Getting started",
        "Extract a release, verify it, and run a first program.",
        `${repo}/blob/main/docs/getting-started.md`,
    ],
    [
        "Why {{name}}",
        "Purpose, audience, and why it is not the smallest self-hosted language.",
        `${repo}/blob/main/docs/why-mini.md`,
    ],
    [
        "Language draft",
        "Accepted syntax and builtin contracts, with open rules marked.",
        `${repo}/blob/main/docs/language.md`,
    ],
    [
        "Compiler reference",
        "The self-hosted compiler, its commands, and the analysis interface.",
        `${repo}/blob/main/docs/compiler.md`,
    ],
    [
        "Runtime",
        "Supported Node range and the generated JavaScript contract.",
        `${repo}/blob/main/docs/runtime.md`,
    ],
    [
        "Releases",
        "The official release cycle, artifacts, and verification.",
        `${repo}/blob/main/docs/releases.md`,
    ],
];

/// Escape text for HTML element content.
function escapeHtml(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/// Escape text and replace the project-name token with the two-tone name.
function renderName(text: string): string {
    return escapeHtml(text).replaceAll("{{name}}", '<span class="name"><span class="name-m">m</span>ini</span>');
}

/// Run one sample and return its standard output.
function runSample(sample: Sample): string {
    const result = spawnSync(
        process.execPath,
        [join(root, "bin", "mini"), "run", sample.file, ...sample.args],
        { cwd: root, input: sample.stdin, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        const detail = result.stderr.trim();
        throw new Error(`${sample.file} failed${detail === "" ? "" : `: ${detail}`}`);
    }
    return result.stdout;
}

/// Read one sample, run it, and return the rendered data.
function loadSample(sample: Sample): RenderedSample {
    return {
        ...sample,
        source: readFileSync(join(root, sample.file), "utf8").trimEnd(),
        output: runSample(sample),
    };
}

/// Render a fenced code block. Mini source is highlighted through the lexer.
function codeBlock(text: string, className: string): string {
    const body = className === "source" ? highlight(text, tokenize) : escapeHtml(text);
    return `<pre class="${className}"><code>${body}</code></pre>`;
}

/// Render the sample card for one sample.
function renderSampleCard(sample: RenderedSample): string {
    return `<article class="sample" id="sample-${sample.id}">
          <header class="sample-head">
            <div>
              <h3>${escapeHtml(sample.title)}</h3>
              <p>${escapeHtml(sample.note)}</p>
            </div>
            <code class="file">${escapeHtml(sample.file)}</code>
          </header>
          ${codeBlock(sample.source, "source")}
          <div class="output">
            <span class="label">output</span>
            ${codeBlock(sample.output, "stdout")}
          </div>
          <footer class="sample-foot">
            <a href="./playground/?sample=${sample.id}">Open in playground &rarr;</a>
          </footer>
        </article>`;
}

/// Render the hero section.
function renderHero(sample: RenderedSample): string {
    return `<section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Alpha &middot; Node 22.18+ &middot; Apache-2.0</p>
          <h1>A tiny self-hosting foundation for building other languages.</h1>
          <p class="lede">${renderName("Clone {{name}}, grow your own language, and keep the compiler compiling itself after every change.")}</p>
          <p class="actions">
            <a class="button" href="./playground/">Try the playground</a>
            <a class="button ghost" href="${repo}/blob/main/docs/getting-started.md">Get started</a>
          </p>
        </div>
        <figure class="hero-code">
          <div class="card-head">
            <code>${escapeHtml(sample.file)}</code>
            <span class="badge">sample</span>
          </div>
          ${codeBlock(sample.source, "source")}
          <div class="output">
            <span class="label">output</span>
            ${codeBlock(sample.output, "stdout")}
          </div>
          <figcaption class="hero-open">
            <a href="./playground/?sample=${sample.id}">Open in playground &rarr;</a>
          </figcaption>
        </figure>
      </section>`;
}

/// Render one "why" card.
function renderWhyCard(title: string, body: string): string {
    return `<article class="feature">
            <h3>${renderName(title)}</h3>
            <p>${renderName(body)}</p>
          </article>`;
}

/// Render the mini wordmark linked to one location.
function renderBrand(href: string): string {
    return `<a class="brand" href="${href}" aria-label="mini home"><span class="brand-logo" aria-hidden="true">${brandWordmark}</span></a>`;
}

/// Render one documentation link card.
function renderDocCard(title: string, body: string, href: string): string {
    return `<a class="doc" href="${href}">
            <h3>${renderName(title)}</h3>
            <p>${renderName(body)}</p>
          </a>`;
}

/// Render the complete page.
function renderPage(hero: RenderedSample, cards: readonly RenderedSample[]): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>mini &mdash; a self-hosting foundation for language projects</title>
  <meta name="description" content="mini is a tiny self-hosting foundation for building other languages. Clone it, grow your own language, and keep the compiler compiling itself.">
  <meta name="theme-color" content="#0a0d12" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f7f9fc" media="(prefers-color-scheme: light)">
  <link rel="icon" href="./favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>

  <header class="site-header">
    ${renderBrand("./")}
    <nav aria-label="Site">
      <a href="./playground/">Playground</a>
      <a href="#install">Install</a>
      <a href="#why">Why</a>
      <a href="#samples">Samples</a>
      <a href="#docs">Docs</a>
      <a href="${repo}">GitHub</a>
    </nav>
  </header>

  <main id="main">
    ${renderHero(hero)}

    <section class="section" id="why">
      <header class="section-head">
        <h2>Built to be changed</h2>
        <p>${renderName("{{name}} stays useful only while the compiler still compiles itself. The foundation is designed around that constraint.")}</p>
      </header>
      <div class="features">
        ${whyCards.map((card) => renderWhyCard(card[0], card[1])).join("\n        ")}
      </div>
      <p class="callout">${renderName("If you want the smallest possible self-hosted demonstration, {{name}} is bigger than that. If you want a starting point that survives changes, that extra is what you are choosing.")}</p>
    </section>

    <section class="section" id="install">
      <header class="section-head">
        <h2>Run it in a minute</h2>
        <p>Node.js 22.18.0 or newer. The compiler installs no packages.</p>
      </header>
      <ol class="steps">
        <li class="step">
          <h3>Get the source</h3>
          ${codeBlock(`git clone ${repo}\ncd Mini`, "step-code")}
        </li>
        <li class="step">
          <h3>Build the generated tools</h3>
          ${codeBlock("./bin/bootstrap", "step-code")}
        </li>
        <li class="step">
          <h3>Run a sample</h3>
          ${codeBlock("./bin/mini run samples/018-list-to-text.mini", "step-code")}
          <p class="step-note">prints <code>one | two | three</code></p>
        </li>
      </ol>
    </section>

    <section class="section" id="samples">
      <header class="section-head">
        <h2>Real samples, real output</h2>
        <p>Every output below was produced by compiling and running the sample during this site build.</p>
      </header>
      <div class="samples">
        ${cards.map(renderSampleCard).join("\n        ")}
      </div>
    </section>

    <section class="section" id="docs">
      <header class="section-head">
        <h2>Read more</h2>
        <p>The documentation covers the contract, the compiler, and the release process.</p>
      </header>
      <div class="docs">
        ${docs.map((entry) => renderDocCard(entry[0], entry[1], entry[2])).join("\n        ")}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p>${renderName("{{name}} is alpha software.")} <a href="${repo}/blob/main/LICENSE">Apache-2.0</a> licensed.</p>
    <p>${renderName("Samples compiled with {{name}} during the build.")}</p>
  </footer>
</body>
</html>
`;
}

/// Return the generated compiler with its CLI entry removed.
function browserCompilerSource(): string {
    const path = join(root, "dist", "compile.js");
    if (!existsSync(path)) {
        throw new Error("dist/compile.js is missing; run ./bin/bootstrap first");
    }
    const source = readFileSync(path, "utf8");
    const importLine = 'import { readFileSync, writeFileSync, writeSync } from "node:fs";';
    if (!source.includes(importLine) || !/main\(\);\s*$/.test(source)) {
        throw new Error("compiler entry shape changed; update the playground build");
    }
    for (const name of ["function tokenize(", "function expand_includes(", "function compile("]) {
        if (!source.includes(name)) {
            throw new Error(`compiler entry is missing ${name}; update the playground build`);
        }
    }
    return source
        .replace(/main\(\);\s*$/, "")
        .replace(importLine, 'import { readFileSync, writeFileSync, writeSync } from "./shim.js";')
        + "\nexport { tokenize, expand_includes, compile };\n";
}

/// Return the generated compiler as a browser module.
function buildBrowserCompiler(): string {
    return browserCompilerSource();
}

/// Write a temporary module that exports the tokenizer without a CLI entry.
function browserCompilerModule(): string {
    const path = join(tmpdir(), "mini-highlight-" + String(process.pid) + ".mjs");
    writeFileSync(path, browserCompilerSource().replace('./shim.js', join(root, "dist", "site", "playground", "shim.js")));
    return path;
}

/// Read the playground samples.
/// Compile and run one playground entry, failing the build on a broken sample.
function verifyPlaygroundSample(sample: PlaygroundSample): void {
    const work = mkdtempSync(join(tmpdir(), "mini-playground-"));
    const file = join(work, "sample.mini");
    writeFileSync(file, sample.source + "\n");
    const result = spawnSync(
        process.execPath,
        [join(root, "bin", "mini"), "run", file, ...sample.args],
        { cwd: root, input: sample.stdin, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    rmSync(work, { recursive: true, force: true });
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${sample.id} failed:\n${result.stderr.trim()}`);
    }
    if (result.stdout.trim() === "") {
        throw new Error(`${sample.id} produced no output`);
    }
}

/// Load and verify every playground entry.
function loadPlaygroundSamples(): readonly PlaygroundSample[] {
    return playgroundSamples.map((entry) => {
        if ((entry.file === undefined) === (entry.source === undefined)) {
            throw new Error(`${entry.id} needs exactly one of file or source`);
        }
        const source = (entry.source ?? readFileSync(join(root, entry.file ?? ""), "utf8")).trim();
        const sample: PlaygroundSample = {
            id: entry.id,
            group: entry.group,
            label: entry.label,
            note: entry.note,
            source,
            args: entry.args,
            stdin: entry.stdin,
        };
        verifyPlaygroundSample(sample);
        return sample;
    });
}

/// Read the declared compiler and language versions.
function readVersions(): { compiler: string; language: string } {
    const parsed = JSON.parse(readFileSync(join(root, "config", "versions.json"), "utf8")) as Record<string, unknown>;
    const compiler = typeof parsed["compiler"] === "string" ? parsed["compiler"] : "unassigned";
    const language = typeof parsed["language"] === "string" ? parsed["language"] : "unassigned";
    return { compiler, language };
}

/// Render the playground page.
function renderPlayground(data: readonly PlaygroundSample[]): string {
    let options = "";
    let currentGroup = "";
    data.forEach((sample, index) => {
        if (sample.group !== currentGroup) {
            if (currentGroup !== "") {
                options += "</optgroup>";
            }
            currentGroup = sample.group;
            options += `<optgroup label="${escapeHtml(currentGroup)}">`;
        }
        options += `<option value="${index}">${escapeHtml(sample.label)}</option>`;
    });
    if (currentGroup !== "") {
        options += "</optgroup>";
    }
    const serialized = JSON.stringify(data).replaceAll("<", "\\u003c");
    const versions = readVersions();
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>mini playground</title>
  <meta name="description" content="Write and run mini in your browser.">
  <meta name="theme-color" content="#0a0d12" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f7f9fc" media="(prefers-color-scheme: light)">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="./playground.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>

  <header class="site-header">
    ${renderBrand("../")}
    <nav aria-label="Site">
      <a href="../#install">Install</a>
      <a href="../#why">Why</a>
      <a href="../#samples">Samples</a>
      <a href="../#docs">Docs</a>
      <a href="${repo}">GitHub</a>
    </nav>
  </header>

  <main id="main" class="playground">
    <h1>Playground</h1>
    <p class="lede">${renderName("Write {{name}}, press Run, and see the output.")} ${data.length} samples, from bindings to a small tokenizer; the compiler and the program run in your browser.</p>

    <div class="workbench">
      <section class="pane" aria-label="Editor">
        <div class="pane-head">
          <select id="samples" aria-label="Sample">${options}</select>
          <span id="status" role="status" aria-live="polite" data-kind="ok">ready</span>
        </div>
        <p class="sample-meta" id="sample-meta" hidden></p>
        <textarea id="source" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="mini source"></textarea>
        <div class="controls">
          <button id="run" type="button">Run</button>
          <button id="reset" class="ghost" type="button">Reset</button>
          <span class="hint">Ctrl/&#8984; + Enter</span>
        </div>
      </section>

      <section class="pane" aria-label="Output">
        <div class="pane-head">
          <div class="tabs" role="tablist" aria-label="Output">
            <button id="tab-output" type="button" role="tab" aria-selected="true" aria-controls="panel-output">Output</button>
            <button id="tab-code" type="button" role="tab" aria-selected="false" aria-controls="panel-code" disabled>JavaScript</button>
          </div>
        </div>
        <div id="panel-output" class="tab-panel" role="tabpanel" aria-labelledby="tab-output">
          <pre id="stdout">(no output)</pre>
          <pre id="stderr" hidden></pre>
          <pre id="diagnostic" hidden></pre>
        </div>
        <div id="panel-code" class="tab-panel" role="tabpanel" aria-labelledby="tab-code" hidden>
          <pre id="code"></pre>
        </div>
      </section>
    </div>

    <p class="limits">Runs entirely in your browser. <code>include</code>, files, processes, and the network are unavailable.</p>
    <p class="versions">compiler ${escapeHtml(versions.compiler)} &middot; language ${escapeHtml(versions.language)}</p>
  </main>

  <footer class="site-footer">
    <p>${renderName("{{name}} is alpha software.")} <a href="${repo}/blob/main/LICENSE">Apache-2.0</a> licensed.</p>
    <p><a href="../#docs">Documentation</a></p>
  </footer>

  <script type="module">
    import { highlight } from "../highlight.js";
    import { tokenize } from "../playground/compiler.js";
    const samples = ${serialized};
    const source = document.getElementById("source");
    const select = document.getElementById("samples");
    const runButton = document.getElementById("run");
    const resetButton = document.getElementById("reset");
    const status = document.getElementById("status");
    const stdout = document.getElementById("stdout");
    const stderr = document.getElementById("stderr");
    const diagnostic = document.getElementById("diagnostic");
    const tabOutput = document.getElementById("tab-output");
    const tabCode = document.getElementById("tab-code");
    const panelOutput = document.getElementById("panel-output");
    const panelCode = document.getElementById("panel-code");
    const code = document.getElementById("code");
    const meta = document.getElementById("sample-meta");

    function showTab(showCode) {
      const active = showCode && !tabCode.disabled;
      tabOutput.setAttribute("aria-selected", String(!active));
      tabCode.setAttribute("aria-selected", String(active));
      panelOutput.hidden = active;
      panelCode.hidden = !active;
    }

    function setStatus(text, kind) {
      status.textContent = text;
      status.dataset.kind = kind || "";
    }

    function describeSample(sample) {
      const parts = [sample.note];
      if (sample.args.length > 0) parts.push("args: " + sample.args.join(" "));
      if (sample.stdin !== "") parts.push("stdin: " + JSON.stringify(sample.stdin));
      meta.textContent = parts.join("  ·  ");
      meta.hidden = false;
    }

    function clear() {
      stdout.textContent = "(no output)";
      stderr.textContent = "";
      stderr.hidden = true;
      diagnostic.textContent = "";
      diagnostic.hidden = true;
      code.textContent = "";
      tabCode.disabled = true;
      showTab(false);
    }

    function fail(text) {
      diagnostic.textContent = text;
      diagnostic.hidden = false;
      setStatus("failed", "error");
      showTab(false);
    }

    function run() {
      const sample = samples[Number(select.value)];
      clear();
      setStatus("working…");
      const started = performance.now();
      const worker = new Worker("./worker.js", { type: "module" });
      let done = false;
      const timer = setTimeout(function () {
        if (done) return;
        done = true;
        worker.terminate();
        fail("The program did not finish within 5 seconds.");
      }, 5000);
      worker.onmessage = function (event) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        worker.terminate();
        const data = event.data;
        if (data.output) stdout.textContent = data.output;
        if (data.stderr) {
          stderr.textContent = data.stderr;
          stderr.hidden = false;
        }
        if (data.code) {
          code.innerHTML = highlight(data.code, tokenize);
          tabCode.disabled = false;
        }
        if (data.diagnostic) {
          fail(data.diagnostic);
        } else {
          setStatus("done in " + Math.round(performance.now() - started) + " ms", "ok");
        }
      };
      worker.onerror = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        worker.terminate();
        fail("The playground worker failed to start.");
      };
      worker.postMessage({ source: source.value, stdin: sample.stdin, args: sample.args });
    }

    function showSample() {
      const sample = samples[Number(select.value)];
      source.value = sample.source;
      describeSample(sample);
      history.replaceState(null, "", "?sample=" + encodeURIComponent(sample.id));
      run();
    }

    select.addEventListener("change", showSample);
    resetButton.addEventListener("click", showSample);
    runButton.addEventListener("click", run);
    tabOutput.addEventListener("click", function () { showTab(false); });
    tabCode.addEventListener("click", function () { showTab(true); });
    function tabKey(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      if (event.key === "ArrowRight" && tabCode.disabled) return;
      const next = event.key === "ArrowRight";
      showTab(next);
      (next ? tabCode : tabOutput).focus();
    }
    tabOutput.addEventListener("keydown", tabKey);
    tabCode.addEventListener("keydown", tabKey);
    source.addEventListener("keydown", function (event) {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = source.selectionStart;
        const end = source.selectionEnd;
        source.setRangeText("    ", start, end, "end");
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        run();
      }
    });

    const requested = new URLSearchParams(location.search).get("sample");
    const found = samples.findIndex(function (sample) { return sample.id === requested; });
    const initial = found >= 0 ? found : 0;
    select.value = String(initial);
    source.value = samples[initial].source;
    describeSample(samples[initial]);
    history.replaceState(null, "", "?sample=" + encodeURIComponent(samples[initial].id));
    run();
  </script>
</body>
</html>
`;
}

/// Build every site asset and print the written page.
function main(): void {
    const hero = loadSample(heroSample);
    const cards = samples.map(loadSample);
    rmSync(output, { recursive: true, force: true });
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, "index.html"), renderPage(hero, cards));
    writeFileSync(join(output, "style.css"), readFileSync(join(root, "site", "style.css")));
    cpSync(join(root, "site", "highlight.js"), join(output, "highlight.js"));
    cpSync(join(root, "brand", "mini-favicon.svg"), join(output, "favicon.svg"));
    const playground = join(output, "playground");
    mkdirSync(playground, { recursive: true });
    writeFileSync(join(playground, "compiler.js"), buildBrowserCompiler());
    writeFileSync(join(playground, "index.html"), renderPlayground(loadPlaygroundSamples()));
    cpSync(join(root, "site", "playground", "shim.js"), join(playground, "shim.js"));
    cpSync(join(root, "site", "playground", "worker.js"), join(playground, "worker.js"));
    cpSync(join(root, "site", "playground", "playground.css"), join(playground, "playground.css"));
    process.stdout.write(`wrote ${join(output, "index.html")}\n`);
}

try {
    main();
} catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
}
