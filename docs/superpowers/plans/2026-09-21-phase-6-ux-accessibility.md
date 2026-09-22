# Phase 6 UX and Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the current portfolio structure reliably usable with keyboard, touch, zoom, reduced motion, and assistive technology while meeting the Phase 6 WCAG 2.2 AA target.

**Architecture:** Preserve the Phase 5 static Astro rendering and native document navigation. Improve semantics in the existing components, keep interaction code in focused browser modules, and verify generated pages with Node tests plus real-browser keyboard, responsive, motion, and form checks. Phase 7 still owns independently addressable PT/EN routes, so this phase keeps the existing language behavior while ensuring its control remains reachable.

**Tech Stack:** Astro 7, TypeScript, browser ES modules, CSS, Node test runner, manual Chromium accessibility and responsive audit.

**Spec:** `D:/dev/Projetos/portifólioV2 temporario/Handoff-Bloco-B.md` (Phase 6 only; canonical decisions already summarized in the current execution context)

## Global Constraints

- Target WCAG 2.2 AA; reduced-motion support is additionally required by the Phase 6 handoff.
- Preserve the frozen Phase 5 section and project hierarchy and native document scrolling.
- Keep navigation destinations in the established order: Projects, About, Resume, Contact.
- Do not introduce a new visual language or unrelated redesign.
- Keep public routes static and compatible with the configured GitHub Pages base path.
- Use English Conventional Commit messages.
- Do not merge into `main`.

## Review Focus

- A 320 CSS px viewport or 400% zoom must retain all content and controls without horizontal scrolling or concealed content.
- Fixed navigation must never obscure the focused element, including the last controls near the bottom of the page.
- Empty, whitespace-only, and malformed-email submissions must identify the affected field and explain the correction in the active language.
- Theme and language controls must be operable by keyboard and touch at every supported homepage viewport, including the mobile navigation state.
- Reduced-motion users must receive no non-essential smooth scrolling, reveal, decorative wave, hover-transform, or moving navigation-indicator animation.

---

### Task 1: Semantic document structure and reachable utilities

**Files:**
- Modify: `src/components/SectionTitle.astro`
- Modify: `src/components/Nav.astro`
- Modify: `src/components/ThemeToggle.astro`
- Modify: `src/components/LangToggle.astro`
- Modify: `src/scripts/navigation.js`
- Modify: `src/styles/global.css`
- Test: `tests/home-page.test.mjs`
- Test: `tests/case-study-pages.test.mjs`
- Test: `tests/navigation.test.mjs`

**Interfaces:**
- Consumes: existing `SectionTitle` props, `Nav` link order, translation keys, and `initNavigation()` behavior.
- Produces: real section `h2` headings, explicit utility-control names, reachable mobile controls, and section navigation state expressed as `aria-current="location"`.

- [ ] **Step 1: Write failing semantic and navigation tests**

Add generated-page assertions that each home content section has a real `h2`, the page has one `h1`, controls have accessible names, and the four destination links remain ordered. Update the navigation unit test to expect `aria-current="location"` for the active in-page destination and removal from inactive links.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test --experimental-strip-types tests/home-page.test.mjs tests/case-study-pages.test.mjs tests/navigation.test.mjs`

Expected: failures for missing semantic `h2` elements, unnamed utility buttons in source output, mobile-unreachable utilities, or the old `aria-current="page"` value.

- [ ] **Step 3: Implement the semantic and control changes**

Render the section title as an `h2`, preserve the decorative label separately, add localized initial `aria-label` values to both utility buttons, make the mobile controls visible in a compact top navigation group with at least 44 CSS px touch height, and use `aria-current="location"` for same-page section state. Keep the existing four navigation destinations and native anchors.

- [ ] **Step 4: Run focused and full verification**

Run the focused command from Step 2, then `npm test` and `npm run check`.

Expected: all tests pass, Astro reports zero diagnostics, and the production build still emits all three current routes.

- [ ] **Step 5: Commit**

Commit: `feat(accessibility): improve navigation semantics`

### Task 2: Accessible contact-form validation and status feedback

**Files:**
- Modify: `src/components/ContactForm.astro`
- Modify: `src/lib/i18n.ts`
- Modify: `src/scripts/contact-form.js`
- Modify: `src/styles/global.css`
- Create: `tests/contact-form.test.mjs`
- Modify: `tests/home-page.test.mjs`

**Interfaces:**
- Consumes: `initContactForm()`, translation dictionaries, EmailJS lazy loading, and the existing field IDs.
- Produces: `validateContactValues(values)` returning `{ fieldErrors, summaryKey }`, field-level error nodes, synchronized `aria-invalid`/`aria-describedby`, and a persistent polite status region.

- [ ] **Step 1: Write failing validation tests**

Cover valid values, whitespace-only name/message, malformed email, multiple simultaneous errors, and the honeypot path. Assert hand-derived translation keys rather than exact implementation structure. Add generated-markup assertions for `name`, `autocomplete`, `required`, error-description associations, and `role="status" aria-live="polite"`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test --experimental-strip-types tests/contact-form.test.mjs tests/home-page.test.mjs`

Expected: module export or validation-result failures and missing form semantics.

- [ ] **Step 3: Implement minimal validation and feedback**

Export a pure validation function, add localized required/invalid-email messages, mark invalid controls with `aria-invalid`, populate each associated error node, focus the first invalid control after submission, and expose sending/success/failure through the existing persistent status region. Keep EmailJS loading lazy and clear errors as fields become valid.

- [ ] **Step 4: Run focused and full verification**

Run the focused command from Step 2, then `npm test` and `npm run check`.

Expected: all tests pass and the current three routes still build.

- [ ] **Step 5: Commit**

Commit: `feat(contact): add accessible form feedback`

### Task 3: Reflow, target size, focus safety, and reduced motion

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/scripts/reveals.js`
- Modify: `tests/architecture.test.mjs`
- Create: `tests/accessibility-styles.test.mjs`

**Interfaces:**
- Consumes: current responsive breakpoints, reveal initialization, fixed desktop navigation, and bottom mobile navigation.
- Produces: one comprehensive `prefers-reduced-motion: reduce` contract, minimum 24-by-24 CSS px targets with larger mobile utilities, layout-safe long content, and focus scroll margins that account for fixed navigation.

- [ ] **Step 1: Write failing style-contract tests**

Assert that reduced-motion rules disable smooth scroll and all non-essential animation/transition behavior, that interactive targets meet explicit minimum sizing in the relevant rules, that focused section targets receive safe scroll margins, and that page-level overflow is solved at the responsible components rather than depending on `body { overflow-x: hidden; }`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test --experimental-strip-types tests/accessibility-styles.test.mjs tests/architecture.test.mjs`

Expected: failures for incomplete reduced-motion coverage, hidden overflow masking, or missing focus/reflow protections.

- [ ] **Step 3: Implement the CSS and reveal changes**

Consolidate reduced-motion overrides after the component rules so they win the cascade, disable decorative wave motion and non-essential transforms/transitions, reveal content immediately in script, add wrapping/min-width protections where long localized content can overflow, remove the global overflow mask once component overflow is fixed, and preserve a strong visible focus ring in both themes.

- [ ] **Step 4: Run focused and full verification**

Run the focused command from Step 2, then `npm test`, `npm run check`, and `npm run build`.

Expected: all automated checks pass with no diagnostics.

- [ ] **Step 5: Commit**

Commit: `fix(accessibility): strengthen reflow and motion preferences`

### Task 4: Browser audit, corrections, and Phase 6 consolidation

**Files:**
- Modify as evidence requires: `src/components/**`, `src/scripts/**`, `src/styles/global.css`, `tests/**`
- Create: `docs/phases/phase-6-consolidation.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: the complete Phase 6 implementation and all current routes.
- Produces: reproducible browser evidence, resolved audit findings, and an explicit Phase 7 handoff.

- [ ] **Step 1: Establish the browser QA inventory**

Record checks for the homepage and both case studies: landmark/heading outline, skip link, complete Tab/Shift+Tab order, visible unobscured focus, theme cycle, language cycle, all four navigation destinations, empty/invalid/valid form states, 320/390/intermediate/desktop widths, 200% and 400% zoom equivalents, text-spacing overrides, reduced motion, light/dark themes, and horizontal overflow. Add exploratory checks for a long localized string and repeated rapid utility toggling.

- [ ] **Step 2: Run functional and visual browser QA**

Use normal keyboard, mouse, and touch-style input. Inspect viewport screenshots separately from functional assertions. Measure viewport/document widths and control bounds; inspect the focused control rectangles against fixed navigation. Use the browser accessibility representation where available to inspect landmarks, headings, names, roles, values, and live status.

- [ ] **Step 3: Correct every in-scope finding with TDD**

For each defect, first add or refine the smallest failing automated test that can reproduce it, implement the fix, rerun the focused test, then rerun the browser check. Document manual-only evidence when the issue cannot be meaningfully automated.

- [ ] **Step 4: Run final verification**

Run: `npm test`, `npm run check`, `npm run build`, and `git diff --check`.

Expected: all tests pass, Astro reports zero diagnostics, all three routes build, and there are no whitespace errors.

- [ ] **Step 5: Consolidate and commit**

Document the WCAG 2.2 AA target, automated results, manual/browser evidence, residual limitations, and exact Phase 7 starting point. Update README only with stable user-facing architecture/verification information.

Commit: `docs: consolidate portfolio phase 6`
