import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { compiler, compilerHash, CompilerStage, root, run, selectRelease, sha256, versions } from './project.ts';
import { verifyBootstrap } from './verify.ts';
import { CaseKind, caseIdentity, loadCase, verifyScenario } from './cases.ts';

/** Build from source using the checkout's locked, locally installed packaging tool. */
export function packageVscode(directory: string, output: string, tooling = directory) {
  const version = versions(directory).vscode;
  assert(version !== null, 'VS Code extension version is unassigned');
  const packager = join(tooling, 'editors/vscode/node_modules/@vscode/vsce/vsce');
  assert(existsSync(packager), 'install VS Code development dependencies with npm ci in editors/vscode');
  const bundler = join(tooling, 'editors/vscode/node_modules/esbuild/bin/esbuild');
  assert(existsSync(bundler), 'install the VS Code extension bundler with npm ci in editors/vscode');
  const extension = join(directory, 'editors/vscode');
  mkdirSync(join(extension, 'dist'), { recursive: true });
  run(process.execPath, [bundler, join(extension, 'src/extension.ts'), '--bundle', '--platform=node',
    '--format=cjs', '--external:vscode', '--outfile=' + join(extension, 'dist/extension.cjs')], extension);
  mkdirSync(output, { recursive: true });
  const file = `mini-${versions(directory).group}-v${version}.vsix`;
  const destination = resolve(output, file);
  assert(!existsSync(destination), 'VSIX output already exists');
  run(process.execPath, [packager, 'package', '--no-dependencies', '--allow-missing-repository',
    '--skip-license', '--out', destination], extension);
  return { file, sha256: sha256(readFileSync(destination)) };
}

/** Package committed sources only. Never creates tags or publishes a release. */
export function prepareRelease(directory: string, output: string, tag?: string) {
  assert(run('git', ['status', '--porcelain'], directory).toString().trim() === '', 'release needs a clean checkout');
  const commit = run('git', ['rev-parse', 'HEAD'], directory).toString().trim();
  const current = versions(directory);
  const active = compiler(directory);
  const releasedComponent = tag === undefined ? null : selectRelease(tag, current);
  if (tag !== undefined) {
    assert(run('git', ['cat-file', '-t', `refs/tags/${tag}`], directory).toString().trim() === 'tag', 'release tag must be annotated');
    assert.equal(run('git', ['rev-parse', `refs/tags/${tag}^{commit}`], directory).toString().trim(), commit);
  }
  const available = JSON.parse(readFileSync(join(directory, 'config/bootstrap.json'), 'utf8')) !== null;
  const t0Preview = releasedComponent?.component === 'compiler' && active.stage === CompilerStage.T0;
  if (t0Preview) assert(releasedComponent.version.includes('-'), 'T0 previews require a prerelease version');
  const compilerRelease = releasedComponent !== null && ['mini', 'language', 'compiler', 'bootstrap'].includes(releasedComponent.component) && !t0Preview;
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
    const sample = active.stage === CompilerStage.T0 ? loadCase(join(source, active.example)) : null;
    if (sample) assert([CaseKind.Sample, CaseKind.Example, CaseKind.Feature].some(kind => kind === sample.definition.kind), 'T0 smoke case must compile and run Mini');
    const t0 = sample ? { identity: caseIdentity(sample), artifacts: sample.definition.cases.map(scenario => verifyScenario(sample, scenario, source)) } : null;
    const label = tag ?? `snapshot-${commit.slice(0, 12)}`;
    const title = t0Preview ? 'Mini T0 compiler preview' : releasedComponent?.component === 'cli' && bootstrap === null ? 'mini tooling preview' : label;
    const vsix = releasedComponent?.component === 'vscode' ? packageVscode(source, output, directory) : null;
    const manifest = { schemaVersion: 2, title, tag: tag ?? null, commit, group: current.group, componentVersions: current, releasedComponent,
      compiler: { ...active, hash: compilerHash(directory) }, node: process.version, bootstrap, t0, vsix };
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
