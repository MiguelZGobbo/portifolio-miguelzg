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

function declarationsFor(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^{}()|[\]\\]/g, '\\$&');
  const rules = [...css.matchAll(new RegExp('(?:^|\\n)\\s*' + escapedSelector + '\\s*\\{([^}]*)\\}', 'g'))];
  assert.ok(rules.length > 0, 'expected rules for ' + selector);
  return rules.map(([, declarations]) => declarations).join('\n');
}

function mediaBlock(css, marker, occurrence = 0) {
  let searchFrom = 0;
  let start = -1;

  for (let index = 0; index <= occurrence; index += 1) {
    start = css.indexOf(marker, searchFrom);
    assert.notEqual(start, -1, 'expected media query ' + marker);
    searchFrom = start + marker.length;
  }

  const openBrace = css.indexOf('{', start);
  let depth = 0;

  for (let index = openBrace; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(openBrace + 1, index);
  }

  assert.fail('expected a closing brace for ' + marker);
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

test('retains ambient light movement between sections', () => {
  assert.match(stylesheet, /\.bg-wave-inner\s*\{[^}]*transition:\s*transform 500ms ease,\s*opacity 500ms ease;/);
  assert.equal([...waves.matchAll(/class="bg-wave wave-[1-3]"/g)].length, 3);
  assert.doesNotMatch(waves, /class="bg-raw/);
  assert.doesNotMatch(stylesheet, /\.bg-raw|\.raw-[1-4]/);
});

test('renders three broad radial lights with theme-specific strength and transparent edges', () => {
  assert.equal([...waves.matchAll(/class="wave-glow"/g)].length, 3);
  assert.doesNotMatch(waves, /<svg|<path/);

  const glow = declarationsFor(stylesheet, '.wave-glow');
  assert.equal((glow.match(/radial-gradient\(/g) ?? []).length, 2);
  assert.match(glow, /ellipse closest-side at var\(--wave-core-position\),/);
  assert.match(glow, /ellipse closest-side at var\(--wave-halo-position\),/);
  assert.doesNotMatch(glow, /closest-side at center/);
  assert.match(glow, /rgba\(var\(--wave-rgb\),\s*1\)\s*0%/);
  assert.match(glow, /rgba\(var\(--wave-rgb\),\s*0\.55\)\s*38%/);
  assert.match(glow, /rgba\(var\(--wave-rgb\),\s*0\.14\)\s*70%/);
  assert.equal([...glow.matchAll(/rgba\(var\(--wave-rgb\),\s*0\)\s*100%/g)].length, 2);
  assert.match(glow, /rgba\(var\(--wave-rgb\),\s*var\(--wave-halo-peak\)\)\s*0%/);
  assert.match(glow, /rgba\(var\(--wave-rgb\),\s*var\(--wave-halo-mid\)\)\s*58%/);
  assert.match(glow, /rgba\(var\(--wave-rgb\),\s*var\(--wave-halo-edge\)\)\s*94%/);
  assert.match(glow, /--wave-halo-peak:\s*0\.48;/);
  assert.match(glow, /--wave-halo-mid:\s*0\.20;/);
  assert.match(glow, /--wave-halo-edge:\s*0\.04;/);
  assert.match(glow, /opacity:\s*var\(--wave-alpha\);/);
  assert.match(declarationsFor(stylesheet, '[data-theme="dark"] .wave-glow'), /--wave-halo-peak:\s*0\.32;/);
  assert.match(declarationsFor(stylesheet, '[data-theme="dark"] .wave-glow'), /--wave-halo-mid:\s*0\.12;/);
  assert.match(declarationsFor(stylesheet, '[data-theme="dark"] .wave-glow'), /--wave-halo-edge:\s*0;/);

  const desktop = stylesheet.slice(0, stylesheet.indexOf('@media (max-width: 1199px)'));
  const medium = mediaBlock(stylesheet, '@media (max-width: 1199px)');
  const mobile = mediaBlock(stylesheet, '@media (max-width: 640px)');
  const darkTheme = stylesheet.slice(
    stylesheet.indexOf('/* Ondas em dark */'),
    stylesheet.indexOf('@media (max-width: 640px)', stylesheet.indexOf('/* Ondas em dark */')),
  );
  const darkMobile = mediaBlock(stylesheet, '@media (max-width: 640px)', 1);

  const expected = [
    { wave: 1, rgb: '30, 99, 136', light: '0.24', mobileLight: '0.27', dark: '0.11', mobileDark: '0.12' },
    { wave: 2, rgb: '78, 116, 152', light: '0.17', mobileLight: '0.20', dark: '0.08', mobileDark: '0.08' },
    { wave: 3, rgb: '46, 82, 105', light: '0.11', mobileLight: '0.14', dark: '0.05', mobileDark: '0.05' },
  ];

  const desktopSizes = [];
  const mediumSizes = [];
  for (const { wave, rgb, light, mobileLight, dark, mobileDark } of expected) {
    const selector = `.wave-${wave} .bg-wave-inner`;
    const desktopDeclarations = declarationsFor(desktop, selector);
    const mediumDeclarations = declarationsFor(medium, selector);
    assert.ok(desktopDeclarations.includes(`--wave-rgb: ${rgb};`));
    assert.ok(desktopDeclarations.includes(`--wave-alpha: ${light};`));
    assert.ok(declarationsFor(mobile, selector).includes(`--wave-alpha: ${mobileLight};`));
    desktopSizes.push(desktopDeclarations.match(/width:\s*(min\([^;]+\));[\s\S]*height:\s*(min\([^;]+\));/)?.slice(1).join(' / '));
    mediumSizes.push(mediumDeclarations.match(/width:\s*(max\([^;]+\));[\s\S]*height:\s*(min\([^;]+\));/)?.slice(1).join(' / '));
    const darkSelector = `[data-theme="dark"] ${selector}`;
    assert.ok(declarationsFor(darkTheme, darkSelector).includes('--wave-rgb: 155, 178, 189;'));
    assert.ok(declarationsFor(darkTheme, darkSelector).includes(`--wave-alpha: ${dark};`));
    assert.ok(declarationsFor(darkMobile, darkSelector).includes(`--wave-alpha: ${mobileDark};`));
  }
  assert.equal(new Set(desktopSizes).size, 3);
  assert.equal(new Set(mediumSizes).size, 3);
  assert.ok(desktopSizes.every(Boolean));
  assert.ok(mediumSizes.every(Boolean));

  const glowGeometry = [
    { wave: 1, corePosition: '42% 56%', haloPosition: '60% 40%' },
    { wave: 2, corePosition: '62% 42%', haloPosition: '38% 62%' },
    { wave: 3, corePosition: '36% 58%', haloPosition: '66% 38%' },
  ];

  for (const { wave, corePosition, haloPosition } of glowGeometry) {
    const declarations = declarationsFor(desktop, `.wave-${wave} .wave-glow`);
    assert.ok(declarations.includes(`--wave-core-position: ${corePosition};`));
    assert.ok(declarations.includes(`--wave-halo-position: ${haloPosition};`));
  }

  const inner = declarationsFor(desktop, '.bg-wave-inner');
  assert.match(inner, /transform:\s*translate\(calc\(50vw - 50% \+ var\(--wave-offset-x\)\),\s*var\(--wave-offset-y\)\);/);
  for (const [ptSection, enSection] of [['sobre', 'about'], ['competencias', 'skills'], ['projetos', 'projects'], ['contato', 'contact']]) {
    for (const wave of [1, 2, 3]) {
      const groupedRule = new RegExp(`body\\[data-section="${ptSection}"\\] \\.wave-${wave} \\.bg-wave-inner,\\s*body\\[data-section="${enSection}"\\] \\.wave-${wave} \\.bg-wave-inner\\s*\\{[^}]*--wave-offset-x:`);
      assert.match(desktop, groupedRule);
    }
  }
  assert.match(mediaBlock(stylesheet, '@media (prefers-reduced-motion: reduce)'), /\.bg-wave\s*\{\s*display:\s*none;/);

  const waveStyles = stylesheet.slice(stylesheet.indexOf('15. ONDAS ANIMADAS'), stylesheet.indexOf('17. TELAS PEQUENAS'));
  assert.doesNotMatch(waveStyles, /filter:\s*blur\(|\.wave-blurred/);
  assert.doesNotMatch(mobile, /filter:\s*blur\(|stroke-width:/);
});

test('keeps content-led section rhythm', () => {
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section--hero\s*\{[^}]*min-height:\s*100vh;/);
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section:not\(\.home-section--hero\)\s*\{[^}]*min-height:\s*auto;[^}]*padding-block:\s*clamp/);
});
