import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { root, run, type Versions } from '../../tools/project.ts';

export const initial: Versions = JSON.parse(readFileSync(join(root, 'config/versions.json'), 'utf8'));

export function fixture(bootstrap = false): string {
  const directory = mkdtempSync(join(tmpdir(), 'minilang-test-'));
  for (const file of ['tools', 'bin', 'config', 'package.json', '.node-version']) cpSync(join(root, file), join(directory, file), { recursive: true, verbatimSymlinks: true });
  cpSync(join(root, 'cases'), join(directory, 'cases'), { recursive: true });
  writeFileSync(join(directory, 'README.md'), '# Synthetic packaging fixture\n');
  writeFileSync(join(directory, 'CHANGELOG.md'), '# Fixture changes\n');
  writeFileSync(join(directory, '.gitignore'), 'dist/\n.cache/\nnode_modules/\n');
  writeFileSync(join(directory, 'config/versions.json'), JSON.stringify(bootstrap ? { ...initial, language: '0.1.0', compiler: '0.1.0', bootstrap: '0.1.0' } : initial));
  writeFileSync(join(directory, 'config/bootstrap.json'), 'null\n');
  if (bootstrap) {
    // A synthetic reproducing program exercises the verifier. This is not MiniLang.
    const compiler = readFileSync(join(root, 'cases/tooling/reproducer.ts'), 'utf8');
    writeFileSync(join(directory, 'seed.ts'), compiler);
    cpSync(join(root, 'cases/tooling/compiler-input.txt'), join(directory, 'source.txt'));
    mkdirSync(join(directory, 'example'));
    cpSync(join(root, 'cases/tooling/example-input.txt'), join(directory, 'example/source.mini'));
    cpSync(join(root, 'cases/tooling/synthetic-example.json'), join(directory, 'example/fixture.case.json'));
    for (const name of ['stdin', 'stdout', 'stderr']) cpSync(join(root, `cases/tooling/synthetic-example.${name}.json`), join(directory, `example/${name}.json`));
    writeFileSync(join(directory, 'config/bootstrap.json'), JSON.stringify({ compiler: 'seed.ts', source: 'source.txt', example: 'example/fixture.case.json' }));
  }
  run('git', ['init', '-b', 'main'], directory);
  run('git', ['config', 'commit.gpgSign', 'false'], directory);
  run('git', ['config', 'tag.gpgSign', 'false'], directory);
  run('git', ['add', '.'], directory);
  run('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture'], directory);
  return directory;
}

export function annotatedTag(directory: string, tag: string): void {
  run('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'tag', '-a', tag, '-m', tag], directory);
}
