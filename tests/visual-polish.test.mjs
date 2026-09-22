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

function lastRuleFor(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...stylesheet.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g'))];
  assert.ok(matches.length, `expected a rule for ${selector}`);
  return matches.at(-1)[1];
}

test('uses one self-hosted sans-serif family throughout the interface', () => {
  assert.match(layout, /@fontsource-variable\/dm-sans/);
  assert.doesNotMatch(layout, /playfair-display/i);
  assert.doesNotMatch(stylesheet, /Playfair Display Variable/);
});

test('gives the featured projects visibly different desktop weight', () => {
  const featuredProjects = ruleFor('.projects-list--featured');
  const primaryProject = ruleFor('.project-card--h1');
  const highlightedProject = lastRuleFor('.project-card--h2');

  assert.match(featuredProjects, /grid-template-columns:\s*minmax\(0,\s*1\.45fr\)\s+minmax\(280px,\s*0\.85fr\);/);
  assert.match(primaryProject, /background:\s*var\(--surface-strong\);/);
  assert.match(primaryProject, /border-left:\s*4px solid var\(--brown-dark\);/);
  assert.match(highlightedProject, /border-left:\s*2px solid var\(--tan\);/);
  assert.match(stylesheet, /\.project-card--h1 \.project-name\s*\{[^}]*font-size:\s*clamp\(1\.45rem,\s*2vw,\s*1\.8rem\);/);
  assert.match(stylesheet, /\.project-card--h2 \.project-name\s*\{[^}]*font-size:\s*1\.2rem;/);
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
