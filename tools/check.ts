import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { compiler, CompilerStage, root, versions } from './project.ts';
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
export function checkProject(): void {
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
const bootstrap = JSON.parse(readFileSync(join(root, 'config/bootstrap.json'), 'utf8')) as { compiler: string } | null;
if (bootstrap === null) {
  assert.equal(compiler().stage, CompilerStage.T0);
  assert(existsSync(join(root, compiler().entry)), 'T0 compiler missing');
  assert(current.language !== null && current.compiler !== null, 'assign language/compiler versions');
  assert.equal(current.bootstrap, null);
  console.log('Repository checks passed. T0 available; self-hosted bootstrap unavailable.');
} else {
  assert.equal(compiler().stage, CompilerStage.SelfHosted);
  assert.equal(compiler().entry, bootstrap.compiler, 'active compiler must be the generated bootstrap');
  verifyBootstrap(root);
  console.log('Repository checks and bootstrap fixed point passed.');
}
}

if (import.meta.main) checkProject();
