import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [main, home, styles, language, skillCard] = await Promise.all([
  readFile(new URL('../src/scripts/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/scripts/language.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/SkillCard.astro', import.meta.url), 'utf8'),
]);

test('main delegates browser behavior to focused initializers only', () => {
  const expectedInitializers = [
    ['theme', 'initTheme'],
    ['language', 'initLanguage'],
    ['navigation', 'initNavigation'],
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

test('the homepage relies on the document scrollport and static localized content', () => {
  assert.doesNotMatch(home, /Particles/);
  assert.doesNotMatch(home, /scroll-container/);
  assert.doesNotMatch(styles, /\.scroll-container/);
  assert.doesNotMatch(styles, /html\s*\{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(language, /\b(innerHTML|renderProjects|renderSkills)\b/);
  assert.match(skillCard, /data-skill-localized/);
  assert.match(skillCard, /data-skill-pt=/);
  assert.match(skillCard, /data-skill-en=/);
});
