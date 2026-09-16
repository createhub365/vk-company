# Motion system — foundation, hero, navigation and editorial sections

Stage 2 added infrastructure and three presentation primitives. Stage 3 applies them to the homepage hero. Stage 4 adds depth and accessible menu interaction to the shared navigation. Stage 5 applies alternating depth to the two existing homepage editorial sections. Stage 6 adds the scroll-linked four-step sequence. Stage 7 adds FAQ, form and footer presentation. Copy, forms, images, routes and metadata remain at the Stage 1 baseline. The root layout adds a context provider without extra DOM; shared photo feedback observes the pointer policy and uses Motion's scheduler.

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

Lenis smoothing is destroyed when reduced motion is requested, the document becomes hidden, or the provider unmounts. Stage 4 may retain one stopped, non-animating Lenis owner while the navigation menu is open under reduced motion; it is destroyed when that lock is released. The loop subscription is cancelled and the smooth-scroll attribute removed. Re-enabling recreates one instance; an ownership guard prevents an accidental second provider from creating a competing instance. Normal visible-page idle operation retains the one Lenis/Motion ticker; it does not continuously animate content.

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

No Lighthouse claim is made at this foundation stage. The full before/after performance pass is now Stage 9, after Stage 8 remaining-page work. Stage 3 has its Round 1 tuning, Stages 4–7 are implemented; Stage 8 remaining pages and Stage 9 performance/final verification have not started.

Implementation references: [Motion useScroll](https://motion.dev/docs/react-use-scroll), [Motion shared frame scheduler](https://motion.dev/docs/frame), [Lenis options and manual frame integration](https://github.com/darkroomengineering/lenis).

## Stage 3: homepage hero

The existing truck photograph remains the sole hero image. No aircraft image, copy, section or route was added. `HeroMotion` is a hero-specific composition around `DepthSection`, with a dynamically loaded null-rendering runtime. `HeroFollow` composes the existing `RiseIn`; there are still exactly three general-purpose primitives.

Tune timing and physics in `lib/motion/hero-tuning.ts`. The back plane uses Z -80px and scale 1.08, the original image plane Z 0, and the original text/CTA plane Z 40px. The existing emphasized second line sits another 15px forward. Mobile halves Z distances. A nested perspective projects those planes once; the stage groups that projection with `transform-style: flat` before applying whole-hero recession. This avoids double projection and an opacity-induced flattening jump. The outer DepthSection retains perspective 1200px and preserve-3d.

Desktop pointer targets are limited to ±10px and spring-damped at stiffness 120 / damping 20. Back, middle and front weights are -1, 0.55 and 1. The new shared-pointer broker reads coordinates already received by the existing photo feedback listener and schedules through Motion's shared frame scheduler. It adds no DOM listeners or independent rAF loops. Mobile, hover-none, reduced motion and the Quote route disable pointer effects. A 10px desktop-only image overscan prevents edge exposure; mobile overscan is zero.

Headline entrances use the original line break: 24px rise, 12deg rotateX, 600ms expo. Their common timeline starts at 0ms and 210ms (90ms stagger plus 120ms emphasis delay). The support text begins at 810ms and CTA at 900ms, both through RiseIn with 16px rise, zero rotation and 400ms expo. There is no per-character splitting. These animations start only after hydration; server output is visible in its final state.

Scroll progress maps directly to Z 0 → -60px and opacity 1 → 0.4 across the hero height, using actual scroll position in both directions. Mobile ends at -30px. Unlike pointer movement, scroll mapping has no spring or easing: the latest Stage 3 requirement takes precedence over generic eased parallax. Reduced motion removes transforms and restores opacity immediately. Keyboard focus inside the CTA wrapper also restores visibility immediately, preserving the original focus ring and native navigation.

`will-change` is added during movement and removed after entry completion or the shared fast-token quiet period. Subscriptions, observers, scheduled callbacks and timers clean up on unmount. Hero CSS is scoped to `.hero-motion`; existing contrast gradients are preserved. See `artifacts/motion-stage-3/REPORT.md` for recordings, validation and the isolated patch.

## Stage 4: navigation and mobile menu

`components/site-header.tsx` retains every original label, href, order and accessible name. A presentation-only `.nav-surface` wrapper sits at Z 60px within the sticky header's 1200px perspective. Below 768px its depth halves to 30px. Inverse scale compensation (.95 / .975) prevents perspective from widening the header or shifting the existing page grid. The inner navigation has its own perspective and is grouped above the background plate, so a tilted button never intersects that plate. No page content or hero implementation changes in this stage.

`styles/navigation.css` owns the scoped effects. The shared scroll MotionValue drives one `scrolled` boolean only when crossing 80px; it does not write per-frame nav styles. The backdrop blur transitions to 16px over 200ms. A pseudo-element with a static deeper shadow fades in over the same duration, avoiding animated box-shadow. Links lift -1px / Z 8px and reveal a scaleX underline over the existing 240ms expo token. The Quote CTA rotates X -8deg on desktop hover, has a radial teal pseudo-element glow, and presses to scale .97 / Z 0. The existing Quote route pointer policy suppresses hover tilt/depth on that route. Touch and sub-768px layouts also omit pointer hover transforms.

The existing 64rem container breakpoint still chooses the mobile menu, including enlarged text. Its panel rotates Y -12deg from the right edge over 380ms using the shared expo easing; the angle respects the foundation's 12deg cap. Reduced motion removes nav transforms and replaces the door with a plain 150ms opacity fade. This scoped duration overrides the older global near-zero animation rule only for the requested menu fade. Closing hides the menu immediately and restores trigger focus. No content, metadata or native navigation is delayed.

Open-menu keyboard behavior cycles the trigger and five links in both directions. Escape restores the trigger. A focusin guard keeps programmatic focus inside; short menus scroll their own panel to expose the full focus ring. Scroll keys remain inside the panel, while Space on the trigger retains native button activation. Focus outlines retain their original styling and sit above neighboring nav layers. Outside taps close the menu using the original click event path, so the replaced Menu/X icon cannot misclassify the opening click; background swipes do not dismiss it on pointerdown.

`lib/motion/scroll-lock.ts` holds idempotent lock requests; `ScrollRuntime` applies them to its existing Lenis owner via stop()/start(). Pending locks survive lazy runtime loading. Open menus stop the shared Lenis ticker. Under reduced motion an owner exists only for the stopped menu lock and never starts a smoothing loop. Menu content has data-lenis-prevent for native internal scrolling, with overscroll containment. Body/html overflow is never set to hidden or clip; wheel and single-touch movement are stopped through Lenis. Ctrl/Meta wheel and multi-touch pinch remain excluded from interception. Escape, navigation, resize and unmount release locks and listeners. There is no second Lenis instance or new rAF loop.

Door/fade will-change hints exist only while the corresponding animation runs and clear on completion or close. Hover transitions do not retain will-change hints. Stage 4 browser tests live in `tests/e2e/nav-motion.spec.ts` with `playwright.nav-motion.config.ts`; the lock ownership regression is in `tests/scroll-lock.test.ts`. Review evidence, screenshots and recordings are in `artifacts/motion-stage-4/`. Video files remain ignored by Git; patches, reports and screenshots remain eligible for tracking.

## Stage 5: Domestic and International editorial prose

Only the two existing homepage editorial blocks use this composition. Each existing column container becomes a `DepthSection`, retaining its grid classes. Images use `ParallaxMedia` around the complete original frame and caption: Z -40px → +20px, scale 1.04 → 1.00; mobile halves Z. No photograph rotates. The `data-photo-motion="scroll"` marker suppresses the existing pointer tilt on these two frames while retaining the shared highlight and tap response. Tap coordinates now account for the frame's projected scale, keeping the ripple at the actual interaction point.

The first block leads with its image and delays text by 90ms; the second leads with text and delays its image by 90ms. These offsets apply when each column enters the viewport. They do not reorder the existing columns: desktop remains image/text then text/image, and mobile keeps its original image-above-text order. No card styling is added.

Text sits at Z 12px (6px below 768px), entering from the opposite image side at X +12px / -12px. Its outer wrapper does not fade. The grouped prose receives one 16px rise, zero rotation and 400ms expo fade; paragraphs are not individually staggered. Combined horizontal/vertical travel stays within 20px. `immediateIfInView` skips entry entirely if the observer's first report finds content in view, including restored scroll positions and delayed hydration.

`EditorialHeading` composes the existing `RiseIn` primitive. A DOM Range measures actual wrapped word lines only when an offscreen heading enters; exact original string slices animate as temporary spans. There are no character spans, inserted hard breaks or duplicate measuring copy. The Stage 3 tuning supplies 14.4px rise (60% of 24px), 8deg rotation, 600ms duration and 90ms line stagger. After settling, or immediately on width change, normal text wrapping resumes. SSR, JavaScript-disabled and initially visible headings retain plain text at final state.

`RiseIn` adds optional `as="span"`, `fromX`, `fade` and `immediateIfInView` props, preserving existing defaults and the shared scheduler. Entry uses transform/opacity only, and will-change clears on completion, cancellation and reduced motion. Reduced motion removes editorial Z and all primitive transforms immediately. Keyboard focus restores the text entry wrapper's final state.

The content verifier now additionally compares both complete editorial prose inventories as unnormalized UTF-8 bytes against both the pinned baseline and the exact text fences in `MOTION_AUDIT.md`. Regression tests reject internal whitespace changes and edits to that Markdown contract. The audit and baseline themselves are unchanged.

See `artifacts/motion-stage-5/REPORT.md` for exported-site tests, before/after screenshots, desktop/mobile recordings and a patch scoped against the pre-Stage-5 working tree. Hero, navigation, process, FAQ, forms, footer, service routes and image files are unchanged during this stage.

## Stage 6: four-step process

`ProcessSequence` wraps the existing ordered-list children without changing a word, image attribute or step order. At widths ≥768px the list is one horizontal row; below 768px the same list becomes one vertical sequence. This replaces the former intermediate two-column layout as requested. Original photo frames retain their intrinsic 3:2 dimensions and existing tap feedback.

`styles/process-depth.css` defines active Z 60px, inactive Z -30px and inactive opacity .55. Mobile halves Z to 30px / -15px. Each step uses a local `perspective(var(--perspective)) translateZ(...)` transform so its projection grows around its own center, avoiding distant-origin drift along the mobile sequence. These Z endpoints are the explicit Stage 6 exception to the older foundation translation cap. No rotation is introduced.

One normalized scroll value drives all four steps, the decorative connector's stroke-dashoffset, and opacity of each number's radial-gradient pseudo-element. A triangular weight around `progress * 3` blends adjacent steps continuously: an exact active position reaches Z 60 / opacity 1, all other steps reach Z -30 / opacity .55. Between positions, neighbors share emphasis. There is no active-state timer, intersection toggle, spring, or transition lag. Scroll up retraces the same states. The SVG uses native percentage endpoints without a scaled viewBox, so its normalized dash forms one continuous line rather than repeated dashes. Desktop/mobile line orientations are decorative and aria-hidden; they never announce a shipment status.

Desktop progress is `(viewportHeight * .75 - wrapperTop) / (wrapperHeight + viewportHeight * .5)`, clamped to [0,1]. The positive sum avoids division by zero when the section equals or is shorter than the viewport. A centered, fully visible sequence gives progress .5: its middle steps share emphasis steadily, rather than flickering between discrete active indices. Mobile uses the untransformed first and last step centers crossing the viewport center; each successive step receives emphasis as the reader reaches it. Measurements use stationary wrapper bounds and layout offsets, never transformed rectangles.

The component subscribes to the existing provider's scroll MotionValue and batches reads/writes on Motion's shared scheduler. No independent rAF loop or scroll listener is added. Identical/clamped progress performs no style writes. One resettable quiet-period timer clears will-change; it never advances motion. Resize, visibility changes, unmount and reduced-motion changes clean up their work. Reduced motion does not subscribe to scroll: all steps are flat/full-opacity, glow off, connector fully drawn. Those same final states render in SSR or with JavaScript disabled.

Evidence is in `artifacts/motion-stage-6/REPORT.md`. No recordings are created in this or remaining stages; review is on the running dev server, with diff/report/content verification retained.

## Stage 7: FAQ, forms and footer

`components/motion/utility-depth.tsx` provides three section-specific presentation wrappers around the existing native DOM. They do not add new general-purpose motion primitives. `FaqDepth` replaces only the existing faq-list div; `FormDepth` wraps the unchanged frozen form components; `FooterDepth` replaces only the footer's shell div. None changes content, field names, endpoints, native details semantics, routes or images. A hydration marker enables presentation only after mount, while CSS and reduced-motion state provide flat readable fallbacks.

FAQ uses the existing plus/minus indicator, rotating it 180° on the 240ms expo curve. Native details opens/closes its layout immediately; the answer hinges from rotateX(-6deg) with opacity over 240ms. There is deliberately no height interpolation, preserving the transform/opacity-only rule. The old entire-card sideways movement and animated shadow are removed within this scope. One capture listener on each FAQ wrapper observes native toggle events; it does not intercept keyboard activation or prevent default. Rapid toggles cancel the prior answer animation, and finish/reduced-motion/unmount clear will-change and listeners. Reduced motion is stationary, including focus outlines.

Forms use a compensated local perspective plane at Z 30px (15px mobile), preserving their existing size, position, soft shadow and layout. Focused controls lift to Z 12px (6px mobile), keeping the existing teal outline/ring. Their existing separate labels move up 2px without becoming placeholders or obscuring values. Submit buttons use desktop rotateX(-8deg) hover with a pseudo-element glow and scale .97 / Z 0 on active; active wins over hover. The shared pointer policy disables hover tilt on Quote, touch and below 768px. Quote's WebGL files and both form implementation files remain unchanged. The enquiry-only notice has no opacity treatment, entry animation or delay.

Footer content sits at local Z -20px (-10px mobile), with a 1px desktop link lift. Original links, focus rings, company data and logo remain. The footer's outer page footprint is unchanged. All Stage 7 transforms are disabled under reduced motion; optional opacity transitions are capped at 150ms. No persistent will-change, rAF loop, pointer listener or scroll subscription was introduced.

The completed Task A image diagnosis and pixel-identical transform controls are in `artifacts/service-photo-diagnosis/REPORT.md`; the six native 392px service rows need larger same-image originals. Stage 7 does not modify their rendering. Review `artifacts/motion-stage-7/REPORT.md` and `stage-7.patch` on the running dev server. No recordings are made. Stage 8 (remaining pages) and Stage 9 (performance/final verification) await review.
