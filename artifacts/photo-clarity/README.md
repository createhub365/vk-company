# Photo clarity and equal sizing follow-up

Completed locally; no deployment or real form submission.

- Domestic/International and process photos now use lossless WebP variants generated from the existing standalone originals. Six native 1536×1024 variants were decoded and verified pixel-for-pixel against their PNG originals (`lossless-verification.json`). No enlargement or fabricated detail.
- Removed the International hero's brightness/saturation filter.
- Service hero images load eagerly. The four homepage process photographs load eagerly at normal fetch priority, independently of scrolling.
- Four process frames have a consistent 3:2 aspect ratio, equal column borders and aligned first grid rows. They show the complete sources.
- At 1440px all four images measure 258×172px; at 768px, 327×218px; at 390px, 362×241px; at 360px, 332×221px (integer browser measurements).
- All 12 route/width combinations loaded their images without overflow. Existing text matched the before capture exactly. Reviewed desktop, tablet and mobile screenshots; no image was missing locally.
- Build, typecheck, lint, static export validation, 65 unit tests and 36 relevant browser tests passed. Preview applied the existing Pages headers.

The screenshot supplied by the user depicts older live-site imagery. These updates only exist in the local source and `out/` export until a separately authorized deployment.

Files changed in this follow-up: `app/globals.css`, `components/photograph.tsx`, `components/process-photo.tsx`, `components/page-hero.tsx`, `scripts/prepare-photographs.mjs`, six families of WebP variants under `public/media/photos/`, `tests/e2e/public.spec.ts`, and `assets/photographs/PROMPTS.md`.

Lossless variants cost more bandwidth: full-size originals are approximately 1.4–1.8 MiB each. Responsive selection continues to serve smaller variants to smaller frames, and service-process photos remain lazy-loaded. Native source resolution is unchanged.

Screenshots: `after-four-steps-{1440,768,390,360}.png`, `after-domestic-{1440,768,390,360}.png`, `after-international-{1440,768,390,360}.png`. Corresponding `before-` captures record this turn's local baseline, not the older live website.
