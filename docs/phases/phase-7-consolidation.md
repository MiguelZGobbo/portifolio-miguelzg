# Portfolio V2 Phase 7 consolidation

## Status and route decision

Phase 7 is complete. ADR-0002 remains binding: Portuguese keeps the stable unprefixed public routes and English uses `/en/`, with localized English case-study segments and homepage fragments. Language changes are ordinary links and full navigations; the URL owns the rendered language, history entry, reload state, metadata, and structured data.

The six canonical routes are:

- `/portifolio-miguelzg/`
- `/portifolio-miguelzg/en/`
- `/portifolio-miguelzg/projetos/purchase-orders-api/`
- `/portifolio-miguelzg/en/projects/purchase-orders-api/`
- `/portifolio-miguelzg/projetos/beadwise/`
- `/portifolio-miguelzg/en/projects/beadwise/`

No `/pt/` or `/pt-br/` family exists. Portuguese is the `x-default` fallback, not a neutral selector page. Shared Astro components and bilingual data remain the content owners; locale-specific page files are thin route entries.

## Language-switch matrix

| PT state | English equivalent | Browser result |
| --- | --- | --- |
| `/` | `/en/` | direct native navigation; history and reload retain English |
| `/#projetos` | `/en/#projects` | section, active navigation state, back, and forward preserved |
| `/#competencias` | `/en/#skills` | observed section context preserved without adding a Skills item to the approved navigation |
| `/#sobre` | `/en/#about` | section, active navigation state, back, and forward preserved |
| `/#cv` | `/en/#resume` | section and round trip preserved after the Task 4 correction |
| `/#contato` | `/en/#contact` | section, active navigation state, back, and forward preserved |
| `/projetos/purchase-orders-api/` | `/en/projects/purchase-orders-api/` | repeated four-step PT/EN cycling stayed on the same project |
| `/projetos/beadwise/` | `/en/projects/beadwise/` | repeated four-step PT/EN cycling stayed on the same project |

Direct entry and reload were exercised on all six routes. The rendered language always agreed with the route. Built output contains no `navigator.language`, legacy `localStorage.lang`, or client metadata rewriting path, so an explicit route cannot be replaced by a saved or browser-preferred language. The browser surface did not expose a supported way to seed a legacy `lang` storage value; that case is therefore supported by the built-code regression rather than a staged storage mutation.

## Metadata matrix

| Route family | `html lang` / `data-lang` | Canonical | Alternates | OG type / locale | JSON-LD |
| --- | --- | --- | --- | --- | --- |
| PT homepage | `pt-BR` / `pt` | self | reciprocal `pt-BR`, `en`, Portuguese `x-default` | `website` / `pt_BR`, `en_US` alternate | `WebPage` + `Person` |
| EN homepage | `en` / `en` | self | reciprocal `pt-BR`, `en`, Portuguese `x-default` | `website` / `en_US`, `pt_BR` alternate | `WebPage` + `Person` |
| PT case studies | `pt-BR` / `pt` | self per slug | reciprocal equivalents by slug | `article` / `pt_BR`, `en_US` alternate | one `WebPage` |
| EN case studies | `en` / `en` | self per slug | reciprocal equivalents by slug | `article` / `en_US`, `pt_BR` alternate | one `WebPage` |

All six rendered heads were inspected in the browser after direct entry and reload. Each had one localized title and description, one self-canonical, three reciprocal alternate links, coherent Open Graph and Twitter values, and one parseable JSON-LD script whose URL, language, title, and description matched the page.

The homepage `Person` claims are visibly supported in both languages: the name is visible in the brand and hero, the localized job title is the page heading, the profile image is visible and its processed source is byte-identical to the public image used by schema, and the email, LinkedIn, and GitHub identities are visible links. Case studies intentionally emit no `Person` node.

## Sitemap and robots decision

The generated sitemap contains exactly the six canonical HTTPS locations above. It contains no queries, fragments, duplicates, `/pt/`, `/pt-br/`, or XML `xhtml:link`/`hreflang` alternates. HTML head links are the single alternate-language mechanism, and the regression suite now explicitly protects that decision.

No project-scoped `robots.txt` is emitted. GitHub Project Pages can publish only below `/portifolio-miguelzg/`, while crawlers discover robots policy at the host root. This repository therefore cannot control `https://miguelzgobbo.github.io/robots.txt`; sitemap discovery and external search-console submission remain the available mechanisms until the host root or a custom domain is controlled.

## Automated and browser evidence

Final automated verification on 2026-09-22:

| Command | Result |
| --- | --- |
| `npm test` | 89 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo; pretest built six pages |
| `npm run check` | 47 files; 0 errors, 0 warnings, 0 hints |
| `npm run build` | 6 static pages built; sitemap index generated |
| `git diff --check` | no whitespace errors |

The production build was served only on `127.0.0.1`. Browser checks used ordinary links, pointer activation, and keyboard input; repository source was not instrumented and no browser-test dependency was added.

### Responsive geometry

All six routes were measured at every row below, for 66 route/viewport combinations. Every page had equal client and scroll width. Navigation, language, and theme controls remained inside the client area.

| Requested viewport | Browser client / scroll width | Key bounds |
| --- | --- | --- |
| 320 × 800 | 305 / 305 | header 32–273; utilities 180–293; bottom navigation 24–281 |
| 390 × 844 | 375 / 375 | header 32–343; utilities 250–363; bottom navigation 24–351 |
| 639 × 800 | 624 / 624 | mobile side of 640 px breakpoint passed |
| 641 × 800 | 626 / 626 | desktop-navigation side of 640 px breakpoint passed |
| 768 / 769 × 800 | 753 / 753 and 754 / 754 | both sides of the intermediate checkpoint passed |
| 900 / 901 × 800 | 885 / 885 and 886 / 886 | both sides of the section-layout checkpoint passed |
| 1199 / 1200 × 800 | 1184 / 1184 and 1185 / 1185 | both sides of the desktop checkpoint passed |
| 1440 × 900 | 1425 / 1425 | full desktop layout passed |

At 320 px, a temporary same-origin audit harness applied line height 1.5, paragraph spacing 2em, letter spacing .12em, and word spacing .16em to the English homepage. The nested page measured 290 / 290 client/scroll width; 30 meaningful controls, both 44 px mobile utilities, long English content, the BeadWise maturity label, and the Contact heading remained available. The harness lived only in ignored build output and was removed before the final build. The 639/641 and 320 CSS px checks repeat the Phase 6 200%/400%-equivalent reflow evidence.

### Keyboard, focus, form, theme, and visual checks

- Complete forward and reverse Tab sequences matched exactly on PT and EN homepages at 1280 × 800 and 390 × 844: 29 controls per route, no trap, every focused element visibly outlined, inside the viewport, and unobscured at its center.
- Representative PT and EN BeadWise case studies repeated the same desktop/mobile pass with 10 controls per route. Fixed top and bottom layers did not obscure a focused target.
- Empty, malformed-email, and correction states were exercised in both localized forms. Errors, summary copy, `aria-invalid`, first-invalid focus, and URL stability were correct; correcting the last invalid field cleared the active feedback.
- An English empty-error state followed by PT navigation produced a fresh Portuguese form with no stale feedback or wrong-language state.
- Built markup retains the Phase 6 pre-initialization gate: the static submit control is inert until handlers are registered, exposes no GET action, and retains the mail fallback.
- The fix-round re-audit used synthetic values only after a host guard was in place. On both PT and EN local-preview routes, the URL stayed unchanged, values were retained, the button returned to its enabled idle label, and a visible localized polite status directed the user to the email link. Fresh browser state kept `window.emailjs` undefined, appended no EmailJS SDK, recorded no EmailJS resource, and initiated no EmailJS-bound network request.
- Eleven rapid theme activations ended in a coherent dark state; navigation to English retained dark mode and updated the theme and language labels. A full return to light also passed.
- Light and dark passes covered every major homepage region at desktop and mobile sizes. Purchase Orders and BeadWise case-study layouts were each inspected in light and dark modes at desktop/mobile sizes. Long English copy wrapped without clipping, and all five BeadWise maturity distinctions remained explicit.
- A fresh browser console inspection after route, form, theme, screenshot, and viewport work returned no warnings or errors.

The available browser exposed viewport and visibility controls but no media-preference emulation. Reduced motion therefore retains the Phase 6 limitation: final cascade and behavior regressions prove the contract, but this phase does not claim a manually emulated reduce-preference session.

## Task 4 corrections

The audit found one user-visible navigation defect with two root causes. Selecting the résumé destination could make the observer treat Contact as active, changing the language link from `#cv`/`#resume` to the Contact equivalent.

The correction followed two strict RED/GREEN cycles:

1. Browser geometry showed the Contact section crossing the viewport midpoint while the nested résumé destination remained closer. A failing focused regression reproduced `contato` instead of `cv`; the minimal fix made observed navigation consistently choose the destination center nearest the viewport midpoint.
2. The English observer queried the Portuguese nested `#cv` target but not localized `#resume`. A separate failing behavior test reproduced the missing English state; the minimal fix included both localized nested targets.

The focused navigation suite finished 11/11 green. A real-browser PT `#cv` → EN `#resume` → PT `#cv` round trip then retained the correct URL, active link, and alternate destination at every step. Audit corrections are isolated in commit `f9486d4`.

The fix round found that valid submissions had no environment boundary before `loadEmailJS`. A strict RED reproduced an SDK append on `127.0.0.1` and `emailjs.init` on `localhost`; the GREEN correction added a pure hostname policy before the loader can run. Its final normalization lowercases the hostname, removes one terminal DNS dot, and unwraps IPv6 brackets. Classification rejects `localhost` and its subdomains, IPv4 `127/8`, IPv6 `::1`, and IPv4-mapped `127/8` in dotted or hexadecimal `7f00`–`7fff` form under compressed `::ffff:` or the accepted fully expanded zero prefix. Tests keep ordinary public hostnames, public IPv6 controls, and mapped addresses outside `127/8` eligible, so non-local deployment behavior remains unchanged.

The first real-browser recheck then found the polite local-preview text present in the status region but visually hidden by its base opacity. A second RED/GREEN cycle added a neutral visible state. The final PT and EN browser passes used `Local Preview Audit`, `local-preview@example.test`, and `Synthetic local boundary verification only`; both showed the localized message with retained values and an enabled idle button, while DOM, resource, and network evidence remained free of any EmailJS boundary.

The final review reopened Task 4 for two Important localization regressions and closed both through independent RED/GREEN cycles:

1. Both English résumé actions still rendered the Portuguese PDF and download filename. A failing built-output regression covered the view URL, download URL, and `download` attribute on both homepages. `ProfileSection` now selects `MiguelZagerGobbo-CV.pdf` for PT and `MiguelZagerGobbo-CV-EN.pdf` for EN once from `lang`, then reuses that filename for both actions.
2. Competências/Skills was observed but deliberately absent from the approved four-link navigation, so the language resolver received no active link and fell back to the alternate homepage. Failing rendered-output, resolver, and observer-wiring regressions reproduced the missing `#competencias` ↔ `#skills` context. The homepage now derives every non-home alternate from the central route registry, and the language toggle carries a data-only map keyed by localized observed section IDs. The observer consults that map when no visual navigation link exists; no Skills link or other visual navigation change was introduced.

## Limitations and non-claims

- This is engineering evidence, not a formal WCAG certification, legal conformance statement, indexing guarantee, or ranking claim.
- No human screen-reader session was performed. Evidence covers static semantics, accessibility representation, full keyboard order, focus visibility/clearance, and live form feedback.
- Reduced-motion preference could not be browser-emulated in the available surface. Automated cascade/behavior coverage remains the evidence.
- Browser geometry is recorded from the real browser rather than committed as computed-layout automation. The current toolchain has no browser dependency, and adding a heavyweight dependency solely for this audit was not justified.
- One exploratory form step unintentionally reused synthetic valid values (`Test User`, `test@example.com`, `Local validation only`) after a same-URL navigation and reached the visible `Sending...` state before immediate navigation away. No success or failure state was observed, and `window.emailjs`, script-load, and network state were not captured. This report therefore does not claim that no external request began or that zero delivery occurred. No further valid submission was exercised before the local-host guard existed, and the historical event was not investigated by sending again.
- The final local-preview behavior is structurally isolated before `loadEmailJS` and was verified with new synthetic values. That evidence applies prospectively to the corrected build; it does not retroactively resolve the historical request above.
- No publishing, deployment, push, merge, search-console submission, robots-control change, or external indexing action was performed.
- The localized `siteName` expression remains duplicated between the two page-composition components. Centralizing it now would introduce a second metadata abstraction or widen the audit fix, so it is deliberately deferred unless metadata ownership is redesigned.

## Phase 8 handoff

Phase 8 must preserve the Phase 5 content hierarchy, all six canonical routes, route-owned language, section/case language equivalence, metadata matrices, sitemap/robots decisions, form safety, keyboard/focus behavior, responsive reflow, theme behavior, and reduced-motion preference.

Phase 8 is limited to visual rhythm, typography, spacing, decorative restraint, and final motion choices. It must not change content hierarchy, route identity, metadata ownership, accessibility semantics, form delivery behavior, project evidence claims, or BeadWise maturity language. Any behavior defect discovered during polish still requires a focused RED/GREEN correction and browser recheck.
