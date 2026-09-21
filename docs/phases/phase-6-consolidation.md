# Portfolio V2 Phase 6 consolidation

## Status and preserved decisions

Phase 6 is complete. The accessibility implementation from Tasks 1–3 and the integrated browser corrections from Task 4 preserve the Phase 5 architecture:

- the public order remains Hero, Projects, Competencies, Profile and education, Curriculum, and Contact;
- the project order and evidence levels remain Purchase Orders API (H1), BeadWise (H2), Portfolio Miguel ZG (H3), and Task Management API (H3);
- only Purchase Orders API and BeadWise have case-study routes;
- native document scrolling, ordinary anchors, static Astro output, and the configured GitHub Pages base path remain in place;
- the navigation destinations remain Projects, About, Resume, and Contact;
- no new visual language, internal scroll container, or input interception was introduced.

The target for this phase was WCAG 2.2 Level AA, with an additional reduced-motion contract required by the project handoff. The normative reference is the [W3C WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/). The audit used the official Understanding guidance for [Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html), [Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), [Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html), and [Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html).

This document records engineering evidence against that target. It is not a certified conformance claim.

## Implementation summary

### Semantics and navigation

- The homepage and each case study expose one main landmark, a labeled primary navigation, one page-specific `h1`, and a logical `h2` outline.
- The skip link, page titles, page language, unique IDs, and names/roles/values for interactive controls were checked in the generated pages and the browser accessibility representation.
- Section observation expresses the active homepage destination with `aria-current="location"` for Projects, About, Resume, and Contact.
- Theme and language utilities remain keyboard-operable and available in the compact mobile header. The narrowest header uses an intentional `Miguel` brand label instead of clipping the full desktop wordmark.

### Contact-form feedback

- Required and email-format errors are localized, attached to their fields, synchronized through `aria-invalid` and `aria-describedby`, summarized in a persistent polite status region, and focus the first invalid field.
- Input correction clears the corresponding field error without hiding other outstanding errors.
- Sending, success, and failure states are announced without an unnecessary focus move. Success clears submitted fields; failure retains them.
- The honeypot stays silent, does not load EmailJS, and is removed from keyboard and accessibility interaction with an inert, `aria-hidden` wrapper. No real contact message was sent during the audit.
- Light and dark themes use separate error tokens. Independently calculated contrast is 5.75:1 or higher for the light token and 6.68:1 or higher for the dark token against the actual page/form surfaces, meeting the 4.5:1 normal-text and 3:1 meaningful-indicator thresholds covered by the regression.

### Reflow, focus, and targets

- Interactive targets have explicit minimum sizing, with 44 CSS px mobile utility targets.
- Fixed navigation and the mobile contact footer have focus-safe scroll offsets. Complete forward and reverse keyboard passes on the desktop homepage and on both named case studies at desktop and mobile widths left every focused control visible and unobscured.
- Decorative waves, raw-line layers, and the rotating profile border clip and paint within their owning boxes instead of expanding the document scroll area.
- Project/card tracks and the BeadWise maturity list can shrink and wrap long content at 320 CSS px.
- Root scrolling is immediate, preventing smooth-scroll animation from leaving newly focused elements temporarily off-screen.

### Reduced motion

- One final `prefers-reduced-motion: reduce` block wins the cascade after component rules.
- It disables smooth scrolling, decorative wave/raw motion, reveal transitions, navigation-indicator movement, and non-essential hover transforms; reveal initialization exposes content immediately.
- The available Chromium browser surfaces did not advertise a media-emulation capability, so the reduce preference could not be manually toggled. Source/cascade contract assertions cover the fallback, but this phase does not claim a manually emulated reduced-motion session.

## Automated verification

Final verification on 2026-09-21:

| Command | Result |
| --- | --- |
| `npm test` | 47 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo; its pretest build also completed |
| `npm run check` | 40 files; 0 errors, 0 warnings, 0 hints |
| `npm run build` | 3 static routes built successfully; sitemap generated |
| `git diff --check` | no whitespace errors |

The three built routes were:

- `/index.html`
- `/projetos/purchase-orders-api/index.html`
- `/projetos/beadwise/index.html`

## Browser matrix and evidence

The production build was served only on `127.0.0.1`. No publish, deployment, or external form submission occurred.

### Reflow and fixed controls

| Requested viewport | Browser client/scroll width | Result |
| --- | --- | --- |
| 320 × 800 | 305 / 305 | no horizontal scroll; compact brand and both utilities present without overlap |
| 390 × 844 | 375 / 375 | no horizontal scroll or lost controls |
| 639 / 641 px | 624 / 624 and 626 / 626 | both sides of the 640 px breakpoint passed |
| 768 / 769 px | 753 / 753 and 754 / 754 | both sides of the intermediate breakpoint passed |
| 900 / 901 px | 885 / 885 and 886 / 886 | both sides of the 900 px breakpoint passed |
| 1199 / 1200 px | 1184 / 1184 and 1185 / 1185 | both sides of the desktop breakpoint passed |
| 1440 × 900 | 1425 / 1425 | full desktop layout passed |

The 641/639 and 320 CSS px checks cover the practical 200% and 400%-equivalent reflow targets. At 320 px, an audit-only same-origin harness applied line height 1.5, paragraph spacing 2em, letter spacing .12em, word spacing .16em, and deliberately long localized hero/CTA strings. Client width and scroll width remained equal and meaningful content and controls remained present. The temporary harness lived only in ignored build output and was removed by the final build.

### Functional and visual evidence

- Keyboard: the desktop homepage completed mirrored 29-control Tab and Shift+Tab sequences. Purchase Orders API and BeadWise each completed mirrored eight-control sequences at 1280 × 800 and 390 × 844. Every pass had logical order, visible/unobscured focus, and no trap. Enter and Space activated theme/language controls.
- Navigation: activating Projects, About, Resume, and Contact updated `aria-current="location"` to the matching destination.
- Theme/language: PT → EN → PT and dark → light → dark cycles updated labels, copy, title, theme metadata, and pressed state. Twenty rapid paired toggles returned to a coherent initial state. Both utilities were available at 320 px.
- Forms: empty, whitespace-only, malformed email, per-field clearing, silent honeypot, sending, success, and failure were exercised in the real UI against a stubbed EmailJS boundary. No external message was transmitted.
- Semantics: homepage and both case studies had one main landmark, correct titles/language, unique IDs, named controls, and logical heading outlines. The BeadWise route separately exposed all five maturity states.
- Visual inspection: Hero, Projects, Competencies, About, résumé, and Contact were each inspected in light mode at 1280 × 800 and 390 × 844. Each retained readable hierarchy and contrast, client width equaled scroll width, controls remained available, and fixed top/bottom navigation did not collide with content. Dark invalid-form feedback was separately inspected with the new error token. Both case-study layouts were also inspected at mobile and desktop sizes in their relevant light/dark states. No clipping, missing control, or navigation collision remained.
- Console: a fresh production-route load produced no new browser warnings or errors. Earlier MutationObserver errors were isolated to temporary audit harness pages with intentionally incomplete shells, not production routes.

Screenshots were inspected interactively and were not retained as repository artifacts.

## Issues found and corrections

Each correction followed RED → minimal implementation → focused GREEN → affected browser recheck.

- The full wordmark collided with mobile utilities at 320 px. A failing generated-page/style assertion preceded the compact mobile brand.
- Raw decorative containers and the rotating profile border expanded intermediate-width scroll areas. Failing containment/animation-owner tests preceded stationary clipping containers, child-only motion, paint containment, and a clipped profile border.
- Smooth scrolling temporarily left newly focused elements off-screen. A failing root-scroll contract preceded immediate scrolling.
- BeadWise maturity rows could enforce their min-content width at 320 px. Failing shrink/wrap assertions preceded `min-width: 0` and safe wrapping.
- The fixed mobile footer covered the focused submit button. A failing mobile scroll-padding assertion preceded the larger focus-safe bottom inset.
- The honeypot combined `aria-hidden="true"` with a focusable descendant carrying `tabindex="-1"`. A failing markup assertion preceded the inert wrapper and removal of the descendant tabindex while preserving silent anti-bot behavior.
- The shared `#AA3333` error color fell below 4.5:1 for text and 3:1 for invalid borders/focus outlines on dark surfaces. A failing theme-token contrast test independently calculated the ratios before the dark token changed to `#FF9B9B`; focused tests then passed, and the real dark empty-form state exposed the new color on messages, borders, and the focused outline.

The deferred Task 3 test-structure minor was already resolved in `c033cee`; review confirmed no further action was needed.

## Limitations, non-claims, and residual risk

- No formal WCAG certification or legal conformance statement is made.
- No independent session with a human screen-reader user was performed. The evidence covers generated semantics, browser accessibility representation, keyboard operation, and live-region behavior, not the usability of every screen-reader/browser combination.
- The available browser surface could not emulate reduced motion. Automated cascade/behavior contracts cover the implementation, but a manual reduce-preference session remains a useful future cross-browser check.
- Error-state text and indicator contrast now have instrumented token/background regression coverage. Other visual states were inspected for regressions, but this audit did not produce an instrumented color-contrast report for every rendered state.
- External EmailJS delivery was intentionally stubbed; the audit verifies the local UI boundary and state handling, not third-party network delivery.

## Phase 7 handoff

Phase 7 should introduce independently addressable PT and EN routes while preserving all Phase 6 behavior. It must include:

- context-preserving language switching between equivalent homepage sections and case-study routes;
- localized titles, descriptions, Open Graph metadata, and other route metadata;
- reciprocal `hreflang` declarations and explicit canonical rules;
- localized structured data;
- sitemap and robots decisions for every language route;
- regression coverage ensuring the Phase 6 semantics, keyboard order, form feedback, responsive reflow, target sizing, focus safety, and reduced-motion contract remain intact.
