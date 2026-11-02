import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { root, run, selectRelease, sha256, versions } from './project.ts';
import { verifyBootstrap } from './verify.ts';

/** Package committed sources only. Never creates tags or publishes a release. */
export function prepareRelease(directory: string, output: string, tag?: string) {
  assert(run('git', ['status', '--porcelain'], directory).toString().trim() === '', 'release needs a clean checkout');
  const commit = run('git', ['rev-parse', 'HEAD'], directory).toString().trim();
  const current = versions(directory);
  const releasedComponent = tag === undefined ? null : selectRelease(tag, current);
  if (tag !== undefined) {
    assert(run('git', ['cat-file', '-t', `refs/tags/${tag}`], directory).toString().trim() === 'tag', 'release tag must be annotated');
    assert.equal(run('git', ['rev-parse', `refs/tags/${tag}^{commit}`], directory).toString().trim(), commit);
  }
  const available = JSON.parse(readFileSync(join(directory, 'config/bootstrap.json'), 'utf8')) !== null;
  const compilerRelease = releasedComponent !== null && ['mini', 'language', 'compiler', 'bootstrap'].includes(releasedComponent.component);
  assert(available || !compilerRelease, 'this release requires a verified compiler bootstrap');
  mkdirSync(output, { recursive: true });
  assert(readdirSync(output).length === 0, 'release output directory must be empty');
  const work = mkdtempSync(join(tmpdir(), 'minilang-release-'));
  try {
    const source = join(work, 'source');
    mkdirSync(source);
    const tracked = join(work, 'source.tar');
    writeFileSync(tracked, run('git', ['archive', '--format=tar', commit], directory));
    run('tar', ['-xf', tracked, '-C', source], work);
    // No .git or node_modules: check the actual distribution, including its links.
    run(join(source, 'bin/mini-check'), ['--docs'], source);
    const bootstrap = available ? verifyBootstrap(source) : null;
    const label = tag ?? `snapshot-${commit.slice(0, 12)}`;
    const title = releasedComponent?.component === 'cli' && bootstrap === null ? 'mini tooling preview' : label;
    const manifest = { schemaVersion: 1, title, tag: tag ?? null, commit, componentVersions: current, releasedComponent, node: process.version, bootstrap };
    assert(!existsSync(join(source, 'RELEASE.json')), 'RELEASE.json is reserved for packaged metadata');
    const record = JSON.stringify(manifest, null, 2) + '\n';
    writeFileSync(join(source, 'RELEASE.json'), record);
    const archive = `minilang-${label}.tar.gz`;
    run('tar', ['-czf', join(output, archive), '-C', source, '.'], work);
    const extracted = join(work, 'extracted');
    mkdirSync(extracted);
    run('tar', ['-xf', join(output, archive), '-C', extracted], work);
    run(join(extracted, 'bin/mini-check'), ['--docs'], extracted);
    writeFileSync(join(output, 'manifest.json'), record);
    writeFileSync(join(output, 'RELEASE-NOTES.md'), `# ${title}\n\nVersion: ${label}\n\nSource: ${commit}\n\nBootstrap: ${bootstrap === null ? 'unavailable' : 'verified fixed point'}\n\n${readFileSync(join(source, 'CHANGELOG.md'), 'utf8')}`);
    const assets = readdirSync(output).sort();
    writeFileSync(join(output, 'SHA256SUMS'), assets.map(name => `${sha256(readFileSync(join(output, name)))}  ${name}\n`).join(''));
    return manifest;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const [output, tag, ...extra] = process.argv.slice(2);
  assert(output !== undefined && extra.length === 0, 'usage: node tools/release.ts OUTPUT_DIRECTORY [COMPONENT_TAG]');
  console.log(JSON.stringify(prepareRelease(root, resolve(output), tag), null, 2));
}
