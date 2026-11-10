import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { test } from 'node:test';
import { groupSamples } from '../site/groups.ts';

type Entry = { id: string; group: string; file?: string; status?: 'planned' | 'cli'; allowSilent?: boolean };
const root = join(import.meta.dirname, '..');
const entries = JSON.parse(readFileSync(join(root, 'site/playground/samples.json'), 'utf8')) as Entry[];

function sampleFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sampleFiles(path);
    return entry.name.endsWith('.mini') ? [relative(root, path).split(sep).join('/')] : [];
  });
}

test('interleaved groups preserve each sample index', () => {
  const samples = [{ group: 'A' }, { group: 'B' }, { group: 'A' }];
  assert.deepEqual(groupSamples(samples).map(group => ({
    name: group.name, indexes: group.entries.map(entry => entry.index),
  })), [{ name: 'A', indexes: [0, 2] }, { name: 'B', indexes: [1] }]);
});

test('the catalog covers each sample once in its topic', () => {
  const folders: Record<string, string> = {
    Basics: 'basics', Numbers: 'numbers', Text: 'text', Lists: 'lists', Maps: 'maps', JSON: 'json',
    'Input and output': 'io', 'Files and directories': 'files', Processes: 'process',
    'Programs and algorithms': 'programs', Games: 'games', 'Pixel art': 'graphics/art',
    Animation: 'graphics/animation', Interaction: 'graphics/interactive', Audio: 'graphics/audio',
  };
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  const files = entries.flatMap(entry => entry.file ? [entry.file] : []);
  assert.equal(new Set(files).size, files.length);
  assert.deepEqual([...files].sort(), sampleFiles(join(root, 'samples')).sort());
  for (const entry of entries) {
    if (!entry.file || entry.status === 'planned') continue;
    const folder = folders[entry.group];
    assert.ok(folder, `unknown group ${entry.group}`);
    assert.ok(entry.file.startsWith(`samples/${folder}/`), `${entry.id} is in the wrong group`);
    if (entry.group === 'Files and directories' || entry.group === 'Processes' || entry.id === 'diagnostic') {
      assert.equal(entry.status, 'cli', `${entry.id} needs host access`);
    }
  }
});
