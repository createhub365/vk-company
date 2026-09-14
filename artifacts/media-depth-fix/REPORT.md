# VK AND COMPANY — local media implementation and verification

Completed locally on 14 September 2026. No commit, push, deployment, DNS change or real enquiry submission was performed.

[Open the visual review](index.html) for before/after screenshots at all four requested widths, recordings, active frames, and the actual Quote asset.

## What changed

- Photograph frames now follow each source's native proportions with no inner padding or fixed minimum height. Images render at `width:100%; height:auto`; the whole clipped frame moves coherently. Aircraft nose, tail and wingtips remain visible. The logo and stationary homepage backdrop retain their separate sizing.
- The Quote placeholder is replaced by the existing **1536×1024** [standalone original](../../assets/photographs/originals/details.png), showing a parcel on a scale, measuring tape and paperwork. It is AI-generated illustrative imagery, not actual company staff/premises. No new generation or enlargement was performed. [Asset provenance and usage](../../assets/photographs/QUOTE-USAGE.md).
- One shared passive gesture recognizer provides approximately ±3.5° pointer tilt, a moving highlight and a teal ripple at the click/tap location, with a 640ms depth response. Border offsets are accounted for. It rejects swipes, drags, selection, long presses and multiple pointers. Feedback is confined to photos. Links retain native activation and keyboard semantics.
- Four translucent teal/silver `SphereGeometry` meshes, physical materials, ambient/directional/point lighting and a perspective camera render through one lazy Three.js scene in the Quote media area. They respond to the recognizer's local events. No canvas is added elsewhere. The scene stops requesting frames after settling and when off-screen or the document is hidden; moving interactions continue to request frames. It disposes its listeners, geometry, materials, renderer and observers on unmount.
- Static shaded circles provide the explicitly **non-WebGL fallback** with reduced motion, unavailable/lost WebGL or absent JavaScript. The photo remains ordinary exported HTML.
- About thumbnail and Contact image `sizes` hints were corrected after the 2× density audit found unnecessarily small selected assets at 768px.

## Reference: observed versus proposed

The requested [Dribbble shot](https://dribbble.com/shots/27726868-AI-CFO-Platform-Landing-Page) could not be freshly fetched by the web tool in this session. Its saved page HTML and associated media were already present in the project. The saved HTML identifies the shot's primary [video URL](https://cdn.dribbble.com/userupload/49005739/file/large-6a6ab18f9cf910d6fb4cd0fd60c116d0.mp4).

The actual saved MP4 was decoded in Chrome: **800×600, 8.27 seconds**. Frames were inspected at 0–8 seconds. Observed: a warm orange/brown editorial composition, large serif heading, photographic background and translucent rectangular information panels. The inspected clip did not demonstrate pointer tilt, image tap ripples or interactive 3D bubbles. Those effects here are newly proposed and implemented to the task specification. No exact animation match or designer-library attribution is claimed. No reference financial copy, branding or assets were placed in the site.

## Verification

The test target was the production static export, served by `scripts/preview-static.mjs`, which reads and applies `out/_headers` and resolves clean HTML routes without a Next.js runtime. The export retains `output: "export"` and `out/`.

| Check | Result |
|---|---|
| All 10 public routes × 1440, 768, 390, 360px | 40 combinations; no page errors or horizontal overflow |
| Photograph visual inspection | All 22 placements at all four widths; complete sources, no inner strips |
| Quote copy/form placement | Heading and form rectangles exactly match the captured baseline at every width |
| Business content | Main text, links and field definitions match baseline on every route/width |
| Interaction suite | 62 passed; two touch-hover checks intentionally skipped |
| Rapid interaction stress | 15 rapid taps/clicks; 4 viewport tests passed; at most one transient ripple; rendering settles |
| Public/forms/visual regression suite | 69 passed; one duplicate mobile visual check intentionally skipped |
| Unit tests | 65 passed in five files |
| Build/typecheck/lint/static artifact checks | Passed; `git diff --check` passed |
| Reduced motion | Stationary frame and fallback; no canvas loaded on initial reduced-motion visit |
| WebGL startup failure/context loss | Photo, form and static fallback remain; form input works |
| JavaScript disabled | Exported photograph and essential form content remain visible |
| Native input | Mouse/trackpad-style pointer events, wheel scrolling, touch swipes, selection, keyboard links and menus checked |
| Native pinch | Browser viewport scale changed from 1 to 1.5000001; zero tap-feedback layers |
| Rendering lifecycle | Actual WebGL2 context confirmed; frame counter stable while idle and off-screen |
| Forms | FormSubmit endpoints and response handling covered with intercepted requests; no real enquiries sent |

Public routes: `/`, `/services/domestic`, `/services/international`, `/about`, `/contact`, `/get-a-quote`, `/faq`, `/privacy`, `/terms`, `/track`. Static checks also cover the real 404 response and retired/private routes.

The official logo, contact information (`vkandcompanymohali@gmail.com`, `+91 93177 24056`), FormSubmit modules, deployment configuration, package dependencies and headers were not changed. The existing `_headers` file has no CSP; none was removed, weakened or added. No archived server features were restored.

## Review artifacts

- [Desktop recording — 13.8 seconds](desktop-interactions.webm): pointer movement, image taps, responding real spheres, scrolling and International aircraft interaction.
- [Mobile recording — 7.16 seconds](mobile-interactions.webm): repeated taps and bounded spheres, followed by native scrolling.
- [Active desktop ripple](desktop-tap-active.png), [active mobile ripple](mobile-tap-active.png), [pointer tilt](pointer-tilt.png), [aircraft tap](aircraft-tap-active.png).
- Before screenshots use the `baseline-` prefix; final screenshots use `after-`. Both exist for Quote and International at all four widths.
- Individual photo captures are in `gallery/`; `gallery-{1440,768,390,360}.png` are inspection sheets. Sheet padding is only part of the review layout, not the site.
- [Measurement summary](verification-summary.json), [full baseline](baseline-audit.json), [full final audit](after-audit.json), [native pinch evidence](native-gestures.json).
- Test logs: [interaction](interaction-tests.log), [rapid taps](rapid-tap-tests.log), [public/forms](public-tests.log).

## Files in this continuation

Runtime changes/additions: `app/globals.css`, `components/image-feedback.tsx`, `components/quote-media.tsx`, `components/three/quote-bubbles.ts`, `app/(site)/about/page.tsx`, `app/(site)/contact/page.tsx`.

The existing draft's `PageHero`, `Photograph`, `ProcessPhoto`, service-photo wrappers, `lib/media-interaction.ts`, image manifest and source assets are reused. Existing unrelated working-tree edits remain intact.

Verification/documentation changes: `tests/e2e/image-feedback.spec.ts`, `tests/e2e/public.spec.ts`, `tests/e2e/reference-designs.spec.ts`, `tests/e2e/visual.spec.ts`, `playwright.image-feedback.config.ts`, `playwright.media-verification.config.ts`, `assets/photographs/QUOTE-USAGE.md`, and this artifact directory.

To reproduce: `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `node scripts/check-static-export.mjs`, `npx playwright test --config playwright.image-feedback.config.ts`, and `npx playwright test --config playwright.media-verification.config.ts`.

## Remaining limitations

- Browser verification used local Chromium and emulated touch/high-density viewports, not physical phones or a physical trackpad. Safari/Firefox and device-specific GPU behavior were not exercised.
- All photographic cards meet the tested density needs. The unchanged full-width homepage backdrop is limited by its existing 1536px native source at 1440px/2×. It was not upscaled or described as a new high-resolution original.
- WebM recordings are compressed browser captures; PNG screenshots and the original photograph are the sharper visual evidence.
- Remote edge configuration and actual FormSubmit delivery were intentionally not exercised. Preview verification applies the repository's deployed header file; no deployment was performed.
