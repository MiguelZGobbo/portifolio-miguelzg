# ADR-0001: Separate static content from browser behavior

## Status

Accepted

## Date

2026-09-17

## Decision drivers

- The frozen Portfolio V2 architecture requires a homepage plus real project case-study pages.
- Project entries have different hierarchy, maturity, public fields, and depth.
- Navigation must use native browser scrolling, history, deep links, and new-tab behavior.
- PT/EN and page-level SEO will need independently renderable pages in Phase 7.
- The current `main.js` combines navigation, scroll control, localization, rendering, effects, clipboard, theme, and form submission.
- Astro, the static build, and the existing GitHub Pages deployment remain useful.

## Considered options

1. Keep the single-page structure and reduce only the most problematic code in `main.js`.
2. Keep Astro, render content statically from typed data, create real project routes, and split browser behavior by capability.
3. Replace Astro or introduce a client-side application framework and router.

## Decision outcome

**Chosen option:** keep Astro and establish two explicit boundaries:

1. Typed content data feeds Astro components and statically generated pages.
2. Small browser modules enhance the generated HTML without owning content, routes, or scrolling.

The homepage remains the primary index. Purchase Orders API and BeadWise receive static case-study routes. Supporting projects remain compact homepage entries. Native anchors and document scrolling replace the internal scroll container and wheel/keyboard interception.

### Positive consequences

- Project hierarchy and heterogeneous depth are represented without artificial fields.
- Project pages, metadata, localized routes, and hreflang can be added in Phase 7 without another structural rewrite.
- Core content remains available without client-side JavaScript.
- Browser behavior can be changed and tested independently.
- The existing Astro build and deploy pipeline remains intact.

### Negative consequences

- The source tree gains several focused files instead of one central script.
- Phase 5 keeps the current visual language where possible, so CSS cleanup and final motion decisions remain for later phases.
- The temporary in-page PT/EN switch remains an enhancement until Phase 7 introduces independently addressable language pages.

## Validation

- Unit tests validate project hierarchy, maturity, and case-study eligibility.
- Built-page tests validate homepage order and the two project deep links.
- Architecture tests validate that `main.js` is only an initializer for focused browser modules.
- `npm run check` and `npm run build` must remain clean.
- Browser verification must confirm ordinary wheel, keyboard, anchor, history, and direct-route behavior.
