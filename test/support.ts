import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const streams = {
  mini: 'mini', lang: 'language', compiler: 'compiler', bootstrap: 'bootstrap',
  std: 'std', builtins: 'builtins', vscode: 'vscode',
  check: 'check', format: 'format', verify: 'verify', release: 'release', test: 'test', bench: 'bench', cli: 'cli', lsp: 'lsp',
} as const;
export type Component = typeof streams[keyof typeof streams];
export type Versions = Record<Component, string | null> & { group: string };
export const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:alpha|beta|rc)\.(0|[1-9]\d*))?$/;

export function versions(directory: string): Versions {
  const value = JSON.parse(readFileSync(join(directory, 'config/versions.json'), 'utf8')) as Versions;
  assert.deepEqual(Object.keys(value).sort(), ['group', ...Object.values(streams)].sort());
  assert(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value.group), 'group requires MAJOR.MINOR.PATCH');
  for (const version of Object.values(value)) {
    assert(version === null || (typeof version === 'string' && versionPattern.test(version)), `invalid version: ${version}`);
  }
  return value;
}

export function releaseTag(component: Component, current: Versions): string {
  const name = Object.keys(streams).find(name => streams[name as keyof typeof streams] === component)!;
  assert(current[component] !== null, `assign the ${component} version before tagging`);
  return `${name}-v${current.group}-v${current[component]}`;
}

export function selectRelease(tag: string, current: Versions): { component: Component; group: string; version: string } {
  const match = /^(mini|lang|compiler|bootstrap|builtins|std|check|format|verify|release|test|bench|cli|lsp|vscode)-v([0-9]+\.[0-9]+\.[0-9]+)-v(.+)$/.exec(tag);
  assert(match, `invalid component tag: ${tag}`);
  const component = streams[match[1] as keyof typeof streams];
  const group = match[2]!;
  assert(group === current.group, 'tag must match assigned group version');
  const version = match[3]!;
  assert(versionPattern.test(version), `invalid release version: ${version}`);
  assert(version === current[component], `tag must match assigned ${component} version`);
  return { component, group, version };
}

export function run(command: string, args: string[], cwd: string, input?: string | Buffer): Buffer {
  const result = spawnSync(command, args, { cwd, input, timeout: 120_000, maxBuffer: 32 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed:\n${result.stdout?.toString()}${result.stderr?.toString()}`);
  return result.stdout;
}

export function sha256(bytes: string | Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export type Compiler = { entry: string; sources: string[]; example: string };
export function compiler(directory = root): Compiler {
  return JSON.parse(readFileSync(join(directory, 'config/compiler.json'), 'utf8'));
}

export function compilerHash(directory = root): string {
  return sha256(compiler(directory).sources.map(path => path + '\0' + readFileSync(join(directory, path), 'utf8')).join('\0'));
}
