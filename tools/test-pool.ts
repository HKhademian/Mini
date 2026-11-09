import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

type Task = Record<string, unknown>;

type Outcome = {
  status: number;
  signal: string;
  stdout: string;
  stderr: string;
  error: string;
};

const input = await new Promise<string>((resolve, reject) => {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { text += chunk; });
  process.stdin.on('end', () => resolve(text));
  process.stdin.on('error', reject);
});

const request = JSON.parse(input) as { jobs: number; script: string; tasks: Task[] };
const concurrency = Math.max(1, Math.min(request.jobs, request.tasks.length || 1));
const outcomes: Outcome[] = new Array(request.tasks.length);
let next = 0;
let active = 0;
let settled = 0;

function runTask(index: number): void {
  const task = request.tasks[index]!;
  const child = spawn(process.execPath, [resolve(request.script), '--_worker', JSON.stringify(task)], {
    cwd: process.cwd(),
    env: task.serial === true ? { ...process.env, MINI_TEST_JOBS: '1' } : process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  let error = '';
  child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
  child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
  child.on('error', reason => { error = reason.message; });
  child.on('close', (status, signal) => {
    outcomes[index] = { status: status ?? 1, signal: signal ?? '', stdout, stderr, error };
    active--;
    settled++;
    schedule();
  });
}

function schedule(): void {
  while (active < concurrency && next < request.tasks.length) {
    const index = next;
    const task = request.tasks[index]!;
    if (task.kind === 'pending') {
      outcomes[index] = { status: 2, signal: '', stdout: '', stderr: '', error: '' };
      next++;
      settled++;
      continue;
    }
    const serial = task.serial === true;
    if (serial && active > 0) return;
    next++;
    active++;
    runTask(index);
    if (serial) return;
  }
  if (settled === request.tasks.length) process.stdout.write(JSON.stringify(outcomes));
}

if (request.tasks.length === 0) {
  process.stdout.write('[]');
} else {
  schedule();
}
