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

const siteUrl = 'https://miguelzgobbo.github.io/portifolio-miguelzg/';

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

test('discloses each BeadWise maturity state separately before the overview', async () => {
  const page = await readBuiltCaseStudy('beadwise');
  const maturityStart = page.indexOf('data-case-study-maturity');
  const overviewStart = page.indexOf('data-case-study-section="overview"');
  const maturity = page.slice(maturityStart, overviewStart);

  assert.notEqual(maturityStart, -1, 'BeadWise should render a maturity disclosure');
  assert.ok(maturityStart < overviewStart, 'maturity disclosure should appear before the overview');
  assert.match(maturity, /data-case-study-maturity-state="observed"/);
  assert.match(maturity, /data-case-study-maturity-state="prototyped"/);
  assert.match(maturity, /data-case-study-maturity-state="specified"/);
  assert.match(maturity, /data-case-study-maturity-state="planned"/);
  assert.match(maturity, /data-case-study-maturity-state="approved"/);
  assert.match(maturity, /40\/40 harnesses[\s\S]*PROVEN = 0/);
  assert.match(maturity, /234 Feature Specs[\s\S]*90 SPECIFIED[\s\S]*não são funcionalidades implementadas/);
  assert.match(maturity, /RESEARCH, BLOCKED ou DEFERRED[\s\S]*não constituem funcionalidade de produto/);
  assert.match(maturity, /APPROVED = 0[\s\S]*backend final, UI, DI, IPC ou contratos finais/);
});

test('emits page-specific canonical and Open Graph URLs for each case study', async () => {
  for (const { slug } of caseStudies) {
    const page = await readBuiltCaseStudy(slug);
    const pageUrl = `${siteUrl}projetos/${slug}/`;

    assert.ok(page.includes(`<link rel="canonical" href="${pageUrl}">`));
    assert.ok(page.includes(`<meta property="og:url" content="${pageUrl}">`));
  }
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
