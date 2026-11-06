import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { readStyles } from './helpers/styles.mjs';

const stylesheet = await readStyles();

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

test('keeps reading, action labels and functional indicators accessible in both themes', () => {
  for (const selector of [':root', ':root[data-theme="dark"]']) {
    const theme = ruleFor(selector);
    const value = (property) => hexValue(theme, property);
    for (const surface of ['--background', '--surface', '--surface-strong']) {
      for (const text of ['--text-primary', '--text-secondary', '--accent-strong', '--error']) {
        assert.ok(contrastRatio(value(text), value(surface)) >= 4.5, `${selector} ${text} on ${surface}`);
      }
      assert.ok(contrastRatio(value('--accent-strong'), value(surface)) >= 3, `${selector} control border`);
      assert.ok(contrastRatio(value('--accent'), value(surface)) >= 3, `${selector} meaningful icon`);
    }
    for (const state of ['--action-background', '--action-hover']) {
      assert.ok(contrastRatio(value('--on-action'), value(state)) >= 4.5, `${selector} label on ${state}`);
      assert.ok(contrastRatio(value(state), value('--background')) >= 3, `${selector} ${state} boundary`);
    }
  }
});

test('applies dedicated action colors through the final button overrides', () => {
  const lightSelection = ruleFor(':root:not([data-theme="dark"]) ::selection');
  assert.match(lightSelection, /background:\s*var\(--action-background\);/);
  assert.match(lightSelection, /color:\s*var\(--on-action\);/);
  const defaultSelection = stylesheet.match(/^::selection\s*\{([^}]*)\}/m)?.[1];
  assert.ok(defaultSelection);
  assert.match(defaultSelection, /background:\s*var\(--brown\);/);
  assert.match(defaultSelection, /color:\s*var\(--cream\);/);
  const editorial = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));
  const rule = (source, selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1];
  };
  for (const [source, selector] of [
    [stylesheet, '.btn'],
    [editorial, '.cv-actions .btn'],
  ]) {
    const body = rule(source, selector);
    assert.ok(body, selector);
    assert.match(body, /background:\s*var\(--action-background\);/);
    assert.match(body, /color:\s*var\(--on-action\);/);
  }
  for (const selector of ['.btn:hover', '.btn:focus-visible']) {
    assert.match(ruleFor(selector), /background:\s*var\(--action-hover\);/);
    assert.match(ruleFor(selector), /color:\s*var\(--on-action\);/);
  }
  assert.match(rule(editorial, '.cv-actions .btn-outline:hover,\n.cv-actions .btn-outline:focus-visible'), /background:\s*var\(--action-background\);/);
});

test('keeps project technology labels readable in both themes', () => {
  for (const selector of [':root', ':root[data-theme="dark"]']) {
    const theme = ruleFor(selector);
    const ratio = contrastRatio(hexValue(theme, '--project-tag-text'), hexValue(theme, '--project-tag-background'));
    assert.ok(ratio >= 4.5, `${selector} technology label contrast ${ratio.toFixed(2)}:1`);
  }
});

test('preserves reading contrast even when all ambient cores overlap', () => {
  for (const [selector, opacities] of [
    [':root', [0.22, 0.16, 0.09]],
    [':root[data-theme="dark"]', [0.10, 0.07, 0.04]],
  ]) {
    const theme = ruleFor(selector);
    const ambient = theme.match(/--ambient-rgb:\s*(\d+),\s*(\d+),\s*(\d+)/);
    assert.ok(ambient, `${selector} ambient color`);
    let background = hexValue(theme, '--background').slice(1).match(/../g).map((channel) => Number.parseInt(channel, 16));
    for (const opacity of opacities) {
      background = background.map((channel, index) => channel * (1 - opacity) + Number(ambient[index + 1]) * opacity);
    }
    const composite = `#${background.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
    for (const text of ['--text-primary', '--text-secondary', '--accent-strong', '--error']) {
      assert.ok(contrastRatio(hexValue(theme, text), composite) >= 4.5, `${selector} ${text} on ambient overlap`);
    }
    assert.ok(contrastRatio(hexValue(theme, '--accent'), composite) >= 3, `${selector} meaningful icon on ambient overlap`);
  }
});

test('keeps browser and installed-app colors aligned with the page backgrounds', async () => {
  const [themeScript, layout, manifest] = await Promise.all([
    readFile(resolve('src/scripts/theme.js'), 'utf8'),
    readFile(resolve('src/layouts/BaseLayout.astro'), 'utf8'),
    readFile(resolve('public/site.webmanifest'), 'utf8').then(JSON.parse),
  ]);
  const light = hexValue(ruleFor(':root'), '--background');
  const dark = hexValue(ruleFor(':root[data-theme="dark"]'), '--background');
  assert.ok(layout.includes(`<meta name="theme-color" content="${light}"`));
  assert.ok(themeScript.includes(`theme === 'dark' ? '${dark}' : '${light}'`));
  assert.equal(manifest.background_color, light);
  assert.equal(manifest.theme_color, light);
});

test('keeps navigation restrained and its utility controls usable on mobile in both themes', () => {
  const editorialStyles = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));

  assert.match(editorialStyles, /background:\s*var\(--background\);[\s\S]*border-bottom:\s*1px solid var\(--line\);/);
  assert.match(editorialStyles, /nav \.nav-btn\s*\{[^}]*min-width:\s*44px;[^}]*height:\s*max\(44px, calc\(var\(--fluid-type\) \* 2\.25\)\);/);
  assert.match(editorialStyles, /\.nav-btn:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-strong\);/);
  const mobileHomeNavigation = ruleFor('body[data-section="home"] nav');
  assert.match(mobileHomeNavigation, /background:\s*var\(--background\);/);
  assert.match(mobileHomeNavigation, /box-shadow:\s*none;/);
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

test('keeps the shared footer readable on both localized pages', () => {
  assert.match(stylesheet, /^footer\s*\{\s*background:\s*transparent;/m);
  assert.match(ruleFor('[data-theme="dark"] footer'), /background:\s*transparent;/);
  const editorial = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));
  assert.match(editorial, /footer\s*\{\s*color:\s*var\(--text-secondary\);/);
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
  assert.match(reducedMotionStyles, /nav[\s\S]*?\.cv-actions \.btn[\s\S]*?\.home-section\.home-section--contact footer[\s\S]*?transition:\s*none;/);
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
  assert.match(wave, /inset:\s*0;/);
  assert.match(wave, /height:\s*100%;/);
  assert.match(wave, /overflow:\s*clip;/);
  assert.match(wave, /contain:\s*paint;/);
  assert.doesNotMatch(stylesheet, /\.bg-raw|\.raw-[1-4]/);
  assert.match(ruleFor('.snap-section'), /scroll-margin-top:\s*0;/);
  assert.match(stylesheet, /scroll-padding-top:\s*calc\(var\(--nav-height\) \+ var\(--fluid-gap\)\);/);
  assert.doesNotMatch(stylesheet, /main:focus/);
  assert.match(stylesheet, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--brown-dark\);/);
});

test('keeps the open portrait frame visible with fluid dimensions', () => {
  const editorialStyles = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));

  assert.match(editorialStyles, /\.hero-photo\s*\{[^}]*overflow:\s*visible;/);
  assert.match(editorialStyles, /\.hero-photo::before,\s*\.hero-photo::after\s*\{[^}]*width:\s*clamp\(1\.5rem, min\(2\.5vw, 4svh\), 2\.25rem\);[^}]*height:\s*clamp\(1\.5rem, min\(2\.5vw, 4svh\), 2\.25rem\);[^}]*var\(--accent\)/);
  assert.match(editorialStyles, /\.hero-photo::before\s*\{[^}]*top:\s*-8px;[^}]*left:\s*-8px;[^}]*border-top-width:\s*1\.5px;[^}]*border-left-width:\s*1\.5px;/);
  assert.match(editorialStyles, /\.hero-photo::after\s*\{[^}]*right:\s*-8px;[^}]*bottom:\s*-8px;[^}]*border-right-width:\s*1\.5px;[^}]*border-bottom-width:\s*1\.5px;/);
});

test('keeps keyboard focus scrolling immediate', () => {
  assert.match(ruleFor('html'), /scroll-behavior:\s*auto;/);
  assert.doesNotMatch(ruleFor('html'), /scroll-behavior:\s*smooth;/);
  assert.match(stylesheet, /scroll-padding-bottom:\s*var\(--fluid-gap\);/);
});

test('uses an intentional compact brand instead of clipping the full mobile logo', () => {
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*nav \.logo-full\s*\{[^}]*display:\s*none;/);
  assert.match(stylesheet, /@media \(max-width: 640px\)[\s\S]*nav \.logo-mobile\s*\{[^}]*display:\s*inline;/);
  assert.doesNotMatch(stylesheet, /nav \.logo\s*\{[^}]*overflow:\s*hidden;/);
});

test('keeps the five-item navigation inside its tablet and notebook container', () => {
  const compactNavigation = stylesheet.slice(stylesheet.indexOf('22. EDITORIAL REDESIGN'));

  assert.match(compactNavigation, /nav,\s*\[data-theme="dark"\] nav\s*\{[^}]*left:\s*0;[^}]*right:\s*0;[^}]*height:\s*auto;[^}]*padding:[^;]*var\(--page-gutter\);[^}]*flex-wrap:\s*wrap;/);
  assert.match(compactNavigation, /\.nav-links\s*\{[^}]*flex-wrap:\s*wrap;[^}]*overflow:\s*visible;/);
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
