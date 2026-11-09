import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { resolve } from 'node:path';

type Task = Record<string, unknown>;

type Outcome = {
  status: number;
  signal: string;
  stdout: string;
  stderr: string;
  error: string;
};

const requestPath = process.argv[2];
const resultsPath = process.argv[3];
if (!requestPath || !resultsPath) throw new Error('request and result paths are required');
const request = JSON.parse(readFileSync(requestPath, 'utf8')) as {
  jobs: number;
  script: string;
  tasks: Task[];
  progress: boolean;
  reportFailures: boolean;
  reportWorkers: boolean;
};
const runnableCount = request.tasks.filter(task => task.kind !== 'pending').length;
const requestedJobs = request.jobs > 0 ? request.jobs : availableParallelism();
const appliedJobs = runnableCount === 0 ? 0 : Math.max(1, Math.min(requestedJobs, runnableCount));
const concurrency = Math.max(1, appliedJobs);
const progressInterval = Math.max(3, Math.ceil(runnableCount / 12));
const outcomes: Outcome[] = new Array(request.tasks.length);
let next = 0;
let active = 0;
let settled = 0;
let completed = 0;
let wroteResults = false;

if (request.reportWorkers) {
  const taskWord = runnableCount === 1 ? 'job' : 'jobs';
  const workerWord = appliedJobs === 1 ? 'worker' : 'workers';
  process.stderr.write(`Using ${appliedJobs} ${workerWord} for ${runnableCount} test ${taskWord}\n`);
}

function finish(): void {
  if (wroteResults) return;
  wroteResults = true;
  writeFileSync(resultsPath!, JSON.stringify(outcomes));
}

function runTask(index: number): void {
  const task = request.tasks[index]!;
  const child = spawn(process.execPath, [resolve(request.script), '--_worker', JSON.stringify(task)], {
    cwd: process.cwd(),
    env: task.serial === true
      ? { ...process.env, MINI_TEST_JOBS: '1', MINI_TEST_MUTE: '1', MINI_TEST_NESTED: '1' }
      : process.env,
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
    if (request.reportFailures) {
      let failure = status !== 0;
      let message = '';
      try {
        const result = JSON.parse(stdout) as { ok?: unknown; message?: unknown };
        if (result.ok !== true) {
          failure = true;
          if (typeof result.message === 'string') message = result.message;
        }
      } catch {
        failure = true;
      }
      if (failure) {
        if (message === '') {
          message = stderr || error || (status === 0 ? 'worker returned an invalid result' : `worker exited with status ${status ?? signal ?? 1}`);
        }
        process.stderr.write(`FAIL ${String(task.label)}: ${message}\n`);
      }
    }
    active--;
    settled++;
    completed++;
    if (request.progress && (completed % progressInterval === 0 || completed === runnableCount)) {
      process.stderr.write(`Progress: ${completed}/${runnableCount} test jobs complete\n`);
    }
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
  if (settled === request.tasks.length) finish();
}

if (request.tasks.length === 0) {
  finish();
} else {
  schedule();
}
