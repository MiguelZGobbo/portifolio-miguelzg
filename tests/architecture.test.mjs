import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const [main, home, styles, skillCard, caseStudy, baseLayout] = await Promise.all([
  readFile(new URL('../src/scripts/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/SkillCard.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/ProjectCaseStudy.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8'),
]);

test('main delegates browser behavior to focused initializers only', () => {
  const expectedInitializers = [
    ['theme', 'initTheme'],
    ['navigation', 'initNavigation'],
    ['project-showcase', 'initProjectShowcase'],
    ['reveals', 'initReveals'],
    ['clipboard', 'initClipboard'],
    ['contact-form', 'initContactForm'],
  ];

  const imports = [...main.matchAll(/^import \{ (init[\w]+) \} from '\.\/(.+)\.js';$/gm)]
    .map(([, initializer, module]) => [module, initializer]);

  assert.deepEqual(imports, expectedInitializers);

  for (const [, initializer] of expectedInitializers) {
    assert.match(main, new RegExp(`\\b${initializer}\\(\\);`));
  }

  assert.doesNotMatch(main, /\b(document|window|translations|projects|skillGroups)\b/);
});

test('the shared browser entry imports and initializes the theme utility', () => {
  assert.match(main, /^import \{ initTheme \} from '\.\/theme\.js';$/m);
  assert.match(main, /\binitTheme\(\);/);
});

test('keeps route language static instead of letting browser preferences own it', () => {
  assert.doesNotMatch(main, /initLanguage|['"]\.\/language\.js['"]/);
  assert.doesNotMatch(baseLayout, /localStorage\.getItem\('lang'\)/);
  assert.doesNotMatch(baseLayout, /navigator\.language/);
  assert.doesNotMatch(baseLayout, /setAttribute\('data-lang'/);
});

test('removes the generic client language module', async () => {
  await assert.rejects(access(new URL('../src/scripts/language.js', import.meta.url)));
});

test('the homepage relies on the document scrollport and static localized content', () => {
  assert.doesNotMatch(home, /Particles/);
  assert.doesNotMatch(home, /scroll-container/);
  assert.doesNotMatch(styles, /\.scroll-container/);
  assert.doesNotMatch(styles, /html\s*\{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(styles, /body\s*\{[^}]*overflow-x:\s*hidden/s);
  assert.match(skillCard, /data-skill-localized/);
  assert.match(skillCard, /data-skill-pt=/);
  assert.match(skillCard, /data-skill-en=/);
  assert.match(caseStudy, /<main id="case-study-content" class="case-study-main">/);
});
