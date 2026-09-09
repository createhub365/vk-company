# Homepage hero image investigation — 2026-09-09

The failure in WEBSITE_AUDIT.md, finding 8, did not reproduce against the current application. No application code, image, stylesheet, dependency, configuration, or existing test was changed. This is a successful current verification, not a demonstrated fix or proof that the historical failure cannot recur.

## Historical finding and current evidence

The audit's 768 × 1024 screenshot showed the navy fallback with no truck image. It recorded an incomplete image and a 2048px optimizer request that returned no status or bytes before a 10-second timeout. This was a pending download, not evidence that a decoded image was hidden by an overlay. The historical server-side cause was not established and remains unknown.

The same current request, `/_next/image?url=%2Fmedia%2Fdomestic-courier-road.png&w=2048&q=75`, now returns HTTP 200, `Content-Type: image/webp`, and 45,686 bytes with the actual Chromium image Accept header. The first fresh-tablet browser request reported `X-Nextjs-Cache: MISS`; later requests reported HIT. A separate GET with the same Accept header completed in 0.004222 seconds. No candidate, loading assertion, or timeout was changed to obtain a pass.

At 768 × 1024, the image has `complete=true`, nonzero natural dimensions, and the expected 2048px `currentSrc`. Its rendered rectangle is 768 × 1024, matching the hero container. Computed display is block, visibility visible, opacity 1, and object-fit cover. The image, navy overlay, and foreground retain their existing stacking order (0, 1, 2). The background is visible in the inspected screenshots, with readable foreground text and reachable buttons.

Evidence:

- Historical screenshot: `test-results/website-audit/768-hero-unloaded.png` (preserved).
- Initial browser network and DOM recording: `test-results/hero-loading/before-network.json`.
- Exact response headers: `test-results/hero-loading/2048-response-headers.txt`.
- Final viewport, image-response, button, overflow, and layout-shift measurements: `test-results/hero-loading/verification.json`.

## Verification

Local production build and Chromium only; no live deployment was tested. The in-app browser could not connect, so standalone Playwright was used. The diagnostic browser blocked external requests and all non-GET requests. No enquiries, emails, activation requests, or calls were sent.

- Repeated the audit sequence 1440 × 900 → 1366 × 768 → 1024 × 900 → 768 × 1024, reloading at each viewport: image loaded throughout.
- Independent fresh browser contexts at 768 × 1024, 1440 × 900, 390 × 844, and 360 × 800: all passed. Mobile contexts used touch emulation and device pixel ratio 3; desktop/tablet used ratio 1.
- Resized an already loaded page 1440 → 768 → 390 → 360 → 1440 without navigation: all five checks passed.
- All images decoded within the existing five-second load-check bound. Background filled the container; no horizontal overflow or foreground clipping was observed. The existing full-background cover crop was preserved.
- Both hero links passed hit testing and navigated to `/get-a-quote` and `/track` from every fresh viewport. No forms were submitted.
- Observed layout-shift total was zero during the measured load/resize windows, including a 300ms settling observation after image decode; this is not a field-performance guarantee.
- No failed hero-resource response or uncaught browser exception was captured during final diagnostic verification.
- `npx playwright test --config=test-results/hero-loading.config.ts`: **2 passed**, running the existing desktop/mobile `visual.spec.ts` unchanged, including the previously failing 768px assertion. No assertions were weakened. Its existing load/decode checks already guard the reported failure; no speculative application fix or new failure-specific test was added.
- `npm test`: **111 passed**, six test files.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed, including 32 generated static pages.

No unrelated test failure occurred in these checks. The other historical audit findings were not investigated or fixed in this task.

## Inspected screenshots

| Viewport | Fresh load | Resized loaded page |
| --- | --- | --- |
| 768 × 1024 | `test-results/hero-loading/fresh-768.png` | `test-results/hero-loading/resized-768.png` |
| 1440 × 900 | `test-results/hero-loading/fresh-1440.png` | `test-results/hero-loading/resized-1440.png` |
| 390 × 844 | `test-results/hero-loading/fresh-390.png` | `test-results/hero-loading/resized-390.png` |
| 360 × 800 | `test-results/hero-loading/fresh-360.png` | `test-results/hero-loading/resized-360.png` |

## Files and scope

Added this report and local diagnostic files under `test-results/hero-loading/`, plus the temporary local test runner `test-results/hero-loading.config.ts`. Existing visual-test screenshot artifacts were refreshed. No application or existing test files changed; the truck photograph, transparent logo, international aircraft photograph, image feedback, forms, email integrations, and backend were preserved. No deployment or remote push was performed.
