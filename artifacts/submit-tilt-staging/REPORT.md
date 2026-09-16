# Quote submit repair, bounded service tilt and staging verification

## Requested intensity values

The requested lower values were already present before this task. No intensity bump had been applied locally: hero pointer 6px, headline 8°, opacity floor .55; depth -80/40/90px; RiseIn 40px; parallax -40/+20px. Mobile Z halving remains. Neither `lib/motion/hero-tuning.ts` nor `styles/depth.css` changed. See `requested-values.json` and the computed tokens in `quote-diagnosis.json`.

## 1. Quote interception: confirmed cause and fix

At 768×900/2×, after an invalid email was corrected and the package count changed to an invalid value, `document.elementFromPoint()` at the submit button's centre returned **FORM.form-panel**, not BUTTON.button. The form used `perspective(1200px) translateZ(30px) scale(.975)` inside a section's preserve-3d context. The error occurred with the requested lower intensity values, so it was not caused by an intensity bump.

Browser-only controls confirmed that removing the form's transform, or isolating its wrapper, restored BUTTON.button as the top hit target without changing its layout. The implementation uses the smaller fix: `isolation: isolate` on `.form-depth`. Form depth stays intact; no parent gets pointer-events:none, and no submission or validation logic changes.

`tests/e2e/quote-hit-testing.spec.ts` covers 360, 390, 768, 1024 and 1440px with/without prior validation errors. It checks elementFromPoint, then uses ordinary actionable clicks. Each scenario retries three mocked rejected submissions and one accepted response. Targeted result: **10/10 pass**. All POSTs are intercepted; no enquiries are sent. Diagnostic screenshot: `quote-768-before.png`; full diagnostic measurements: `quote-diagnosis.json`.

## 2. Service-row tilt

All six Domestic/International service-row photographs opt into bounded rotateX/rotateY, capped at ±10°. Their original images, filenames, alt text, responsive sources and layout dimensions are unchanged. The whole photo face rotates inside a paint-contained boundary, in an isolated media stacking context; neighboring prose has its own higher plane.

`lib/motion/service-tilt.ts` uses Motion spring generators with the hero's stiffness 120/damping 24/mass 1, resetting velocity when retargeting so it approaches each target without overshoot. Unit tests sample both directions, reversal, return to zero and out-of-range input. It uses the existing frame.render scheduler and the existing ImageFeedback pointer recognizer. No pointer listener, native rAF loop or timer is added. Stationary bounds prevent hover feedback from moving its own measurement target. Settling/cleanup release will-change.

Tilt is completely disabled below 768px, under hover:none, under reduced motion and on Quote. The existing click/tap recognizer remains; tap feedback resets tilt before creating its ripple. The service highlight is limited to .15 alpha. Targeted result: **10/10 pass**, covering all six photos at 768/1024/1440px, unchanged prose rectangles, adjacent test-only native links/buttons at the image edge, real Quote/Contact navigation, and all pointer exclusions. Tests never add controls to website source.

## Full verification and test maintenance

The full suite includes the existing site tests plus the submit/tilt regressions. All artifacts remain inside the project; no recordings were created. Browser tests use the exported out/ and deployed `_headers`, not next dev. The in-app browser bootstrap failed (`Cannot redefine property: process`), so installed Playwright Chromium was used. Physical devices/Safari were not tested.

Older tests assumed eagerly loaded process photos, immediate availability of lazy effects, viewport coordinates unaffected by automated scrolling, and pre-approved-caption-removal geometry. Those assumptions were corrected rather than changing the website to satisfy them:

- Lazy photos are scrolled into view before decode; all four still decode and share the 3:2 frame.
- Feedback tests wait for the actual handler-ready marker, not an arbitrary load delay.
- Ripple coordinates are checked against the actual click point at animation start, including projected/tilted frames.
- Existing text entrances settle before measuring whether an image interaction moves text.
- Geometry uses the saved pre-fix Stage 9 export, which already includes approved Stage 8/caption/process changes. Device rounding allows at most one physical pixel.
- Auxiliary no-JS contexts use the test's actual site origin; no hardcoded unrelated preview ports. Screenshots use artifacts/.

The original failed-attempt logs remain as `full-e2e-first.log` and `full-e2e-second.log`. They are not represented as passing checks. The latest run log is `full-e2e.log`.

## Content, deployment boundaries and evidence

`verify:content` rebuilds the export and passes against the existing pinned, explicitly approved baseline. It was not recaptured. The original-commit comparison with c4e5357 also passes: only the previously approved six caption removals, decorative Quote VKC removal, image descriptions and image repairs differ. No new copy, route, metadata, section, link, control, image-byte or form/business-source changes were introduced by these repairs. All 66 image-file hashes remain pinned. Original transparent logo, contact information, FormSubmit endpoints and static security headers remain unchanged.

This changeset also includes the already-requested uncommitted Stage 8 wrappers and Stage 9 runtime splitting/scheduler work. Those are documented separately in `artifacts/motion-stage-8/REPORT.md`, `artifacts/motion-stage-9/REPORT.md` and MOTION_SYSTEM.md. No archived backend was restored. The intensity increase was not applied.

Final suite results, commit SHA and Cloudflare deployment evidence are appended only after those operations actually complete. The later deployment evidence JSON records the exact commit and provider-reported result; a push alone is not treated as deployment success.


## Completed local gate

- Full Playwright suite: **188 passed, 2 existing deliberate skips, 0 failed, 0 flaky** (190 cases; desktop and mobile projects, with explicit 360/390/768/1024/1440 regression cases). See `full-e2e.log` and `full-results.json`.
- Unit suite: **85 passed** across 9 files. See `unit-tests.log`.
- `npm run lint`, `npm run typecheck`: pass.
- `npm run verify:content`: pass, including its fresh `npm run build` and static `out/` export. See `verify-content.log`.
- `node scripts/check-static-export.mjs`: pass; deployed headers retained, no retired server routes, all assets within the Pages size limit.
- Independent original-commit proof: pass (`original-content-proof.log`). No unapproved copy/routes/elements/images; the historical approved differences remain documented.
- `git diff --check`: pass. Hero/depth values and all image files have no diff from the pre-task state.
- Tilt screenshots were visually inspected at 1024px Domestic and 1440px International. The complete frames rotate without moving prose or covering adjacent controls. No new recording was made.


## Final performance measurements

Three final Lighthouse mobile runs per page, same compressed static preview/settings as the saved baseline:

| Page | Before median | Final median | Final range | CLS |
|---|---:|---:|---:|---:|
| Home | 90 | 96 | 95–96 | 0 |
| Domestic | 95 | 96 | 95–96 | 0 |
| International | 95 | 95 | 95–95 | 0 |
| Contact | 95 | 96 | 95–96 | 0 |
| Quote | 90 | 90 | 90–90 | 0 |

All 15 final runs meet Performance ≥90 and CLS=0. Raw reports: `artifacts/motion-stage-9/final-repair-pages/`. Earlier Domestic outlier measurements remain disclosed in the Stage 9 report. This is a local simulated-mobile result, not a physical-device field guarantee.

Final 4× CPU scroll: all 11 routes reached the bottom; zero scroll long tasks >50ms, zero idle will-change hints. Estimated missed frames: /=0, /services/domestic=0, /services/international=0, /about=0, /contact=0, /get-a-quote=1, /faq=0, /track=0, /privacy=0, /terms=0, /404.html=0. Estimates use rAF intervals, not compositor counters. The window starts 2.5s after navigation; startup tasks are reported separately in the raw data. One recurring Motion scheduler remains; no new native rAF loop or pointer listener was added.
