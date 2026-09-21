# ADR-0002: Use localized static routes with Portuguese as the stable default

## Status

Accepted

## Date

2026-09-21

## Decision drivers

- Portuguese and English must be independently addressable and indexable without client-side language detection.
- Existing Portuguese homepage and case-study URLs are already public and should not be broken.
- Language switching should preserve the current homepage section or case study when an equivalent exists.
- Canonical, hreflang, Open Graph, structured data, and sitemap URLs must agree on one route identity.
- The site remains a static Astro project deployed below the GitHub Pages base path `/portifolio-miguelzg/`.
- Content must continue to come from the existing shared bilingual dictionaries and typed project data.

## Considered options

1. Keep one URL per page and continue changing language in the browser.
2. Prefix both languages (`/pt-br/` and `/en/`) and turn the existing root into a language selector.
3. Preserve Portuguese at the existing unprefixed routes and add English under `/en/`, with localized English page segments and anchors.

## Decision outcome

**Chosen option:** preserve Portuguese at the existing routes and add English under `/en/`.

The canonical public route families are:

- Portuguese homepage: `/portifolio-miguelzg/`
- English homepage: `/portifolio-miguelzg/en/`
- Portuguese case study: `/portifolio-miguelzg/projetos/{slug}/`
- English case study: `/portifolio-miguelzg/en/projects/{slug}/`

Homepage fragments are localized (`#projetos` ↔ `#projects`, `#sobre` ↔ `#about`, `#cv` ↔ `#resume`, `#contato` ↔ `#contact`). A central route module owns these mappings. The language utility is a normal anchor whose baseline destination works without JavaScript; browser enhancement may update the anchor to the currently observed equivalent section.

Each localized page renders its language, content, title, description, canonical URL, reciprocal hreflang links, Open Graph identity, and structured data at build time. Each page is self-canonical. `x-default` points to the Portuguese equivalent because the stable root is the deliberate fallback, not a neutral selector.

Astro remains in static output mode. Its i18n configuration recognizes `pt` as the unprefixed default locale and `en` as the prefixed locale. Route components may be thin locale-specific entries, but page composition and content sources remain shared.

The project-scoped `public/robots.txt` is removed: on a GitHub project site it would be served below the repository base path, while robots rules are only discovered at the host root. Sitemap discovery should use the generated sitemap and external search-console submission until the host root or a custom domain is controlled.

### Positive consequences

- Existing Portuguese URLs and external links remain valid.
- English pages and metadata are crawlable without JavaScript.
- Language switching becomes ordinary navigation with history, reload, copy-link, and direct-entry behavior.
- One route map prevents canonical, alternate, navigation, and project-card URLs from drifting.
- English path segments and fragments are meaningful to English readers.

### Negative consequences

- The two languages are not structurally symmetrical at the first path segment.
- Route entry files exist in both the root and `/en/` trees, although their composition is shared.
- `x-default` represents a deliberate Portuguese fallback instead of a neutral language selector.
- This repository cannot publish an effective host-root robots file under the current GitHub project-site deployment.

## Validation

- Pure route tests cover every locale, page kind, project slug, base path, and localized fragment.
- Built-page tests require six static routes and validate reciprocal absolute hreflang, self-canonical URLs, HTML language, localized metadata, Open Graph fields, and JSON-LD.
- Architecture tests prevent restoration of client-side language-owned content or metadata.
- Sitemap tests require all six canonical localized routes and exclude nonexistent or duplicate variants.
- Browser verification covers direct entry, reload, history, language switching on homepage sections and both case studies, and Phase 6 responsive/focus regressions.

## Sources

- [Astro internationalization routing](https://docs.astro.build/en/guides/internationalization/)
- [Astro i18n API](https://docs.astro.build/en/reference/modules/astro-i18n/)
- [Astro GitHub Pages deployment](https://docs.astro.build/en/guides/deploy/github/)
- [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google robots.txt location](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)

