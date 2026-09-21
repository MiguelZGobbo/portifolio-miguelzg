# Phase 7 Task 2 Report: Route-based language switching

## Files

- Replaced the visible language button with a localized alternate-language anchor in `LangToggle`.
- Passed each page's alternate default and homepage section alternates through `Nav`, `HomePage`, and `CaseStudyPage` using the Task 1 route helpers.
- Loaded the shared browser entry on all six routes, so theme and language utilities render and initialize on case studies too.
- Added `updateLanguageDestination` to the navigation observer; it changes only the language-link destination alongside observed `aria-current` state.
- Deleted the obsolete generic browser language module and added anchor parity styling.
- Added focused navigation, architecture, homepage, and case-study generated-page regression coverage.

## RED

`node --test --experimental-strip-types tests/navigation.test.mjs tests/architecture.test.mjs tests/home-page.test.mjs tests/case-study-pages.test.mjs` failed as expected before implementation:

- `updateLanguageDestination` was not exported.
- `language.js` still existed.
- Built pages still rendered an inert language button, did not expose alternate homepage fragments, omitted case-study utilities, and lacked reciprocal case-study language links.

## GREEN

The focused command passed 29/29 after implementation and a fresh static build. It verifies the active section alternate, stable fallback, unchanged `aria-current`, direct homepage and case-study links, `hreflang`, all-route theme/language controls, and removal of the generic client language module.

## Alternate mappings

| Current route/context | Alternate destination |
| --- | --- |
| PT homepage | `/portifolio-miguelzg/en/` |
| PT projects / about / résumé / contact | `/portifolio-miguelzg/en/#projects`, `/portifolio-miguelzg/en/#about`, `/portifolio-miguelzg/en/#resume`, `/portifolio-miguelzg/en/#contact` |
| EN homepage | `/portifolio-miguelzg/` |
| EN projects / about / résumé / contact | `/portifolio-miguelzg/#projetos`, `/portifolio-miguelzg/#sobre`, `/portifolio-miguelzg/#cv`, `/portifolio-miguelzg/#contato` |
| PT purchase-orders-api case study | `/portifolio-miguelzg/en/projects/purchase-orders-api/` |
| EN purchase-orders-api case study | `/portifolio-miguelzg/projetos/purchase-orders-api/` |
| PT beadwise case study | `/portifolio-miguelzg/en/projects/beadwise/` |
| EN beadwise case study | `/portifolio-miguelzg/projetos/beadwise/` |

## Full verification

- Focused route/navigation tests — 29 passed, 0 failed.
- `npm test` — 67 passed, 0 failed.
- `npm run check` — 0 errors, 0 warnings, 0 hints.
- `npm run build` — 6 static pages built.
- `git diff --check` — no whitespace errors.

## Self-review

- The no-JavaScript baseline is always a real localized anchor, including on both case-study pairs.
- Homepage enhancement replaces only the fragment after an observed native-scroll state; it does not intercept clicks, write history, or scroll programmatically.
- Route helpers generate every alternate path, preserving the GitHub Pages base path exactly once.
- Case studies include the same shared entry and controls as homepages, with unique IDs per rendered document.
- The anchor retains the prior utility class, 44px mobile target, and focus styles; anchor-specific font and decoration rules preserve visual parity.
- No client language preference, language detection, generic content translation, or metadata mutation remains callable.

## Commit

`refactor(i18n): use route-based language switching`

## Concerns

None. Browser enhancement is intentionally limited to section-fragment preservation; direct links and browser history remain native.
