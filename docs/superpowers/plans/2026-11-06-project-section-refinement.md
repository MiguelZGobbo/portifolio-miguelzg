# Project section refinement

**Goal:** Implement the owner-approved project section refinements from this chat.

**Architecture:** Keep static Astro rendering, the existing project data source and localized homepages. Project images are optional local imports rendered by Astro Image, never placeholders.

**Stack:** Astro, TypeScript, CSS, Node test runner.

## Implementation

- [x] Replace the filled repository button with a transparent 14px “Ver código” / “View code” link, retaining its external icon, accessible label, 44px click target, hover underline and keyboard focus.
- [x] Give technology tags theme-specific blue-gray fill, border and text tokens. Verify at least 4.5:1 text contrast.
- [x] Add optional `Project.image` metadata (`src`, localized `alt`, optional localized `caption` for prototypes).
- [x] Render optimized lazy images at 16:10, right of copy on desktop and above it at 640px and below. Entries without images stay full width.
- [x] Document how to add genuine captures; preserve project content, order, hierarchy and repository URLs.

## Verification

- [x] Update the old filled-action test and verify technology text contrast in both themes.
- [x] Check PT/EN, light/dark, desktop/mobile, focus, hover, link destinations and page overflow in the browser (320, 390, 768 and 1440px).
- [x] Exercise the optional image branch using a temporary QA fixture, including localized alt/caption and long content; remove the fixture afterward.
- [x] Run `npm run check`, `npm test` (including build), and `git diff --check` on the final state: no diagnostics, 100 passing tests, exactly two public pages.

## Defaults

No real captures are available. Do not add project images until the owner supplies suitable captures. Keep image content fully visible with contain fitting. Work in the current checkout, without a commit or deployment.

## Owner-requested revision

The owner subsequently requested stronger emphasis on the code action and delegated image selection. The action is now a compact outlined button with the GitHub icon, filled on hover/focus. All four projects have visuals: existing repository architecture/product-flow illustrations, an actual portfolio screenshot and a source-grounded task API diagram. Original images can be opened from the thumbnails. Image data stores filenames; the presentation component resolves them through a local eager asset glob so the content model remains importable by Node tests. Origins are documented alongside the assets.

## Image viewer and softer controls

The next approved refinement replaces the rigid code-button outline with a soft tonal surface, 500 weight and 4px corners. Natural-ratio thumbnails use two fine corner marks and an integrated Enlarge indicator. A single native dialog handles fit/original size, backdrop/Escape/close dismissal, keyboard focus cycling, scroll locking and restoration. Public full-resolution URLs come from `getImage()`; the link remains functional without JavaScript. No dependencies were added.

Verification: 103 Node tests, Astro check with no diagnostics, production build with two public pages; 32 browser open/zoom/close cycles each on development and production preview, covering PT/EN, both themes and desktop/mobile. Also checked focus cycling, backdrop dismissal, touch interaction, 16 full-image URL requests and actual no-JavaScript image navigation. Reserving the scrollbar gutter prevents page shifts while locking scroll.

## Approved simplification of image presentation

Removed thumbnail corner marks and the Enlarge badge. Thumbnails retain their natural ratio, 4px corners, captions, zoom-in cursor and subtle opacity hover. The native dialog now has a transparent background without borders, dividers or fixed height. Its backdrop uses 60% darkening and 10px blur, with a 160ms opacity entrance only when reduced motion is not requested. It shows only the project name, an accessible 44px close control, the fitted image and a caption. Removed all original-size/zoom controls, state and translations. The code button is unchanged.

Verification: 128 browser cases across development and production preview, both languages/themes, four images and four viewport sizes including mobile landscape. Verified focus/scroll restoration, all dismissal methods, touch, motion preferences, 16 no-JavaScript image URLs and native fallback navigation. Production CSS regression checks that the standard backdrop-filter property survives optimization; put it after the prefixed property. Updated Node regressions cover the simplified markup and focus cycle.

## Caption indicator and complete fades

Owner-approved addition: theme-specific 1px thumbnail borders and short shadows, intensified on hover/keyboard focus over 180ms. One link now wraps each figure, with a decorative 16px expansion icon next to its wrapping caption. Accessible labels include the enlargement action, project name and visible caption. The code action and transparent viewer remain unchanged.

Entry and exit now use 180ms opacity animations; every dismissal path awaits the exit before native close, focus restoration and scroll release. Repeated close requests are ignored; a 250ms fallback handles lost animation events. Reduced motion closes immediately. Image decode uses a generation guard so old results cannot affect a reopened viewer. Full-image dimensions are reserved with an explicit aspect ratio and responsive width before the request completes, then the decoded image fades in.

Regressions cover the delayed close/event fallback, modifier navigation, reduced-motion close, caption structure, reserved dimensions and stale decode results. Browser checks cover all click surfaces, themes/languages, responsive layouts, slow network and reopens, with development and built assets.
