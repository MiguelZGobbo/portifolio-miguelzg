# ADR-0003: Keep the portfolio on two localized homepages

## Status

Accepted

## Date

2026-09-24

## Decision drivers

- The editorial layout presents projects in a continuous, readable sequence on the homepage.
- The project owner chose to remove case studies and their links entirely.
- The site remains a static Astro portfolio with Portuguese and English pages.

## Considered options

1. Keep case-study pages and links alongside the project list.
2. Hide the links but keep the pages available by direct URL.
3. Remove the pages, links, and exclusive content, leaving the repository links on the homepages.

## Decision outcome

**Chosen option:** publish only `/portifolio-miguelzg/` and `/portifolio-miguelzg/en/`. The four projects retain their order, hierarchy, summaries, states, and GitHub links. BeadWise remains identified as in development.

The four former case-study URLs are no longer generated or listed in the sitemap. No redirects are provided, so previously shared direct URLs return 404 after publication. Their exclusive content, route helpers, components, and tests are removed. The active navigation item continues to identify the current homepage section; the separate reading-progress bar is removed.

This decision supersedes the case-study route portions of ADR-0001 and ADR-0002. Their static-content boundary, native navigation, and localized homepage decisions remain in force.

## Consequences

- Visitors can scan all projects without leaving the homepage and can open each repository directly.
- Long-form technical detail from the case studies is no longer published on this site.
- Existing external links to the former pages stop working.

## Validation

- The build emits exactly two HTML pages and the sitemap lists only their canonical URLs.
- Both languages render four projects with the correct hierarchy and GitHub destinations, without case-study actions.
- Theme, language, anchor navigation, keyboard focus, responsive layout, and reduced-motion behavior remain usable.
