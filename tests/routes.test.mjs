import assert from 'node:assert/strict';
import test from 'node:test';

const { caseStudyPath, homePath, pageUrl, routeConfig } = await import('../src/lib/routes.ts');

test('maps every shared homepage section to its localized fragment', () => {
  assert.deepEqual(routeConfig.pt.sections, {
    home: 'home',
    projects: 'projetos',
    skills: 'competencias',
    about: 'sobre',
    resume: 'cv',
    contact: 'contato',
  });
  assert.deepEqual(routeConfig.en.sections, {
    home: 'home',
    projects: 'projects',
    skills: 'skills',
    about: 'about',
    resume: 'resume',
    contact: 'contact',
  });
});

test('normalizes the project base for Portuguese and English homepage routes', () => {
  assert.equal(homePath('portifolio-miguelzg', 'pt'), '/portifolio-miguelzg/');
  assert.equal(homePath('/portifolio-miguelzg/', 'pt', 'projects'), '/portifolio-miguelzg/#projetos');
  assert.equal(homePath('portifolio-miguelzg/', 'en'), '/portifolio-miguelzg/en/');
  assert.equal(homePath('/portifolio-miguelzg', 'en', 'projects'), '/portifolio-miguelzg/en/#projects');
});

test('builds localized case-study path families without duplicating the base', () => {
  assert.equal(
    caseStudyPath('/portifolio-miguelzg/', 'pt', 'purchase-orders-api'),
    '/portifolio-miguelzg/projetos/purchase-orders-api/',
  );
  assert.equal(
    caseStudyPath('portifolio-miguelzg', 'en', 'beadwise'),
    '/portifolio-miguelzg/en/projects/beadwise/',
  );
});

test('composes absolute page URLs from a site origin and a normalized path', () => {
  assert.equal(
    pageUrl('https://miguelzgobbo.github.io', '/portifolio-miguelzg/en/projects/beadwise/'),
    'https://miguelzgobbo.github.io/portifolio-miguelzg/en/projects/beadwise/',
  );
  assert.equal(
    pageUrl('https://miguelzgobbo.github.io/', 'portifolio-miguelzg/'),
    'https://miguelzgobbo.github.io/portifolio-miguelzg/',
  );
});

test('rejects empty and unsafe case-study slugs', () => {
  for (const slug of ['', ' ', '../beadwise', 'beadwise/extra', 'bead wise']) {
    assert.throws(() => caseStudyPath('/portifolio-miguelzg/', 'en', slug), /slug/i);
  }
});
