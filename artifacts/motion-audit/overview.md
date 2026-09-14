# MOTION AUDIT — Stage 1 pre-work contract

Captured 14 September 2026, from the current local working tree and a fresh successful `npm run build`. No presentation code, dependencies, content, routes or images were changed to create this audit. The local image repairs from the previous task are part of this baseline. Existing uncommitted changes must not be mistaken for motion-retrofit changes or bundled indiscriminately into future commits.

## Repository map

| Area | Observed implementation |
|---|---|
| Framework | Next.js 16.3.4, React 19.2.8; App Router under `app/(site)` |
| Export | `output: "export"`, output `out/`, unoptimized static images, no application server needed |
| CSS | Tailwind 4 import in `app/globals.css`; predominantly authored global CSS; CSS modules for Contact, ServiceProcess and the unused ReferenceArtwork helper |
| Fonts | Existing Arial/Helvetica sans-serif and Georgia/Times New Roman serif stacks |
| Palette | Existing navy `#203a55` / deep navy `#132c43`, teal `#227d91` / dark teal `#17677a`, cream `#f6f5f1`, paper, and existing supporting tokens; do not substitute colours |
| Public pages | `/`, `/services/domestic`, `/services/international`, `/about`, `/contact`, `/get-a-quote`, `/faq`, `/track`, `/privacy`, `/terms`; separate not-found output `/404.html` |
| Metadata outputs | `app/robots.ts` → `/robots.txt`; `app/sitemap.ts` → `/sitemap.xml`; root metadata inherited where applicable; capture exact rendered metadata below |
| Shell | `app/layout.tsx`: ImageFeedback and children; `app/(site)/layout.tsx`: RouteTransition, SiteHeader, main, SiteFooter |
| Image rendering | Shared `Photograph`, responsive local WebP manifest `lib/photographs.json`; proportional hero photos, scoped 3:2 process photos; original transparent CompanyLogo unchanged |
| Forms | Client EnquiryForm and SupportForm; existing POST fetch to `https://formsubmit.co/ajax/vkandcompanymohali@gmail.com`; validation/response handling in protected source snapshots below |
| Headers | `public/_headers`, copied to export; existing local preview applies these headers |
| Installed motion libraries | GSAP 3.15.0, Three.js 0.182.0, R3F 9.7.0, Drei 10.7.8 already installed; Motion/Framer Motion and Lenis absent |
| Other dependencies | Existing Supabase and nodemailer packages are present but not part of this public motion task; do not restore archived server functionality |
| Local Next.js guidance read | `node_modules/next/dist/docs/01-app/02-guides/static-exports.md` and `lazy-loading.md`; DOM-only `ssr:false` dynamic imports must originate from a client component |

## Existing effects and conflicts to resolve during implementation

- `components/image-feedback.tsx` is the current shared owner of photo pointer tilt, moving highlight, tap discrimination and ripple/depth feedback. It installs passive pointer/click/scroll listeners and uses requestAnimationFrame and Web Animations. Extend or coordinate this owner; do not layer competing transforms or another global pointer system on the same frames. Resting photo transforms and process aspect ratios were verified by the preceding repair.
- `components/route-transition.tsx` currently renders an aria-hidden thin route indicator keyed by pathname; CSS drives a short horizontal sweep. A new scroll indicator must coordinate with this presentation rather than accidentally duplicate it.
- `components/quote-media.tsx` actively lazy-loads `components/three/quote-bubbles.ts` on the Quote page. Its photograph and static decorative fallback are server-rendered. This conflicts with the new WebGL-free request: retire the WebGL activation during the retrofit while preserving the exact photograph, existing media area and essential DOM. Do not add Three.js or reactivate other scenes.
- Other Three.js/R3F scene helpers (`scene-stage`, `courier-canvas`, `dispatch-experience`, `dispatch-canvas`, `delivery-canvas`) exist but are not imported by the current public pages. `MotionControl` and `ReferenceArtwork` are also not mounted on current public routes. Their unused labels are not new content to add.
- The header already uses sticky positioning, backdrop blur, an expanding mobile nav, Escape/outside/blur closing, and focus restoration. Keep those behaviors and focus order.
- Native FAQ `<details><summary>` elements are used on Home and FAQ. There is no current custom answer-panel wrapper or explicit chevron component. A decorative chevron may be added without changing existing semantics or words.
- Forms use conventional visible labels above fields; moving labels must not replace them with placeholders, overlap typed text, alter IDs, or change the grid. The quote enquiry notice must remain immediately visible and stationary.
- Existing global `html { scroll-behavior: smooth }`, reduced-motion rules, CSS button transforms and photo feedback need one coordinated reduced-motion path. Lenis must not run against a second smoothing mechanism. Native touch scrolling, zoom, focus navigation and anchor behavior must remain usable.

## Mapping the requested motion onto existing sections

| Requested effect | Existing target / boundary |
|---|---|
| Global shell | Existing SiteLayout shell, RouteTransition, SiteHeader, SiteFooter; presentation-only client layer |
| Hero | `.cinematic-hero`, existing background image, `.cinematic-copy`, existing `<br/>` and `<em>Across borders.</em>`; preserve all lines and CTA |
| Domestic / International cards | Currently two separate `.editorial-section` sections, not a two-card row. Apply depth within these existing editorial blocks; no new card content, icons, sections or grid |
| Four-step process | `.process-flow`, existing ordered list and four items/photographs. Decorative connecting-line overlay must not replace/reorder list items or affect their equal 3:2 frames |
| Service pages | PageHero, ServiceProcess's three articles, QuoteBand; keep exact selected art, source limits and text |
| About | PageHero, existing What We Do composition and three nested sections, QuoteBand |
| FAQ | Existing native details on `/` and `/faq`; preserve all four questions and answers |
| Contact / Quote | Existing `.form-panel`, `.field`, buttons and labels; keep notices, validation, pending/result wording and submission behavior |
| Footer | Existing footer columns, links and copyright; do not add a motion toggle or other copy |
| Other routes | FAQ/Track/Privacy/Terms and not-found copy remain protected; keep legal notices immediately readable |

## Specification reconciliation and acceptance boundaries

1. The section spec requests animating FAQ height, but the non-negotiable performance gate permits only transform/opacity animation. Preserve the native details height change and animate the answer's hinge/opacity; do not interpolate layout height. This is an explicit interpretation to review before the FAQ stage.
2. A shared token system must include the requested base depth/easing/duration tokens plus named tokens for the other supplied numeric values (e.g. nav 60px, transition 300ms). No scattered per-element constants. Mobile depth uses one shared half-distance factor.
3. The new hero pointer/scroll movement is a change from the earlier task's stationary-background requirement; the latest explicit hero specification is the scope for this retrofit. Photos and their frame geometry must remain unchanged at rest.
4. Existing Quote WebGL behavior conflicts with the new WebGL-free requirement. Disable that presentation initializer while retaining the photograph and static fallback; no new scenes or asset changes.
5. No initial hidden content: server-rendered HTML stays at its final readable state. Only an effects-only layer may be dynamically loaded without SSR; never place page content behind `ssr:false`. Reduced motion must immediately remove motion transforms and expose final content. Any entry effect must avoid the enquiry/legal notices.
6. App Router route transitions must preserve native Next links, focus and URL semantics. Do not introduce navigation delays, manual route interception or content cloning to force an exit animation.
7. Performance targets are acceptance targets, not existing measurements. No Lighthouse score, CLS result, or scroll long-task result has been measured for this new retrofit yet. Save the before run before Stage 2; compare the same local exported pages and throttling settings after implementation. Report any misses honestly. Earlier test passes are not a Lighthouse result.
8. “Zero removed elements” means retain every existing content-bearing element, form control, image, section and link. Presentation wrappers/decorations may be added and existing effect owners coordinated. CSS depth may change apparent position during animation, but must not alter the layout grid, section order or resting image fitting.

## Working order and stage status

1. Audit and this contract — complete; ready for user review before implementation.
2. Depth tokens, Motion/Lenis, coordinated reduced-motion foundation — not started.
3. Hero — not started.
4. Navigation — not started.
5. Existing service editorial sections — not started.
6. Process sequence — not started.
7. FAQ, forms, footer — not started.
8. Performance/accessibility pass and Lighthouse comparison — not started.

The user requested each stage be shown before moving on. Stage 1 introduces only documentation and a repeatable audit/check script; no dependency installation or motion implementation has started. Future logical commits must contain only new motion work, not unrelated pre-existing changes. No deployment or enquiry is authorized by this retrofit.

## Verification contract

`artifacts/motion-audit/baseline.json` records all 11 page outputs, ordered text/headings/links/images/controls/labels, native details, metadata, section counts, original source snapshots and hashes of every referenced static image variant. It also preserves robots, sitemap and headers. Frozen business/form source files include conditional error/success copy and submission logic that initial HTML cannot cover.

After each later stage, rebuild and run:

```sh
npm run build
node scripts/audit-motion-content.mjs
```

The check rejects copy, section-count, heading, link, image, control, label, details, metadata, route-file, image-byte, protected business-source and static-header changes. Layout and focus must additionally be verified in a browser; source equality alone does not prove visual or accessibility equivalence. Do not recapture the baseline to make a failing change pass. The script refuses to overwrite an existing baseline.
