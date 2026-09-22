import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const stylesheet = await readFile(resolve('src/styles/global.css'), 'utf8');
const layout = await readFile(resolve('src/layouts/BaseLayout.astro'), 'utf8');

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = stylesheet.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `expected a rule for ${selector}`);
  return match[1];
}

test('uses one self-hosted sans-serif family throughout the interface', () => {
  assert.match(layout, /@fontsource-variable\/dm-sans/);
  assert.doesNotMatch(layout, /playfair-display/i);
  assert.doesNotMatch(stylesheet, /Playfair Display Variable/);
});

test('uses one stable visual grammar for every project', () => {
  const showcase = ruleFor('.project-showcase');
  const panels = ruleFor('.project-showcase-panels');
  const inactivePanel = ruleFor('.project-showcase-panel');
  const activePanel = ruleFor('.project-showcase-panel[data-active="true"]');

  assert.match(showcase, /background:\s*var\(--surface\);/);
  assert.match(showcase, /border:\s*1px solid var\(--line\);/);
  assert.match(panels, /display:\s*grid;/);
  assert.match(inactivePanel, /grid-area:\s*1\s*\/\s*1;/);
  assert.doesNotMatch(inactivePanel, /visibility:\s*hidden;/);
  assert.match(activePanel, /visibility:\s*visible;/);
  assert.match(stylesheet, /html\.js \.project-showcase-panel\s*\{[^}]*visibility:\s*hidden;/);
  assert.match(stylesheet, /\.project-showcase-nav-button\[aria-current="true"\][\s\S]*border-bottom-color:\s*var\(--brown-dark\);/);
  assert.match(stylesheet, /\.project-showcase-actions\s*\{[^}]*margin-top:\s*auto;[^}]*padding-top:/);
  assert.match(stylesheet, /html:not\(\.js\) \.project-showcase-panels\s*\{[^}]*display:\s*block;/);
});

test('uses an editorial case-study flow instead of a stack of equal cards', () => {
  const section = ruleFor('.case-study-section');

  assert.match(section, /background:\s*transparent;/);
  assert.match(section, /border:\s*0;/);
  assert.match(section, /border-top:\s*1px solid var\(--line\);/);
  assert.match(section, /border-radius:\s*0;/);
  assert.match(section, /box-shadow:\s*none;/);
});

test('uses solid restrained surfaces and short functional transitions', () => {
  assert.match(ruleFor('body'), /background:\s*var\(--cream\);/);
  assert.match(ruleFor('[data-theme="dark"] body'), /background:\s*var\(--cream\);/);
  assert.doesNotMatch(stylesheet, /(?:radial|conic)-gradient/);
  assert.doesNotMatch(stylesheet, /backdrop-filter/);
  assert.doesNotMatch(stylesheet, /0 0 2[48]px/);
  assert.doesNotMatch(stylesheet, /translateY\(-8px\)|scale\(1\.0[234]\)/);
  assert.match(stylesheet, /html\.js \.reveal\s*\{[^}]*transition:\s*opacity 180ms ease;/);
});

test('keeps only the hero viewport-height and gives content sections a compact rhythm', () => {
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section--hero\s*\{[^}]*min-height:\s*100vh;/);
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section:not\(\.home-section--hero\)\s*\{[^}]*min-height:\s*auto;[^}]*padding-block:\s*clamp\(5rem,\s*8vw,\s*7rem\);/);
});
