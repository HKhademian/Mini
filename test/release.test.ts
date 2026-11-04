import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { test } from 'node:test';
import { root, run, sha256, versions } from './support.ts';

function fixture() {
  const work = mkdtempSync(join(tmpdir(), 'mini-vscode-release-'));
  const directory = join(work, 'project');
  cpSync(root, directory, {
    recursive: true, verbatimSymlinks: true,
    filter: source => !['.git', 'node_modules', '.cache'].includes(basename(source))
      && !source.includes('/dist/release/') && !source.endsWith('/dist/release'),
  });
  const git = (...args: string[]) => run('git', [
    '-c', 'user.name=Release fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgSign=false', '-c', 'tag.gpgSign=false',
    '-c', 'maintenance.auto=false', '-c', 'gc.auto=0', ...args,
  ], directory);
  git('init', '-b', 'main');
  git('add', '.');
  git('commit', '-m', 'release fixture');
  writeFileSync(join(directory, '.git/info/exclude'), 'editors/vscode/node_modules\n');
  symlinkSync(join(root, 'editors/vscode/node_modules'), join(directory, 'editors/vscode/node_modules'), 'dir');
  return { work, directory, git };
}

function release(directory: string, output: string, tag?: string) {
  return spawnSync(process.execPath, [join(directory, 'bin/mini-release'), output, ...(tag === undefined ? [] : [tag])],
    { cwd: directory, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

test('VS Code releases build a checksummed VSIX from the annotated source revision', () => {
  const { work, directory, git } = fixture();
  try {
    const current = versions(directory);
    const version = current.vscode;
    const tag = `vscode-v${current.group}-v${version}`;
    const output = join(work, 'release');
    git('tag', tag);
    const lightweight = release(directory, output, tag);
    assert.equal(lightweight.status, 1);
    assert.match(lightweight.stderr, /release tag must be annotated/);
    git('tag', '-d', tag);
    git('tag', '-a', tag, '-m', tag);
    const built = release(directory, output, tag);
    assert.equal(built.status, 0, built.stderr);
    assert.equal(built.stdout, 'Release prepared.\n');
    const manifest = JSON.parse(readFileSync(join(output, 'manifest.json'), 'utf8'));
    assert.deepEqual(manifest.releasedComponent, { component: 'vscode', group: current.group, version });
    assert.equal(manifest.schemaVersion, 2);
    assert.equal(manifest.group, current.group);
    assert.equal(manifest.commit, git('rev-parse', 'HEAD').toString().trim());
    assert(manifest.bootstrap !== null, 'release records the verified bootstrap');
    assert.equal(manifest.bootstrap.compiler, sha256(readFileSync(join(directory, 'dist/compile.ts'))));
    assert.ok(manifest.vsix);
    const file = join(output, manifest.vsix.file);
    assert.equal(manifest.vsix.file, `mini-${current.group}-v${version}.vsix`);
    assert.equal(manifest.vsix.sha256, sha256(readFileSync(file)));
    const packaged = (path: string) => run('unzip', ['-p', file, `extension/${path}`], work);
    for (const path of ['package.json', 'language-configuration.json', 'syntaxes/mini.tmLanguage.json', 'icons/mini-dark.svg', 'icons/mini-light.svg']) {
      assert.deepEqual(packaged(path), readFileSync(join(directory, 'editors/vscode', path)));
    }
    assert.deepEqual(packaged('readme.md'), readFileSync(join(directory, 'editors/vscode/README.md')));
    assert.match(packaged('dist/extension.cjs').toString(), /async function activate\(/);
    assert.equal(run('unzip', ['-Z1', file], work).toString().trim().split('\n').length, 9);
    for (const line of readFileSync(join(output, 'SHA256SUMS'), 'utf8').trim().split('\n')) {
      const [hash, asset] = line.split('  ');
      assert.equal(sha256(readFileSync(join(output, asset!))), hash, asset);
    }
    const extracted = join(work, 'extracted');
    mkdirSync(extracted);
    run('tar', ['-xf', join(output, `minilang-${tag}.tar.gz`), '-C', extracted], work);
    assert.deepEqual(JSON.parse(readFileSync(join(extracted, 'RELEASE.json'), 'utf8')), manifest);
    assert(!existsSync(join(extracted, 'editors/vscode/node_modules')));
    writeFileSync(join(directory, 'dirty.txt'), 'changed');
    const dirty = release(directory, join(work, 'dirty'), tag);
    assert.equal(dirty.status, 1);
    assert.match(dirty.stderr, /release needs a clean checkout/);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test('repository checks reject extension package and lockfile version drift', () => {
  const { work, directory } = fixture();
  try {
    const editor = join(directory, 'editors/vscode');
    const packageFile = join(editor, 'package.json');
    const packageText = readFileSync(packageFile, 'utf8');
    const check = () => run(process.execPath, ['bin/mini-check', '--docs'], directory);
    writeFileSync(packageFile, JSON.stringify({ ...JSON.parse(packageText), version: '9999.0.0' }));
    assert.throws(check, /VS Code version must match the registry/);
    writeFileSync(packageFile, packageText);
    const lockFile = join(editor, 'package-lock.json');
    const lock = JSON.parse(readFileSync(lockFile, 'utf8'));
    const originalVersion = lock.version;
    lock.version = '9999.0.0';
    writeFileSync(lockFile, JSON.stringify(lock));
    assert.throws(check, /VS Code lockfile version differs/);
    lock.version = originalVersion;
    lock.packages[''].version = '9999.0.0';
    writeFileSync(lockFile, JSON.stringify(lock));
    assert.throws(check, /VS Code lockfile package version differs/);
    const registryFile = join(directory, 'config/versions.json');
    const registry = JSON.parse(readFileSync(registryFile, 'utf8'));
    registry.vscode = originalVersion + '-alpha.1';
    lock.version = registry.vscode;
    lock.packages[''].version = registry.vscode;
    writeFileSync(registryFile, JSON.stringify(registry));
    writeFileSync(packageFile, JSON.stringify({ ...JSON.parse(packageText), version: registry.vscode }));
    writeFileSync(lockFile, JSON.stringify(lock));
    assert.throws(check, /VS Code versions require plain MAJOR.MINOR.PATCH/);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});
