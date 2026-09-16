# Motion system

Current implementation through Stage 9. No intensity bump was applied. The subsequent approved repair adds bounded service-row tilt and isolates the form stacking context. The content contract is the explicitly amended [MOTION_AUDIT.md](MOTION_AUDIT.md), not a claim that every byte matches the original website. [Stage 9 evidence](artifacts/motion-stage-9/REPORT.md) includes the independent comparison with `c4e5357` and performance results.

## Tokens and easing

`styles/depth.css` is imported after the original global CSS.

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

Expo is `cubic-bezier(0.16, 1, 0.3, 1)`. Durations are `--d-fast:240ms`, `--d-base:600ms`, `--d-slow:900ms`; reduced opacity transitions are capped at `--d-reduced:150ms`. Mobile halves Z distances, not entrance durations or Y translations.

The hero retains approved Round 1 tuning in `lib/motion/hero-tuning.ts`: pointer travel 6px, stiffness 120/damping 24/mass 1, headline rise 24px/rotation 8deg/duration 600ms, line stagger 90ms plus emphasis delay 80ms. Scroll ends at opacity .55 and Z -60px (-30px mobile). Support text/CTA use a 16px/400ms entrance. The emphasis line is 15px forward, halved on mobile. Recession tracks scroll without a spring; pointer movement uses the spring. The later proposed intensity increase is not applied.

## Exactly three general-purpose primitives

Import from `components/motion/primitives.tsx`. All render content during SSR in its visible final state; only null-rendering DOM effects load after hydration.

| Primitive | Behavior | Props |
|---|---|---|
| `DepthSection` | Div with perspective/preserve-3d. No new semantic section or automatic animation. | `children`, `className`, `id`, `style` |
| `RiseIn` | Once-only transform/opacity entrance. Default 40px rise, 12deg rotateX, 600ms expo. | Common props; `as="div"\|"span"`, `rise`, `rotate`, `fromX`, `fade`, `immediateIfInView`, `stagger`, `index`, `delay`, `duration`, `enabled`, `timelineStart` |
| `ParallaxMedia` | Stationary measuring wrapper, transformed inner plane. Viewport progress maps through expo to Z -40px → +20px and scale 1.04 → 1. No rotation; mobile Z halves. | Common props |

`RiseIn` clamps rise to 0–40px, rotation to 0–12deg, horizontal travel to ±40px and duration to 0–600ms. Total `delay + stagger * index` is capped at 900ms. Times are milliseconds. `fade` and `enabled` default true. `timelineStart` is an optional document-timeline timestamp for existing coordinated sequences. These bounds are independent: do not combine full X/Y distances for prose; the editorial composition uses smaller offsets.

Use `immediateIfInView` for headings/prose: if the first observer report finds them visible, skip the entrance. Never put essential notices or a whole form behind delayed reveals. The `style` type excludes transform, opacity, will-change and animation overrides.

```tsx
<DepthSection className="existing-section-layout">
  <RiseIn rise={16} rotate={0} duration={400} immediateIfInView>
    {/* Existing heading/prose, unchanged */}
  </RiseIn>
  <ParallaxMedia>
    {/* Complete original photo frame, with its existing classes */}
  </ParallaxMedia>
</DepthSection>
```

Preserve the frame's radius, object-fit, aspect ratio and image attributes. Wrap the complete frame; do not transform a bare photograph away from its border. Existing scroll photographs use `data-photo-motion="scroll"` to suppress pointer rotation while retaining permitted feedback. The six service-row photographs now additionally opt into the explicitly approved desktop tilt described below. Other scroll photographs remain unrotated.

## One shared scheduler

`MotionProvider` adds context only. `useScroll({trackContentSize:true})` provides shared MotionValues. `ScrollRuntime` connects one Lenis owner with `lerp:.08`, `autoRaf:false`, `syncTouch:false`; Lenis events update the same values. Motion's frame scheduler owns the one recurring native rAF loop. Work uses `frame.read`, `frame.update`, and `frame.render`; cancel with `cancelFrame`.

Normal visible-page idle retains the Lenis ticker. Hiding the document, reduced motion, the Quote exception or unmount removes it. A stopped Lenis owner can exist while the mobile menu is open, including on Quote/reduced motion, solely for scroll locking. It does not run another smoothing loop. Ctrl/Meta-wheel, pinch and normal touch scrolling stay native. Body overflow is not hidden.

Stage 9 moved Quote's demand renderer onto `frame.render`. It requests another frame only while settling and cancels pending work when idle, offscreen or disposed. Geometry, lighting and bubble presentation are unchanged. Lenis contains internal single-shot rAF callbacks; they are not independent recurring loops. Unused legacy scene files remain outside the public import graph; their source text is not evidence of a mounted loop. The audit documents both facts.

Do not add `requestAnimationFrame`, `autoRaf:true`, per-card tickers or canvases. Subscribe to the provider and schedule needed work through Motion.

## Code-splitting without hiding content

SSR facades retain semantic markup, refs and essential interactions. DOM presentation runtimes return null and use `dynamic(..., {ssr:false})`:

| Facade | Lazy runtime |
|---|---|
| `motion/provider.tsx` | `motion/scroll-runtime.tsx` |
| `motion/primitives.tsx` | `motion/primitives-runtime.tsx` (RiseRuntime and ParallaxRuntime) |
| `motion/hero.tsx` | `motion/hero-runtime.tsx` |
| `site-header.tsx` | `motion/navigation-runtime.tsx` |
| `image-feedback.tsx` | `motion/image-feedback-runtime.tsx` |
| `motion/editorial-heading.tsx` | `motion/editorial-heading-runtime.tsx` |
| `motion/process-sequence.tsx` | `motion/process-runtime.tsx` |
| `motion/utility-depth.tsx` | `motion/utility-runtime.tsx` |
| `quote-media.tsx` | `motion/quote-media-runtime.tsx`, then on-demand `three/quote-bubbles.ts` |

Paths are relative to `components/`. Essential nav focus handling and forms stay in SSR client components. Dynamically hiding entire nav/forms/prose would violate the fallback contract. The provider and shared media-query hook are infrastructure, not additional visual effects.

Automatic public Link prefetch is disabled, and below-fold process photographs load lazily. Labels, hrefs, activation and image bytes are unchanged.

## Reduced motion, pointer policy and cleanup

`useReducedMotion` uses a shared media-query subscription and conservative stationary server/hydration snapshot. CSS independently forces final opacity and removes motion transforms/perspective before JavaScript. Reduced opacity transitions are at most 150ms. The menu becomes a plain fade; process steps are flat/full opacity with the connector fully drawn.

`usePointerEffects` requires no reduced motion, a fine hover-capable pointer, width ≥768px and an allowed route. Shared feedback is the pointer broker; hero adds no document listeners. Mobile/hover-none CSS is a second guard. Touch scrolling and zoom are not captured for effects.

`will-change` is temporary: entrances release it on finish/cancel; parallax/hero/process after the 240ms quiet period; FAQ after its answer animation; menu on animation end/cancel/close. All release on cleanup/reduced motion. Stage 9 guards delayed entrance hints against already-finished animations and cancels their timers. There is no permanent non-auto declaration on mounted public components.

## Quote exceptions

`/get-a-quote` is pointer-effects-disabled in `lib/motion/policy.ts`. Scrolling is native; Lenis smoothing remains disabled. Shared image tilt/parallax and button hover depth cannot drive Quote. The hero photograph/static decorative fallback are SSR content, outside ParallaxMedia. Reduced motion and WebGL failure retain the fallback. One bounded Three.js scene loads when needed, uses the shared scheduler, and pauses offscreen/at rest.

The form notice stays immediately visible, unchanged and outside reveals. Field names, FormSubmit targets, validation, response handling and contact information are frozen; neither form implementation changed in Stage 9.

## Existing compositions

- Navigation: Z 60px/30px mobile; one boolean past 80px; pseudo-element shadow/glow; visible keyboard rings; focus trap and Lenis menu lock. No per-scroll-frame nav writes.
- Editorial prose: alternating existing columns, small opposing X entry, text Z 12px/6px mobile, grouped 16px/400ms body reveal. Initially visible prose is immediate. Measured heading lines reuse RiseIn, then restore ordinary wrapping.
- Process: one list, horizontal desktop/vertical mobile; continuous scroll emphasis Z -30px to +60px (mobile halved), opacity .55–1. Connector uses the same progress. These are Stage 6 endpoints, separate from generic primitive bounds. Positive denominators handle tall viewports without active-state flicker.
- FAQ: native details opens its layout immediately; only answer transform/opacity hinges. No height interpolation. Forms/footer keep existing compensated planes and focus behavior. Stage 8 remaining sections use only the three primitives.

## Adding sections and verifying changes

1. Preserve words, semantic sections, images, links, controls, metadata and routes. Add wrappers around existing content; keep original layout/frame classes where necessary.
2. Compose only the three primitives. Prefer grouped prose with `immediateIfInView`; do not stagger long paragraphs or animate notices. If they cannot express a request, ask before adding bespoke code.
3. Respect reduced motion, mobile Z halving, Quote exceptions, tokens and shared scheduling.
4. Preview `out/` with `node scripts/preview-static.mjs 3102`. It applies exported `_headers` and negotiates gzip for text as Pages does, never recompressing images. An optional third argument selects a saved export for comparisons.
5. Test 1440/768/390/360 layouts, keyboard, scrolling, reduced motion, no-JavaScript content, WebGL failure and idle cleanup. Intercept form requests. Artifacts stay inside `artifacts/`; no new recordings.
6. Run lint, typecheck, relevant tests and `npm run verify:content`. Verification rebuilds `out/`, checks 11 pages and 66 referenced image-file hashes, metadata, routes, headers, form/business sources and exact editorial prose. Never recapture to fix a failure.

`.githooks/pre-commit` checks staged/worktree consistency before content verification and fails closed. Intentional content amendments require user approval and a reasoned audit entry. The independent original-git comparison remains necessary: an accepted baseline cannot prove absence of historical changes.


## Approved submit repair and service-row tilt

The requested original hero/depth values above were already in place: no intensity increase was applied or reverted. At 768px, after validation errors, `elementFromPoint` returned the form background over its submit button. `.form-depth { isolation: isolate; }` groups the form before the surrounding section projects it. This preserves form depth, layout, focus and submission logic without disabling any parent pointer events. Regression coverage checks real clicks before/after validation and repeated provider rejection at 360, 390, 768, 1024 and 1440px.

ServiceProcess opts its six photo faces into `data-service-tilt`. The existing ImageFeedback recognizer measures each stationary `data-service-tilt-boundary`; no listener is added. `lib/motion/service-tilt.ts` samples Motion spring generators on the shared `frame.render` scheduler with the hero's stiffness 120, damping 24 and mass 1. Both axes clamp to ±10 degrees. Velocity resets on target changes to avoid overshoot. Settled springs stop requesting frames and release will-change. Unmount, disabled pointer policy, reduced motion and blur clean up immediately. Click feedback cancels tilt on that face before using its existing ripple/depth response.

The complete photo face rotates inside a paint-contained frame. The media column has an isolated stacking context; neighboring prose stays above it. The photo's source, aspect ratio, alt text and layout dimensions are unchanged. This confines projected corners and hit testing to the media area. Desktop fine pointers at width ≥768px can tilt; hover-none, narrower screens, reduced motion and Quote cannot. Tests check all six images, unchanged prose rectangles, adjacent native controls, real page links and all exclusions. Only this explicit service-row exception introduces photograph rotation.

See [submit/tilt deployment report](artifacts/submit-tilt-staging/REPORT.md) for current checks and staging verification. Earlier Stage 9 performance artifacts retain their original measurements and any failed attempts; they are not silently rewritten as final results.
