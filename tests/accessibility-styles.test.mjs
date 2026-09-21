import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const stylesheet = await readFile(resolve('src/styles/global.css'), 'utf8');

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = stylesheet.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `expected a rule for ${selector}`);
  return match[1];
}

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

test('keeps the reduced-motion contract after component motion and disables decorative movement', () => {
  const reducedMotionStart = stylesheet.lastIndexOf('@media (prefers-reduced-motion: reduce)');

  assert.equal(
    [...stylesheet.matchAll(/@media \(prefers-reduced-motion: reduce\)/g)].length,
    1,
  );
  assert.match(
    stylesheet,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\}\s*$/,
  );

  const reducedMotionStyles = stylesheet.slice(reducedMotionStart);
  assert.match(reducedMotionStyles, /html\s*\{[^}]*scroll-behavior:\s*auto;/);
  assert.match(
    reducedMotionStyles,
    /html\.js \.reveal[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*none;[\s\S]*?transition:\s*none;/,
  );
  assert.match(reducedMotionStyles, /\.bg-wave,\s*\.bg-raw\s*\{[^}]*display:\s*none;/);
  assert.match(reducedMotionStyles, /\.nav-pill[\s\S]*?transition:\s*none;/);
  assert.match(reducedMotionStyles, /\.btn:hover[\s\S]*?transform:\s*none;/);
});

test('sizes direct interactive controls and preserves mobile utility targets', () => {
  const navButton = ruleFor('.nav-btn');
  const copyButton = ruleFor('.copy-btn');

  assert.match(navButton, /min-width:\s*24px;/);
  assert.match(navButton, /min-height:\s*24px;/);
  assert.match(copyButton, /min-width:\s*24px;/);
  assert.match(copyButton, /min-height:\s*24px;/);
  assert.match(
    stylesheet,
    /nav \.nav-btn\s*\{[^}]*min-width:\s*44px;[^}]*height:\s*44px;/,
  );
});

test('contains decorative overflow and protects anchor and focus destinations from fixed navigation', () => {
  const wave = ruleFor('.bg-wave');
  const raw = ruleFor('.bg-raw');

  assert.doesNotMatch(wave, /width:\s*100vw;/);
  assert.doesNotMatch(raw, /width:\s*100vw;/);
  assert.match(wave, /overflow:\s*clip;/);
  assert.match(raw, /overflow:\s*clip;/);
  assert.match(stylesheet, /\.snap-section,[\s\S]*?scroll-margin-top:\s*calc\(var\(--nav-top\) \+ var\(--nav-height\) \+ 1rem\);/);
  assert.match(stylesheet, /main:focus[\s\S]*?scroll-margin-top:\s*calc\(var\(--nav-top\) \+ var\(--nav-height\) \+ 1rem\);/);
  assert.match(stylesheet, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--brown-dark\);/);
});
