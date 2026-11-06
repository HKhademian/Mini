import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url));
const extensionDirectory = resolve(scriptDirectory, '..');
const projectDirectory = resolve(extensionDirectory, '../..');
const markPath = resolve(projectDirectory, 'brand/mini-mark.svg');
const mark = await readFile(markPath, 'utf8');

if (!/<svg\b[^>]*viewBox="0 0 16 16"/.test(mark) || !/stroke="currentColor"/.test(mark)) {
  throw new Error(`Canonical mini mark has an unexpected SVG shape: ${markPath}`);
}

for (const [filename, color] of [
  ['mini-light.svg', '#0369A1'],
  ['mini-dark.svg', '#7DD3FC'],
] as const) {
  const icon = mark.replaceAll('stroke="currentColor"', `stroke="${color}"`);
  await writeFile(resolve(extensionDirectory, 'icons', filename), icon);
}
