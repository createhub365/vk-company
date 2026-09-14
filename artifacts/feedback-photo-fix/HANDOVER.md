# VK AND COMPANY — local feedback and photograph fixes

Implemented locally on 14 September 2026. No commit, push, deployment or Cloudflare setting changes. Existing untracked files were preserved.

## Demonstrated cause

The live site and the initial production `out/` build both executed the existing 450ms image animations. This was not a missing client initialization or blocked JavaScript problem. The live feedback bundle (`app/layout-ef9030f88a42f615.js`) returned HTTP 200 and contained the same marked-surface restriction and foreground exclusions as the local implementation. No page exceptions were observed; reduced motion was false. Production headers contain no CSP. `_headers` is exported unchanged and applied by the local preview.

Two causes were reproduced:

- The delegated handler required `[data-image-feedback]` and explicitly rejected foreground text and most interactive/background areas. A heading click produced no feedback; photo and exposed hero clicks produced effects.
- Its ripple expanded to the farthest corner of the entire surface while fading from opacity .30 to .18 at 40% progress, then zero. Multiplication by the already translucent gradient made it easy to miss. The baseline screenshots look nearly unchanged even while two image animations are running.

`baseline.json` records those interactions and keyframes. `live-check.json` confirms the deployed bundle, headers, motion preference and absence of page exceptions. Live HEAD-prefetch requests failed in the browser even when permitted; no feedback JavaScript request failed. Analytics POST was deliberately blocked. The first baseline run also blocked HEAD requests, so its resource-error list must not be interpreted as script failures.

The in-app browser could not initialize (`Cannot redefine property: process`). Verification used the repository's installed Playwright Chromium instead. The public live site was inspected; all implementation verification used the actual static export, not `next dev`.

## Changes

`components/image-feedback.tsx` remains the sole delegated feedback system. Deliberate clicks/taps on images or ordinary page areas create one localized teal ripple at the interaction point. Links, buttons, summaries and clickable controls receive a stationary highlight. Logos retain their artwork and native links. Inputs/textareas/selects use focus outlines without overlays over text or the caret. Content photographs pulse inward by 1.5%; hero and aircraft images remain stationary. Reduced motion uses opacity-only, stationary feedback. Duration is 450ms, with bounded cleanup after at most 550ms. Listeners are passive; no pointer capture, preventDefault, form interception, navigation delay, or new keyboard stops were added. Scroll, drag, long press, selection, cancellation and multiple pointers reject feedback.

`components/photograph.tsx`, `lib/photographs.json` and `scripts/prepare-photographs.mjs` provide local responsive WebP assets. No runtime optimizer or external image hotlinks. Existing text, layout grids, contacts, official transparent logo and FormSubmit code remain intact. Service and About image frame ratios are preserved; contain fitting prevents additional subject crops. The hero uses contain fitting at tablet/mobile widths so the whole truck stays in frame, while retaining existing copy positioning and contrast overlay.

Changed page/component files: `app/(site)/page.tsx`, `app/(site)/about/page.tsx`, `app/(site)/contact/page.tsx`, `app/globals.css`, `components/image-feedback.tsx`, `components/page-hero.tsx`, `components/process-photo.tsx`, `components/service-process.tsx`; new responsive component, manifest, conversion script and assets listed above. Browser tests updated in `tests/e2e/image-feedback.spec.ts`, `reference-designs.spec.ts`, `public.spec.ts`, `visual.spec.ts` to verify the new behavior and responsive sources.

## Originals and usage

All eight generated originals are **1536×1024 native PNGs**, stored in `assets/photographs/originals/`. They are illustrative AI-generated scenes, not actual company staff, customers or premises. Exact prompts and generation method: [PROMPTS.md](../../assets/photographs/PROMPTS.md).

| Original | Used in |
|---|---|
| hero.png | Homepage static hero |
| details.png | Homepage shipment-details step; domestic first step; international quote assessment; About customer journey |
| review.png | Homepage reviewed quote; domestic review; international documentation; About service confirmation |
| dispatch.png | Homepage dispatch; domestic dispatch; About main operations visual |
| scan.png | Homepage verified-updates step |
| domestic.png | Homepage domestic feature; domestic service hero |
| support.png | About support thumbnail; Contact photograph |
| aircraft.png | International service hero and route review |

Preserved sharp originals: `public/media/dispatch-workspace.png` (1717×916), used on Home/About; `public/media/homepage-international-cargo.jpg` (2400×1600), used for the homepage international feature. Both also have compressed responsive variants. The official logo is unchanged. Old source files and user-provided mockups were retained, but replaced placements no longer render crops from them.

WebP quality 90; generated widths 480, 768, 1024, 1440 and 1536. Preserved originals additionally use their native maximum widths. No enlargement. Generated PNG masters total approximately 18 MB outside public output; all 50 responsive variants total approximately 5.9 MB, with the browser selecting one per placement.

## Verification

- `npm test`: **65 passed** across 5 files.
- `npm run test:e2e`: **97 passed, 1 skipped**. The skip is the existing duplicate mobile About check; explicit responsive sizes run in the desktop project.
- `npm run lint`: passed, no errors or warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed; static routes exported to `out/`.
- `node scripts/check-static-export.mjs`: passed; 11 required HTML documents, matching Pages headers, no retired routes/server references, assets under 25 MiB each.
- `git diff --check`: passed.
- Independent audit: **40 route/viewport combinations, 168 image placements including logos, zero horizontal overflows, zero page exceptions**. Widths: 1440 and 768 at DPR 2; 390 and 360 at DPR 3.

Routes checked: `/`, `/services/domestic`, `/services/international`, `/about`, `/contact`, `/get-a-quote`, `/faq`, `/privacy`, `/terms`, `/track`; missing/retired URLs also checked as real 404s.

Tests exercise active feedback and cleanup, repeated taps, inward photo scale, stationary hero/aircraft/logo, native Enter/Space behavior, logo navigation, field focus/caret/value preservation, reduced motion, drag/selection rejection, actual mobile swiping and pinch gestures, and mobile menu operation. Existing quote/contact tests intercept the FormSubmit endpoint. No live enquiries were sent.

[Full photograph audit](PHOTO-AUDIT.md) records before source paths/pixels/display sizes/styles and after selected files/actual pixels/display sizes at every tested width. [Raw measurements](photo-audit-after.json) retain filter, opacity, scale and placeholder fields. No unintended blur or loading-placeholder styles were found. The international hero's existing brightness/saturation treatment remains for contrast.

## Visual evidence and limits

[Open screenshot gallery and recording](index.html). [Interaction recording](interaction.webm). [Visible photo ripple](after-active-domesticserviceseditorialimage.png). [Field focus](field-focus.png). [About support at actual display size](about-support-viewport.png).

Before screenshots: `before-home.png`, `before-about.png`, `before-domestic.png`, `before-contact.png` and `before-*-interaction.png`; deployed baseline: `live-*.png`. After full-page screenshots: `after-{home,about,domestic,international,contact}-{1440,768,390,360}.png`. High-density hero captures are `after-hero-*-density.png`. Full-page gallery captures use eager painting and, for non-home pages, an extended capture viewport height after the normal production lazy-loading/source audit, avoiding Chromium's omitted offscreen-image paint in stitched screenshots. Viewport widths are unchanged; audit and interaction screenshots use normal viewport heights. The viewport About-support capture verifies normal lazy rendering directly.

The generated foregrounds, parcel edges, scale, paperwork, scanner and aircraft were visually inspected, along with compressed variants and actual page placements. Complete aircraft and vehicle framing is preserved. Small incidental background text/label details are synthetic; do not treat them as operational facts.

**Resolution limitation:** the image tool exposed no explicit resolution control and returned 1536×1024 despite requesting higher native resolution. These are not 4K or full 2× desktop-hero originals. Most content placements are adequately supplied at tested densities, but the 1440px-wide hero remains below a true 2880px-wide DPR-2 source. The existing workspace's portrait crop also has limited pixel headroom at high density. No upscaling was used to conceal this limit. Hardware Safari/iOS and a post-deployment check remain outside this local Chromium verification.

Preview: run `npm start` and open `http://127.0.0.1:3102`. This server serves `out/` with its exported headers and extensionless Pages-style HTML lookup. It is a local static preview, not a Cloudflare deployment.
