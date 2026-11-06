import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import test from 'node:test';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => relative(directory, resolve(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .sort();
}

test('builds only the Portuguese and English homepages', async () => {
  assert.deepEqual(await htmlFiles(resolve('dist')), ['en/index.html', 'index.html']);
});
