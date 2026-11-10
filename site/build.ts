#!/usr/bin/env node
/// Build the static showcase into dist/site.
import { spawnSync } from "node:child_process";
import { highlight, type Token } from "./highlight.js";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

type PlaygroundEntry = {
    readonly id: string;
    readonly group: string;
    readonly label: string;
    readonly note: string;
    readonly args: readonly string[];
    readonly stdin: string;
    readonly status?: "planned";
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

/// Identify the exact source revision used for this site build.
function readSourceCommit(): string {
    const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error("could not read the source commit");
    }
    return result.stdout.trim();
}

const sourceCommit = readSourceCommit();
const shortCommit = sourceCommit.slice(0, 12);

/// Load the generated compiler so pages highlight through the real lexer.
/// The CLI entry is stripped first; importing it directly would run main().
const compilerModule = await import(browserCompilerModule()) as {
    readonly lex_tokenize: (source: string, name: string, comments: boolean) => readonly Token[];
    readonly lex_expand_imports: (tokens: readonly Token[], base: string, seen: object) => readonly (Token & { readonly file?: string })[];
};

const lexTokenize = (source: string, name: string, comments: boolean): readonly Token[] => compilerModule.lex_tokenize(source, name, comments);
const output = join(root, "dist", "site");
const brandWordmark = readFileSync(join(root, "brand", "mini-wordmark.svg"), "utf8");
const playgroundSamples = JSON.parse(
    readFileSync(join(root, "site", "playground", "samples.json"), "utf8"),
) as readonly PlaygroundEntry[];

const heroSample: Sample = {
    id: "fibonacci",
    title: "Fibonacci",
    note: "Build and print a number sequence with a function and loop.",
    file: "samples/showcase/fibonacci.mini",
    args: [],
    stdin: "",
};

const samples: readonly Sample[] = [
    {
        id: "lists",
        title: "Lists",
        note: "Join list items with a visible separator.",
        file: "samples/018-list-join.mini",
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
        "Readable generated code",
        "Compile to JavaScript you can inspect, run on Node, and adapt for your language.",
    ],
    [
        "Self-hosting you can verify",
        "Compiler updates must rebuild to the same output across successive generations and run a compiled example.",
    ],
    [
        "A focused language core",
        "Functions, control flow, text, lists, maps, and JSON provide a practical base for growing a language.",
    ],
];

const docs: readonly (readonly [string, string, string])[] = [
    [
        "Getting started",
        "Build the tools and run your first program.",
        `${repo}/blob/main/docs/getting-started.md`,
    ],
    [
        "Why {{name}}",
        "Goals, audience, and design choices.",
        `${repo}/blob/main/docs/why-mini.md`,
    ],
    [
        "Language draft",
        "Accepted syntax and function contracts, with open rules marked.",
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
    const body = className === "source" ? highlight(text, lexTokenize) : escapeHtml(text);
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
          <h1>Build your language on a compiler that grows with it.</h1>
          <p class="lede">${renderName("The compiler is written in {{name}} and emits readable JavaScript for Node. Extend the syntax and built-ins as your language takes shape.")}</p>
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

/// Render a short revision link with the full commit in its destination.
function renderSourceRevision(): string {
    return `<p>Source commit: <a href="${repo}/commit/${sourceCommit}" title="${sourceCommit}"><code><strong>${shortCommit}</strong>${sourceCommit.slice(shortCommit.length)}</code></a></p>`;
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
  <title>mini &mdash; a compiler foundation for your language</title>
  <meta name="description" content="Build your own language from a focused, self-hosted compiler foundation written in mini.">
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
        <h2>A practical base for language builders</h2>
        <p>Start with a working compiler, then extend the language in small, verifiable steps.</p>
      </header>
      <div class="features">
        ${whyCards.map((card) => renderWhyCard(card[0], card[1])).join("\n        ")}
      </div>
    </section>

    <section class="section" id="install">
      <header class="section-head">
        <h2>Build and run</h2>
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
          ${codeBlock("./bin/mini run samples/018-list-join.mini", "step-code")}
          <p class="step-note">prints <code>one | two | three</code></p>
        </li>
      </ol>
    </section>

    <section class="section" id="samples">
      <header class="section-head">
        <h2>Real samples, real output</h2>
        <p>Explore the language through runnable examples. <a href="./samples/">Browse all samples by topic.</a></p>
      </header>
      <div class="samples">
        ${cards.map(renderSampleCard).join("\n        ")}
      </div>
    </section>

    <section class="section" id="docs">
      <header class="section-head">
        <h2>Read more</h2>
        <p>Start with the language, then explore the compiler and release guides.</p>
      </header>
      <div class="docs">
        ${docs.map((entry) => renderDocCard(entry[0], entry[1], entry[2])).join("\n        ")}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p>${renderName("{{name}} is alpha software.")} <a href="${repo}/blob/main/LICENSE">Apache-2.0</a> licensed.</p>
    ${renderSourceRevision()}
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
    if (!source.includes("    main(process.argv.slice(2));\n")) {
        throw new Error("compiler entry shape changed; update the playground build");
    }
    for (const name of ["function lex_tokenize(", "function lex_expand_imports(", "function emit_js_compile(", "function emit_js_compile_program_only(", "function emit_js_set_reference_mode("]) {
        if (!source.includes(name)) {
            throw new Error(`compiler entry is missing ${name}; update the playground build`);
        }
    }
    return source
        .replace("    main(process.argv.slice(2));\n", "")
        + "\nexport { lex_tokenize, lex_expand_imports, emit_js_compile, emit_js_compile_program_only, emit_js_set_reference_mode };\n";
}

/// Return the generated compiler as a browser module.
function buildBrowserCompiler(): string {
    return browserCompilerSource()
        .replace('from "node:fs"', `from "./shim.js?rev=${sourceCommit}"`);
}

/// Return the browser worker pinned to this site's source revision.
function buildBrowserWorker(): string {
    const source = readFileSync(join(root, "site", "playground", "worker.js"), "utf8");
    const marker = 'const buildRevision = "";';
    if (!source.includes(marker)) {
        throw new Error("playground worker revision marker is missing");
    }
    return source.replace(marker, `const buildRevision = "${sourceCommit}";`);
}

/// Return every Mini library source keyed by its compiler import path.
function buildBrowserImports(): string {
    const files: Record<string, string> = {};
    function visit(directory: string, relativeDirectory: string): void {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const relativePath = relativeDirectory === "" ? entry.name : relativeDirectory + "/" + entry.name;
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                visit(path, relativePath);
            } else if (entry.isFile() && entry.name.endsWith(".mini")) {
                files["libs/" + relativePath] = readFileSync(path, "utf8");
            }
        }
    }
    visit(join(root, "libs"), "");
    return `export const files = ${JSON.stringify(files).replaceAll("<", "\\u003c")};\n`;
}

/// Write a temporary module that exports the compiler without a CLI entry.
///
/// The import keeps node:fs so the build can expand imports from the tree; the
/// browser copy swaps in the shim separately.
function browserCompilerModule(): string {
    const path = join(tmpdir(), "mini-highlight-" + String(process.pid) + ".mjs");
    writeFileSync(path, browserCompilerSource());
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
    return playgroundSamples.filter((entry) => entry.status !== "planned").map((entry) => {
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

/// Read the declared compiler, language, and playground versions.
function readVersions(): { compiler: string; language: string; play: string } {
    const parsed = JSON.parse(readFileSync(join(root, "config", "versions.json"), "utf8")) as Record<string, unknown>;
    const compiler = typeof parsed["compiler"] === "string" ? parsed["compiler"] : "unassigned";
    const language = typeof parsed["language"] === "string" ? parsed["language"] : "unassigned";
    const play = typeof parsed["play"] === "string" ? parsed["play"] : "unassigned";
    return { compiler, language, play };
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
  <meta name="description" content="Edit mini programs, run them in your browser, and inspect the generated JavaScript.">
  <meta name="theme-color" content="#0a0d12" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f7f9fc" media="(prefers-color-scheme: light)">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../style.css?rev=${sourceCommit}">
  <link rel="stylesheet" href="./playground.css?rev=${sourceCommit}">
</head>
<body class="playground-page">
  <a class="skip" href="#main">Skip to content</a>

  <header class="site-header playground-header">
    <div class="playground-brand">
      ${renderBrand("../")}
      <h1>Playground</h1>
    </div>
    <nav aria-label="Site">
      <a href="../">Home</a>
      <a href="../samples/">Samples</a>
    </nav>
  </header>

  <main id="main" class="playground">
    <div class="workbench">
      <section class="pane" aria-label="Editor">
        <div class="pane-head">
          <div class="sample-picker">
            <select id="samples" aria-label="Sample">${options}</select>
            <button id="reset" class="ghost" type="button">Reset</button>
          </div>
          <span id="status" role="status" aria-live="polite" data-kind="ok">ready</span>
        </div>
        <p class="sample-meta" id="sample-meta" hidden></p>
        <div class="source-editor">
          <pre id="source-highlight" aria-hidden="true"><code></code></pre>
          <textarea id="source" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="mini source"></textarea>
        </div>
        <div class="controls">
          <span class="hint">Ctrl/&#8984; + Enter</span>
        </div>
      </section>

      <section class="pane" aria-label="Output">
        <div class="pane-head output-head">
          <div class="tabs" role="tablist" aria-label="Output">
            <button id="tab-output" type="button" role="tab" aria-selected="true" aria-controls="panel-output">Output</button>
            <button id="tab-canvas" type="button" role="tab" aria-selected="false" aria-controls="panel-canvas" hidden>Canvas</button>
            <button id="tab-code" type="button" role="tab" aria-selected="false" aria-controls="panel-code" disabled>JavaScript</button>
          </div>
          <div class="pane-actions">
            <button id="run" class="action-button primary" type="button"><span aria-hidden="true">▶</span> Play</button>
            <button id="compile" class="action-button secondary" type="button">Compile only</button>
          </div>
        </div>
        <div id="panel-output" class="tab-panel" role="tabpanel" aria-labelledby="tab-output">
          <pre id="stdout">(no output)</pre>
          <pre id="stderr" hidden></pre>
          <pre id="diagnostic" hidden></pre>
        </div>
        <div id="panel-canvas" class="tab-panel canvas-panel" role="tabpanel" aria-labelledby="tab-canvas" hidden>
          <h2 id="play-title"></h2>
          <div class="canvas-stage">
            <canvas id="play-canvas" tabindex="0" aria-label="Mini Play board"></canvas>
          </div>
          <p id="play-status" role="status">Ready</p>
        </div>
        <div id="panel-code" class="tab-panel" role="tabpanel" aria-labelledby="tab-code" hidden>
          <div class="code-modes" role="group" aria-label="Generated JavaScript">
            <button id="mode-full" type="button" data-mode="full" aria-pressed="false">Runtime + program</button>
            <button id="mode-program" type="button" data-mode="program" aria-pressed="true">Program only</button>
            <button id="mode-portable" type="button" data-mode="portable" aria-pressed="false" hidden>Reference</button>
          </div>
          <pre id="code"></pre>
        </div>
      </section>
    </div>

  </main>

  <footer class="site-footer playground-footer">
    <p>Runs in your browser. Filesystem, process, and network access are unavailable.</p>
    <p>compiler ${escapeHtml(versions.compiler)} &middot; language ${escapeHtml(versions.language)} &middot; playground ${escapeHtml(versions.play)}</p>
    ${renderSourceRevision()}
  </footer>

  <script type="module">
    import { highlight, highlightJavaScript } from "../highlight.js";
    import { lex_tokenize } from "../playground/compiler.js";
    const samples = ${serialized};
    const source = document.getElementById("source");
    const sourceHighlight = document.querySelector("#source-highlight code");
    const sourceHighlightPane = document.getElementById("source-highlight");
    const select = document.getElementById("samples");
    const runButton = document.getElementById("run");
    const resetButton = document.getElementById("reset");
    const status = document.getElementById("status");
    const stdout = document.getElementById("stdout");
    const stderr = document.getElementById("stderr");
    const diagnostic = document.getElementById("diagnostic");
    const tabOutput = document.getElementById("tab-output");
    const tabCanvas = document.getElementById("tab-canvas");
    const tabCode = document.getElementById("tab-code");
    const panelOutput = document.getElementById("panel-output");
    const panelCanvas = document.getElementById("panel-canvas");
    const panelCode = document.getElementById("panel-code");
    const playTitle = document.getElementById("play-title");
    const playCanvas = document.getElementById("play-canvas");
    const playStatus = document.getElementById("play-status");
    const playContext = playCanvas.getContext("2d");
    const code = document.getElementById("code");
    const meta = document.getElementById("sample-meta");
    const modeButtons = Array.prototype.slice.call(document.querySelectorAll(".code-modes button"));
    let mode = "program";
    let latestCode = null;
    let activeWorker = null;
    let activeCanvas = false;
    let activePlay = false;
    let playFrame = 0;
    let playInFlight = false;
    let lastPlayStepAt = 0;
    let previousPlayTimestamp = 0;
    const maxPlayFramesPerSecond = 60;
    const minPlayFrameMs = 1000 / maxPlayFramesPerSecond;
    let audioContext = null;

    function showTab(name) {
      const active = name === "code" && !tabCode.disabled ? "code" : name === "canvas" && !tabCanvas.hidden ? "canvas" : "output";
      tabOutput.setAttribute("aria-selected", String(active === "output"));
      tabCanvas.setAttribute("aria-selected", String(active === "canvas"));
      tabCode.setAttribute("aria-selected", String(active === "code"));
      panelOutput.hidden = active !== "output";
      panelCanvas.hidden = active !== "canvas";
      panelCode.hidden = active !== "code";
    }

    function stopPlay() {
      if (playFrame) cancelAnimationFrame(playFrame);
      playFrame = 0;
      playInFlight = false;
      lastPlayStepAt = 0;
      previousPlayTimestamp = 0;
      activePlay = false;
      activeCanvas = false;
      if (activeWorker) {
        activeWorker.postMessage({ action: "stop" });
        activeWorker.terminate();
        activeWorker = null;
      }
      tabCanvas.hidden = true;
      if (!panelCanvas.hidden) showTab("output");
    }

    function drawPlayFrame(pixels) {
      if (playCanvas.width < 1 || playCanvas.height < 1) return;
      const image = playContext.createImageData(playCanvas.width, playCanvas.height);
      const count = Math.min(pixels.length, playCanvas.width * playCanvas.height);
      for (let index = 0; index < count; index += 1) {
        const color = Number(pixels[index]) >>> 0;
        const offset = index * 4;
        image.data[offset] = (color >>> 16) & 255;
        image.data[offset + 1] = (color >>> 8) & 255;
        image.data[offset + 2] = color & 255;
        image.data[offset + 3] = 255;
      }
      playContext.putImageData(image, 0, 0);
    }

    function applyPlayFrame(frame) {
      if (!frame) return;
      if (frame.width > 0 && frame.height > 0) {
        if (playCanvas.width !== frame.width) playCanvas.width = frame.width;
        if (playCanvas.height !== frame.height) playCanvas.height = frame.height;
      }
      if (typeof frame.title === "string") {
        playCanvas.title = frame.title;
        playTitle.textContent = frame.title;
      }
      drawPlayFrame(frame.pixels);
    }

    function unlockAudio() {
      const AudioContextType = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextType) return;
      if (!audioContext) audioContext = new AudioContextType();
      if (audioContext.state === "suspended") {
        const resume = audioContext.resume();
        if (resume && resume.catch) resume.catch(function () {});
      }
    }

    function playToneEvents(values) {
      if (!audioContext || !Array.isArray(values)) return;
      let index = 0;
      while (index + 2 < values.length) {
        const frequency = Number(values[index]);
        const duration = Number(values[index + 1]);
        const volume = Number(values[index + 2]);
        index += 3;
        if (!Number.isFinite(frequency) || frequency < 20 || frequency > 20000
          || !Number.isFinite(duration) || duration <= 0 || duration > 3
          || !Number.isFinite(volume) || volume <= 0 || volume > 1) continue;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startAt = audioContext.currentTime;
        const ramp = Math.min(duration / 4, 0.01);
        oscillator.frequency.setValueAtTime(frequency, startAt);
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(volume, startAt + ramp);
        gain.gain.setValueAtTime(volume, startAt + duration - ramp);
        gain.gain.linearRampToValueAtTime(0, startAt + duration);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + duration);
      }
    }

    function requestPlayStep(timestamp) {
      if (!activePlay || !activeWorker || playInFlight) return;
      if (lastPlayStepAt !== 0 && timestamp - lastPlayStepAt < minPlayFrameMs) {
        playFrame = requestAnimationFrame(requestPlayStep);
        return;
      }
      lastPlayStepAt = timestamp;
      playInFlight = true;
      const dt = previousPlayTimestamp === 0 ? 1 / maxPlayFramesPerSecond : Math.min((timestamp - previousPlayTimestamp) / 1000, 0.1);
      previousPlayTimestamp = timestamp;
      activeWorker.postMessage({ action: "update", dt: dt });
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

    function syncSourceHighlightScroll() {
      sourceHighlightPane.scrollTop = source.scrollTop;
      sourceHighlightPane.scrollLeft = source.scrollLeft;
    }

    function updateSourceHighlight() {
      sourceHighlight.innerHTML = highlight(source.value, lex_tokenize);
      syncSourceHighlightScroll();
    }

    function fail(text, keepCodeTab) {
      diagnostic.textContent = text;
      diagnostic.hidden = false;
      setStatus("failed", "error");
      if (keepCodeTab) code.textContent = text;
      else showTab("output");
    }

    function setMode(next) {
      mode = next;
      modeButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
      });
      renderCode();
    }

    modeButtons.forEach(function (button) {
      button.addEventListener("click", function () { setMode(button.dataset.mode); });
    });

    function renderCode() {
      if (latestCode === null) return;
      const shown = mode === "program" ? latestCode.program : latestCode.code;
      code.innerHTML = highlightJavaScript(shown);
    }

    function compile(compileOnly) {
      stopPlay();
      const sample = samples[Number(select.value)];
      latestCode = null;
      code.textContent = "";
      tabCode.disabled = !compileOnly;
      if (!compileOnly) {
        stdout.textContent = "(no output)";
        stderr.textContent = "";
        stderr.hidden = true;
        diagnostic.textContent = "";
        diagnostic.hidden = true;
        showTab("output");
      }
      setStatus(compileOnly ? "compiling…" : "playing…");
      const started = performance.now();
      const worker = new Worker("./worker.js?rev=${sourceCommit}", { type: "module" });
      let done = false;
      const timer = setTimeout(function () {
        if (done) return;
        done = true;
        worker.terminate();
        fail("The program did not finish within 5 seconds.");
      }, 5000);
      worker.onmessage = function (event) {
        const data = event.data;
        if (data.tones) playToneEvents(data.tones);
        if (data.action === "step") {
          playInFlight = false;
          if (!activePlay) return;
          applyPlayFrame(data);
          if (data.status === 0) {
            playFrame = requestAnimationFrame(requestPlayStep);
          } else {
            activePlay = false;
            playStatus.textContent = "Stopped with status " + data.status;
            setStatus("stopped", "ok");
          }
          return;
        }
        if (["keydown", "keyup", "pointermove", "pointerdown", "pointerup"].includes(data.action)) {
          if (activeCanvas && data.pixels) applyPlayFrame(data);
          return;
        }
        if (data.action === "failure") {
          activePlay = false;
          playStatus.textContent = data.diagnostic;
          setStatus("failed", "error");
          return;
        }
        if (data.action === "keydown") return;
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (!data.play) worker.terminate();
        if (!compileOnly && data.output) stdout.textContent = data.output;
        if (data.stderr) {
          stderr.textContent = data.stderr;
          stderr.hidden = false;
        }
        if (data.code) {
          latestCode = data;
          renderCode();
          tabCode.disabled = false;
        }
        const canvasFrame = data.play || data.canvas;
        if (!compileOnly && canvasFrame) {
          applyPlayFrame(canvasFrame);
          playStatus.textContent = data.play ? data.play.hasUpdate ? "Playing · arrows or WASD" : "Canvas ready" : "One-time render";
          tabCanvas.hidden = false;
          showTab("canvas");
          if (data.play) playCanvas.focus({ preventScroll: true });
          if (data.play && data.play.hasUpdate && data.play.status === 0) {
            activeWorker = worker;
            activeCanvas = true;
            activePlay = true;
            lastPlayStepAt = 0;
            previousPlayTimestamp = 0;
            playFrame = requestAnimationFrame(requestPlayStep);
          } else if (data.play) {
            activeWorker = worker;
            activeCanvas = true;
            activePlay = false;
            if (data.play.hasUpdate) playStatus.textContent = "Stopped with status " + data.play.status;
          }
        }
        if (data.diagnostic) {
          fail(data.diagnostic, compileOnly);
        } else {
          setStatus(data.play ? !data.play.hasUpdate ? "ready" : data.play.status === 0 ? "playing" : "stopped" : (data.canvas ? "rendered in " : compileOnly ? "compiled in " : "played in ") + Math.round(performance.now() - started) + " ms", "ok");
        }
      };
      worker.onerror = function () {
        if (activeWorker === worker) {
          activePlay = false;
          activeCanvas = false;
          playStatus.textContent = "The game worker stopped unexpectedly.";
          setStatus("failed", "error");
          return;
        }
        if (done) return;
        done = true;
        clearTimeout(timer);
        worker.terminate();
        fail("The playground worker failed to start.");
      };
      worker.postMessage({ source: source.value, stdin: sample.stdin, args: sample.args, title: sample.label, portable: mode === "portable", compileOnly: compileOnly });
    }

    function run() {
      compile(false);
    }

    function compileOnly() {
      tabCode.disabled = false;
      showTab("code");
      compile(true);
    }

    function showSample() {
      const sample = samples[Number(select.value)];
      source.value = sample.source;
      updateSourceHighlight();
      describeSample(sample);
      history.replaceState(null, "", "?sample=" + encodeURIComponent(sample.id));
      run();
    }

    select.addEventListener("change", function () {
      unlockAudio();
      showSample();
    });
    source.addEventListener("input", function () {
      stopPlay();
      updateSourceHighlight();
    });
    source.addEventListener("scroll", syncSourceHighlightScroll);
    resetButton.addEventListener("click", showSample);
    runButton.addEventListener("click", function () {
      unlockAudio();
      run();
    });
    document.getElementById("compile").addEventListener("click", compileOnly);
    tabOutput.addEventListener("click", function () { showTab("output"); });
    tabCanvas.addEventListener("click", function () {
      showTab("canvas");
      playCanvas.focus({ preventScroll: true });
    });
    tabCode.addEventListener("click", function () { showTab("code"); });
    playCanvas.addEventListener("keydown", function (event) {
      if (!activeCanvas || !activeWorker) return;
      unlockAudio();
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
      activeWorker.postMessage({ action: "keydown", key: event.key });
    });
    playCanvas.addEventListener("keyup", function (event) {
      if (!activeCanvas || !activeWorker) return;
      activeWorker.postMessage({ action: "keyup", key: event.key });
    });
    playCanvas.addEventListener("pointermove", function (event) {
      if (!activeCanvas || !activeWorker) return;
      const bounds = playCanvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - bounds.left) * playCanvas.width / bounds.width);
      const y = Math.floor((event.clientY - bounds.top) * playCanvas.height / bounds.height);
      if (x >= 0 && x < playCanvas.width && y >= 0 && y < playCanvas.height) {
        activeWorker.postMessage({ action: "pointermove", x: x, y: y });
      }
    });
    playCanvas.addEventListener("pointerdown", function (event) {
      if (!activeCanvas || !activeWorker) return;
      unlockAudio();
      playCanvas.focus({ preventScroll: true });
      const point = playPoint(event);
      if (point) activeWorker.postMessage({ action: "pointerdown", x: point.x, y: point.y, button: event.button });
    });
    playCanvas.addEventListener("pointerup", function (event) {
      if (!activeCanvas || !activeWorker) return;
      const point = playPoint(event);
      if (point) activeWorker.postMessage({ action: "pointerup", x: point.x, y: point.y, button: event.button });
    });
    function playPoint(event) {
      const bounds = playCanvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - bounds.left) * playCanvas.width / bounds.width);
      const y = Math.floor((event.clientY - bounds.top) * playCanvas.height / bounds.height);
      return x >= 0 && x < playCanvas.width && y >= 0 && y < playCanvas.height ? { x: x, y: y } : null;
    }
    function tabKey(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const tabs = [tabOutput, tabCanvas, tabCode].filter(function (tab) {
        return !tab.hidden && !tab.disabled;
      });
      const current = tabs.findIndex(function (tab) { return tab.getAttribute("aria-selected") === "true"; });
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(current + delta + tabs.length) % tabs.length];
      showTab(next === tabCanvas ? "canvas" : next === tabCode ? "code" : "output");
      next.focus();
    }
    tabOutput.addEventListener("keydown", tabKey);
    tabCanvas.addEventListener("keydown", tabKey);
    tabCode.addEventListener("keydown", tabKey);
    source.addEventListener("keydown", function (event) {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = source.selectionStart;
        const end = source.selectionEnd;
        source.setRangeText("    ", start, end, "end");
        updateSourceHighlight();
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
    updateSourceHighlight();
    describeSample(samples[initial]);
    history.replaceState(null, "", "?sample=" + encodeURIComponent(samples[initial].id));
    run();
  </script>
</body>
</html>
`;
}

/// Render the catalog of runnable and planned samples, grouped by topic.
function renderSamplesIndex(): string {
    const groups = [...new Set(playgroundSamples.map((sample) => sample.group))];
    const sections = groups.map((group) => {
        const entries = playgroundSamples.filter((sample) => sample.group === group);
        if (entries.length === 0) return "";
        return `<section class="section sample-index-group"><div class="section-head"><h2>${escapeHtml(group)}</h2></div><div class="docs">${entries.map((sample) => {
            const planned = sample.status === "planned";
            const title = planned ? sample.label.replace(/\s*[—-]\s*planned$/i, "") : sample.label;
            const action = planned ? `<span class="badge">Planned</span>` : `<a href="../playground/?sample=${encodeURIComponent(sample.id)}">Open in playground &rarr;</a>`;
            return `<article class="doc sample-index-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(sample.note)}</p><footer>${action}</footer></article>`;
        }).join("")}</div></section>`;
    }).join("");
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>mini — samples</title>
  <meta name="description" content="Runnable and planned mini samples grouped by topic.">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../style.css?rev=${sourceCommit}">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">${renderBrand("../")}<nav aria-label="Site"><a href="../playground/">Playground</a><a href="../">Home</a></nav></header>
  <main id="main">
    <section class="section"><div class="section-head"><h1>Samples</h1><p>Browse runnable examples across Mini’s features. Open any runnable sample in the playground.</p></div></section>
    ${sections}
  </main>
  <footer class="site-footer"><p>${renderName("{{name}} is alpha software.")} <a href="${repo}/blob/main/LICENSE">Apache-2.0</a> licensed.</p>${renderSourceRevision()}</footer>
</body>
</html>`;
}

/// Build every site asset and print the written page.
function main(): void {
    const hero = loadSample(heroSample);
    const cards = samples.map(loadSample);
    rmSync(output, { recursive: true, force: true });
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, "index.html"), renderPage(hero, cards));
    writeFileSync(join(output, "build.json"), JSON.stringify({ commit: sourceCommit, shortCommit }) + "\n");
    writeFileSync(join(output, "style.css"), readFileSync(join(root, "site", "style.css")));
    cpSync(join(root, "site", "highlight.js"), join(output, "highlight.js"));
    cpSync(join(root, "brand", "mini-favicon.svg"), join(output, "favicon.svg"));
    const playground = join(output, "playground");
    mkdirSync(playground, { recursive: true });
    writeFileSync(join(playground, "compiler.js"), buildBrowserCompiler());
    writeFileSync(join(playground, "imports.js"), buildBrowserImports());
    writeFileSync(join(playground, "index.html"), renderPlayground(loadPlaygroundSamples()));
    const graphicalIndex = join(output, "samples");
    mkdirSync(graphicalIndex, { recursive: true });
    writeFileSync(join(graphicalIndex, "index.html"), renderSamplesIndex());
    cpSync(join(root, "site", "playground", "shim.js"), join(playground, "shim.js"));
    writeFileSync(join(playground, "worker.js"), buildBrowserWorker());
    cpSync(join(root, "site", "playground", "playground.css"), join(playground, "playground.css"));
    process.stdout.write(`wrote ${join(output, "index.html")}\n`);
}

try {
    main();
} catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
}
