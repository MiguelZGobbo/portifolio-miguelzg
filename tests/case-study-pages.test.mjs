import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const caseStudies = [
  {
    slug: 'purchase-orders-api',
    repository: 'https://github.com/MiguelZGobbo/purchase-orders-api',
  },
  {
    slug: 'beadwise',
    repository: 'https://github.com/MiguelZGobbo/beadwise',
  },
];

const canonicalSections = [
  'overview',
  'context',
  'built',
  'decisions',
  'implementation',
  'validation',
  'result',
  'limitations',
  'evidence',
];

async function readBuiltCaseStudy(slug) {
  return readFile(resolve('dist', 'projetos', slug, 'index.html'), 'utf8');
}

test('builds each case-study route with ordered sections and its repository evidence', async () => {
  for (const { slug, repository } of caseStudies) {
    const page = await readBuiltCaseStudy(slug);
    const sectionPositions = canonicalSections.map((section) => {
      const position = page.indexOf(`data-case-study-section="${section}"`);
      assert.notEqual(position, -1, `${slug} should render the ${section} section`);
      return position;
    });

    assert.deepEqual(
      [...sectionPositions].sort((left, right) => left - right),
      sectionPositions,
      `${slug} should keep its case-study sections in canonical order`,
    );
    assert.ok(page.includes(`href="${repository}"`), `${slug} should expose its public repository`);
  }
});

test('keeps BeadWise current state and prototype caveat near the beginning', async () => {
  const page = await readBuiltCaseStudy('beadwise');
  const overviewStart = page.indexOf('data-case-study-section="overview"');
  const contextStart = page.indexOf('data-case-study-section="context"');
  const initialContent = page.slice(0, contextStart);

  assert.notEqual(overviewStart, -1, 'BeadWise should have an overview section');
  assert.ok(
    page.indexOf('em desenvolvimento') < overviewStart,
    'BeadWise should state that it is in development before the case-study sections',
  );
  assert.match(initialContent, /não é produto final/);
  assert.match(page, /prototypes ainda não equivalem a backend final/);
});

test('uses shared navigation links that return to homepage anchors through the configured base URL', async () => {
  for (const { slug } of caseStudies) {
    const page = await readBuiltCaseStudy(slug);
    const navigation = page.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';

    for (const anchor of ['home', 'projetos', 'sobre', 'cv', 'contato']) {
      assert.ok(
        navigation.includes(`href="/portifolio-miguelzg/#${anchor}"`),
        `${slug} navigation should link back to homepage #${anchor}`,
      );
    }
  }
});
