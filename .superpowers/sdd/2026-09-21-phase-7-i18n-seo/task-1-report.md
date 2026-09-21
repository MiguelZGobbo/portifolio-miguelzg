# Phase 7 Task 1 Report: Canonical route registry and six static pages

## Files

- Added `src/lib/routes.ts` with the pure locale registry and route helpers.
- Added shared `HomePage` and `CaseStudyPage` compositions, plus thin English route entries.
- Updated the existing route entries, Astro i18n/trailing-slash configuration, home sections, navigation, project cards, and case-study return paths to consume shared localized route values.
- Added route-helper coverage and expanded generated-page tests for the English homepage and case studies.

## RED

Before implementation, `node --test --experimental-strip-types tests/routes.test.mjs tests/home-page.test.mjs tests/case-study-pages.test.mjs` failed as intended: `src/lib/routes.ts` was missing and the three English generated files did not exist.

## GREEN

After the implementation, the same focused command passed 20/20 tests. It covers normalized bases, both locale route families, every localized fragment, absolute URL composition, unsafe slug rejection, all six built routes, English visible content, and English case-study return paths.

## Full verification

- `npm test` — 61 passed, 0 failed.
- `npm run check` — 0 errors, 0 warnings, 0 hints.
- `npm run build` — 6 static pages built.
- `git diff --check` — no whitespace errors.

## Public routes

- `/portifolio-miguelzg/`
- `/portifolio-miguelzg/projetos/purchase-orders-api/`
- `/portifolio-miguelzg/projetos/beadwise/`
- `/portifolio-miguelzg/en/`
- `/portifolio-miguelzg/en/projects/purchase-orders-api/`
- `/portifolio-miguelzg/en/projects/beadwise/`

## Self-review

- Route paths and fragments are owned by one pure registry; route entries contain no duplicated content dictionaries or project records.
- Project-card and case-study links derive from typed case-study data and shared route helpers, preserving stable slugs while localizing only route segments and fragments.
- The English homepage and case-study output use English IDs and return/navigation paths; no `/en/` route emits a Portuguese fragment.
- Scope stayed within static routing and composition. Final canonical/alternate/structured-data work remains for Task 3.

## Commit

`feat(i18n): add localized static routes`

## Concerns

Task 2 remains responsible for replacing the existing browser language toggle and preference-driven client localization with route-based language navigation. This task renders the static URL identity correctly but deliberately does not implement that follow-on browser behavior.
