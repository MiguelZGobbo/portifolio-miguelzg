import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const page = await readFile(resolve('dist/index.html'), 'utf8');
const englishPage = await readFile(resolve('dist/en/index.html'), 'utf8');

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

test('renders the simplified hero copy and canonical homepage hierarchy', () => {
  const hero = sectionMarkup('home');

  assert.match(page, />Desenvolvedor de Software<\/h1>/);
  assert.match(
    page,
    /Estudo Engenharia de Software e tenho preferência por desenvolvimento backend\. Nos meus projetos, procuro entender o problema, estruturar a implementação e verificar o resultado de cada etapa antes de avançar\./,
  );
  assert.match(page, /Busco estágio e oportunidades iniciais em desenvolvimento de software\./);
  assert.doesNotMatch(hero, />Miguel Zager Gobbo<\/p>/);
  assert.doesNotMatch(hero, /class="hero-actions/);
  assert.doesNotMatch(hero, /href="#/);

  const sectionIds = ['home', 'projetos', 'competencias', 'sobre', 'contato'];
  for (const id of sectionIds) {
    assert.notEqual(positionOf(id), -1, `expected #${id} to be present`);
  }

  assert.deepEqual(
    [...sectionIds].sort((left, right) => positionOf(left) - positionOf(right)),
    sectionIds,
  );
});

test('builds both localized homepages with their own visible content and fragments', () => {
  assert.match(page, /<html lang="pt-BR"[^>]*data-lang="pt"/);
  assert.match(englishPage, /<html lang="en"/);
  assert.match(englishPage, /<html lang="en"[^>]*data-lang="en"/);
  assert.match(englishPage, />Software Developer<\/h1>/);
  for (const id of ['home', 'projects', 'skills', 'about', 'contact']) {
    assert.notEqual(englishPage.indexOf(`id="${id}"`), -1, `expected English #${id} to be present`);
  }
  assert.equal(englishPage.indexOf('id="resume"'), -1, 'resume must not remain an independent English anchor');
  assert.match(englishPage, /href="\/portifolio-miguelzg\/en\/projects\/purchase-orders-api\/"/);
  assert.match(englishPage, /href="\/portifolio-miguelzg\/en\/projects\/beadwise\/"/);
  assert.doesNotMatch(englishPage, /localStorage\.getItem\('lang'\)/);
  assert.doesNotMatch(englishPage, /navigator\.language/);
  assert.doesNotMatch(englishPage, /setAttribute\('data-lang'/);
});

test('renders direct reciprocal language links with section-specific alternate destinations', () => {
  const portugueseToggle = page.match(/<a id="lang-toggle"[^>]*>/)?.[0] ?? '';
  const englishToggle = englishPage.match(/<a id="lang-toggle"[^>]*>/)?.[0] ?? '';

  assert.match(portugueseToggle, /href="\/portifolio-miguelzg\/en\/"/);
  assert.match(portugueseToggle, /hreflang="en"/);
  assert.match(portugueseToggle, /data-language-sections="[^"]*&quot;competencias&quot;:&quot;\/portifolio-miguelzg\/en\/#skills&quot;[^"]*"/);
  assert.match(englishToggle, /href="\/portifolio-miguelzg\/"/);
  assert.match(englishToggle, /hreflang="pt-BR"/);
  assert.match(englishToggle, /data-language-sections="[^"]*&quot;skills&quot;:&quot;\/portifolio-miguelzg\/#competencias&quot;[^"]*"/);

  const portugueseLinks = page.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] ?? '';
  const englishLinks = englishPage.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.match(portugueseLinks, /href="#projetos"[^>]*data-language-alternate="\/portifolio-miguelzg\/en\/#projects"/);
  assert.match(portugueseLinks, /href="#competencias"[^>]*data-language-alternate="\/portifolio-miguelzg\/en\/#skills"/);
  assert.match(portugueseLinks, /href="#sobre"[^>]*data-language-alternate="\/portifolio-miguelzg\/en\/#about"/);
  assert.match(portugueseLinks, /href="#contato"[^>]*data-language-alternate="\/portifolio-miguelzg\/en\/#contact"/);
  assert.match(englishLinks, /href="#projects"[^>]*data-language-alternate="\/portifolio-miguelzg\/#projetos"/);
  assert.match(englishLinks, /href="#skills"[^>]*data-language-alternate="\/portifolio-miguelzg\/#competencias"/);
  assert.match(englishLinks, /href="#about"[^>]*data-language-alternate="\/portifolio-miguelzg\/#sobre"/);
  assert.match(englishLinks, /href="#contact"[^>]*data-language-alternate="\/portifolio-miguelzg\/#contato"/);
});

test('renders one navigable showcase with the canonical project order', () => {
  const projectsSection = sectionMarkup('projetos');
  const purchaseOrders = projectMarkup('purchase-orders-api');
  const beadWise = projectMarkup('beadwise');
  const portfolio = projectMarkup('portfolio');
  const taskApi = projectMarkup('task-management-api');

  assert.equal((projectsSection.match(/data-project-showcase/g) ?? []).length, 1);
  assert.equal((projectsSection.match(/data-project-panel/g) ?? []).length, 4);
  assert.match(projectsSection, /data-project-counter[^>]*>01 \/ 04</);
  assert.match(projectsSection, /data-project-direction="previous"[^>]*disabled/);
  assert.match(projectsSection, /data-project-direction="next"/);
  assert.match(purchaseOrders, /data-project-panel[^>]*data-active="true"/);
  for (const inactiveProject of [beadWise, portfolio, taskApi]) {
    assert.doesNotMatch(inactiveProject, /data-project-panel[^>]*(?:aria-hidden|inert)/);
  }

  assert.match(purchaseOrders, /href="\/portifolio-miguelzg\/projetos\/purchase-orders-api\/"/);
  assert.match(beadWise, /href="\/portifolio-miguelzg\/projetos\/beadwise\/"/);
  assert.doesNotMatch(portfolio, /project-case-study-link/);
  assert.doesNotMatch(taskApi, /project-case-study-link/);
  assert.doesNotMatch(projectsSection, /\bproject-(?:level|state|facts?)\b/);
  assert.doesNotMatch(projectsSection, />Origem</);
  assert.doesNotMatch(projectsSection, />Contribuição</);
  assert.doesNotMatch(projectsSection, />em desenvolvimento</);
});

test('renders accessible direct project navigation and a polite change announcement', () => {
  const projectsSection = sectionMarkup('projetos');
  const directNavigation = projectsSection.match(/<div class="project-showcase-nav"[^>]*role="navigation"[\s\S]*?<\/div>/)?.[0] ?? '';

  assert.match(projectsSection, /data-project-announcement[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(projectsSection, /aria-label="Projeto anterior"/);
  assert.match(projectsSection, /aria-label="Próximo projeto"/);
  assert.equal((directNavigation.match(/data-project-select=/g) ?? []).length, 4);
  assert.match(directNavigation, /data-project-select="0"[^>]*aria-current="true"/);
  assert.match(directNavigation, /data-project-select="1"[^>]*aria-controls="project-panel-beadwise"/);
});

test('keeps global navigation focused on home, projects, skills, profile, and contact', () => {
  const nav = page.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';
  const destinations = [...nav.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);

  assert.deepEqual(destinations, [
    '#home',
    '#home',
    '#projetos',
    '#competencias',
    '#sobre',
    '#contato',
    '/portifolio-miguelzg/en/',
  ]);
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
  assert.match(page, /<a id="lang-toggle"[^>]*aria-label="Switch to English"/);

  const links = page.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] ?? '';
  const destinations = [...links.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);
  assert.deepEqual(destinations, ['#home', '#projetos', '#competencias', '#sobre', '#contato']);
  assert.match(links, />Início<\/span>/);
  assert.match(links, />Competências<\/span>/);
  assert.doesNotMatch(links, />Currículo<\/span>/);
  assert.match(page, /<span class="logo-full">MIGUEL ZAGER GOBBO<\/span>/);
  assert.match(page, /<span class="logo-mobile">Miguel<\/span>/);
});

test('keeps résumé actions inside About without exposing a separate résumé anchor', () => {
  const about = sectionMarkup('sobre');
  const englishAboutStart = englishPage.indexOf('id="about"');
  const englishContactStart = englishPage.indexOf('<section', englishAboutStart + 1);
  const englishAbout = englishPage.slice(englishAboutStart, englishContactStart);

  assert.equal(positionOf('cv'), -1);
  assert.match(about, /class="cv-box profile-cv reveal"/);
  assert.equal((about.match(/data-cv/g) ?? []).length, 2);
  assert.match(englishAbout, /class="cv-box profile-cv reveal"/);
  assert.equal((englishAbout.match(/data-cv/g) ?? []).length, 2);
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

  const form = contact.match(/<form\b[\s\S]*?<\/form>/)?.[0] ?? '';
  const submit = form.match(/<button\b[^>]*id="btn-enviar"[^>]*>/)?.[0] ?? '';
  assert.match(submit, /\btype="button"/);
  assert.match(submit, /\bdisabled\b/);
  assert.doesNotMatch(form, /\bmethod="post"/i);
  assert.match(form, /<noscript>[\s\S]*href="mailto:miguelzgobbo@gmail\.com"[\s\S]*<\/noscript>/);

  const honeypot = contact.match(/<div class="hp-field"[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.match(honeypot, /<div class="hp-field"[^>]*aria-hidden="true"[^>]*\binert\b/);
  assert.doesNotMatch(honeypot, /\btabindex=/);
});
