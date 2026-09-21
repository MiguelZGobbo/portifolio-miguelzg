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

test('uses theme-specific error tokens with compliant text and indicator contrast', () => {
  const lightRoot = ruleFor(':root');
  const darkRoot = ruleFor(':root[data-theme="dark"]');
  const darkBody = ruleFor('[data-theme="dark"] body');
  const lightError = hexValue(lightRoot, '--error');
  const darkError = hexValue(darkRoot, '--error');
  const lightSurface = hexValue(lightRoot, '--surface');
  const lightPage = hexValue(lightRoot, '--cream');
  const darkSurface = hexValue(darkRoot, '--surface');
  const darkPage = darkBody.match(/linear-gradient\(135deg,\s*(#[0-9a-f]{6})\s+0%/i)?.[1];

  assert.ok(darkPage, 'expected the first dark page gradient stop');
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

test('keeps the reduced-motion contract after component motion and disables decorative movement', () => {
  const reducedMotionStart = stylesheet.lastIndexOf('@media (prefers-reduced-motion: reduce)');

  assert.ok(reducedMotionStart > stylesheet.indexOf('nav .logo'));
  assert.ok(reducedMotionStart > stylesheet.indexOf('.cv-actions .btn'));
  assert.ok(reducedMotionStart > stylesheet.indexOf('#contato footer'));

  const reducedMotionStyles = stylesheet.slice(reducedMotionStart);
  assert.match(reducedMotionStyles, /html\s*\{[^}]*scroll-behavior:\s*auto;/);
  assert.match(
    reducedMotionStyles,
    /html\.js \.reveal[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*none;[\s\S]*?transition:\s*none;/,
  );
  assert.match(reducedMotionStyles, /\.bg-wave,\s*\.bg-raw\s*\{[^}]*display:\s*none;/);
  assert.match(reducedMotionStyles, /\.nav-pill[\s\S]*?transition:\s*none;/);
  assert.match(reducedMotionStyles, /\.btn:hover[\s\S]*?transform:\s*none;/);
  assert.match(reducedMotionStyles, /nav \.logo[\s\S]*?\.cv-actions \.btn[\s\S]*?#contato footer[\s\S]*?transition:\s*none;/);
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
  assert.match(wave, /contain:\s*paint;/);
  assert.match(raw, /contain:\s*paint;/);
  for (const variant of ['.raw-1', '.raw-2', '.raw-3', '.raw-4']) {
    assert.doesNotMatch(ruleFor(variant), /animation:/, `${variant} must remain a stationary clipping container`);
    assert.match(ruleFor(`${variant} svg`), /animation:/, `${variant} should animate only its clipped SVG child`);
  }
  assert.match(stylesheet, /\.snap-section,[\s\S]*?scroll-margin-top:\s*calc\(var\(--nav-top\) \+ var\(--nav-height\) \+ 1rem\);/);
  assert.match(stylesheet, /#case-study-content\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--nav-top\) \+ var\(--nav-height\) \+ 1rem\);/);
  assert.doesNotMatch(stylesheet, /main:focus/);
  assert.match(stylesheet, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--brown-dark\);/);
});

test('clips the rotating profile border inside its own layout box', () => {
  const heroPhoto = ruleFor('.hero-photo');
  const heroBorder = ruleFor('.hero-photo::before');

  assert.match(heroPhoto, /overflow:\s*clip;/);
  assert.match(heroPhoto, /padding:\s*5px;/);
  assert.match(heroBorder, /inset:\s*0;/);
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*\.hero-photo\s*\{[^}]*padding:\s*0;/);
});

test('keeps keyboard focus scrolling immediate and case-study grid items shrinkable', () => {
  assert.match(ruleFor('html'), /scroll-behavior:\s*auto;/);
  assert.doesNotMatch(ruleFor('html'), /scroll-behavior:\s*smooth;/);
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*html\s*\{[^}]*scroll-padding-bottom:\s*152px;/);
  assert.match(ruleFor('.case-study > *'), /min-width:\s*0;/);
  assert.match(ruleFor('.case-study-maturity-list > *'), /min-width:\s*0;/);
  assert.match(ruleFor('.case-study-maturity-list dd'), /overflow-wrap:\s*anywhere;/);
});

test('uses an intentional compact brand instead of clipping the full mobile logo', () => {
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*nav \.logo-full\s*\{[^}]*display:\s*none;/);
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*nav \.logo-mobile\s*\{[^}]*display:\s*inline;/);
  assert.doesNotMatch(stylesheet, /nav \.logo\s*\{[^}]*overflow:\s*hidden;/);
});

test('allows long project card and evidence content to wrap within the grid track', () => {
  const projectCard = ruleFor('.project-card');
  const projectCardInner = ruleFor('.project-card-inner');
  const projectEvidenceItem = ruleFor('.project-evidence li');
  const projectState = ruleFor('.project-state');

  assert.match(projectCard, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/);
  assert.match(projectCardInner, /min-width:\s*0;/);
  assert.match(projectEvidenceItem, /overflow-wrap:\s*anywhere;/);
  assert.match(projectState, /overflow-wrap:\s*anywhere;/);
});
