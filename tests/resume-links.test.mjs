import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

function cvLinks(renderedPage) {
  const links = [...renderedPage.matchAll(/<a\b[^>]*data-cv[^>]*>/g)].map(([link]) => link);
  assert.equal(links.length, 2, 'expected one view and one download résumé link');
  return links;
}

test('renders localized résumé view and download targets on both homepages', async () => {
  for (const [pagePath, filename] of [
    ['dist/index.html', 'MiguelZagerGobbo-CV.pdf'],
    ['dist/en/index.html', 'MiguelZagerGobbo-CV-EN.pdf'],
  ]) {
    const renderedPage = await readFile(resolve(pagePath), 'utf8');
    const [viewLink, downloadLink] = cvLinks(renderedPage);
    const escapedFilename = filename.replace('.', '\\.');

    assert.match(viewLink, new RegExp(`href="/portifolio-miguelzg/files/${escapedFilename}"`));
    assert.match(downloadLink, new RegExp(`href="/portifolio-miguelzg/files/${escapedFilename}"`));
    assert.match(downloadLink, new RegExp(`download="${escapedFilename}"`));
  }
});
