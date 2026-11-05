/// Build the static showcase into dist/site.
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

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
const output = join(root, "dist", "site");

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
        "Mini is the starting point for your language, not the finished language. Start from the reviewed contract and add only what your target needs.",
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
        "Why Mini",
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

/// Render a fenced code block.
function codeBlock(text: string, className: string): string {
    return `<pre class="${className}"><code>${escapeHtml(text)}</code></pre>`;
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
        </article>`;
}

/// Render the hero section.
function renderHero(sample: RenderedSample): string {
    return `<section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Alpha &middot; Node 22.18+ &middot; Apache-2.0</p>
          <h1>A tiny self-hosting foundation for building other languages.</h1>
          <p class="lede">Clone Mini, grow your own language, and keep the compiler compiling itself after every change.</p>
          <p class="actions">
            <a class="button" href="${repo}/blob/main/docs/getting-started.md">Get started</a>
            <a class="button ghost" href="${repo}/blob/main/docs/why-mini.md">Why Mini</a>
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
        </figure>
      </section>`;
}

/// Render one "why" card.
function renderWhyCard(title: string, body: string): string {
    return `<article class="feature">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(body)}</p>
          </article>`;
}

/// Render one documentation link card.
function renderDocCard(title: string, body: string, href: string): string {
    return `<a class="doc" href="${href}">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(body)}</p>
          </a>`;
}

/// Render the complete page.
function renderPage(hero: RenderedSample, cards: readonly RenderedSample[]): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mini &mdash; a self-hosting foundation for language projects</title>
  <meta name="description" content="Mini is a tiny self-hosting foundation for building other languages. Clone it, grow your own language, and keep the compiler compiling itself.">
  <meta name="theme-color" content="#0a0d12" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f7f9fc" media="(prefers-color-scheme: light)">
  <link rel="icon" href="./favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>

  <header class="site-header">
    <a class="brand" href="./" aria-label="Mini home">
      <svg viewBox="0 0 16 16" width="22" height="22" aria-hidden="true"><path d="M2.5 13V3l5.5 7L13.5 3v10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span>mini</span>
    </a>
    <nav aria-label="Site">
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
        <p>Mini stays useful only while the compiler still compiles itself. The foundation is designed around that constraint.</p>
      </header>
      <div class="features">
        ${whyCards.map((card) => renderWhyCard(card[0], card[1])).join("\n        ")}
      </div>
      <p class="callout">If you want the smallest possible self-hosted demonstration, Mini is bigger than that. If you want a starting point that survives changes, that extra is what you are choosing.</p>
    </section>

    <section class="section" id="install">
      <header class="section-head">
        <h2>Run it in a minute</h2>
        <p>Node.js 22.18.0 or newer. The compiler installs no packages.</p>
      </header>
      <ol class="steps">
        <li>
          <h3>Get the source</h3>
          ${codeBlock(`git clone ${repo}.git\ncd Mini`, "step-code")}
        </li>
        <li>
          <h3>Build the generated tools</h3>
          ${codeBlock("./bin/bootstrap", "step-code")}
        </li>
        <li>
          <h3>Run a sample</h3>
          ${codeBlock("./bin/mini run samples/018-list-to-text.mini", "step-code")}
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
    <p>Mini is alpha software. <a href="${repo}/blob/main/LICENSE">Apache-2.0</a> licensed.</p>
    <p>Generated with Mini, from this repository.</p>
  </footer>
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
    cpSync(join(root, "editors/vscode/icons/mini-light.svg"), join(output, "favicon.svg"));
    process.stdout.write(`wrote ${join(output, "index.html")}\n`);
}

try {
    main();
} catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
}
