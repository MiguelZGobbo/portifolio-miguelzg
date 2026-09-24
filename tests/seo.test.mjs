import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const siteUrl = 'https://miguelzgobbo.github.io/portifolio-miguelzg/';
const imageUrl = `${siteUrl}img/foto-perfil.jpeg`;

const pages = [
  {
    file: ['index.html'],
    lang: 'pt-BR',
    dataLang: 'pt',
    title: 'Miguel — Engenharia de Software',
    description: 'Portfólio de Miguel Zager Gobbo — estudante de Engenharia de Software com foco em backend, sistemas e infraestrutura.',
    canonical: siteUrl,
    pt: siteUrl,
    en: `${siteUrl}en/`,
    ogType: 'website',
    ogLocale: 'pt_BR',
    ogAlternateLocale: 'en_US',
    siteName: 'Portfólio de Miguel Zager Gobbo',
    imageAlt: 'Foto de perfil de Miguel Zager Gobbo',
    personJobTitle: 'Desenvolvedor de Software',
  },
  {
    file: ['en', 'index.html'],
    lang: 'en',
    dataLang: 'en',
    title: 'Miguel — Software Engineering',
    description: 'Miguel Zager Gobbo portfolio — Software Engineering student focused on backend, systems and infrastructure.',
    canonical: `${siteUrl}en/`,
    pt: siteUrl,
    en: `${siteUrl}en/`,
    ogType: 'website',
    ogLocale: 'en_US',
    ogAlternateLocale: 'pt_BR',
    siteName: 'Miguel Zager Gobbo Portfolio',
    imageAlt: 'Profile photo of Miguel Zager Gobbo',
    personJobTitle: 'Software Developer',
  },
];

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]));
}

function tags(page, tagName) {
  return [...page.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'g'))].map(([tag]) => attributes(tag));
}

function one(items, message) {
  assert.equal(items.length, 1, message);
  return items[0];
}

function meta(page, key, value) {
  return one(
    tags(page, 'meta').filter((entry) => entry[key] === value),
    `expected one ${key}="${value}" meta tag`,
  ).content;
}

function title(page) {
  return page.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
}

function structuredData(page) {
  const scripts = [...page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, rawAttributes]) => attributes(rawAttributes).type === 'application/ld+json');
  assert.equal(scripts.length, 1, 'expected one JSON-LD script');
  return JSON.parse(scripts[0][2]);
}

for (const expected of pages) {
  test(`renders complete localized metadata for ${expected.canonical}`, async () => {
    const page = await readFile(resolve('dist', ...expected.file), 'utf8');
    const html = one(tags(page, 'html'), 'expected one html element');
    const links = tags(page, 'link');
    const canonicals = links.filter((link) => link.rel === 'canonical');
    const alternates = links.filter((link) => link.rel === 'alternate');

    assert.equal(html.lang, expected.lang);
    assert.equal(html['data-lang'], expected.dataLang);
    assert.equal(title(page), expected.title);
    assert.equal(meta(page, 'name', 'description'), expected.description);
    assert.equal(one(canonicals, 'expected one canonical link').href, expected.canonical);
    assert.equal(alternates.length, 3, 'expected exactly three language alternates');
    assert.deepEqual(
      Object.fromEntries(alternates.map(({ hreflang, href }) => [hreflang, href])),
      { 'pt-BR': expected.pt, en: expected.en, 'x-default': expected.pt },
    );

    assert.equal(meta(page, 'property', 'og:type'), expected.ogType);
    assert.equal(meta(page, 'property', 'og:title'), expected.title);
    assert.equal(meta(page, 'property', 'og:description'), expected.description);
    assert.equal(meta(page, 'property', 'og:url'), expected.canonical);
    assert.equal(meta(page, 'property', 'og:image'), imageUrl);
    assert.equal(meta(page, 'property', 'og:image:alt'), expected.imageAlt);
    assert.equal(meta(page, 'property', 'og:site_name'), expected.siteName);
    assert.equal(meta(page, 'property', 'og:locale'), expected.ogLocale);
    assert.equal(meta(page, 'property', 'og:locale:alternate'), expected.ogAlternateLocale);

    assert.equal(meta(page, 'name', 'twitter:card'), 'summary_large_image');
    assert.equal(meta(page, 'name', 'twitter:title'), expected.title);
    assert.equal(meta(page, 'name', 'twitter:description'), expected.description);
    assert.equal(meta(page, 'name', 'twitter:image'), imageUrl);
    assert.equal(meta(page, 'name', 'twitter:image:alt'), expected.imageAlt);

    const jsonLd = structuredData(page);
    assert.equal(jsonLd['@context'], 'https://schema.org');
    assert.ok(Array.isArray(jsonLd['@graph']), 'JSON-LD should expose an explicit graph');
    const webPages = jsonLd['@graph'].filter((node) => node['@type'] === 'WebPage');
    const webPage = one(webPages, 'expected one WebPage node');
    assert.equal(webPage['@id'], expected.canonical);
    assert.equal(webPage.url, expected.canonical);
    assert.equal(webPage.name, expected.title);
    assert.equal(webPage.description, expected.description);
    assert.equal(webPage.inLanguage, expected.lang);

    const people = jsonLd['@graph'].filter((node) => node['@type'] === 'Person');
    const person = one(people, 'expected one homepage Person node');
    assert.equal(webPage.mainEntity['@id'], `${expected.canonical}#person`);
    assert.deepEqual(person, {
      '@type': 'Person',
      '@id': `${expected.canonical}#person`,
      name: 'Miguel Zager Gobbo',
      jobTitle: expected.personJobTitle,
      image: imageUrl,
      email: 'mailto:miguelzgobbo@gmail.com',
      sameAs: [
        'https://www.linkedin.com/in/miguel-zager-gobbo',
        'https://github.com/MiguelZGobbo',
      ],
    });
  });
}

test('publishes exactly the two homepage routes through generated sitemap files', async () => {
  const index = await readFile(resolve('dist', 'sitemap-index.xml'), 'utf8');
  const sitemapUrls = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.ok(sitemapUrls.length > 0, 'sitemap index should reference at least one generated sitemap');

  const discovered = [];
  for (const sitemapUrl of sitemapUrls) {
    const parsedUrl = new URL(sitemapUrl);
    assert.equal(parsedUrl.origin, new URL(siteUrl).origin);
    const relativePath = parsedUrl.pathname.replace('/portifolio-miguelzg/', '');
    const sitemap = await readFile(resolve('dist', relativePath), 'utf8');
    assert.doesNotMatch(
      sitemap,
      /<xhtml:link\b|hreflang=/i,
      'HTML head links are the only hreflang mechanism; sitemap alternates must stay disabled',
    );
    discovered.push(...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url));
  }

  const expectedUrls = pages.map(({ canonical }) => canonical).sort();
  assert.deepEqual([...discovered].sort(), expectedUrls);
  assert.equal(new Set(discovered).size, discovered.length, 'sitemap URLs should not be duplicated');
  for (const url of discovered) {
    const parsedUrl = new URL(url);
    assert.equal(parsedUrl.protocol, 'https:');
    assert.equal(parsedUrl.search, '');
    assert.equal(parsedUrl.hash, '');
    assert.equal(parsedUrl.pathname.endsWith('/'), true);
    assert.doesNotMatch(parsedUrl.pathname, /\/(?:pt|pt-br)\//i);
  }
});

test('does not emit a project-scoped robots file', async () => {
  await assert.rejects(access(resolve('dist', 'robots.txt')), { code: 'ENOENT' });
});
