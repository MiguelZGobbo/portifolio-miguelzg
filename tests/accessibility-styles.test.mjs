import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const stylesheet = await readFile(resolve('src/styles/global.css'), 'utf8');

test('uses the dark navigation surface for mobile utility controls and their focus indicator', () => {
  assert.match(
    stylesheet,
    /\[data-theme="dark"\] nav \.nav-controls \{[\s\S]*background: rgba\(38, 30, 22, 0\.92\);[\s\S]*\}/,
  );
  assert.match(
    stylesheet,
    /\[data-theme="dark"\] nav \.nav-btn:focus-visible \{[\s\S]*outline-color: var\(--brown-dark\);[\s\S]*\}/,
  );
});
