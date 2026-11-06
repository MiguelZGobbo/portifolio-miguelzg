import { readFile } from 'node:fs/promises';

// Follow the same ordered imports as the build, so assertions cover the entire cascade.
export async function readStyles(url = new URL('../../src/styles/global.css', import.meta.url)) {
  const source = await readFile(url, 'utf8');
  const imports = [...source.matchAll(/^@import ['"](.+?)['"];\s*$/gm)];
  let result = '';
  let cursor = 0;
  for (const match of imports) {
    result += source.slice(cursor, match.index);
    result += await readStyles(new URL(match[1], url));
    cursor = match.index + match[0].length;
  }
  return result + source.slice(cursor);
}
