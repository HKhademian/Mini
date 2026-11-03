import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const streams = {
  mini: 'mini', lang: 'language', compiler: 'compiler', bootstrap: 'bootstrap',
  std: 'std', vscode: 'vscode',
  check: 'check', verify: 'verify', release: 'release', test: 'test', bench: 'bench', cli: 'cli',
} as const;
export type Component = typeof streams[keyof typeof streams];
export type Versions = Record<Component, string | null>;
export const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:alpha|beta|rc)\.(0|[1-9]\d*))?$/;

export function versions(directory: string): Versions {
  const value = JSON.parse(readFileSync(join(directory, 'config/versions.json'), 'utf8')) as Versions;
  assert.deepEqual(Object.keys(value).sort(), Object.values(streams).sort());
  for (const version of Object.values(value)) {
    assert(version === null || (typeof version === 'string' && versionPattern.test(version)), `invalid version: ${version}`);
  }
  return value;
}

export function selectRelease(tag: string, current: Versions): { component: Component; version: string } {
  const match = /^(mini|lang|compiler|bootstrap|std|check|verify|release|test|bench|cli|vscode)-v(.+)$/.exec(tag);
  assert(match, `invalid component tag: ${tag}`);
  const component = streams[match[1] as keyof typeof streams];
  const version = match[2]!;
  assert(versionPattern.test(version), `invalid release version: ${version}`);
  assert(version === current[component], `tag must match assigned ${component} version`);
  return { component, version };
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
