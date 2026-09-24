import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const stylesheet = await readFile(resolve('src/styles/global.css'), 'utf8');
const layout = await readFile(resolve('src/layouts/BaseLayout.astro'), 'utf8');
const waves = await readFile(resolve('src/components/Waves.astro'), 'utf8');

function ruleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^{}()|[\]\\]/g, '\\$&');
  const match = stylesheet.match(new RegExp(escapedSelector + '\\s*\\{([^}]*)\\}'));
  assert.ok(match, 'expected a rule for ' + selector);
  return match[1];
}

test('uses one self-hosted IBM Plex Sans family throughout the interface', () => {
  assert.match(layout, /@fontsource-variable\/ibm-plex-sans/);
  assert.doesNotMatch(layout, /dm-sans/i);
  assert.match(stylesheet, /font-family:\s*'IBM Plex Sans Variable',\s*sans-serif;/);
  assert.doesNotMatch(stylesheet, /DM Sans Variable|Playfair Display Variable/);
});

test('uses a restrained off-white and graphite palette with a blue-gray accent', () => {
  const lightTheme = ruleFor(':root');
  const darkTheme = ruleFor(':root[data-theme="dark"]');

  assert.match(lightTheme, /--background:\s*#[0-9a-f]{6};/i);
  assert.match(lightTheme, /--accent:\s*#[0-9a-f]{6};/i);
  assert.match(lightTheme, /--accent-strong:\s*#[0-9a-f]{6};/i);
  assert.match(darkTheme, /--background:\s*#[0-9a-f]{6};/i);
  assert.match(darkTheme, /--accent:\s*#[0-9a-f]{6};/i);
  assert.match(ruleFor('body'), /background:\s*var\(--background\);/);
  assert.match(ruleFor('body'), /color:\s*var\(--text-primary\);/);
});

test('presents projects in a continuous editorial list without card surfaces', () => {
  const list = ruleFor('.project-list');
  const entry = ruleFor('.project-entry');
  const primary = ruleFor('.project-entry[data-hierarchy="H1"]');
  const featured = ruleFor('.project-entry[data-hierarchy="H2"]');

  assert.match(list, /display:\s*grid;/);
  assert.match(list, /gap:/);
  assert.match(entry, /background:\s*transparent;/);
  assert.match(entry, /border-bottom:\s*1px solid var\(--line\);/);
  assert.match(entry, /box-shadow:\s*none;/);
  assert.match(primary, /padding-block:/);
  assert.match(featured, /padding-block:/);
});

test('retains the blurred section transition and removes static wave lines', () => {
  assert.match(stylesheet, /\.bg-wave-inner\s*\{[^}]*transition:\s*transform 500ms ease,\s*opacity 500ms ease;/);
  assert.doesNotMatch(waves, /class="bg-raw/);
  assert.doesNotMatch(stylesheet, /\.bg-raw|\.raw-[1-4]/);
});

test('keeps content-led section rhythm', () => {
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section--hero\s*\{[^}]*min-height:\s*100vh;/);
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section:not\(\.home-section--hero\)\s*\{[^}]*min-height:\s*auto;[^}]*padding-block:\s*clamp/);
});
