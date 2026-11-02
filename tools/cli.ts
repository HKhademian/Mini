import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { root, run, versions, type Component } from './project.ts';

const names: Record<string, Component> = { check: 'check', verify: 'verify', release: 'release', test: 'test', bench: 'bench', compile: 'compiler' };
const help = 'mini: tiny self-hosting foundation for language projects\nUsage: mini check [--docs] | test [FILTER] | bench OUTPUT [FILTER] | verify | release OUTPUT [TAG] | compile\nAliases: mini-check, mini-test, mini-bench, mini-verify, mini-release, mini-compile, minic\n';

export async function main(executable: string): Promise<void> {
  try {
    const args = process.argv.slice(2);
    if (executable === 'mini' && (args.length === 0 || args[0] === '--help')) { process.stdout.write(help); return; }
    const current = versions(root);
    if (executable === 'mini' && args[0] === '--version') {
      console.log(`mini ${current.mini}\nmini CLI ${current.cli}`); return;
    }
    const command = executable === 'mini' ? args.shift()! : executable === 'minic' ? 'compile' : executable.replace(/^mini-/, '');
    const component = names[command];
    assert(component !== undefined, `unknown command: ${command}`);
    if (args[0] === '--version') { console.log(`mini-${command} ${current[component] ?? 'unavailable'}`); return; }
    switch (command) {
      case 'check': {
        assert(args.length === 0 || (args.length === 1 && args[0] === '--docs'), 'usage: mini-check [--docs]');
        if (args.length === 0) run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--noEmit'], root);
        (await import('./check.ts')).checkProject(); break;
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
        assert(args.length === 0, 'usage: mini-verify');
        console.log(JSON.stringify((await import('./verify.ts')).verifyBootstrap(root), null, 2));
        break;
      case 'release':
        assert(args[0] !== undefined && args.length <= 2, 'usage: mini-release OUTPUT [TAG]');
        console.log(JSON.stringify((await import('./release.ts')).prepareRelease(root, resolve(args[0]), args[1]), null, 2));
        break;
      case 'compile': {
        assert(args[0] !== undefined && args.length <= 2, 'usage: mini-compile SOURCE.mini [OUTPUT.ts]');
        const { readFileSync } = await import('node:fs');
        const config = JSON.parse(readFileSync(join(root, 'config/bootstrap.json'), 'utf8')) as { compiler: string } | null;
        assert(config !== null, 'Mini compiler unavailable: not implemented yet.');
        const source = resolve(args[0]);
        assert(source.endsWith('.mini'), 'Mini source must use .mini');
        const output = args[1] === undefined ? source.slice(0, -5) + '.ts' : resolve(args[1]);
        process.stdout.write(run(process.execPath, [join(root, config.compiler), 'compile', source, output], process.cwd()));
        break;
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
