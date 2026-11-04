import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { compiler, root, run, versions } from './project.ts';
import { verifyTools } from './mini-tools.ts';
import { verifyBootstrap } from './verify.ts';
import { CaseKind, loadCases } from './cases.ts';

function documents(directory: string): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', '.cache'].includes(entry.name)) continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) documents(file);
    else if (/\.(md|mdc)$/.test(entry.name)) {
      const text = readFileSync(file, 'utf8');
      assert.equal((text.match(/^```/gm) ?? []).length % 2, 0, `unbalanced code fence: ${file}`);
      const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '');
      for (const match of prose.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = match[1]!.split('#')[0]!;
        if (target && !/^[a-z]+:/i.test(target)) {
          assert(existsSync(join(dirname(file), target)), `broken local link in ${file}: ${target}`);
        }
      }
    }
  }
}

/** Reject committed absolute home paths; evidence must use repository-relative paths. */
function portablePaths(directory: string): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', '.cache'].includes(entry.name)) continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { portablePaths(file); continue; }
    if (!/\.(json|ts|md|mdc|mini|yml|yaml|stdout|stderr|stdin|svg)$/.test(entry.name)) continue;
    const text = readFileSync(file, 'utf8');
    assert(!/(^|["'\s])\/(Users|home)\//.test(text), `absolute home path in ${file}`);
    assert(!/[A-Za-z]:\\Users\\/.test(text), `absolute home path in ${file}`);
    assert(!/\$HOME\//.test(text), `home variable path in ${file}`);
  }
}
export function checkProject(): void {
  verifyTools(root);
  run(process.execPath, [join(root, 'tools/build-m1.generated.ts'), '--check'], root);
  const current = versions(root);
  const editor = JSON.parse(readFileSync(join(root, 'editors/vscode/package.json'), 'utf8')) as { version: string };
  const editorLock = JSON.parse(readFileSync(join(root, 'editors/vscode/package-lock.json'), 'utf8')) as { version: string; packages: Record<string, { version: string }> };
  assert.equal(editor.version, current.vscode, 'VS Code version must match the registry');
  assert(!editor.version.includes('-'), 'VS Code versions require plain MAJOR.MINOR.PATCH');
  assert.equal(editorLock.version, editor.version, 'VS Code lockfile version differs');
  assert.equal(editorLock.packages['']?.version, editor.version, 'VS Code lockfile package version differs');
  assert.equal(Number(process.versions.node.split('.')[0]), 24, 'use Node 24; see .node-version');
  assert(Number(process.versions.node.split('.')[1]) >= 16, 'use Node 24.16.0 or newer in the 24.x line');
  const fixtures = loadCases();
  const covered = new Set(fixtures.flatMap(item => item.definition.kind === CaseKind.Tool ? [] : [resolve(dirname(item.path), item.definition.source)]));
  for (const directory of ['samples', 'examples']) {
    const path = join(root, directory);
    if (!existsSync(path)) continue;
    for (const entry of readdirSync(path, { recursive: true, encoding: 'utf8' })) {
      if (entry.endsWith('.mini')) assert(covered.has(resolve(path, entry)), `missing case: ${directory}/${entry}`);
    }
  }
documents(root);
portablePaths(root);
const bootstrap = JSON.parse(readFileSync(join(root, 'config/bootstrap.json'), 'utf8')) as { compiler: string } | null;
assert(bootstrap !== null, 'self-hosted bootstrap unavailable; promote a generated compiler');
assert.equal(compiler().entry, bootstrap.compiler, 'active compiler must be the generated bootstrap');
verifyBootstrap(root);
console.log('Repository checks and bootstrap fixed point passed.');
}

if (import.meta.main) checkProject();
