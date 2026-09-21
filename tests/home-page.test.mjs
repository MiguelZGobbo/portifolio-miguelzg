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

function sectionMarkup(id) {
  const start = positionOf(id);
  const next = page.indexOf('<section', start + 1);

  assert.notEqual(start, -1, `expected #${id} to be present`);
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

test('renders a public state badge only for the in-development project', () => {
  const purchaseOrders = projectMarkup('purchase-orders-api');
  const beadWise = projectMarkup('beadwise');
  const portfolio = projectMarkup('portfolio');
  const taskApi = projectMarkup('task-management-api');

  assert.match(beadWise, /class="project-state project-state--in-development"/);
  assert.match(beadWise, />em desenvolvimento</);
  assert.doesNotMatch(purchaseOrders, /\bproject-state\b/);
  assert.doesNotMatch(portfolio, /\bproject-state\b/);
  assert.doesNotMatch(taskApi, /\bproject-state\b/);
});

test('keeps global navigation focused on home, projects, profile, résumé, and contact', () => {
  const nav = page.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';
  const destinations = [...nav.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);

  assert.deepEqual(destinations, ['#home', '#projetos', '#sobre', '#cv', '#contato']);
});

test('renders one page heading and a section heading for each home content section', () => {
  const pageHeadings = [...page.matchAll(/<h1\b/g)];
  assert.equal(pageHeadings.length, 1, 'the homepage should have one h1');

  for (const id of ['projetos', 'competencias', 'sobre', 'contato']) {
    assert.match(sectionMarkup(id), /<h2\b/, `#${id} should contain an h2`);
  }
});

test('renders named utility controls and preserves ordered in-page destinations', () => {
  assert.match(page, /<button id="theme-toggle"[^>]*aria-label="Mudar para tema escuro"/);
  assert.match(page, /<button id="lang-toggle"[^>]*aria-label="Switch to English"/);

  const links = page.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] ?? '';
  const destinations = [...links.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);
  assert.deepEqual(destinations, ['#projetos', '#sobre', '#cv', '#contato']);
});

test('renders native contact semantics with linked field errors and a polite status region', () => {
  const contact = sectionMarkup('contato');

  for (const [id, name, autocomplete] of [
    ['campo-nome', 'name', 'name'],
    ['campo-email', 'email', 'email'],
    ['campo-mensagem', 'message', 'off'],
  ]) {
    const control = contact.match(new RegExp(`<(?:input|textarea)\\b[^>]*id="${id}"[^>]*>`))?.[0] ?? '';
    assert.match(control, new RegExp(`\\bname="${name}"`));
    assert.match(control, new RegExp(`\\bautocomplete="${autocomplete}"`));
    assert.match(control, /\brequired\b/);
    assert.match(control, new RegExp(`\\baria-describedby="${id}-error"`));
    assert.match(contact, new RegExp(`id="${id}-error"`));
  }

  const errorIds = [...contact.matchAll(/<p class="field-error" id="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(errorIds, ['campo-nome-error', 'campo-email-error', 'campo-mensagem-error']);
  assert.equal(new Set(errorIds).size, errorIds.length, 'field error IDs should be unique');

  assert.match(contact, /id="form-aviso"[^>]*role="status"[^>]*aria-live="polite"/);
});
