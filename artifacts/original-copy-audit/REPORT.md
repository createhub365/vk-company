# Copy audit against the original pre-Stage-1 git commit

Audit date: 16 September 2026. Read-only audit of the current working tree, including its existing uncommitted changes.

## Baseline and method

The baseline is **`c4e53578c53d1497fe67044d453b0ad8ab80a89b`**, dated 10 September 2026: “Prepare public website for Cloudflare Pages static deployment.” It is the immediate parent of `d152357f04a07d04bf75c74ef163a90acb2dc2f9`, the first commit containing `MOTION_AUDIT.md` and the motion foundation/hero work. The repository's initial commit, `e7cfc6b`, predates that static-deployment preparation; it is not the last pre-Stage-1 commit.

Neither `MOTION_AUDIT.md` nor `artifacts/motion-audit/baseline.json` supplied the comparison baseline.

Built the original git source in a separate temporary directory inside this artifact folder, and independently rebuilt the current working tree. Both builds succeeded. Compared the resulting HTML for all 11 public routes, including 404. Retained both exports, extracted text, structured inventories, build logs, and the comparison script here. Removed the temporary original source checkout after building it.

Compared body wording and order with formatting whitespace normalized, plus headings, image alternative text, accessibility labels, placeholders, controls, links, metadata, and structured data. Compared complete source bytes for the form/business-message modules to cover messages not present in the initial HTML. This is a website-copy audit, not an OCR comparison of lettering baked into raster image pixels; image lettering is outside these results. It compares local current source/export to git, not the deployed website.

## Visible page copy added since the original commit

**None.** No added body prose, headings, navigation labels, button labels, form labels, FAQ wording, or legal wording was found in the exported pages.

## Visible page copy present originally but missing now

| Route | Exact removed text | Occurrences |
| --- | --- | --- |
| `/` | Illustrative route imagery | 1 |
| `/` | Illustrative international logistics | 1 |
| `/` | Illustrative operations environment | 1 |
| `/about` | Illustrative courier environment | 1 |
| `/services/domestic` | Illustrative courier environment | 1 |
| `/services/international` | Illustrative courier environment | 1 |
| `/get-a-quote` | VKC | 1 |

The six captions are the text removed in the preceding caption fix. `VKC` was the decorative, `aria-hidden` Quote hero placeholder replaced by the photograph. Remaining occurrences of `VKC` elsewhere were not removed.

**Important correction to the caption history:** `Illustrative courier environment` already appears in `c4e5357:components/page-hero.tsx`. The three homepage captions also exist in that commit's exported HTML. These captions were therefore not introduced during the motion stages. Their presence in the later baseline alone does not demonstrate drift from this original commit.

## Image alternative text: six replacements and two additions

These are accessibility copy changes even though they are not normally visible over a successfully loaded photograph. Each replacement means the old description is missing at that placement and the new description is present.

| Page / placement | Original description | Current description |
| --- | --- | --- |
| Home hero | Teal and navy courier truck travelling on an intercity road | Illustrative navy and teal courier truck at an Indian delivery forecourt |
| Home Domestic editorial image | Illustrative unbranded delivery truck travelling on a modern intercity road | Illustrative delivery truck travelling on an intercity road |
| Home first process image | No image description at this placement | Illustrative parcel being weighed and measured |
| About main image | Illustrative logistics network with an aircraft, cargo ship, delivery truck and parcels | Illustrative courier team loading parcels for dispatch |
| About shipment-details image | Illustrative parcel label being prepared for shipment | Illustrative parcel being weighed and measured |
| About reviewed-quote image | Illustrative courier vehicle travelling on a city route | Illustrative courier and customer reviewing shipment details |
| Contact image | Illustration of a VK AND COMPANY courier handing a parcel to a customer, with a globe, aircraft, ship and delivery truck | Illustrative Indian courier customer support representative |
| Quote hero image | No image description at this placement | Illustrative Indian courier measuring a parcel on a weighing scale beside shipping paperwork; not actual company staff or premises |

These changed descriptions were already recorded in `d152357`, the commit that also introduced the motion audit. Git cannot establish the order of individual uncommitted edits bundled into that commit. A check against that later baseline can pass while these differences from the original commit remain. The six Domestic/International service-row image descriptions themselves match the original commit.

## Unchanged copy and functionality inputs

- All routes: headings, link text and hrefs, control labels/names/types, `aria-label` strings, placeholders, page titles, metadata, and structured data match.
- Entire normalized visible body copy matches on `/contact`, `/faq`, `/track`, `/privacy`, `/terms`, and `/404.html`.
- On the other five routes, the only body-wording differences are the seven removals listed above.
- These six modules are byte-identical to their original git versions: `components/forms/enquiry-form.tsx`, `components/forms/support-form.tsx`, `lib/schemas.ts`, `lib/quote-formsubmit.ts`, `lib/business-settings.ts`, and `lib/config.ts`. Their validation, pending/success/error wording, contact information, and submission configuration have not changed.
- No meaningful added CSS-generated text was found; added pseudo-element `content` declarations are empty or `none`.

## Evidence

- [Exact visible-copy differences with context](visible-copy-delta.json)
- [Readable visible-copy patch](visible-copy.patch)
- [Per-route comparison and message-module hashes](comparison.json)
- [Complete original/current copy inventory](copy-inventory.json)
- [Independent comparison script](compare.mjs)
- [Original git source snapshot](original-sources.json)
- [Commit identities](commits.json)
- [Original build log](original-build.log) / [current build log](current-build.log)
- [Audit integrity check](integrity.json)

No website source, image, preservation baseline, or existing artifact was changed by this audit. No commit, push, deployment, recording, or enquiry submission was performed.
