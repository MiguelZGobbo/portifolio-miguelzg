import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const page = await readFile(resolve('dist/index.html'), 'utf8');

function positionOf(id) {
  return page.indexOf(`id="${id}"`);
}

function projectMarkup(slug) {
  const start = page.indexOf(`data-project="${slug}"`);
  const next = page.indexOf('data-project="', start + 1);

  assert.notEqual(start, -1, `expected ${slug} to be rendered`);
  return page.slice(start, next === -1 ? undefined : next);
}

test('renders the approved hero copy and canonical homepage hierarchy', () => {
  assert.match(page, />Desenvolvedor de Software<\/h1>/);
  assert.match(
    page,
    /Estudo Engenharia de Software e tenho preferência por desenvolvimento backend\. Nos meus projetos, procuro entender o problema, estruturar a implementação e verificar o resultado de cada etapa antes de avançar\./,
  );
  assert.match(page, /Busco estágio e oportunidades iniciais em desenvolvimento de software\./);

  const sectionIds = ['home', 'projetos', 'competencias', 'sobre', 'cv', 'contato'];
  for (const id of sectionIds) {
    assert.notEqual(positionOf(id), -1, `expected #${id} to be present`);
  }

  assert.deepEqual(
    [...sectionIds].sort((left, right) => positionOf(left) - positionOf(right)),
    sectionIds,
  );
});

test('renders all project levels with their available depth and visible state', () => {
  const purchaseOrders = projectMarkup('purchase-orders-api');
  const beadWise = projectMarkup('beadwise');
  const portfolio = projectMarkup('portfolio');
  const taskApi = projectMarkup('task-management-api');

  assert.match(purchaseOrders, /data-project-hierarchy="H1"/);
  assert.match(beadWise, /data-project-hierarchy="H2"/);
  assert.match(portfolio, /data-project-hierarchy="H3"[\s\S]*data-project-compact="true"/);
  assert.match(taskApi, /data-project-hierarchy="H3"[\s\S]*data-project-compact="true"/);

  assert.match(beadWise, /data-project-state="in-development"/);
  assert.match(beadWise, />em desenvolvimento</);

  assert.match(purchaseOrders, /href="\/portifolio-miguelzg\/projetos\/purchase-orders-api\/"/);
  assert.match(beadWise, /href="\/portifolio-miguelzg\/projetos\/beadwise\/"/);
  assert.doesNotMatch(portfolio, /project-case-study-link/);
  assert.doesNotMatch(taskApi, /project-case-study-link/);
});

test('keeps global navigation focused on home, projects, profile, résumé, and contact', () => {
  const nav = page.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';
  const destinations = [...nav.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);

  assert.deepEqual(destinations, ['#home', '#projetos', '#sobre', '#cv', '#contato']);
});
