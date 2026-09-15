# Stage 6 — Four-step process

Implemented locally on the homepage process section. Review at **http://localhost:3000/**. The dev server returned 200, reported no page errors, and native wheel scrolling advanced the sequence ([dev check](dev-review.json)). No recordings were made. Nothing was committed, pushed or deployed; no enquiries were sent. Stage 7 has not started.

## Result

The same ordered list retains all four steps, wording, image sources/attributes and order. Desktop (≥768px) is a horizontal row; mobile (<768px) is a vertical sequence. The previous intermediate two-column arrangement is replaced by the requested horizontal/vertical treatment. The photo frames keep their original intrinsic 3:2 dimensions; their apparent size changes only with the requested depth projection.

One scroll-progress value drives:

- Step depth: active Z 60px, inactive Z -30px; mobile 30px / -15px.
- Opacity: active 1, inactive .55, continuously blended between neighboring steps.
- A continuous teal connector using normalized SVG stroke-dashoffset, horizontal on desktop and vertical on mobile.
- A subtle radial-gradient pseudo-element behind each step number, with opacity matching its emphasis. No animated box-shadow.

Each step has a local CSS perspective projection so the end columns and distant mobile steps do not drift sideways from a shared vanishing point. There is no new photo rotation. Existing photo highlight, tap and ripple behavior remains.

There is no timer or IntersectionObserver active-state toggle. The shared Motion scroll value schedules measurements and writes through the existing frame scheduler. Scrolling backwards retraces the same states. A single resettable quiet-period timer only removes will-change; it does not advance the sequence.

## Tall viewport behavior

Desktop progress uses a positive denominator, `wrapperHeight + viewportHeight / 2`, rather than subtracting those dimensions. A centered section that fits entirely in the viewport resolves to progress .5, sharing emphasis steadily between steps 2 and 3. There is no discrete threshold that can flicker between them. The exact step peaks still reach the requested active Z/opacity values. Mobile progress follows the untransformed first and last step centers as they cross the viewport center.

Tests cover shorter/equal/taller-than-viewport dimensions, reverse scrolling, a 1440×2000 viewport with the entire sequence visible, subpixel changes, and resizing from that tall desktop viewport to mobile.

## Accessibility and preservation

Reduced motion removes the scroll subscription and all process transforms: every step is at full opacity, the line is fully drawn and the number glow is off. The same readable final state is server-rendered and remains with JavaScript disabled. The connector is decorative/aria-hidden, and visual emphasis does not announce a shipment status. No links, controls or focus semantics were added or changed.

`npm run verify:content` passed after a fresh `out/` export: all 11 public-page contracts and 66 image hashes remain intact. The existing byte-level Domestic/International audit check also passes. [Scope verification](scope-check.json) confirms that removing just the process wrapper/import reproduces the entire previous homepage source exactly. Thus process copy and its original children are unchanged byte for byte, as is every other homepage section. The audit, business sources, routes and public assets/headers are unchanged.

## Files and diff

[Scoped Stage 6 diff](stage-6.patch) compares with the pre-stage working tree, preserving earlier uncommitted work.

- `app/(site)/page.tsx`: replace only the ordered-list wrapper with `ProcessSequence`, plus its import.
- `components/motion/process-sequence.tsx`: SSR-safe presentation and shared-scroll integration.
- `lib/motion/process-progress.ts`: stable progress/weight calculation.
- `styles/process-depth.css`: scoped depth, number glow, connector and responsive/reduced states.
- `tests/process-progress.test.ts`: progress edge cases.
- `tests/e2e/process-motion.spec.ts`, `playwright.process-motion.config.ts`: exported-site motion checks; video and trace disabled.
- `tests/e2e/image-feedback.spec.ts`: let process scroll depth settle before measuring a resting tap target.
- `MOTION_SYSTEM.md`: implementation and extension guidance.

## Verification

| Check | Result |
|---|---|
| Fresh static build + `verify:content` | Passed — [build log](build.log) |
| Final exported-content audit | Passed — [log](final-content-check.log) |
| Lint / typecheck | Passed — [lint](lint.log), [typecheck](typecheck.log) |
| Unit tests | 78 passed — [log](unit-tests.log) |
| Process browser checks | 16 passed — [log](browser-tests.log) |
| Homepage photo/tap regression | 4 passed — [log](feedback-tests.log) |
| Existing public-page regression | 18 passed — [log](public-tests.log) |
| Diff whitespace / scope | Passed |

The exported site was served through the existing Pages-compatible preview applying `public/_headers`. Process checks use 1440px/2×, 768px/2×, 390px/3× touch and 360px/3× touch. They verify actual transforms, opacity, glow, dash offsets, reverse progress, idle stability/cleanup, decoded equal intrinsic photo frames, no horizontal overflow, live reduced-motion changes, JavaScript-disabled rendering and the tall-viewport/resize edge case. Public regression checks intercept submissions; no actual enquiries are sent.

Visual review caught a repeated-dash SVG artifact despite correct numeric progress. The connector was corrected to use native percentage line endpoints without a scaled viewBox, then all 16 process checks passed again and the desktop/mobile screenshots were inspected. The initial tap regression measured projected scale before the new scroll update had settled; the test now waits for the process's resting state before measuring. All four homepage profiles then passed, without changing the feedback implementation. The 18 public cases passed before the final connector-only/CSS separator correction; the final process and tap runs cover that final implementation.

Useful static inspection evidence (no video):

- [Desktop 1440](process-1440.png), [768](process-768.png)
- [Mobile 390](process-390.png), [360](process-360.png)
- [Whole sequence in tall viewport](tall-process-1440.png)
- [Reduced motion desktop](reduced-1440.png), [mobile](reduced-390.png)

Screenshots are captured at scroll positions during the sequence, so the sticky navigation may overlap content that has naturally scrolled beneath it. The tall screenshot shows the full section together. No source image was replaced or sharpened in this stage.

## Limits

Browser testing uses local Chromium emulation, not physical iOS/Android or Safari. The in-app browser connection failed during bootstrap, so project Playwright supplied verification. No Lighthouse score or Stage 8 performance comparison is claimed. The requested inactive opacity intentionally dims those steps; reduced motion retains full opacity throughout.
