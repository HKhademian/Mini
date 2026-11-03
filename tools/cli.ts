import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compiler, releaseTag, root, run, versions, type Component } from './project.ts';

const names: Record<string, Component> = { check: 'check', verify: 'verify', release: 'release', test: 'test', bench: 'bench', compile: 'compiler' };
const help = 'mini: tiny self-hosting foundation for language projects\nUsage: mini check [--docs | SOURCE.mini | -] | test [FILTER] | bench OUTPUT [FILTER] | verify [CASE.json] | release OUTPUT [TAG] | compile\nAliases: mini-check, mini-test, mini-bench, mini-verify, mini-release, mini-compile, minic\n';

export async function main(executable: string): Promise<void> {
  try {
    const args = process.argv.slice(2);
    if (executable === 'mini' && (args.length === 0 || args[0] === '--help')) { process.stdout.write(help); return; }
    const current = versions(root);
    if (executable === 'mini' && args[0] === '--version') {
      console.log(`${releaseTag('mini', current)}\n${releaseTag('cli', current)}`); return;
    }
    const command = executable === 'mini' ? args.shift()! : executable === 'minic' ? 'compile' : executable.replace(/^mini-/, '');
    const component = names[command];
    assert(component !== undefined, `unknown command: ${command}`);
    if (args[0] === '--version') { console.log(releaseTag(component, current)); return; }
    switch (command) {
      case 'check': {
        if (args.length === 0) {
          run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--noEmit'], root);
          (await import('./check.ts')).checkProject();
          break;
        }
        if (args.length === 1 && args[0] === '--docs') {
          (await import('./check.ts')).checkProject();
          break;
        }
        assert(args.length === 1, 'usage: mini-check [--docs | SOURCE.mini | -]');
        const path = args[0]!;
        assert(path === '-' || path.endsWith('.mini'), 'Mini source must use .mini');
        let source: string;
        try {
          source = readFileSync(path === '-' ? 0 : resolve(path), 'utf8');
        } catch {
          throw new Error(`cannot read ${path}`);
        }
        const diagnostic = (await import('./source-check.ts')).checkSource(source, path === '-' ? '<stdin>' : path);
        if (diagnostic !== null) {
          console.error(diagnostic);
          process.exitCode = 1;
        }
        break;
      }
      case 'test':
        assert(args.length <= 1, 'usage: mini-test [FILTER]');
        (await import('./test.ts')).testCases(args[0]);
        break;
      case 'bench':
        assert(args[0] !== undefined && args.length <= 2, 'usage: mini-bench OUTPUT [FILTER]');
        (await import('./bench.ts')).benchmark(resolve(args[0]), args[1]);
        break;
      case 'verify':
        assert(args.length <= 1, 'usage: mini-verify [CASE.json]');
        if (args[0] === undefined) console.log(JSON.stringify((await import('./verify.ts')).verifyBootstrap(root), null, 2));
        else (await import('./test.ts')).testCases('', resolve(args[0]));
        break;
      case 'release':
        assert(args[0] !== undefined && args.length <= 2, 'usage: mini-release OUTPUT [TAG]');
        (await import('./release.ts')).prepareRelease(root, resolve(args[0]), args[1]);
        console.log('Release prepared.');
        break;
      case 'compile': {
        if (args[0] === '--tokens') {
          assert(args.length === 2, 'usage: mini-compile --tokens SOURCE.mini');
          process.stdout.write(run(process.execPath, [join(root, compiler().entry), 'tokens', resolve(args[1]!)], process.cwd()));
          break;
        }
        assert(args[0] !== undefined && args.length <= 2, 'usage: mini-compile SOURCE.mini [OUTPUT.ts]');
        const source = resolve(args[0]);
        assert(source.endsWith('.mini'), 'Mini source must use .mini');
        const output = args[1] === undefined ? source + '.ts' : resolve(args[1]);
        const { spawnSync } = await import('node:child_process');
        const result = spawnSync(process.execPath, [join(root, compiler().entry), 'compile', source, output], { stdio: 'inherit' });
        if (result.error) throw result.error;
        process.exitCode = result.status ?? 1;
        break;
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
