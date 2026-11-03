import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prepareRelease } from './release.ts';
import { root, run } from './project.ts';

// GitHub's custom shell passes a file containing the task name, not shell code.
const taskFile = process.argv[2];
assert(taskFile !== undefined, 'CI task file required');
const task = readFileSync(taskFile, 'utf8').trim();
const mini = (...args: string[]) => process.stdout.write(run(process.execPath, ['bin/mini', ...args], root));

switch (task) {
  case 'install':
    process.stdout.write(run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], root));
    process.stdout.write(run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], join(root, 'editors/vscode')));
    break;
  case 'check': mini('check'); break;
  case 'test':
    mini('test');
    process.stdout.write(run(process.execPath, ['--test', 'compiler/analysis.test.ts'], root));
    process.stdout.write(run(process.execPath, ['--test', 'compiler/builtins.test.ts'], root));
    process.stdout.write(run(process.execPath, ['--test', 'compiler/m1.test.ts'], root));
    process.stdout.write(run(process.execPath, ['--test', 'tools/format.test.ts'], root));
    process.stdout.write(run(process.execPath, ['--test', 'test/grammar.test.ts'], join(root, 'editors/vscode')));
    process.stdout.write(run(process.execPath, ['--test', 'tools/release.test.ts'], root));
    process.stdout.write(run(process.execPath, ['tools/application-performance.ts', '--check'], root));
    break;
  case 'bench':
    mini('bench', '.cache/bench-ci.json', 'tooling.check');
    mini('bench', '.cache/bench-t0-ci.json', 'compiler.bindings-emission');
    break;
  case 'package': {
    const tag = process.env['GITHUB_EVENT_NAME'] === 'push' && process.env['GITHUB_REF_TYPE'] === 'tag'
      ? process.env['GITHUB_REF_NAME'] : undefined;
    prepareRelease(root, join(root, 'dist/release'), tag);
    break;
  }
  case 'publish': {
    assert.equal(process.env['GITHUB_EVENT_NAME'], 'push');
    assert.equal(process.env['GITHUB_REF_TYPE'], 'tag');
    const tag = process.env['GITHUB_REF_NAME'];
    const directory = join(root, 'dist/release');
    const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8')) as {
      title: string; tag: string; releasedComponent: { version: string };
    };
    assert.equal(manifest.tag, tag);
    assert(typeof tag === 'string');
    const { readdirSync } = await import('node:fs');
    const args = [
      'release', 'create', tag, ...readdirSync(directory).map(file => join(directory, file)),
      '--draft', '--verify-tag', '--latest=false', '--title', manifest.title,
      '--notes-file', join(directory, 'RELEASE-NOTES.md'),
    ];
    if (manifest.releasedComponent.version.includes('-')) args.push('--prerelease');
    process.stdout.write(run('gh', args, root));
    process.stdout.write(run('gh', ['release', 'edit', tag, '--draft=false', '--latest=false'], root));
    break;
  }
  default: throw new Error(`Unknown CI task: ${task}`);
}
