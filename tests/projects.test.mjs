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
  const beadWise = model.projects.find(({ slug }) => slug === 'beadwise');

  assert.ok(beadWise);
  assert.equal(beadWise.state.pt, 'em desenvolvimento');
  assert.equal(beadWise.state.en, 'in development');
});

test('identifies each project with its localized kind', () => {
  assert.deepEqual(
    model.projects.map(({ slug, showcase }) => [slug, showcase.kind]),
    [
      ['purchase-orders-api', { pt: 'API REST · Backend', en: 'REST API · Backend' }],
      ['beadwise', { pt: 'Aplicação Windows', en: 'Windows application' }],
      ['portfolio', { pt: 'Site pessoal', en: 'Personal website' }],
      ['task-management-api', { pt: 'API REST · Backend', en: 'REST API · Backend' }],
    ],
  );
});

test('keeps complementary projects concise in both languages', () => {
  const compactProjects = model.projects.filter(({ hierarchy }) => hierarchy === 'H3');

  assert.equal(compactProjects.length, 2);
  for (const project of compactProjects) {
    assert.ok(project.showcase.summary.pt.length <= 250);
    assert.ok(project.showcase.summary.en.length <= 250);
  }
});

test('does not expose the deferred financial app', () => {
  assert.equal(
    model.projects.some(({ slug, name }) => /financial|finance|finan(c|ç)/i.test(`${slug} ${name.pt} ${name.en}`)),
    false,
  );
});

test('provides localized public content and repository destinations for every project', () => {
  for (const project of model.projects) {
    for (const lang of ['pt', 'en']) {
      for (const content of [project.name, project.state, project.ariaLabel, project.showcase.kind, project.showcase.summary]) {
        assert.ok(content[lang].length > 0, `${project.slug}: missing ${lang} content`);
      }
      if (project.image) {
        assert.ok(project.image.alt[lang].length > 0);
        if (project.image.caption) assert.ok(project.image.caption[lang].length > 0);
      }
    }
    assert.match(project.href, /^https:\/\/github\.com\/MiguelZGobbo\//);
  }
});

test('provides a concise, consistent showcase presentation for every project', () => {
  for (const project of model.projects) {
    assert.ok(project.showcase, `${project.slug} should provide showcase content`);
    assert.equal(typeof project.showcase.summary.pt, 'string');
    assert.equal(typeof project.showcase.summary.en, 'string');
    assert.ok(project.showcase.summary.pt.length <= 300);
    assert.ok(project.showcase.summary.en.length <= 300);
    assert.ok(project.showcase.technologies.length >= 2);
    assert.ok(project.showcase.technologies.length <= 4);
    assert.equal(project.showcase.aspects.length, 4);

    for (const aspect of project.showcase.aspects) {
      assert.ok(aspect.pt.length > 0);
      assert.ok(aspect.en.length > 0);
    }
  }
});
