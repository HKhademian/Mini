import assert from 'node:assert/strict';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { compiler, root, run } from './project.ts';

export type MiniTool = { source: string; generated: string };
export type MiniLauncher = { name: string; tool?: string };

/** Load and validate the tool composition manifest. */
export function miniTools(directory = root): MiniTool[] {
  const manifest = JSON.parse(readFileSync(join(directory, 'tools/mini-tools.json'), 'utf8')) as { tools?: unknown };
  assert(Array.isArray(manifest.tools) && manifest.tools.length > 0, 'tools/mini-tools.json needs a nonempty tools list');
  const tools: MiniTool[] = manifest.tools.map((value, index) => {
    assert(typeof value === 'object' && value !== null, `tool ${index} must be an object`);
    const { source, generated } = value as Record<string, unknown>;
    assert(typeof source === 'string' && source.endsWith('.mini'), `tool ${index} needs a .mini source`);
    assert(typeof generated === 'string' && generated.endsWith('.generated.ts'), `tool ${index} needs a .generated.ts target`);
    return { source, generated };
  });
  assert.equal(new Set(tools.map(tool => tool.source)).size, tools.length, 'tool sources must be unique');
  assert.equal(new Set(tools.map(tool => tool.generated)).size, tools.length, 'generated targets must be unique');
  return tools;
}

/** Load and validate the bin launcher manifest. */
export function miniLaunchers(directory = root): MiniLauncher[] {
  const manifest = JSON.parse(readFileSync(join(directory, 'tools/mini-tools.json'), 'utf8')) as { launchers?: unknown };
  assert(Array.isArray(manifest.launchers) && manifest.launchers.length > 0, 'tools/mini-tools.json needs a nonempty launchers list');
  const launchers = manifest.launchers.map((value, index) => {
    assert(typeof value === 'object' && value !== null, `launcher ${index} must be an object`);
    const { name, tool } = value as Record<string, unknown>;
    assert(typeof name === 'string' && /^(mini|minic|mini-[a-z]+(?:-[a-z]+)*)$/.test(name), `invalid launcher name: ${name}`);
    assert(tool === undefined || (typeof tool === 'string' && tool.endsWith('.generated.ts')), `launcher ${name} needs a generated tool`);
    return { name, ...(tool === undefined ? {} : { tool }) };
  });
  assert.equal(new Set(launchers.map(launcher => launcher.name)).size, launchers.length, 'launcher names must be unique');
  return launchers;
}

/** Return launcher text for a command or generated tool. */
export function launcherSource(launcher: MiniLauncher): string {
  if (launcher.tool === undefined) {
    return "#!/usr/bin/env node\nimport { basename } from 'node:path';\nimport { main } from '../tools/cli.ts';\nawait main(basename(process.argv[1]));\n";
  }
  return "#!/usr/bin/env node\nimport { pathToFileURL } from 'node:url';\nimport { dirname, join } from 'node:path';\n"
    + `await import(pathToFileURL(join(import.meta.dirname, '..', '${launcher.tool}')).href);\n`;
}

/** Regenerate every bin launcher from the manifest. */
export function buildLaunchers(directory = root): void {
  for (const launcher of miniLaunchers(directory)) {
    const path = join(directory, 'bin', launcher.name);
    rmSync(path, { force: true });
    writeFileSync(path, launcherSource(launcher));
    chmodSync(path, 0o755);
  }
}

/** Reject a launcher that differs from the manifest or is not executable. */
export function verifyLaunchers(directory = root): void {
  for (const launcher of miniLaunchers(directory)) {
    const path = join(directory, 'bin', launcher.name);
    assert.equal(readFileSync(path, 'utf8'), launcherSource(launcher), `bin/${launcher.name} is stale; run node tools/mini-tools.ts`);
    assert((statSync(path).mode & 0o111) !== 0, `bin/${launcher.name} must be executable`);
  }
}

/** Compile a tool source, resolving its include directives, and return generated text. */
export function generateTool(directory: string, tool: MiniTool): string {
  const work = mkdtempSync(join(tmpdir(), 'mini-tool-'));
  try {
    const output = join(work, 'tool.generated.ts');
    run(process.execPath, [join(directory, compiler(directory).entry), 'compile', join(directory, tool.source), output], directory);
    return readFileSync(output, 'utf8');
  } finally {
    rmSync(work, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  }
}

/** Regenerate every tracked tool from the manifest. */
export function buildTools(directory = root): void {
  for (const tool of miniTools(directory)) {
    const target = join(directory, tool.generated);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, generateTool(directory, tool));
  }
}

/** Reject a tracked tool that differs from a fresh compilation. */
export function verifyTools(directory = root): void {
  for (const tool of miniTools(directory)) {
    const tracked = readFileSync(join(directory, tool.generated), 'utf8');
    const generated = generateTool(directory, tool);
    assert(tracked === generated, `${tool.generated} is stale; run node tools/mini-tools.ts`);
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  assert(args.length <= 1 && (args[0] === undefined || args[0] === '--check'), 'usage: node tools/mini-tools.ts [--check]');
  if (args[0] === '--check') {
    verifyTools();
    verifyLaunchers();
  } else {
    buildTools();
    buildLaunchers();
  }
}
