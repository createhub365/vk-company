# Motion system — foundation and Stage 3 hero

Stage 2 added infrastructure and three presentation primitives. Stage 3 applies them only to the homepage hero. Copy, forms, images, routes and metadata remain at the Stage 1 baseline; homepage markup after the hero is byte-for-byte unchanged from before Stage 3. The root layout adds a context provider without extra DOM; shared photo feedback now observes the pointer policy and uses Motion's scheduler.

## Tokens

`styles/depth.css` is imported after the existing global CSS.

| Token | Desktop | Below 768px |
|---|---|---|
| `--perspective` | 1200px | 1200px |
| `--z-back` | -80px | -40px |
| `--z-mid` | 0 | 0 |
| `--z-front` | 40px | 20px |
| `--z-pop` | 90px | 45px |
| `--depth-parallax-from` / `--depth-parallax-to` | -40px / +20px | -20px / +10px |
| `--depth-rise` / `--depth-rotate` | 40px / 12deg | 40px / 12deg |
| `--depth-scale-from` / `--depth-scale-to` | 1.04 / 1 | 1.04 / 1 |

`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` is read from computed CSS for both entry and scroll interpolation. `--d-fast: 240ms`, `--d-base: 600ms`, `--d-slow: 900ms`; reduced opacity transitions are capped at `--d-reduced: 150ms`.

The static Z layer tokens are available for future composition; Stage 2 does not apply the larger -80px/90px layer offsets. Primitive animated translations are clamped within ±40px of their resting plane and rotation within 12deg. Parallax follows the explicitly requested -40px → +20px endpoints (a 60px total range, with no offset exceeding 40px); on mobile those endpoints halve. There is no photo rotation or spring overshoot. Invalid/excessive RiseIn props are clamped.

## Provider and shared scheduling

`MotionProvider` wraps existing server-rendered content with context only. Its `useScroll` creates the shared scroll MotionValues. Only `ScrollRuntime`, which renders null, is dynamically imported with `ssr:false`. Content itself is never placed behind a client-only boundary.

The runtime creates one Lenis instance (`lerp:0.08`, `autoRaf:false`, `syncTouch:false`). It registers a single persistent callback with Motion's shared `frame.update` scheduler. Lenis scroll events synchronize the same `scrollY` and `scrollYProgress` values returned by `useScroll`; native scrolling remains observed as well. Primitives and legacy photo hover schedule work on that existing Motion scheduler. None creates its own requestAnimationFrame loop.

Lenis is destroyed when reduced motion is requested, the document becomes hidden, or the provider unmounts. The loop subscription is cancelled and the smooth-scroll attribute removed. Re-enabling recreates one instance; an ownership guard prevents an accidental second provider from creating a competing instance. Normal visible-page idle operation retains the one Lenis/Motion ticker; it does not continuously animate content.

Touch scrolling is native, Ctrl/Meta-wheel is left to the browser, and form-control scrolling is excluded from smoothing. Native links/anchors, browser focus, selection and zoom are not intercepted. The CSS smooth-scroll override exists only while Lenis is active, avoiding double smoothing.

## Reduced motion and pointer policy

`useReducedMotion` uses a shared MediaQueryList subscription and `useSyncExternalStore`. Its server and hydration snapshot is conservative (`true`), so content starts visible and stationary. The CSS reduced-motion block independently forces the primitives to final opacity and removes transforms, perspective, animations and will-change. This also works before JavaScript loads. Existing static page styling is not indiscriminately reset.

`usePointerEffects` requires all of: no reduced motion, width ≥768px, hover capability, fine pointer, and an allowed pathname. The CSS `(hover:none)`/mobile block is a second guard for future `[data-depth-pointer]` layers. Touch does not disable scroll-linked depth.

`lib/motion/policy.ts` explicitly registers `/get-a-quote` as pointer-effects-disabled. Shared photo hover and tap effects do not run on that route, so they cannot send pointer impulses to the Quote scene. `components/quote-media.tsx` and `components/three/quote-bubbles.ts` are byte-for-byte unchanged from Stage 1. That retained WebGL code owns its pre-existing rendering lifecycle; it is not a new foundation rAF loop. The latest Stage 2 instruction to leave it untouched supersedes Stage 1's proposed retirement. Later Quote presentation may use scroll reveals only.

## Exactly three primitives

Import from `components/motion/primitives.tsx` beneath the shared provider.

```tsx
<DepthSection>
  <RiseIn rise={24} rotate={12} stagger={120} index={0}>
    {/* Existing content, unchanged */}
  </RiseIn>
  <ParallaxMedia>
    {/* Existing complete media frame, including its photograph */}
  </ParallaxMedia>
</DepthSection>
```

- `DepthSection`: a wrapper with perspective and preserve-3d; no animation or automatic Z translation. It uses a div so adding it does not create a new semantic section.
- `RiseIn`: IntersectionObserver-triggered, once-only transform/opacity animation. Defaults to 40px rise, 12deg rotateX, 600ms expo. `stagger` is milliseconds multiplied by `index`; the total delay is capped at the slow-duration token (900ms). Optional `delay`, `duration`, `enabled` and `timelineStart` support coordinated sequences; duration is bounded by the base token. Content stays in final state before activation and with JS disabled. An explicitly enabled sequence uses backwards fill only after hydration to coordinate its entrance. A cancelled/reduced-motion reveal immediately restores final state. `will-change` exists only during the actual animation.
- `ParallaxMedia`: stationary measuring wrapper and one transformed inner plane. It subscribes to the provider's scrollY, measures in Motion's read phase and writes in its render phase. Viewport-pass progress is eased with the shared expo curve. Offscreen work stops. A 240ms quiet period clears will-change; resize, unmount and reduced-motion transitions clean up subscriptions, observers, scheduled work and timers.

Only transform and opacity are animated. Layout dimensions, borders, padding, text and image sources are never animated or changed. Wrap the complete photo frame rather than rotating or scaling an image independently inside its frame. Keep inputs and important notices outside delayed reveals. Presentation-style props intentionally omit transform, opacity, will-change and animation overrides; do not bypass those limits with custom CSS.

## Content contract and pre-commit hook

`npm run verify:content` pins the SHA-256 of the original Stage 1 baseline, performs a fresh production static export, then runs `scripts/audit-motion-content.mjs`. It fails for changed copy, headings, section counts, links, images/66 image-file hashes, controls, labels, native details, metadata, routes, protected form/business sources or static headers/metadata. It refuses a silently recaptured baseline. No output-cache shortcut is used.

The repository-local hook is `.githooks/pre-commit`; it is activated with `npm run hooks:install` (`core.hooksPath=.githooks`). It first verifies that all relevant staged build inputs equal the working tree, then runs `npm run verify:content`. This blocks a staged content change hidden by a different unstaged version. Any nonzero check/build exit aborts the commit. It never stages files automatically or bypasses the check.

The working tree includes older image repairs and the Stage 1 audit that are not committed. The hook correctly requires those baseline inputs to be staged consistently before any commit; a foundation-only partial stage cannot pretend that older deployed HEAD is the audited content. Stage 2's supplied diff isolates this stage from those pre-existing changes.

## Stage 2 evidence

The temporary `/motion-foundation-demo` route exercised all three primitives and was deleted before the final export. Its source survives only as a non-route text artifact. Browser evidence is under `artifacts/motion-stage-2/demo/`, with a desktop recording at `artifacts/motion-stage-2/demo.webm`.

Browser profiles: 1440px/2×, 768px/2×, 390px/3× touch, 360px/3× touch, reduced motion, and JavaScript disabled. Checks cover actual entry keyframes, easing, clamp behavior, mobile token values, scrolling transforms, idle will-change cleanup, live reduced-motion toggling, no overflow/errors and Quote pointer exclusion. Desktop and mobile screenshots were inspected. Standalone Playwright was used after the in-app browser connection failed during bootstrap.

The hook was exercised in an isolated temporary Git repository: preserved staged content passes; a staged bad headline concealed by a clean working copy fails; a fully staged bad headline fails the fresh-build content check. No test commits or enquiries were created. Unit regression tests additionally reject altered image bytes, dynamic form wording and an added route.

No Lighthouse claim is made at this foundation stage. The full before/after performance pass remains Stage 8. Stage 3 is ready for its first tuning review; Stage 4 has not started.

Implementation references: [Motion useScroll](https://motion.dev/docs/react-use-scroll), [Motion shared frame scheduler](https://motion.dev/docs/frame), [Lenis options and manual frame integration](https://github.com/darkroomengineering/lenis).

## Stage 3: homepage hero

The existing truck photograph remains the sole hero image. No aircraft image, copy, section or route was added. `HeroMotion` is a hero-specific composition around `DepthSection`, with a dynamically loaded null-rendering runtime. `HeroFollow` composes the existing `RiseIn`; there are still exactly three general-purpose primitives.

Tune timing and physics in `lib/motion/hero-tuning.ts`. The back plane uses Z -80px and scale 1.08, the original image plane Z 0, and the original text/CTA plane Z 40px. The existing emphasized second line sits another 15px forward. Mobile halves Z distances. A nested perspective projects those planes once; the stage groups that projection with `transform-style: flat` before applying whole-hero recession. This avoids double projection and an opacity-induced flattening jump. The outer DepthSection retains perspective 1200px and preserve-3d.

Desktop pointer targets are limited to ±10px and spring-damped at stiffness 120 / damping 20. Back, middle and front weights are -1, 0.55 and 1. The new shared-pointer broker reads coordinates already received by the existing photo feedback listener and schedules through Motion's shared frame scheduler. It adds no DOM listeners or independent rAF loops. Mobile, hover-none, reduced motion and the Quote route disable pointer effects. A 10px desktop-only image overscan prevents edge exposure; mobile overscan is zero.

Headline entrances use the original line break: 24px rise, 12deg rotateX, 600ms expo. Their common timeline starts at 0ms and 210ms (90ms stagger plus 120ms emphasis delay). The support text begins at 810ms and CTA at 900ms, both through RiseIn with 16px rise, zero rotation and 400ms expo. There is no per-character splitting. These animations start only after hydration; server output is visible in its final state.

Scroll progress maps directly to Z 0 → -60px and opacity 1 → 0.4 across the hero height, using actual scroll position in both directions. Mobile ends at -30px. Unlike pointer movement, scroll mapping has no spring or easing: the latest Stage 3 requirement takes precedence over generic eased parallax. Reduced motion removes transforms and restores opacity immediately. Keyboard focus inside the CTA wrapper also restores visibility immediately, preserving the original focus ring and native navigation.

`will-change` is added during movement and removed after entry completion or the shared fast-token quiet period. Subscriptions, observers, scheduled callbacks and timers clean up on unmount. Hero CSS is scoped to `.hero-motion`; existing contrast gradients are preserved. See `artifacts/motion-stage-3/REPORT.md` for recordings, validation and the isolated patch.
