# Portfolio V2 Phase 5 Structural Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sustainable Astro structure for the frozen homepage hierarchy and two project case studies while restoring native browser scrolling and reducing `main.js` to orchestration.

**Architecture:** Typed project content is the source of truth for cards and case studies. Astro renders the homepage and project routes as complete static HTML. Focused browser modules enhance theme, language, active navigation, reveals, clipboard, and contact without intercepting document scrolling or rebuilding content.

**Tech Stack:** Astro 7, TypeScript, JavaScript ES modules, CSS, Node test runner.

**Spec:** `D:/dev/Projetos/portifólioV2 temporario/Handoff-Bloco-B.md`, supported by the Phase 0–4 consolidation documents in the same directory.

## Global constraints

- Preserve the approved Phase 2 PT/EN meaning, facts, evidence, and positioning.
- Homepage order is Hero → Projects → Competencies → About/Education/Resume → Contact.
- Project hierarchy is Purchase Orders API (H1), BeadWise (H2, visibly in development), Portfolio and Task API (H3).
- Only Purchase Orders API and BeadWise receive case-study pages.
- BeadWise must not imply that specifications or prototypes are finished product functionality; preserve `PROVEN = 0` and `APPROVED = 0` context.
- Do not add a general projects page, internal scroll container, wheel/keyboard interception, particles, parallax, or 3D tilt.
- Keep Astro and the current static build/deploy flow.
- Do not implement Phase 6 accessibility audit, Phase 7 route localization/SEO completion, or Phase 8 visual polish in this phase.

---

### Task 1: Model heterogeneous project evidence

**Files:**
- Modify: `package.json`
- Replace: `src/data/projects.ts`
- Create: `tests/projects.test.mjs`

**Interfaces:**
- Produces: `projects`, `caseStudyProjects`, `getProjectBySlug(slug)`, and typed project/content structures.
- Consumes: no production interface beyond the frozen project facts.

- [ ] **Step 1: Write failing model tests**

  Assert literal hierarchy order, required public BeadWise state, H1/H2 case-study eligibility, H3 compactness, and absence of the deferred financial app.

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `node --test --experimental-strip-types tests/projects.test.mjs`

  Expected: FAIL because the current model has no hierarchy, state, slug, or case-study data.

- [ ] **Step 3: Implement the minimal typed project model**

  Represent optional content honestly instead of filling every project with synthetic values. Populate canonical PT/EN summaries and verified evidence only.

- [ ] **Step 4: Run the focused test and verify GREEN**

  Run: `node --test --experimental-strip-types tests/projects.test.mjs`

  Expected: PASS.

- [ ] **Step 5: Suggested commit**

  `feat(projects): model portfolio evidence hierarchy`

### Task 2: Render the frozen homepage hierarchy

**Files:**
- Create: `src/components/home/HeroSection.astro`
- Create: `src/components/home/ProjectsSection.astro`
- Create: `src/components/home/SkillsSection.astro`
- Create: `src/components/home/ProfileSection.astro`
- Create: `src/components/home/ContactSection.astro`
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/components/Nav.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/lib/i18n.ts`
- Modify: `src/styles/global.css`
- Create: `tests/home-page.test.mjs`

**Interfaces:**
- Consumes: `projects` and the existing skills data.
- Produces: static homepage sections with stable IDs `home`, `projetos`, `competencias`, `sobre`, `cv`, and `contato`.

- [ ] **Step 1: Write a failing built-page test**

  Build the site, read `dist/index.html`, and assert the approved Hero copy, canonical section order, all four included projects, visible BeadWise status, case-study links for H1/H2, compact H3 entries, and the global navigation destinations.

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `npm run build; node --test tests/home-page.test.mjs`

  Expected: FAIL because the current order, copy, hierarchy, and project set differ.

- [ ] **Step 3: Implement the section components and navigation**

  Assemble the home as an Astro index, keep semantic content static, and apply hierarchy classes instead of forcing identical cards.

- [ ] **Step 4: Add only structural CSS needed by the new markup**

  Preserve the existing palette and identity while avoiding new decorative treatments or Phase 8 polish.

- [ ] **Step 5: Run the focused test and verify GREEN**

  Run: `npm run build; node --test tests/home-page.test.mjs`

  Expected: PASS.

- [ ] **Step 6: Suggested commit**

  `feat(home): implement frozen portfolio hierarchy`

### Task 3: Generate real case-study pages

**Files:**
- Create: `src/components/ProjectCaseStudy.astro`
- Create: `src/pages/projetos/[slug].astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Create: `tests/case-study-pages.test.mjs`

**Interfaces:**
- Consumes: `caseStudyProjects` and each project's `caseStudy` content.
- Produces: `/projetos/purchase-orders-api/` and `/projetos/beadwise/` static routes.

- [ ] **Step 1: Write failing built-route tests**

  Assert both route files exist, contain the nine canonical case-study sections, expose the repository link, and communicate BeadWise maturity near the beginning.

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `npm run build; node --test tests/case-study-pages.test.mjs`

  Expected: FAIL because the route files do not exist.

- [ ] **Step 3: Implement static paths and the shared case-study component**

  Use headings and normal document flow. Render only verified content and available evidence.

- [ ] **Step 4: Run the focused test and verify GREEN**

  Run: `npm run build; node --test tests/case-study-pages.test.mjs`

  Expected: PASS.

- [ ] **Step 5: Suggested commit**

  `feat(projects): add portfolio case study pages`

### Task 4: Restore native scrolling and split browser behavior

**Files:**
- Create: `src/scripts/theme.js`
- Create: `src/scripts/language.js`
- Create: `src/scripts/navigation.js`
- Create: `src/scripts/reveals.js`
- Create: `src/scripts/clipboard.js`
- Create: `src/scripts/contact-form.js`
- Replace: `src/scripts/main.js`
- Delete: `src/components/Particles.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Create: `tests/navigation.test.mjs`
- Create: `tests/architecture.test.mjs`

**Interfaces:**
- Produces: `initTheme`, `initLanguage`, `initNavigation`, `initReveals`, `initClipboard`, `initContactForm`, and pure `findActiveSection` navigation logic.
- Consumes: generated DOM and `translations`; no browser module owns project content or routes.

- [ ] **Step 1: Write failing navigation and architecture tests**

  Test the active-section calculation with literal geometry and enforce that `main.js` only imports and initializes focused modules.

- [ ] **Step 2: Run the focused tests and verify RED**

  Run: `node --test tests/navigation.test.mjs tests/architecture.test.mjs`

  Expected: FAIL because focused modules do not exist and `main.js` still owns all behavior.

- [ ] **Step 3: Implement the browser modules**

  Preserve theme, temporary in-page language switching, reveal, clipboard, and contact behavior. Navigation may observe document scrolling but must not prevent native wheel, keyboard, anchor, or history behavior.

- [ ] **Step 4: Remove obsolete effects and internal-scroll CSS**

  Remove particles, parallax, tilt, fixed `.scroll-container`, and the styles tied only to those behaviors.

- [ ] **Step 5: Run focused tests and verify GREEN**

  Run: `node --test tests/navigation.test.mjs tests/architecture.test.mjs`

  Expected: PASS.

- [ ] **Step 6: Suggested commit**

  `refactor(frontend): restore native document navigation`

### Task 5: Verify and document Phase 5

**Files:**
- Modify: `README.md`
- Create: `docs/phases/phase-5-consolidation.md`

**Interfaces:**
- Consumes: completed Tasks 1–4 and their verification evidence.
- Produces: an accurate repository map and a Phase 6 handoff.

- [ ] **Step 1: Run the full automated verification**

  Run: `npm test; npm run check; npm run build`

  Expected: all tests pass, Astro reports zero diagnostics, and all three static pages build.

- [ ] **Step 2: Verify the built site in a browser**

  Check the homepage and both direct case-study URLs at desktop and mobile widths. Confirm ordinary wheel/keyboard scrolling, anchors, back/forward history, theme, language, resume, repository links, and no horizontal overflow.

- [ ] **Step 3: Review the complete diff**

  Confirm every changed line belongs to Phase 5, no deferred visual/SEO/accessibility work was smuggled in, and no obsolete files/imports remain.

- [ ] **Step 4: Update README and write the consolidation**

  Record the new source layout, commands, delivered acceptance criteria, verification evidence, and explicitly deferred Phase 6–8 work.

- [ ] **Step 5: Suggested commit**

  `docs: consolidate portfolio phase 5`
