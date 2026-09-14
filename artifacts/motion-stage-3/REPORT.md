# Stage 3 — hero review

The homepage hero now has three CSS depth planes, spring-damped desktop pointer movement, coordinated headline/support/CTA entrances, and reversible scroll-linked recession. The existing truck photograph and all frozen wording are retained. No aircraft asset was introduced. Stage 4 has not started.

## Review artifacts

- [1440px recording](hero-review-1440.webm): pointer movement and wheel scrolling down/up.
- [390px recording](hero-review-390.webm): native touch swipes; pointer parallax disabled.
- [Isolated Stage 3 diff](stage-3.patch).
- Desktop: [before](before/hero-1440.png), [after](desktop-rest.png), [pointer](desktop-pointer.png).
- Mobile: [before](before/hero-390.png), [after](mobile-rest.png).
- [Reduced motion](desktop-live-reduced.png), [JavaScript disabled](mobile-no-js-rest.png), [keyboard focus](keyboard-focus.png).

The review videos were decoded and sampled for visual inspection, alongside the screenshots and intermediate animation states. They are 10.32 seconds (desktop) and 5.44 seconds (mobile).

## Scope and tuning

Changed implementation files: `app/(site)/page.tsx` (hero wrappers only), `components/motion/hero.tsx`, `components/motion/hero-runtime.tsx`, `components/motion/primitives.tsx` (optional coordinated RiseIn timing), `components/image-feedback.tsx` (publishes existing pointer events), `lib/motion/shared-pointer.ts`, `lib/motion/hero-tuning.ts`, and `styles/hero.css`. Documentation: `MOTION_SYSTEM.md`. The image-feedback browser test now checks each photograph's own section heading, since the homepage hero intentionally moves with scroll.

Tune pointer weights, spring parameters, entrance timing and scroll endpoints in `lib/motion/hero-tuning.ts`. Static depth tokens remain in `styles/depth.css`. Headline delays are 0/210ms, support 810ms, CTA 900ms. Scroll mapping is direct, not spring-smoothed; pointer travel is spring-damped and capped at ±10px.

## Verified results

- Fresh `npm run verify:content` build/export: passed. All 11 audited outputs, 66 image hashes, copy, routes, metadata, links and form contracts preserved.
- Lint, typecheck and 70 automated tests: passed.
- Public browser suite: 71 passed, 1 skipped. Final image-feedback suite: 62 passed, 2 skipped.
- Targeted hero checks: 1440px at 2× density and 390px at 3× density, each with standard, reduced-motion and JavaScript-disabled profiles. Entry keyframes, shared timing, pointer bounds, mobile gating, scroll reversal, idle cleanup, no overflow and no runtime errors passed.
- Live reduced-motion switching restores stationary final state. Keyboard focus reveals the CTA immediately, retains its focus ring and navigates normally.
- Homepage source after the hero is byte-identical to its pre-stage snapshot. Existing DOM listener registrations and Quote WebGL sources are unchanged. The hero adds zero DOM listeners and zero independent rAF loops.
- Screenshots confirmed readable text and preserved imagery. Reduced-motion hero layout matches the pre-stage measurements; no non-hero layout change was observed beyond subpixel image rounding (under 0.1 CSS px) in one no-JavaScript mobile measurement.

Testing used the static `out/` preview with deployed headers, not next dev. Form submissions were intercepted; no enquiries were sent. Full evidence is in `verify-content.log`, `lint.log`, `typecheck.log`, `unit-tests.log`, `public-tests.log`, `feedback-final.log`, `hero-results.json`, `scope-check.json` and `focus-result.json`.

## Limitations and stop point

Visual and touch checks used Playwright Chromium emulation, not physical devices. The in-app browser bootstrap failed, so the project browser runner was used. Lighthouse performance numbers are deferred to Stage 8; no performance score is claimed here. The older `feedback-tests.log` records the superseded heading assertion; `feedback-final.log` is the passing final run.

The working tree contains earlier uncommitted work, so the linked patch compares this stage against saved pre-stage sources instead of Git HEAD. This stage remains uncommitted for tuning review. No deployment, push, DNS change or Stage 4 work occurred.
