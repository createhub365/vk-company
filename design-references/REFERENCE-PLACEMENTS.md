# Saved Contact and service designs

Implemented on `/contact`, `/services/domestic`, and `/services/international`.
The user selected the three-row Domestic design from the left half of the
combined reference, rather than the separate four-step Domestic design.

## Sources

These are user-supplied, approved local illustrations. No external photographs,
generated replacements, or remote image URLs were introduced. Original files
remain unmodified; no independent stock-photo licence is asserted.

| File | Dimensions | Placement / source rectangle (x, y, width, height) |
| --- | --- | --- |
| `app/(site)/contact/image.png` | 1536 × 1024 | Contact illustration: (0, 330, 760, 448) |
| `public/media/international/image.png` | 1554 × 1012 | Domestic quote laptop: (38, 144, 392, 248) |
| same | same | Domestic customer review: (38, 432, 392, 254) |
| same | same | Domestic truck: (38, 724, 392, 254) |
| same | same | International cargo aircraft: (814, 144, 392, 248) |
| same | same | International documents: (814, 432, 392, 254) |
| same | same | International transport: (814, 724, 392, 254) |

`ReferenceArtwork` displays only those artwork rectangles through proportional
CSS viewports around Next.js images. It never displays the complete page mockup.
Headings, paragraphs, form fields, contact links, decorative Contact taglines and
icon labels are HTML. Lettering within the supplied artwork remains part of the
original illustration. Artwork resolution is limited to the supplied screenshots.

The shared image-feedback implementation supplies ripple-only feedback, avoiding
extra subject cropping from a scale pulse. Header, footer, official logo and the
service heroes are preserved. The obsolete Contact orbit markup was removed.

Contact now has the reference's Subject select and omits the optional shipment
reference control. The existing validated FormSubmit field whitelist, fixed
recipient, Reply-To, timeout, attempt limit, honeypot, duplicate-click guard and
response interpretation remain in place. No delivery or activation was tested.

## Verification — 9 September 2026

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 110 tests passed across 6 files.
- `npm run build`: passed, including TypeScript and production page generation.
- Final focused browser run: 28 passed (34.8 seconds), across desktop Chromium
  and touch-enabled mobile Chromium at 1440, 390 and 360 pixels. All seven artwork
  placements loaded, matched the intended rows, retained their proportions, and
  produced ripple-only feedback with stationary text. Quote links navigated to
  `/get-a-quote`. Contact field validation, Reply-To payload, optional fields,
  provider failure and retained inputs were tested with intercepted requests.
- Screenshots of all three sections at all three widths were visually inspected,
  including active image feedback. No horizontal overflow was found.
- A broader 78-test run had 64 passes, 13 failures and 1 intentional skip. Twelve
  failures were ambiguous selectors in the new service tests; those were corrected
  and passed in the focused rerun above. The remaining, unrelated desktop visual
  failure was the unchanged homepage hero image's `complete` property staying
  false beyond the existing 5-second assertion timeout for its 3840px optimized
  image request. The hero code and assertion were not changed. The full suite
  should therefore not be described as fully green.
- In-app browser connection failed; rendered verification used standalone
  Playwright against the existing local development server. No live form
  submissions, emails, activation requests, calls, deployment or push occurred.

Screenshot paths (each also has a `-mobile.png` touch-browser counterpart):

```
test-results/contact-approved-{1440,390,360}-desktop.png
test-results/domestic-approved-{1440,390,360}-desktop.png
test-results/international-approved-{1440,390,360}-desktop.png
```

The tall service-section captures hide the fixed header only for the screenshot,
so it does not overlay the middle of the stitched section. Application header
styles and behaviour are unchanged.

## Files changed in this task

```
app/(site)/contact/page.tsx
app/(site)/contact/contact.module.css
app/(site)/services/domestic/page.tsx
app/(site)/services/international/page.tsx
app/globals.css (obsolete Contact orbit rules only)
components/page-hero.tsx (obsolete Contact orbit branch only)
components/forms/support-form.tsx
components/reference-artwork.tsx (new)
components/reference-artwork.module.css (new)
components/service-process.tsx (new)
components/service-process.module.css (new)
tests/contact-formsubmit.test.ts
tests/e2e/contact-validation.spec.ts
tests/e2e/public.spec.ts (old Contact orbit test replaced by new design coverage)
tests/e2e/visual.spec.ts (old International structure test replaced by new design coverage)
tests/e2e/reference-designs.spec.ts (new)
design-references/REFERENCE-PLACEMENTS.md (new)
```

Other pre-existing working-tree changes are outside this task.
