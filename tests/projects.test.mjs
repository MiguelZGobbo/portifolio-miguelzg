import test from 'node:test';
import assert from 'node:assert/strict';

const model = await import('../src/data/projects.ts');

test('keeps the canonical project hierarchy and public order', () => {
  assert.deepEqual(
    model.projects.map(({ slug, hierarchy }) => [slug, hierarchy]),
    [
      ['purchase-orders-api', 'H1'],
      ['beadwise', 'H2'],
      ['portfolio', 'H3'],
      ['task-management-api', 'H3'],
    ],
  );
});

test('communicates BeadWise as in development in both supported languages', () => {
  const beadWise = model.getProjectBySlug('beadwise');

  assert.ok(beadWise);
  assert.equal(beadWise.state.pt, 'em desenvolvimento');
  assert.equal(beadWise.state.en, 'in development');
});

test('exposes only H1 and H2 projects as case studies', () => {
  assert.deepEqual(
    model.caseStudyProjects.map(({ slug, hierarchy }) => [slug, hierarchy]),
    [
      ['purchase-orders-api', 'H1'],
      ['beadwise', 'H2'],
    ],
  );

  assert.equal(model.getProjectBySlug('purchase-orders-api'), model.caseStudyProjects[0]);
  assert.equal(model.getProjectBySlug('beadwise'), model.caseStudyProjects[1]);
  assert.equal(model.getProjectBySlug('missing-project'), undefined);
});

test('keeps H3 projects compact and without case-study content', () => {
  const compactProjects = model.projects.filter(({ hierarchy }) => hierarchy === 'H3');

  assert.equal(compactProjects.length, 2);
  assert.ok(compactProjects.every(({ compact, caseStudy }) => compact === true && caseStudy === undefined));
});

test('does not expose the deferred financial app', () => {
  assert.equal(
    model.projects.some(({ slug, name }) => /financial|finance|finan(c|ç)/i.test(`${slug} ${name.pt} ${name.en}`)),
    false,
  );
});

test('provides localized summaries, evidence, and all case-study sections only where supported', () => {
  const requiredSections = [
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

  for (const project of model.projects) {
    assert.equal(typeof project.summary.pt, 'string');
    assert.ok(project.summary.pt.length > 0);
    assert.equal(typeof project.summary.en, 'string');
    assert.ok(project.summary.en.length > 0);
    assert.ok(project.evidence.length > 0);
  }

  for (const project of model.caseStudyProjects) {
    assert.ok(project.caseStudy);
    for (const section of requiredSections) {
      assert.ok(project.caseStudy[section], `${project.slug} is missing ${section}`);
    }
  }
});
