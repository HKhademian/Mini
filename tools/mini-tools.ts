import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compiler, root, run } from './project.ts';

export type MiniTool = { source: string; parts: string[]; generated: string };

/** Load and validate the tool composition manifest. */
export function miniTools(directory = root): MiniTool[] {
  const manifest = JSON.parse(readFileSync(join(directory, 'tools/mini-tools.json'), 'utf8')) as { tools?: unknown };
  assert(Array.isArray(manifest.tools) && manifest.tools.length > 0, 'tools/mini-tools.json needs a nonempty tools list');
  const tools: MiniTool[] = manifest.tools.map((value, index) => {
    assert(typeof value === 'object' && value !== null, `tool ${index} must be an object`);
    const { source, parts, generated } = value as Record<string, unknown>;
    assert(typeof source === 'string' && source.endsWith('.mini'), `tool ${index} needs a .mini source`);
    assert(typeof generated === 'string' && generated.endsWith('.generated.ts'), `tool ${index} needs a .generated.ts target`);
    assert(Array.isArray(parts), `tool ${index} needs a parts list`);
    for (const part of parts) {
      assert(typeof part === 'string' && part.endsWith('.mini'), `tool ${index} parts must be .mini paths`);
      assert(part !== source, `tool ${source} cannot list itself as a part`);
      assert(!part.endsWith('50-main.mini'), `tool ${source} must supply its own entry`);
    }
    return { source, parts: parts as string[], generated };
  });
  assert.equal(new Set(tools.map(tool => tool.source)).size, tools.length, 'tool sources must be unique');
  assert.equal(new Set(tools.map(tool => tool.generated)).size, tools.length, 'generated targets must be unique');
  return tools;
}

/** Concatenate compiler parts and tool source, keeping the tool shebang first. */
export function composeTool(directory: string, tool: MiniTool): string {
  const source = readFileSync(join(directory, tool.source), 'utf8');
  let header = '';
  let body = source;
  if (source.startsWith('#!')) {
    const newline = source.indexOf('\n');
    header = newline === -1 ? source : source.slice(0, newline);
    body = newline === -1 ? '' : source.slice(newline + 1);
  }
  const parts = tool.parts.map(part => readFileSync(join(directory, part), 'utf8'));
  assert(parts.every(part => !part.startsWith('#!')), `${tool.source} parts must not contain a shebang`);
  return (header === '' ? '' : `${header}\n`) + parts.join('') + body;
}

/** Compile a composed tool with the active compiler and return its generated text. */
export function generateTool(directory: string, tool: MiniTool): string {
  const work = mkdtempSync(join(tmpdir(), 'mini-tool-'));
  try {
    const input = join(work, 'tool.mini');
    const output = join(work, 'tool.generated.ts');
    writeFileSync(input, composeTool(directory, tool));
    run(process.execPath, [join(directory, compiler(directory).entry), 'compile', input, output], directory);
    return readFileSync(output, 'utf8');
  } finally {
    rmSync(work, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  }
}

/** Regenerate every tracked tool from the manifest. */
export function buildTools(directory = root): void {
  for (const tool of miniTools(directory)) {
    writeFileSync(join(directory, tool.generated), generateTool(directory, tool));
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
  if (args[0] === '--check') verifyTools();
  else buildTools();
}
