# Process photograph update — partial, awaiting the first photograph

Date: 2026-09-09

## Completed and remaining scope

Five of the seven requested placements are implemented:

- Homepage: review, dispatch and verified-updates steps have photographs. All four existing titles, numbers, icons and descriptions remain. Four columns at 1440px, two at 768px and one at 390/360px.
- Domestic Services: the review and verified-milestones rows each have their own image on the left at desktop sizes and directly above their text on mobile. The section label, wording, tracking link, coverage notice and QuoteBand remain.
- **Not complete:** the weighing/measuring photograph for homepage step 01 and the first Domestic process row. No suitable approved local photograph was available. Downloadable licensed candidates did not meet the subject/framing requirements; a suitable public-domain download returned HTTP 403. The user has been asked whether to wait for an approved real photograph or permit a licensed photographic AI stock image. No answer has been assumed and no substitute has been inserted. Desktop therefore still has unused space at the first step/row.

## Changed files

- `app/(site)/page.tsx` — photo import and three process-step placements only.
- `app/(site)/services/domestic/page.tsx` — local process-row layout and two corresponding photo placements.
- `app/globals.css` — process-card alignment, reusable photo sizing, and scoped Domestic process rows.
- `components/process-photo.tsx` — server-rendered Next Image helper with meaningful alt text and intrinsic dimensions; uses existing ripple-only feedback.
- `public/media/process/review.jpg`
- `public/media/process/dispatch.jpg`
- `public/media/process/scan.jpg`
- `public/media/process/SOURCES.md` — actual source/download URLs and licence provenance.
- `PROCESS_PHOTO_UPDATE.md` — this report.
- Diagnostic screenshots and `results.json` under `test-results/process-photos/`.

No form, provider, backend, hero, logo, aircraft, header, footer, or shared feedback implementation was edited. No new dependencies, live submissions, calls, deployment or remote push.

## Actual assets

- Mikhail Nilov / Pexels: courier and customer reviewing delivery paperwork, photo 6969956, 1200 × 800.
- Tiger Lily / Pexels: workers loading parcels into a van, photo 4487486, 1200 × 800.
- Awesome Content / PikWizard: handheld scanner reading a parcel barcode, photo 74664a6f219ba1cae4b54d575222fb23, 1080 × 570.

These are stock illustrations of the process, not company/team photos or claimed Indian locations. The scanner image is an original close-up; parts of the handle and parcel extend outside the source frame. No additional crop, distortion, filter or movement is applied by the website. Review and scan assets are reused between the two pages. Full source and licence links are in `public/media/process/SOURCES.md`.

## Checks and actual results

- `npm test`: **111 passed**, 6 test files.
- `npm run lint`: **passed, zero warnings** after making the helper's alt prop explicit.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed** after the final code edit.
- Existing Playwright image-feedback coverage for `/` and `/services/domestic`, plus the International aircraft regression: **9 passed** across 1440, 390 and 360px. Existing tests were not weakened.
- Local production-browser diagnostic: **8 route/viewport combinations passed** (both pages at 1440, 768, 390 and 360px). Checked all five implemented photo placements for actual image decoding, proportional dimensions, non-empty alt text, active ripple, no image scale, stable frame/text positions, cleanup and no horizontal overflow. Checked four/two/one-column homepage layout, Domestic image/text order and actual tracking-link navigation.
- No browser page exceptions recorded in these diagnostic checks.
- Early diagnostic attempts detected scrolling in viewport coordinates, not image layout movement. The diagnostic was corrected to settle instant scrolling before measuring. The final run passed strict position equality checks.
- Browser verification used actual locally served pages/assets; external requests and every non-GET request were blocked. No email delivery was tested.

## Screenshot paths

For each width `1440`, `768`, `390`, `360`, in `test-results/process-photos/`:

- `home-WIDTH.png` and `domestic-WIDTH.png`: whole-section captures.
- `home-WIDTH-page.png` and `domestic-WIDTH-page.png`: full-page context.
- `home-WIDTH-active.png` and `domestic-WIDTH-active.png`: viewport capture during the review-photo ripple (paused at 200ms of the existing 450ms effect).
- `results.json`: route/viewport diagnostic results, explicitly recording the pending weighing photo.

The existing fixed header can appear over part of a stitched whole-section screenshot at its current scroll position. Use the viewport active captures and full-page context when assessing framing. Header styling was not changed.

## Next action

Supply an approved real weighing/measuring photograph, or answer the pending question about a licensed photographic AI stock image. Reuse that one image for both first steps and repeat the section checks. This task is not being reported as fully completed while those two placements are missing.
