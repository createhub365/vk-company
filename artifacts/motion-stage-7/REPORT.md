# Stage 7 — FAQ, forms and footer

Ready for local review at **http://localhost:3000/**. `/faq`, `/contact` and `/get-a-quote` returned 200 with the expected wrappers and no page errors ([dev check](dev-review.json)). Stop here for review: Stage 8 remaining-page work and Stage 9 performance/final verification have not begun. No commit, push or deployment was made in this task. No recordings or real enquiries were created.

## Task A completed first: source limitation, no image edits

[The separate diagnosis](../service-photo-diagnosis/REPORT.md) identifies all six soft service-row files as cause (a). Their native 392×248 / 392×254 pixels are enlarged to approximately 625×396 / 625×405 CSS pixels. They need genuine higher-resolution originals of the same images. Minimum current desktop targets are approximately 1251×792 / 1251×811 at 2×, or 1876×1187 / 1876×1216 at 3×, maintaining the original aspect ratio.

The two service routes do not use ParallaxMedia. All 16 desktop/mobile normal-versus-transforms-off controls were pixel-identical. Static source selection and hero density coverage were appropriate at the tested sizes; no (b) or (c) fix was supported by the evidence. The photographs, image components, source files and crop coordinates were left unchanged. This reports the unresolved source limitation rather than claiming a code repair restored detail.

## Stage 7 implementation

- FAQ retains native details/summary and exact questions/answers. The answer hinges from -6° rotateX with opacity over the 240ms expo token. Existing plus/minus indicators rotate 180°. The former whole-card sideways shift and animated shadow are removed within this component's scope. Native height expansion is immediate; height is not animated, respecting the earlier transform/opacity-only rule.
- One local native toggle listener per FAQ wrapper observes activation without preventing default. Rapid toggles cancel the previous answer animation. Completion, reduced-motion changes and unmount clear animations, will-change and listeners. Keyboard Enter/Space and normal focus order remain native.
- Both unchanged form components sit inside presentation wrappers. The form plane is Z 30px (mobile 15px), with projection compensation preserving its existing visible width and field alignment. Focused fields use Z 12px (mobile 6px), preserving the original teal focus ring. Existing labels rise 2px; they do not become placeholders or obscure values.
- Contact submit hover uses -8° rotateX and a soft pseudo-element teal glow. Active press uses scale .97 / Z 0 and wins over hover. The existing pointer policy suppresses hover tilt on Quote, touch and below 768px. Quote WebGL is unchanged.
- The exact enquiry-only notice remains immediately visible with no reveal, fade or delay. Form names, labels, values, validation, endpoints and response handling are untouched.
- Footer content uses subtle local Z -20px (mobile -10px), and desktop links lift 1px. Its outer layout footprint, copy, routes and native keyboard links remain.
- New presentation enables only after hydration. Reduced motion disables all Stage 7 transforms immediately, keeping content in its final state and limiting opacity transitions to 150ms. JavaScript-disabled rendering retains readable forms/footer and functional native details. No new rAF loop, scroll listener, pointer listener or persistent will-change was added.

## Changed files

[Stage 7 patch](stage-7.patch) is scoped against the pre-stage working tree.

- `components/motion/utility-depth.tsx`: FAQ, form and footer presentation compositions.
- `styles/utility-depth.css`: scoped depth, focus, press, indicator and reduced-motion styles.
- `components/faq-list.tsx`: replace only its outer div with FaqDepth.
- `components/site-footer.tsx`: replace only its inner shell div with FooterDepth.
- `app/(site)/contact/page.tsx`, `app/(site)/get-a-quote/page.tsx`: wrap existing form components; no content edits.
- `playwright.utility-motion.config.ts`, `tests/e2e/utility-motion.spec.ts`: Stage 7 browser checks, with recording disabled.
- `MOTION_SYSTEM.md`: implementation guidance and revised Stage 8/9 ordering.

[Scope check](scope-check.json) confirms the frozen form implementations, image files, source manifest, hero, navigation, process and editorial implementations remain unchanged. `next-env.d.ts` switches its generated development/build type paths when Next runs; this automatic file is outside the Stage 7 patch. The pinned content baseline and MOTION_AUDIT.md are unchanged.

## Verification

| Check | Result |
|---|---|
| Fresh `npm run verify:content` static export | Passed — [build](build.log) |
| Final content audit | Passed — [log](final-content-check.log) |
| Lint / typecheck | Passed — [lint](lint.log), [typecheck](typecheck.log) |
| Unit suite | 78 passed — [log](unit-tests.log) |
| Stage 7 browser cases | All 20 unique cases covered by passing results — [broad run](browser-tests.log), [FAQ recheck](faq-recheck.log) |
| Existing Contact, Quote and public regression | 46 passed — [log](form-regression.log) |
| Scope / diff whitespace | Passed |

The static export preview applied the existing `public/_headers`. Stage 7 profiles were 1440/768px at 2× and 390/360px at 3× touch. Checks cover actual answer keyframes, repeated native toggles, will-change cleanup, focus rings and order, hover/press precedence, Quote pointer exclusion, retained field values, unchanged notice, native footer navigation, overflow, reduced motion and JavaScript-disabled content. Existing FormSubmit suites intercept every submission and test accepted/error/timeout/validation behavior without sending enquiries.

The first motion run caught a real hover-versus-active specificity issue and inherited global focus transitions under reduced motion; both were fixed. On the final implementation, 18 broad cases passed while two mobile FAQ assertions sampled before the asynchronous native toggle animation appeared. The test now records the actual animation call and waits for its keyframes; all four FAQ profiles passed on recheck. No runtime code changed for that test correction. The 46 form/public checks passed before the final CSS-only specificity/reduced-motion fixes; the final Stage 7 checks cover those corrected styles. No claim is made of a single subsequent combined full-suite run.

`verify:content` preserves 11 page contracts, 66 image hashes, all copy/links/metadata/form attributes, frozen business sources and deployed headers. Its additional Domestic/International UTF-8 check continues to match MOTION_AUDIT.md byte for byte.

## Review evidence and limits

Still-image evidence is provided for inspection; no video recording was generated:

- [FAQ desktop](faq-1440.png), [mobile](faq-390.png)
- [Contact desktop](contact-1440.png), [mobile](contact-390.png)
- [Quote notice mobile](get-a-quote-390.png)
- [Footer desktop](footer-1440.png), [mobile](footer-390.png)

Desktop FAQ entry, desktop Contact and mobile Quote/notice screenshots were visually inspected. FAQ captures may show the short in-progress answer fade; settled and no-JS content is fully visible. The original notice, field layout, footer links and photographs remain recognizable and intact. Review motion directly on the running dev server.

Testing uses Chromium emulation, not physical Safari/iOS/Android. The in-app browser could not bootstrap, so project Playwright supplied verification. No Lighthouse score or performance completion is claimed; that is Stage 9. The six soft service-row source files remain unresolved pending higher-resolution originals.
