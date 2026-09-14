# Same-photo repairs — local verification, 14 September 2026

The first homepage process image is present in the exported site, and all four process images have matching 3:2 frames. Higher-resolution originals of the exact live paperwork and loading photographs are now used. The six service-row pictures remain source-limited; this repair does not claim to restore missing detail.

## Demonstrated causes and changes

The live homepage and Git HEAD omit the image element entirely from step 01. All three other live process images loaded successfully. This is a markup omission, not demonstrated caching, a bad filename, or failed loading. Old `public/media/process/SOURCES.md` explicitly says weighing imagery was pending. The current local project already contains `assets/photographs/originals/details.png` (1536×1024), which this repair retains. That is an existing illustrative AI asset from prior local work, not a newly generated image or evidence of actual company premises. No earlier approved stock weighing photo was found in the two Git revisions or supplied archive.

The live scanner image is 1080×570, while the two neighboring stock photos are 3:2. Their automatic heights produced 258×136.16 versus 258×172 CSS pixels at 1440px. The four process cards now share 3:2 frames, cover fitting and identical spacing. The scanner is positioned left, cropping empty cardboard on the right; the visible hand, scanner and barcode remain. These rules are restricted to process cards. Aircraft and logos retain proportional fitting.

The pre-repair local site differed from deployment: earlier work had selected different illustrative photos. Live inspection identified the actual deployed images. The relevant homepage, process, domestic and international selections now use those exact photographs/artwork. No new selection, generation, animation or section redesign was performed during this repair.

The six service-row pictures on the live site are 392px-wide regions of a 1554×1012 supplied design composition, expanded to roughly 625 CSS pixels on desktop. There was no unintended blur filter or lingering placeholder demonstrated. Native lossless crops now preserve those exact source pixels without loading and scaling the whole composition. A raw-pixel comparison confirms all six crops are identical to their original regions. This removes the composite-image machinery but cannot make 392px detail Retina sharp. The international hero's intentional brightness/saturation contrast remains intact. Process frames have no resting transform.

## Actual sources

| Selected image | Available original | Export variants / limitation |
|---|---:|---|
| Existing weighing/measuring image | 1536×1024 | Existing responsive local derivatives retained |
| Courier/customer paperwork | 6000×4000 | Same Pexels photo; previously 1200×800; responsive WebP up to 2400×1600 |
| Workers loading parcels | 5000×3333 | Same Pexels photo; previously 1200×800; responsive WebP up to 2400×1600 |
| Barcode scanning | 1080×570 | Same original; effective 3:2 crop 855×570; foreground softness is in source |
| Domestic service hero | 1744×902 | Exact repository original, no enlargement |
| International service hero | 1802×873 | Exact repository original, no enlargement |
| Homepage road background | 1744×902 | Exact repository original; insufficient for full 2× detail at 1440px |
| Three domestic + three international service pictures | Each 392×248 or 392×254 | Lossless native crops; larger originals unavailable |

Original files remain intact. Newly prepared photographic WebP variants use quality 94 and never enlarge their source. Large downloaded masters stay outside `public/`. The two new downloads are visually the exact same live photos. See [source provenance](../../assets/photographs/selected-originals/SOURCES.md) for source pages and download URLs. The scanner's documented source only yielded the same 1080px medium asset; its original source-page fetch returned 403. Repository assets, both Git revisions and the supplied ZIP provided no larger versions of the six service pictures. Those six require larger originals of the same artwork to resolve their blur fully. Scanner cropping provides about 2.36 source pixels per CSS pixel at 390px, below full 3× density.

## Export verification

Tested the actual `out/` using the existing Pages-compatible static preview, which reads and applies `out/_headers`. Local screenshots are not evidence of deployment. Live screenshots and local-before screenshots are labeled separately.

| Viewport | Device density | Every process frame, CSS px |
|---:|---:|---:|
| 1440 | 2× | 258×172 |
| 768 | 2× | 327×218 |
| 390 | 3× | 362×241.33 |
| 360 | 3× | 332×221.33 |

All four images load and decode. Frames have a 5px radius and 24px spacing below; desktop tops match exactly, as do each tablet row's tops. All 12 detailed route/viewport combinations passed decoding and overflow checks; main text matched the local-before capture exactly. Screenshots were visually inspected at actual layouts, including the full domestic/international sections and mobile process cards. Process cards have no empty side strips or stretching; important contents remain visible. The service-row softness and scanner's source softness remain visible and are not reported as fixed.

Validation passed: build; lint; TypeScript; 65 unit tests; static-export check. Public browser suite: 71 passed, 1 skipped. Existing interaction suite: 62 passed, 2 skipped (touch-only projects skip mouse-hover cases). The public-suite skipped case is a desktop-specific About structure check in the mobile project. Tests cover public routes/assets, links, intercepted contact/quote responses, existing click/tap feedback, repeated taps, scrolling/swipes, reduced motion and failure fallbacks. No real enquiry was sent. The in-app browser bootstrap failed with `Cannot redefine property: process`; project Playwright Chromium provided the browser verification instead.

Evidence: [layout/source checks](verified.json), [exact frame checks](frame-check.json), [public tests](public-tests.log), [feedback tests](feedback-tests.log), and [live audit](live-audit.json).

## Screenshots

- [Live process before](live-process-1440.png) / [local export after, 1440](after-four-steps-1440.png)
- [After at 768](after-four-steps-768.png), [390](after-four-steps-390.png), [360](after-four-steps-360.png)
- [Retina desktop capture](after-process-retina-1440.png) / [Retina phone capture](after-process-retina-390.png)
- [Live domestic before](live-domestic-full.png) / [local domestic hero after](after-domestic-1440.png) / [local domestic process after](sections/after-domestic-1440.png)
- [Live international before](live-international-full.png) / [local international hero after](after-international-1440.png) / [local international process after](sections/after-international-1440.png)
- [Pre-repair local process](local-before-four-steps-1440.png) is a separate baseline and was not the deployed state.

## Files changed for this repair

- `app/(site)/page.tsx`: exact deployed homepage/domestic image selections; existing first process image retained.
- `components/process-photo.tsx`: exact stock-photo variants, scanner-specific class and appropriate alternative descriptions.
- `components/page-hero.tsx`, `components/service-process.tsx`: exact deployed hero and service-row selections.
- `app/globals.css`: scoped 3:2 process fill and scanner position; intentional international contrast.
- `scripts/prepare-selected-photographs.mjs`, `scripts/prepare-photographs.mjs`: reproducible same-photo variants and native lossless service crops.
- `lib/photographs.json`, `public/media/photos/selected-*`, `public/media/photos/process-*`: responsive manifest/assets.
- `assets/photographs/selected-originals/`: two exact original downloads and provenance.
- `tests/e2e/reference-designs.spec.ts`, `tests/e2e/visual.spec.ts`, `tests/e2e/image-feedback.spec.ts`: expectations for exact source selections and scoped process fitting.
- `artifacts/same-photo-repair/`: before/after screenshots, browser audits, measurements and this report.

The working tree also contains earlier project changes; these are not all changes from this repair. Forms, endpoints, company copy, logos, links and existing feedback implementation were not changed during this repair. No commit, push, staging deployment, DNS change or enquiry occurred.
