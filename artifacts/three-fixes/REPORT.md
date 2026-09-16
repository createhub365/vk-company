# Caption, focus and Quote scroll fixes

Completed locally, in the requested order. No commit, push, deployment, recording or enquiry submission.

## Fix 1 — the caption was in the DOM, not baked into the photograph

The actual Domestic, International and About hero image files contain no “Illustrative courier environment” lettering. `components/page-hero.tsx` rendered that phrase in an absolutely positioned span over the picture. Hiding only the span in a browser control removed the lettering while using exactly the same image bytes; see `*-caption-before.png` and `*-caption-dom-hidden-control.png`.

Removed that span on all three routes and the three similar homepage overlays (“Illustrative route imagery”, “Illustrative international logistics”, “Illustrative operations environment”). Also removed the unused legacy SceneStage caption so it cannot reintroduce the overlay. No service photograph needed regeneration: all 66 image hashes, filenames, physical dimensions, ratios, alt text and embedded VK branding remain unchanged.

**Why verify:content passed:** these captions date to original repository commit `e7cfc6b` and were already present in the Stage 1 baseline and MOTION_AUDIT.md. The preservation check did not miss an added caption; it was faithfully preserving unwanted baseline content. It is a change detector, not an approval classifier or OCR system. Earlier wording that preservation implied absence of such overlays was too broad.

Your explicit removal instruction authorizes six narrowly scoped rendered-copy deletions. Only those baseline `contract.text` / section inventory entries and their corresponding Markdown inventory lines were changed; the integrity pin was refreshed without recapturing the baseline. All other contract data, including the complete 66-image manifest, is identical. A regression test adds the phrase back as DOM content and proves the guard rejects it. Historical fixture HTML receives only these exact caption removals before tests run.

## Fix 2 — keyboard rings, no mouse boxes

The local nav already used `:focus-visible`; initial desktop mouse clicks did not reproduce the reported box. The wider keyboard/mouse test did reproduce a mobile edge case: after keyboard use, mouse-opening/closing the menu could retain `:focus-visible` on the trigger when focus returned.

- Converted the remaining plain `:focus` field outline/depth selectors to `:focus-visible` in globals and utility styles.
- Added `:focus:not(:focus-visible)` outline suppression with the existing visible keyboard rings retained.
- The nav records pointer activation and suppresses its retained browser focus ring for that input mode. A keyboard event clears the flag before focus moves, restoring the normal visible ring immediately. Focus itself is never blurred or discarded. The one keyboard listener cleans up on unmount.
- Kept `:focus-within` stacking and content-visibility safeguards; these do not draw click outlines. Text-entry controls retain the browser's native `:focus-visible` heuristic.

50 recorded focus observations passed across all five nav links, 1440/390px, normal/reduced motion. Tabbing shows solid 2px-or-greater teal rings; mouse clicks show no box; Tab after mouse use restores the ring. Mobile Escape returns focus to the trigger. Screenshots are `nav-keyboard-*` and `nav-mouse-*`.

## Fix 3 — diagnosed Lenis easing latency

Controlled comparisons ran against the exported site before changing the scroll runtime. A single 500px wheel event was sampled through settlement, with normal CPU and 4× CPU throttling. Main comparison uses 1× display density and records actual wheel deltas. An earlier 2× emulation trace is retained separately because native and script wheel distances differed there; it is not used for the headline comparison.

| Condition | Normal CPU settlement | 4× CPU settlement |
| --- | ---: | ---: |
| Before, normal Quote | 1231ms | 1226ms |
| Before, native-wheel control | 49ms | 45ms |
| Before, WebGL disabled | 1233ms | 1226ms |
| Before, button effects disabled | 1224ms | 1229ms |
| After, native Quote route | 20ms | 28ms |

Settlement means reaching within one CSS pixel of the 500px target. It measures the smoothing tail, not INP or network loading. The WebGL frame counter stayed at 2 before and after scrolling in WebGL-enabled comparisons. No long tasks occurred during these wheel samples. Thus the supported cause is Lenis interpolation latency, **not** a WebGL render on every scroll frame or the pressable button effect; “Lenis fighting WebGL” was not demonstrated.

`components/motion/scroll-runtime.tsx` now opts `/get-a-quote` (including trailing slash) out of smoothing. There is no running Lenis instance/rAF owner on the unlocked Quote route. Framer Motion's existing native `useScroll` continues to update scroll-linked consumers. Other routes retain their configured smoothing. The WebGL scene and button effects are unchanged.

For mobile menu locking on Quote, a temporary nonsmoothing Lenis instance is stopped while the menu is open and destroyed on close. Repeated locks, native touch scrolling, navigation away/back, browser Back, reduced motion, no-JS and WebGL-failure checks passed. See `quote-runtime-results.json`.

## End-to-end scroll verification and remaining stall

All 11 exported public page outputs were scrolled from top to bottom at 1440px and 390px: 22 passes. Every pass reached the bottom, decoded all images, and had no horizontal overflow or browser errors. The local preview applies the deployed security headers. Network interception blocks external requests and submissions.

Across all 22 traversals, the 95th-percentile frame interval was 16.7–16.8ms, with **zero intervals over 50ms and zero scroll long tasks**. No recurring scroll stutter was measured. Full-page stills were captured after reaching the bottom; sticky elements therefore appear at their scrolled position in these long screenshots. Domestic/International desktop, Quote desktop/mobile, homepage mobile and keyboard/mouse nav stills were visually inspected.

**Remaining limitation:** Quote's initial WebGL-enabled load still produced a one-off long task of 177ms at normal CPU, and 142ms (plus a 57ms hydration task) at 4× CPU. The no-WebGL control removed the large scene-associated task, supporting initialization as its source. This can cause a brief entry hitch; it is not recurring scroll work and was not eliminated by the route scroll fix. Other pages retain the intentional Lenis easing tail. These are Chromium desktop/mobile emulation results, not a guarantee for every physical device, Safari, network or GPU. No Lighthouse/INP score is claimed.

## Checks and scope

- `npm run verify:content`: passed with a fresh static `out/` production build; approved caption delta only.
- `npm run typecheck`, `npm run lint`: passed.
- `npm test`: 8 files, 79 tests passed, including the new DOM-caption regression.
- `verify-focus.mjs`: 50 keyboard/mouse observations passed.
- `verify-quote-runtime.mjs`: native scrolling, six repeated menu-lock cycles, touch gestures, route/history lifecycle and accessibility/failure paths passed.
- `verify-scope.mjs`: every image byte and all non-caption copy/alt/links/forms/metadata remain unchanged relative to the pre-task snapshot. Prior generated-photo and Stage 7 changes were preserved.

Task-specific production edits: `components/page-hero.tsx`, `app/(site)/page.tsx`, `components/three/scene-stage.tsx`, `app/globals.css`, `styles/utility-depth.css`, `components/site-header.tsx`, `styles/navigation.css`, `components/motion/scroll-runtime.tsx`. Contract/test edits: `MOTION_AUDIT.md`, `artifacts/motion-audit/baseline.json`, `scripts/verify-content.mjs`, `tests/motion-content-guard.test.ts`.

`changes.patch` contains only this task's delta relative to its actual starting tree. The working tree also contains prior authorized photo and Stage 7 work; a whole-repository git diff therefore shows more than this task.

Raw evidence: `caption-diagnosis.json`, `focus-before.json`, `focus-after.json`, `quote-profile-before.json`, `quote-profile-after.json`, `site-scroll-results.json`, `scope-results.json`, screenshots and check logs in this folder. The in-app browser connection failed to bootstrap; project Playwright supplied local Chromium verification.
