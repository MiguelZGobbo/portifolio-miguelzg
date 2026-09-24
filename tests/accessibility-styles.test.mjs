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

function hexValue(rule, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rule.match(new RegExp(`${escapedProperty}\\s*:\\s*(#[0-9a-f]{3,6})`, 'i'));
  assert.ok(match, `expected a hex value for ${property}`);
  return match[1];
}

function relativeLuminance(hex) {
  const normalized = hex.length === 4
    ? hex.slice(1).split('').map((value) => value.repeat(2))
    : hex.slice(1).match(/.{2}/g);
  const channels = normalized.map((value) => {
    const srgb = Number.parseInt(value, 16) / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(foreground, background) {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('keeps navigation restrained and its utility controls usable on mobile in both themes', () => {
  const editorialStyles = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));

  assert.match(editorialStyles, /background:\s*var\(--background\);[\s\S]*border-bottom:\s*1px solid var\(--line\);/);
  assert.match(editorialStyles, /nav \.nav-btn\s*\{[^}]*min-width:\s*34px;[^}]*min-height:\s*34px;/);
  assert.match(editorialStyles, /\.nav-btn:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-strong\);/);
});

test('uses theme-specific error tokens with compliant text and indicator contrast', () => {
  const lightRoot = ruleFor(':root');
  const darkRoot = ruleFor(':root[data-theme="dark"]');
  const darkBody = ruleFor('[data-theme="dark"] body');
  const lightError = hexValue(lightRoot, '--error');
  const darkError = hexValue(darkRoot, '--error');
  const lightSurface = hexValue(lightRoot, '--surface');
  const lightPage = hexValue(lightRoot, '--background');
  const darkSurface = hexValue(darkRoot, '--surface');
  const darkPage = hexValue(darkRoot, '--background');

  assert.match(darkBody, /background:\s*var\(--cream\);/);
  assert.notEqual(lightError.toLowerCase(), darkError.toLowerCase());
  for (const [label, foreground, background] of [
    ['light error text on the page', lightError, lightPage],
    ['light invalid border on the surface', lightError, lightSurface],
    ['dark error text on the page', darkError, darkPage],
    ['dark invalid border on the surface', darkError, darkSurface],
  ]) {
    const ratio = contrastRatio(foreground, background);
    const minimum = label.includes('text') ? 4.5 : 3;
    assert.ok(ratio >= minimum, `${label} contrast ${ratio.toFixed(2)} must be at least ${minimum}:1`);
  }

  assert.match(ruleFor('.form-group input[aria-invalid="true"],\n.form-group textarea[aria-invalid="true"]'), /border-color:\s*var\(--error\);/);
  assert.match(ruleFor('.form-group input[aria-invalid="true"]:focus-visible,\n.form-group textarea[aria-invalid="true"]:focus-visible'), /outline-color:\s*var\(--error\);/);
  assert.match(ruleFor('.field-error'), /color:\s*var\(--error\);/);
  assert.match(ruleFor('#form-aviso.erro'), /color:\s*var\(--error\);/);
});

test('keeps the local-preview contact status visibly neutral', () => {
  const localPreviewStatus = ruleFor('#form-aviso.local-preview');

  assert.match(localPreviewStatus, /color:\s*var\(--text-muted\);/);
  assert.match(localPreviewStatus, /opacity:\s*1;/);
});

test('keeps the reduced-motion contract after component motion and disables decorative movement', () => {
  const reducedMotionBlocks = [...stylesheet.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/g)];
  const reducedMotionStyles = reducedMotionBlocks.map(([, block]) => block).join('\n');

  assert.ok(reducedMotionBlocks.length > 0);
  assert.match(reducedMotionBlocks[0][1], /html\s*\{[^}]*scroll-behavior:\s*auto;/);
  assert.match(
    reducedMotionBlocks[0][1],
    /html\.js \.reveal[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*none;[\s\S]*?transition:\s*none;/,
  );
  assert.match(reducedMotionBlocks[0][1], /\.bg-wave\s*\{[^}]*display:\s*none;/);
  assert.match(reducedMotionBlocks[0][1], /\.nav-pill[\s\S]*?transition:\s*none;/);
  assert.match(reducedMotionBlocks[0][1], /\.btn:hover[\s\S]*?transform:\s*none;/);
  assert.match(reducedMotionStyles, /nav[\s\S]*?\.cv-actions \.btn[\s\S]*?#contato footer[\s\S]*?transition:\s*none;/);
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

  assert.doesNotMatch(wave, /width:\s*100vw;/);
  assert.match(wave, /overflow:\s*clip;/);
  assert.match(wave, /contain:\s*paint;/);
  assert.doesNotMatch(stylesheet, /\.bg-raw|\.raw-[1-4]/);
  assert.match(ruleFor('.snap-section'), /scroll-margin-top:\s*calc\(var\(--nav-top\) \+ var\(--nav-height\) \+ 1rem\);/);
  assert.doesNotMatch(stylesheet, /main:focus/);
  assert.match(stylesheet, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--brown-dark\);/);
});

test('keeps the open portrait frame visible on desktop and smaller on mobile', () => {
  const editorialStyles = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));

  assert.match(editorialStyles, /\.hero-photo\s*\{[^}]*overflow:\s*visible;/);
  assert.match(editorialStyles, /\.hero-photo::before,\s*\.hero-photo::after\s*\{[^}]*width:\s*36px;[^}]*height:\s*36px;[^}]*var\(--accent\)/);
  assert.match(editorialStyles, /\.hero-photo::before\s*\{[^}]*top:\s*-8px;[^}]*left:\s*-8px;[^}]*border-top-width:\s*1\.5px;[^}]*border-left-width:\s*1\.5px;/);
  assert.match(editorialStyles, /\.hero-photo::after\s*\{[^}]*right:\s*-8px;[^}]*bottom:\s*-8px;[^}]*border-right-width:\s*1\.5px;[^}]*border-bottom-width:\s*1\.5px;/);
  assert.match(editorialStyles, /@media \(max-width: 640px\)[\s\S]*\.hero-photo::before,\s*\.hero-photo::after\s*\{[^}]*width:\s*24px;[^}]*height:\s*24px;/);
  assert.match(editorialStyles, /@media \(max-width: 640px\)[\s\S]*\.hero-photo::before\s*\{[^}]*top:\s*-5px;[^}]*left:\s*-5px;[^}]*border-top-width:\s*1px;[^}]*border-left-width:\s*1px;/);
  assert.match(editorialStyles, /@media \(max-width: 640px\)[\s\S]*\.hero-photo::after\s*\{[^}]*right:\s*-5px;[^}]*bottom:\s*-5px;[^}]*border-right-width:\s*1px;[^}]*border-bottom-width:\s*1px;/);
});

test('keeps keyboard focus scrolling immediate', () => {
  assert.match(ruleFor('html'), /scroll-behavior:\s*auto;/);
  assert.doesNotMatch(ruleFor('html'), /scroll-behavior:\s*smooth;/);
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*html\s*\{[^}]*scroll-padding-bottom:\s*152px;/);
});

test('uses an intentional compact brand instead of clipping the full mobile logo', () => {
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*nav \.logo-full\s*\{[^}]*display:\s*none;/);
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*nav \.logo-mobile\s*\{[^}]*display:\s*inline;/);
  assert.doesNotMatch(stylesheet, /nav \.logo\s*\{[^}]*overflow:\s*hidden;/);
});

test('keeps the five-item navigation inside its tablet and notebook container', () => {
  const compactNavigation = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));

  assert.match(compactNavigation, /@media \(min-width: 641px\) and \(max-width: 1023px\)[\s\S]*nav\s*\{[^}]*left:\s*0;[^}]*right:\s*0;[^}]*padding-inline:\s*1\.25rem;/);
  assert.match(compactNavigation, /\.nav-links a\s*\{[^}]*padding-inline:\s*0\.2rem;[^}]*font-size:\s*0\.76rem;/);
});

test('keeps editorial project entries readable when names and summaries are long', () => {
  const projectEntry = ruleFor('.project-entry');
  const projectName = ruleFor('.project-name');
  const projectSummary = ruleFor('.project-summary');
  const projectActions = ruleFor('.project-actions');

  assert.match(projectEntry, /min-width:\s*0;/);
  assert.match(projectName, /overflow-wrap:\s*anywhere;/);
  assert.match(projectSummary, /overflow-wrap:\s*anywhere;/);
  assert.match(projectActions, /flex-wrap:\s*wrap;/);
});
