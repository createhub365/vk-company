# Stage 9 performance audit — retained measurements

This records the performance pass before the subsequent submit/tilt repair. Final regression and deployment status belongs to [the current report](../submit-tilt-staging/REPORT.md). No intensity bump was applied. No production deployment was made during the original pass.

## Before/after Lighthouse

Three runs per route, Lighthouse 13.4.1, headless Chromium 153, default simulated mobile throttling. Both versions were fresh static exports, served with the same deployed `_headers` and negotiated gzip. Before sources are saved in `before/sources.json`; rebuilt baseline output was served independently. Cloudflare Pages serves compressed text ([official documentation](https://developers.cloudflare.com/pages/configuration/serving-pages/)). The initial uncompressed preview runs remain under `before/` and `trial/`; they are not used to claim an improvement caused by code.

| Page | Before median | After median | After range | CLS, all runs |
|---|---:|---:|---:|---:|
| Home | 90 | 96 | 96–96 | 0 |
| Domestic | 95 | 96 | 83–96 | 0 |
| International | 95 | 95 | 95–95 | 0 |
| Contact | 95 | 96 | 96–96 | 0 |
| Quote | 90 | 90 | 90–90 | 0 |

Domestic had one 83 result. Five repeat runs, unchanged code/settings, scored 95, 96, 96, 96, 96. The low run's simulated LCP was 4729.6ms versus 2856.6ms in the next run, while observed image render delay was 30.1ms versus 31.8ms. An effect-specific cause was not established; the original miss remains disclosed, not discarded. Median targets pass; an every-run ≥90 guarantee is not claimed.

Raw JSON, first-run HTML reports and settings: `before-pages/`, `after-pages/`, `domestic-recheck/`. All local laboratory scores, not physical Android or live Cloudflare field results.

## Scroll, scheduler and hints

All eleven public outputs were scrolled to the bottom at 390×844/2× under actual CDP 4× CPU slowdown. Both before and after recorded zero scroll tasks exceeding 50ms and zero lingering will-change hints. Estimated missed frames were zero on every route except Quote, which had one before and one after; p95 frame intervals were approximately 16.7–16.8ms. Estimates come from rAF intervals against a 60Hz budget, not compositor dropped-frame counters. Startup is separate: Quote's largest initial task was 197ms before / 200ms after. The scroll window starts 2.5 seconds after navigation; this is not a claim that startup contains no long tasks.

`source-audit.json` maps the public import graph. No reachable application component owns a native rAF loop. Motion owns the recurring scheduler, Lenis uses autoRaf:false, and Quote's former independent demand loop now uses frame.render. Empirical callback ownership on Quote changes from two owners to one; Lenis's isolated one-shot callbacks elsewhere are not loops. Unused legacy R3F/scene files remain unmounted. Reduced motion and hidden-document cleanup cancel scheduled work.

All non-auto will-change writes are temporary. Delayed RiseIn hints are guarded against already-completed animations and cleared with their timers. Menu animationcancel also clears its hint. Dynamic ssr:false boundaries now wrap presentation runtimes while SSR content, form behavior and keyboard navigation remain available.

## Scope and preservation

Moved existing DOM effects to lazy null-rendering runtimes; consolidated Quote scheduling; disabled automatic route prefetch; lazily loaded below-fold process photos; made the static preview negotiate text compression. No spring, depth or easing values changed. No image bytes, copy, routes, form sources or headers changed. Runtime splitting is distinct from new effects.

`verify:content` passed with a fresh build. The independent `final-preservation/comparison.json` compares with c4e5357: only six approved visible captions and decorative Quote VKC were removed; accepted image descriptions/replacements are recorded in MOTION_AUDIT.md. Headings, links, controls, labels, details, metadata, semantic section counts, routes and protected form/business sources match original. All 66 referenced image hashes match the explicitly approved baseline.

The initial browser pass uncovered a reproducible Quote submit hit-testing failure at 768px and process tests waiting on offscreen lazy-image decode. Work was stopped when requested. Those results were not signed off as successful. The later explicitly authorized repair confirms the cause, adds regression coverage, and reports the final suite/deployment separately.
