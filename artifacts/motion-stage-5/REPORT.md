# Stage 5 — Domestic and International editorial motion

Implemented locally on the two existing homepage prose sections. The original grid, column order, photographs, captions, text, links and section spacing remain. No card chrome or photo rotation was added. Nothing was committed, pushed or deployed; no enquiries were sent. Stage 6 has not started.

## Treatment

- Each original column container is now a `DepthSection` with the existing grid classes.
- Complete photo frames use `ParallaxMedia`: Z -40px → +20px, scale 1.04 → 1.00 across the viewport pass. Mobile halves Z. The existing expo mapping follows scrolling in either direction.
- Domestic image leads text by a local 90ms entrance offset; International text leads its image by 90ms. This interprets “leads” as timing while preserving the existing positions. On narrow screens both sections retain their original image-above-text reading order; offsets apply when each column enters view.
- Text planes sit at Z 12px / mobile 6px. Opposite-side entry uses X +12px / -12px. Body prose moves up 16px and fades over 400ms as one group. Combined travel is at most 20px; no individual paragraph staggering.
- Headings animate the browser's actual wrapped lines: 14.4px rise (60% of Stage 3), tuned 8° rotateX, 600ms expo, 90ms line stagger. Original bytes, whitespace and natural wrapping are retained. Temporary line spans disappear after settling or on resize.
- Initially visible prose and headings skip entry entirely, including when hydration is delayed at an existing scroll position. SSR/JavaScript-disabled output is immediately readable. Reduced motion removes depth and reveals; focus restores the text wrapper's final state.
- The two photographic frames opt out of existing pointer tilt. Shared highlight and tap feedback remain; ripple coordinates compensate for projected frame scale. No new listener system or per-component rAF loop was added. Will-change clears at rest.

## Preservation and scope

`npm run verify:content` completed a fresh static export and passed all 11 page contracts and 66 image hashes. The verifier additionally compares both complete editorial copy inventories as **unnormalized UTF-8 bytes** against the pinned baseline and the exact text blocks in `MOTION_AUDIT.md`. Neither contract file was modified. Negative tests reject an extra internal space and an edited audit heading.

[Scope check](scope-check.json) confirms no unexpected pre-existing file changes, unchanged hero source, unchanged process-and-later homepage source, and unchanged Stage 4 implementation. No routes, image files, forms, metadata or deployed headers changed.

Changed implementation files:

- `app/(site)/page.tsx`: wrappers on these two blocks only, plus imports.
- `components/motion/primitives.tsx`: optional span, horizontal entry, fade and initial-visibility controls; original defaults retained.
- `components/motion/editorial-heading.tsx`: heading-specific composition of RiseIn.
- `styles/editorial-depth.css`: scoped depth and original responsive column order.
- `components/image-feedback.tsx`: opt out of tilt on these frames; projected ripple coordinates.
- `scripts/audit-motion-content.mjs`: exact editorial byte comparison.
- `tests/motion-content-guard.test.ts`, `tests/e2e/editorial-motion.spec.ts`, `playwright.editorial-motion.config.ts`, `tests/e2e/image-feedback.spec.ts`: preservation/motion coverage.
- `MOTION_SYSTEM.md`: usage and behavior documentation.

The [Stage 5 patch](stage-5.patch) compares against the saved pre-Stage-5 working tree, excluding earlier uncommitted Stage 4 changes. Review artifacts are under this directory. Recordings are Git-ignored; screenshots, this report and the patch remain eligible for tracking.

## Verification

Tested the exported `out/` through the local Pages-compatible preview applying `public/_headers`, not Next dev. Those headers were preserved; this report does not claim an enforced CSP where the existing file does not specify one.

| Check | Result / evidence |
|---|---|
| Fresh export + content verification | Passed, [build log](build.log) |
| Typecheck / lint | Passed, [typecheck](typecheck.log), [lint](lint.log) |
| Unit tests | 73 passed, [log](unit-tests.log) |
| Editorial browser cases | All 20 unique cases covered by passing results across the broad run and targeted recheck |
| Existing image feedback browser cases | 62 unique cases covered by passing results; two existing skips |
| Public regression cases | 18 passed, [log](public-tests.log) |
| Diff whitespace and final content audit | Passed |

Browser profiles were 1440px/2×, 768px/2×, 390px/3× touch and 360px/3× touch. Checks cover actual animation keyframes and timing, opposite-side travel, initially visible prose with delayed hydration, reversible scroll depth, no photo rotation, projected tap position, will-change cleanup, reduced motion, JavaScript disabled, resize during heading entry, native CTA navigation, image loading and overflow. Outer layout geometry remains within 1px of the pre-stage baseline; observed subpixel differences were intrinsic image sizing rounding, not a new grid. Both recorded viewports reported zero page errors and no horizontal overflow.

Test-run accounting: the [editorial broad run](editorial-tests.log) had 17 passes and three failures from assumptions about IntersectionObserver callback order and the number of wrapped heading lines. Assertions were corrected to inspect each section's local delay and actual responsive lines; [all four timing profiles then passed](editorial-timing-recheck.log). The [feedback broad run](feedback-tests.log) had 58 passes, four homepage failures and two skips. Those assertions were updated to await the intentional scroll entrance before testing tap isolation and to map ripple coordinates through the measured visual scale; [all four homepage profiles then passed](feedback-home-recheck.log). Runtime code was unchanged for these assertion corrections. Full suites were not repeated after those focused rechecks; the earlier failed logs are retained transparently.

## Visual evidence

Actual entrance screenshots, resting screenshots and decoded frames of both recordings were inspected. The full aircraft, truck frame and captions remain intact; the original prose layout is recognizable. The recordings demonstrate scroll depth and taps without photograph rotation. Video encoding is review evidence, not a source-image quality benchmark.

| View | Before | After |
|---|---|---|
| Domestic 1440 | [Before](before/domestic-1440.png) | [Settled](first-domestic-1440.png), [entrance](entrance-editorial-1440-0.png) |
| International 1440 | [Before](before/international-1440.png) | [Settled](first-international-1440.png), [entrance](entrance-editorial-1440-1.png) |
| Domestic 390 | [Before](before/domestic-390.png) | [Settled](first-domestic-390.png), [entrance](entrance-editorial-390-0.png) |
| International 390 | [Before](before/international-390.png) | [Settled](first-international-390.png), [entrance](entrance-editorial-390-1.png) |

Before/entrance/initial-prose/reduced-motion screenshots also cover 768px and 360px in this directory. Different scroll capture positions in the recordings mean screenshot viewport offsets are not a pixel-diff measure; automated geometry checks use the saved layout baseline.

- [1440px recording — 9.68 seconds](editorial-review-1440.webm)
- [390px recording — 13 seconds](editorial-review-390.webm)
- [Recording results](recording-results.json), [decoded metadata](recording-metadata.json)

## Limits

Browser coverage is local Chromium emulation, not physical Android/iOS or Safari. The in-app browser could not bootstrap, so project Playwright supplied the screenshots and recordings. The Stage 8 Lighthouse/performance comparison has not been performed and no score is claimed. No image source or quality was altered in this stage. Existing native mobile order remains; alternating lead timing cannot make an offscreen column appear before scrolling brings it into view.
