import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { compiler, releaseTag, root, run, versions, type Component } from './project.ts';

const names: Record<string, Component> = { check: 'check', format: 'format', verify: 'verify', release: 'release', test: 'test', bench: 'bench', compile: 'compiler', run: 'cli' };
const help = 'mini: tiny self-hosting foundation for language projects\nUsage: mini check [--docs | SOURCE.mini | -] | fmt [--write | --check] SOURCE.mini | run SOURCE.mini [ARG]... | test [FILTER] | bench OUTPUT [FILTER] | verify [CASE.json] | release OUTPUT [TAG] | compile\nAliases: mini-check, mini-format, mini-run, mini-test, mini-bench, mini-verify, mini-release, mini-compile, minic\n';

function readSource(path: string): string {
  try {
    return readFileSync(path === '-' ? 0 : resolve(path), 'utf8');
  } catch {
    throw new Error(`cannot read ${path}`);
  }
}

export async function main(executable: string): Promise<void> {
  try {
    const args = process.argv.slice(2);
    if (executable === 'mini' && (args.length === 0 || args[0] === '--help')) { process.stdout.write(help); return; }
    const current = versions(root);
    if (executable === 'mini' && args[0] === '--version') {
      console.log(`${releaseTag('mini', current)}\n${releaseTag('cli', current)}`); return;
    }
    const invoked = executable === 'mini' ? args.shift()! : executable === 'minic' ? 'compile' : executable.replace(/^mini-/, '');
    const command = invoked === 'fmt' ? 'format' : invoked;
    const component = names[command];
    assert(component !== undefined, `unknown command: ${invoked}`);
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
        if (path !== '-') {
          try { readFileSync(resolve(path), 'utf8'); } catch { throw new Error(`cannot read ${path}`); }
        }
        const { spawnSync } = await import('node:child_process');
        const checked = spawnSync(process.execPath, [join(root, 'tools/check-source.generated.ts'), ...args], { stdio: 'inherit' });
        if (checked.error) throw checked.error;
        process.exitCode = checked.status ?? 1;
        break;
      }
      case 'format': {
        let mode: 'stdout' | 'write' | 'check' = 'stdout';
        let path: string | undefined;
        for (const arg of args) {
          if (arg === '--write' || arg === '--check') {
            assert(mode === 'stdout', 'usage: mini-format [--write | --check] SOURCE.mini');
            mode = arg === '--write' ? 'write' : 'check';
          } else {
            assert(path === undefined, 'usage: mini-format [--write | --check] SOURCE.mini');
            path = arg;
          }
        }
        assert(path !== undefined, 'usage: mini-format [--write | --check] SOURCE.mini');
        assert(mode !== 'write' || path !== '-', '--write does not accept stdin');
        assert(path === '-' || path.endsWith('.mini'), 'Mini source must use .mini');
        const name = path === '-' ? '<stdin>' : path;
        const source = readSource(path);
        const result = (await import('./format.ts')).formatSource(source, name);
        if ('diagnostic' in result) {
          const { renderDiagnostic } = await import('./source-check.ts');
          console.error(renderDiagnostic(source, result.diagnostic));
          process.exitCode = 1;
          break;
        }
        if (mode === 'check') {
          if (result.text !== source) {
            console.error(`${name}: not formatted`);
            process.exitCode = 1;
          }
          break;
        }
        if (mode === 'write') {
          if (result.text !== source) {
            const target = resolve(path);
            const temporary = `${target}.mini-format-${process.pid}`;
            try {
              writeFileSync(temporary, result.text);
              renameSync(temporary, target);
            } catch (error) {
              rmSync(temporary, { force: true });
              throw error;
            }
          }
          break;
        }
        process.stdout.write(result.text);
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
      case 'run': {
        assert(args[0] !== undefined, 'usage: mini-run SOURCE.mini [ARG]...');
        const source = resolve(args[0]);
        assert(source.endsWith('.mini'), 'Mini source must use .mini');
        const directory = mkdtempSync(join(tmpdir(), 'mini-run-'));
        const output = join(directory, 'program.ts');
        writeFileSync(join(directory, 'package.json'), '{"type":"module"}\n');
        try {
          const { spawnSync } = await import('node:child_process');
          const compiled = spawnSync(process.execPath, [join(root, compiler().entry), 'compile', source, output], { stdio: 'inherit' });
          if (compiled.error) throw compiled.error;
          if (compiled.status !== 0) { process.exitCode = compiled.status ?? 1; break; }
          const executed = spawnSync(process.execPath, [output, ...args.slice(1)], { stdio: 'inherit' });
          if (executed.error) throw executed.error;
          process.exitCode = executed.status ?? 1;
        } finally {
          rmSync(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
        }
        break;
      }
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
        if ((result.status ?? 1) === 0 && process.platform !== 'win32' && readFileSync(source, 'utf8').startsWith('#!')) {
          try { chmodSync(output, 0o755); } catch { /* executable output is best effort */ }
        }
        process.exitCode = result.status ?? 1;
        break;
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
