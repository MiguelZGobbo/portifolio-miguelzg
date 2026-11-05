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

test('uses muted light-theme blues while preserving Radix surfaces and dark colors', () => {
  const lightTheme = ruleFor(':root');
  const darkTheme = ruleFor(':root[data-theme="dark"]');

  assert.match(lightTheme, /--background:\s*#[0-9a-f]{6};/i);
  assert.match(lightTheme, /--accent:\s*#[0-9a-f]{6};/i);
  assert.match(lightTheme, /--accent-strong:\s*#[0-9a-f]{6};/i);
  assert.match(darkTheme, /--background:\s*#[0-9a-f]{6};/i);
  assert.match(darkTheme, /--accent:\s*#[0-9a-f]{6};/i);
  assert.match(lightTheme, /--background:\s*#F9F9FB;/);
  assert.match(lightTheme, /--ambient-rgb:\s*142, 200, 246;/);
  assert.match(lightTheme, /--accent:\s*#647D8A;/);
  assert.match(lightTheme, /--accent-strong:\s*#405A67;/);
  assert.match(lightTheme, /--action-background:\s*#405A67;/);
  assert.match(lightTheme, /--action-hover:\s*#1C2024;/);
  assert.match(lightTheme, /--on-action:\s*#FFFFFF;/);
  assert.match(darkTheme, /--background:\s*#2E3135;/);
  assert.match(darkTheme, /--ambient-rgb:\s*0, 144, 255;/);
  assert.match(darkTheme, /--accent:\s*#3B9EFF;/);
  assert.match(darkTheme, /--accent-strong:\s*#70B8FF;/);
  assert.match(darkTheme, /--action-background:\s*#70B8FF;/);
  assert.match(darkTheme, /--action-hover:\s*#C2E6FF;/);
  assert.doesNotMatch(stylesheet, /--(?:highlight|highlight-hover|on-highlight)\b/);
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

test('smoothly repositions ambient cores and presence when the observed section changes', () => {
  assert.match(ruleFor('.bg-wave-inner'), /transition:[^;]*--wave-origin-x 900ms ease,[^;]*--wave-origin-y 900ms ease,[^;]*opacity 500ms ease;/);
  for (const axis of ['x', 'y']) {
    const registration = ruleFor(`@property --wave-origin-${axis}`);
    assert.match(registration, /syntax:\s*'<length>';/);
    assert.match(registration, /inherits:\s*true;/);
    assert.match(registration, /initial-value:\s*0px;/);
  }
  assert.equal([...waves.matchAll(/class="bg-wave wave-[1-3]"/g)].length, 3);
  assert.equal([...waves.matchAll(/aria-hidden="true"/g)].length, 3);
  assert.doesNotMatch(waves, /class="bg-raw/);
  assert.doesNotMatch(stylesheet, /\.bg-raw|\.raw-[1-4]/);
  assert.doesNotMatch(stylesheet, /--wave-offset-[xy]/);

  for (const [ptSection, enSection, presence, origins] of [
    ['projetos', 'projects', [0.85, 1, 0.9], [['12vw', '88vh'], ['88vw', '12vh'], ['88vw', '88vh']]],
    ['competencias', 'skills', [1, 0.85, 0.9], [['12vw', '12vh'], ['12vw', '88vh'], ['88vw', '12vh']]],
    ['sobre', 'about', [0.9, 1, 0.85], [['88vw', '12vh'], ['12vw', '88vh'], ['88vw', '88vh']]],
    ['contato', 'contact', [1, 0.9, 0.85], [['88vw', '88vh'], ['12vw', '12vh'], ['12vw', '88vh']]],
  ]) {
    for (const wave of [1, 2, 3]) {
      const groupedRule = new RegExp(`body\\[data-section="${ptSection}"\\] \\.wave-${wave} \\.bg-wave-inner,\\s*body\\[data-section="${enSection}"\\] \\.wave-${wave} \\.bg-wave-inner\\s*\\{([^}]+)\\}`);
      const declarations = stylesheet.match(groupedRule)?.[1];
      assert.ok(declarations, `${ptSection}/${enSection} wave ${wave}`);
      assert.ok(declarations.includes(`opacity: ${presence[wave - 1]};`));
      assert.ok(declarations.includes(`--wave-origin-x: ${origins[wave - 1][0]};`));
      assert.ok(declarations.includes(`--wave-origin-y: ${origins[wave - 1][1]};`));
    }
  }
});

test('renders three broad radial lights with theme-specific strength and transparent edges', () => {
  assert.equal([...waves.matchAll(/class="wave-glow"/g)].length, 3);
  assert.doesNotMatch(waves, /<svg|<path/);

  const glow = declarationsFor(stylesheet, '.wave-glow');
  const paint = declarationsFor(stylesheet, '.wave-glow::before');
  assert.equal((paint.match(/radial-gradient\(/g) ?? []).length, 2);
  assert.match(paint, /ellipse var\(--wave-core-radius\) at var\(--wave-core-position\),/);
  assert.match(paint, /ellipse var\(--wave-halo-radius\) at var\(--wave-core-position\),/);
  assert.match(glow, /--wave-core-radius:\s*55vw 65vh;/);
  assert.match(glow, /--wave-halo-radius:\s*90vw 95vh;/);
  assert.match(paint, /inset:\s*calc\(-1 \* var\(--wave-drift-y\)\) calc\(-1 \* var\(--wave-drift-x\)\);/);
  assert.match(paint, /rgba\(var\(--wave-rgb\),\s*1\)\s*0%/);
  assert.match(paint, /rgba\(var\(--wave-rgb\),\s*0\.55\)\s*38%/);
  assert.match(paint, /rgba\(var\(--wave-rgb\),\s*0\.14\)\s*70%/);
  assert.equal([...paint.matchAll(/rgba\(var\(--wave-rgb\),\s*0\)\s*100%/g)].length, 2);
  assert.match(paint, /rgba\(var\(--wave-rgb\),\s*var\(--wave-halo-peak\)\)\s*0%/);
  assert.match(paint, /rgba\(var\(--wave-rgb\),\s*var\(--wave-halo-mid\)\)\s*58%/);
  assert.match(paint, /rgba\(var\(--wave-rgb\),\s*var\(--wave-halo-edge\)\)\s*94%/);
  assert.match(glow, /--wave-halo-peak:\s*0\.48;/);
  assert.match(glow, /--wave-halo-mid:\s*0\.20;/);
  assert.match(glow, /--wave-halo-edge:\s*0\.04;/);
  assert.match(glow, /opacity:\s*var\(--wave-alpha\);/);
  assert.match(declarationsFor(stylesheet, '[data-theme="dark"] .wave-glow'), /--wave-halo-peak:\s*0\.32;/);
  assert.match(declarationsFor(stylesheet, '[data-theme="dark"] .wave-glow'), /--wave-halo-mid:\s*0\.12;/);
  assert.match(declarationsFor(stylesheet, '[data-theme="dark"] .wave-glow'), /--wave-halo-edge:\s*0;/);

  const desktop = stylesheet.slice(stylesheet.indexOf('15. ONDAS ANIMADAS'), stylesheet.indexOf('17. TELAS PEQUENAS'));
  const mobile = mediaBlock(stylesheet, '@media (max-width: 640px)');
  const darkTheme = stylesheet.slice(
    stylesheet.indexOf('/* Ondas em dark */'),
    stylesheet.indexOf('@media (max-width: 640px)', stylesheet.indexOf('/* Ondas em dark */')),
  );
  const darkMobile = mediaBlock(stylesheet, '@media (max-width: 640px)', 1);

  const expected = [
    { wave: 1, light: '0.22', mobileLight: '0.22', dark: '0.10', mobileDark: '0.10' },
    { wave: 2, light: '0.16', mobileLight: '0.16', dark: '0.07', mobileDark: '0.07' },
    { wave: 3, light: '0.09', mobileLight: '0.09', dark: '0.04', mobileDark: '0.04' },
  ];

  assert.match(ruleFor(':root'), /--ambient-rgb:\s*142, 200, 246;/);
  assert.match(ruleFor(':root[data-theme="dark"]'), /--ambient-rgb:\s*0, 144, 255;/);
  for (const { wave, light, mobileLight, dark, mobileDark } of expected) {
    const selector = `.wave-${wave} .bg-wave-inner`;
    const desktopDeclarations = declarationsFor(desktop, selector);
    assert.ok(desktopDeclarations.includes('--wave-rgb: var(--ambient-rgb);'));
    assert.ok(desktopDeclarations.includes(`--wave-alpha: ${light};`));
    assert.ok(declarationsFor(mobile, selector).includes(`--wave-alpha: ${mobileLight};`));
    const darkSelector = `[data-theme="dark"] ${selector}`;
    assert.ok(declarationsFor(darkTheme, darkSelector).includes('--wave-rgb: var(--ambient-rgb);'));
    assert.ok(declarationsFor(darkTheme, darkSelector).includes(`--wave-alpha: ${dark};`));
    assert.ok(declarationsFor(darkMobile, darkSelector).includes(`--wave-alpha: ${mobileDark};`));
  }
  const glowGeometry = [
    { wave: 1, x: '12vw', y: '12vh', duration: 28 },
    { wave: 2, x: '88vw', y: '88vh', duration: 22 },
    { wave: 3, x: '88vw', y: '12vh', duration: 18 },
  ];

  for (const { wave, x, y, duration } of glowGeometry) {
    const declarations = declarationsFor(desktop, `.wave-${wave} .bg-wave-inner`);
    assert.ok(declarations.includes(`--wave-origin-x: ${x};`));
    assert.ok(declarations.includes(`--wave-origin-y: ${y};`));
    assert.ok(declarationsFor(desktop, `.wave-${wave} .wave-glow::before`).includes(`animation: waveFloat${wave} ${duration}s ease-in-out infinite;`));
  }

  const inner = declarationsFor(desktop, '.bg-wave-inner');
  assert.match(inner, /inset:\s*0;/);
  assert.match(inner, /width:\s*100%;/);
  assert.match(inner, /height:\s*100%;/);
  assert.doesNotMatch(inner, /transform:/);
  assert.doesNotMatch(desktop, /rotate\(|width:\s*(?:min|max)\(/);
  const mobileGlow = declarationsFor(mobile, '.wave-glow');
  assert.match(mobileGlow, /--wave-core-radius:\s*70vw 60vh;/);
  assert.match(mobileGlow, /--wave-halo-radius:\s*110vw 90vh;/);
  assert.match(mobileGlow, /--wave-drift-x:\s*1vw;/);
  assert.match(mobileGlow, /--wave-drift-y:\s*0\.75vh;/);
  assert.doesNotMatch(mobile, /animation:\s*none;/);
  assert.match(mediaBlock(stylesheet, '@media (prefers-reduced-motion: reduce)'), /\.bg-wave\s*\{\s*display:\s*none;/);

  const waveStyles = stylesheet.slice(stylesheet.indexOf('15. ONDAS ANIMADAS'), stylesheet.indexOf('17. TELAS PEQUENAS'));
  assert.doesNotMatch(waveStyles, /filter:\s*blur\(|\.wave-blurred/);
  assert.doesNotMatch(mobile, /filter:\s*blur\(|stroke-width:/);
});

test('keeps content-led section rhythm', () => {
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section--hero\s*\{[^}]*min-height:\s*100vh;/);
  assert.match(stylesheet, /@media \(min-width: 641px\)[\s\S]*\.home-section:not\(\.home-section--hero\)\s*\{[^}]*min-height:\s*auto;[^}]*padding-block:\s*clamp/);
});
