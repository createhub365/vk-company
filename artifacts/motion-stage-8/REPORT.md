# Stage 8 — remaining pages

Status: implemented and verified locally; stopped for review before the intensity bump and Stage 9. Baseline: `dfb14db` (the staging commit immediately before this work). No commit, push or deployment performed for Stage 8.

Review: http://127.0.0.1:3000/services/domestic (development server). Static export with the project's deployed headers: http://127.0.0.1:3102/services/domestic.

## Implementation boundary

Only the existing `DepthSection`, `RiseIn` and `ParallaxMedia` primitives are imported. Existing section containers become depth wrappers; heading/prose containers use RiseIn; complete photographic frames use ParallaxMedia. No new component definitions, animation handlers, CSS, transform values, easing curves, timing overrides or dependencies were added. The application diff is 49 added / 38 removed lines across 11 files, predominantly substitutions on existing compact JSX lines.

- Domestic and International: shared PageHero, ServiceProcess and QuoteBand wrappers cover the hero, all three service rows and closing quote section.
- About: shared hero/quote section plus main composition, three journey text blocks and all photographs.
- Contact: main layout, introduction/headings and supporting photograph; the existing form effects remain unchanged.
- Quote: shared hero copy and the form-section layout/sidebar; QuoteMedia is deliberately not wrapped in ParallaxMedia, preserving its scroll-reveals-only exception and existing WebGL implementation. The form and enquiry notice have no new reveal ancestor.
- FAQ: shared hero/quote section and existing FAQ list. Native details and Stage 7 answer behavior remain unchanged.
- Track, Privacy, Terms and 404: section wrappers and existing text blocks. Legal launch notices stay outside animated reveals.
- Home, navigation and footer implementation remain unchanged in this stage.

`immediateIfInView` preserves immediately readable text already visible at first observation. Offscreen blocks use the existing primitive defaults. New span wrappers use only `display: block` where needed to preserve existing heading/paragraph margins and permit transforms. Existing `data-photo-motion="scroll"` markers prevent the old photo pointer-tilt handler from competing with the new scroll wrapper; highlight/tap behavior retains its existing implementation. No logo receives a photographic wrapper.

## Per-page diff line counts

Counts below are actual added/deleted lines in each route file. Shared component changes are listed separately rather than counted repeatedly as direct route edits.

| Route | Added | Deleted | Additional shared component changes affecting this route |
| --- | ---: | ---: | --- |
| `/services/domestic` | 0 | 0 | PageHero, ServiceProcess, QuoteBand: +10 / -7 |
| `/services/international` | 0 | 0 | PageHero, ServiceProcess, QuoteBand: +10 / -7 |
| `/about` | 17 | 16 | PageHero, QuoteBand: +4 / -2 |
| `/contact` | 9 | 8 | None |
| `/get-a-quote` | 2 | 1 | PageHero: +2 / -1 |
| `/faq` | 2 | 1 | PageHero, QuoteBand: +4 / -2 |
| `/track` | 3 | 2 | PageHero: +2 / -1 |
| `/privacy` | 2 | 1 | PageHero: +2 / -1 |
| `/terms` | 2 | 1 | PageHero: +2 / -1 |
| `/404.html` | 2 | 1 | None |
| `/` | 0 | 0 | None |

Shared files: `components/page-hero.tsx` +2/-1, `components/service-process.tsx` +6/-5, `components/quote-band.tsx` +2/-1. [Raw counts](diff-line-counts.tsv), [application patch](stage-8.patch), [scope checks](scope-results.json).

## Verified results

- `npm run verify:content`: PASS after a fresh production export. All 11 page outputs retain the approved copy, sections, headings, links, image attributes/bytes, controls, labels, form attributes, details, metadata, routes, protected business sources and deployed headers. No baseline update was needed.
- `npm run lint`: PASS. `npm run typecheck`: PASS. `npm test`: 79 tests across 8 files PASS.
- Exported-site Chromium checks: all ten remaining routes at 1440, 768, 390 and 360px, at 2× density. Forty reduced-motion/layout checks and forty normal-motion checks passed.
- Compared pre/post heading, paragraph, image, form-control and details rectangles under reduced motion: zero differences greater than 1 CSS pixel across all forty layouts. Images decode; no horizontal overflow or browser page errors. Before/after screenshots were visually inspected for Domestic, About and Contact, including desktop and mobile examples.
- Normal-motion checks traverse each page, collect actual RiseIn animation requests and sampled ParallaxMedia transforms, and verify no photo rotation, original desktop/mobile Z bounds, and cleared primitive will-change hints after rest. Initially visible headings remain at full opacity.
- Keyboard checks preserve FAQ Enter/Space behavior, form input values, Name-to-Phone tab order and visible keyboard focus rings. Quote retains native scrolling and its unchanged enquiry notice outside any reveal ancestor.
- Twenty JavaScript-disabled checks (ten routes at 1440 and 390px) passed: primitive content remains fully visible and untransformed, without overflow. All forty reduced-motion checks likewise show final opacity, no primitive transform and no retained will-change.
- Read-only requests were permitted locally; all mutation/external requests were intercepted. No enquiry submission was attempted or sent.
- Dev server confirmed the updated Domestic page with three DepthSection wrappers and four ParallaxMedia wrappers.

Visual checks caught two wrapper-placement regressions during implementation: an About decorative-span selector incorrectly matched a new span, and moving the service-image class outside ParallaxMedia interrupted inherited corner rounding. Both were corrected by changing wrapper placement only. Final geometry checks and screenshot inspection preserve the original appearance at rest.

The first browser run's submission counter mistakenly classified background HEAD requests as submissions. The filter was corrected to recognize GET/HEAD as read-only; the complete final run passed with zero submission attempts. The in-app browser could not bootstrap, so verification used the repository's Playwright Chromium installation.

## Evidence and remaining stages

- [Layout checker](check-layout.mjs), [before measurements](before/layout.json), [after measurements](after/layout.json), [layout differences](layout-differences.json).
- [Motion/accessibility checker](check-motion.mjs), [final results](motion-results.json), [run log](motion.log).
- [Content verification](verify-content.log), [lint](lint.log), [typecheck](typecheck.log), [unit tests](tests.log), [localhost confirmation](dev-review.json).
- [Domestic before](before/services-domestic-1440.png) / [after](after/services-domestic-1440.png); [About mobile before](before/about-390.png) / [after](after/about-390.png); [Contact before](before/contact-1440.png) / [after](after/contact-1440.png). Normal-motion resting screenshots are also in `after/` with a `-motion.png` suffix.

No recordings. This stage does not claim Lighthouse scores, 4× CPU scroll performance, or the Stage 9 site-wide scheduler/code-splitting audit. The requested intensity bump has not begun: hero tuning, depth tokens, primitive motion values, expo easing, spring damping, reduced motion, mobile halving, Quote pointer policy and native Quote scrolling remain unchanged. `MOTION_SYSTEM.md` will receive the requested final update in Stage 9.
