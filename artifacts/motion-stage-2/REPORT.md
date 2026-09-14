# Stage 2 — foundation and primitives

Complete locally. No real page uses the new primitives. The temporary demonstration route was deleted from source and the final `out/` build. Stage 3 has not started. No commits, pushes, deployments or enquiries were made.

[Review the Stage 2-only diff](stage-2.patch). This compares against the audited local working tree, not the older deployed Git HEAD. Existing image repairs and Stage 1 audit files are separate pre-existing changes. [File-level diff summary](diff-summary.json).

## Delivered

- `styles/depth.css`: requested depth/easing/duration tokens, all Z distances halved below 768px, scoped reduced-motion final-state CSS and hover-none/mobile pointer guard.
- `components/motion/provider.tsx` and `scroll-runtime.tsx`: SSR-preserving context and a lazy, null-rendering DOM runtime. One Lenis 1.3.26 instance (`lerp:0.08`, no auto rAF) uses Framer Motion 13.2.0's shared frame scheduler and provider-level useScroll values. Reduced motion and document visibility clean up the instance and ticker. No per-primitive rAF loops.
- `components/motion/primitives.tsx`: exactly DepthSection, RiseIn and ParallaxMedia. Transform/opacity only; Expo easing; clamped rise/rotation; mobile Z endpoints; observers/subscriptions/timers cancelled on cleanup; will-change removed at rest. The -40px → +20px parallax range follows the requested endpoints; each offset stays within 40px of the resting plane.
- `components/motion/use-reduced-motion.ts`, `lib/motion/policy.ts`, `lib/motion/tokens.ts`: shared preference subscriptions, route policy and bounded token readers.
- `npm run verify:content`: pinned original content contract, fresh export, then copy/66-image/metadata/form/route checks. `.githooks/pre-commit` is installed through the local `core.hooksPath`; it fails on staged/working-tree input mismatches or contract failure.
- [MOTION_SYSTEM.md](../../MOTION_SYSTEM.md): usage, limits, lifecycle, preservation checks and implementation references.

Only two existing runtime modules changed: root `app/layout.tsx` imports the foundation CSS and adds the no-DOM provider; `components/image-feedback.tsx` uses the shared scheduler and pointer policy. No existing page module, form component, photograph source, metadata value or layout grid changed. The existing Quote media and WebGL source files are byte-identical to the audit. Quote's shared tilt/tap effects are disabled; the retained WebGL lifecycle remains separate and untouched as requested.

## Demonstration and verification

[Desktop recording](demo.webm), [entry animation frame](demo/desktop-entry.png), [mobile scroll frame](demo/mobile-scroll.png), [reduced-motion final state](demo/reduced-entry.png), [JavaScript-disabled screenshot](demo/no-js-entry.png). The retained `demo/fixture.page.txt` is a text artifact, not a route.

The exported Pages-compatible preview was tested at 1440px/2×, 768px/2×, 390px/3× touch and 360px/3× touch, plus reduced-motion and no-JavaScript profiles. Actual animation keyframes showed clamping of deliberately excessive 999px/999deg props to 40px/12deg. Checks confirmed token-based Expo easing, mobile Z values, native scrolling, clean resting will-change, live reduced-motion toggles, no overflow/runtime errors, and Quote pointer exclusion. Screenshots were visually inspected. Additional final checks cover wide touch devices, a narrow desktop pointer, Quote exclusion after native client navigation, and the removed route returning 404 with deployed headers.

- Fresh production build and `npm run verify:content`: passed.
- Lint and typecheck: passed.
- Automated tests: 70 passed. Five contract tests reject changed copy, image bytes, dynamic form wording and route additions; they now use saved non-executing HTML fixtures and do not require an existing build.
- Public-page browser suite: 71 passed, one desktop-specific About check skipped in the mobile project.
- Existing feedback suite: 62 passed, two touch-project hover checks skipped. Quote expectations now reflect the explicit pointer exclusion.
- Pre-commit integration, in an isolated temporary Git repository: matching staged content passed; bad staged copy hidden behind a clean working copy failed; fully staged bad copy failed after the fresh build. No commits were created in that fixture.
- All 66 image hashes match. Thirteen existing page/layout and Quote implementation sources match the pre-work snapshots exactly. No new public route remains.

Evidence: [demo measurements](demo/results.json), [final browser checks](final-browser-check.json), [unchanged-source check](unchanged-sources.json), [hook results](hook-results.json), [content verification](verify-content.log), [public tests](public-tests.log), [feedback tests](feedback-tests.log).

## Review notes

The in-app browser connection failed during bootstrap; project Playwright Chromium supplied the actual browser verification and recording. No Lighthouse score is claimed at Stage 2; the full performance comparison remains Stage 8.

The hook intentionally does not stage files itself. The repository still has older uncommitted image repairs and Stage 1 baseline files, so a partial stage containing only this foundation would not match the audited build inputs and would be blocked. The changes remain uncommitted for review; this stage's diff excludes those older repairs. The hook's pass/fail behavior was verified independently without modifying the main repository's index.
