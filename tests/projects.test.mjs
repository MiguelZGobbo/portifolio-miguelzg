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

test('keeps H3 projects compact', () => {
  const compactProjects = model.projects.filter(({ hierarchy }) => hierarchy === 'H3');

  assert.equal(compactProjects.length, 2);
  assert.ok(compactProjects.every(({ compact }) => compact === true));
});

test('does not expose the deferred financial app', () => {
  assert.equal(
    model.projects.some(({ slug, name }) => /financial|finance|finan(c|ç)/i.test(`${slug} ${name.pt} ${name.en}`)),
    false,
  );
});

test('provides localized summaries and evidence for every project', () => {
  for (const project of model.projects) {
    assert.equal(typeof project.summary.pt, 'string');
    assert.ok(project.summary.pt.length > 0);
    assert.equal(typeof project.summary.en, 'string');
    assert.ok(project.summary.en.length > 0);
    assert.ok(project.evidence.length > 0);
  }
});

test('provides a concise, consistent showcase presentation for every project', () => {
  for (const project of model.projects) {
    assert.ok(project.showcase, `${project.slug} should provide showcase content`);
    assert.equal(typeof project.showcase.summary.pt, 'string');
    assert.equal(typeof project.showcase.summary.en, 'string');
    assert.ok(project.showcase.summary.pt.length < project.summary.pt.length);
    assert.ok(project.showcase.summary.en.length < project.summary.en.length);
    assert.ok(project.showcase.technologies.length >= 2);
    assert.ok(project.showcase.technologies.length <= 4);
    assert.equal(project.showcase.aspects.length, 4);

    for (const aspect of project.showcase.aspects) {
      assert.ok(aspect.pt.length > 0);
      assert.ok(aspect.en.length > 0);
    }
  }
});
