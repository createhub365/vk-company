# Public-only Cloudflare Pages preparation

Repository: `https://github.com/createhub365/vk-company.git`. Intended branch:
`staging`. Build root: repository root (`/`). No deployment, push, DNS or custom
domain change is part of this preparation.

Use the existing npm lockfile (`npm ci`). Pages build command: `npm run build`.
Output directory: `out`. Next.js uses `output: "export"` and
`images.unoptimized: true`; no runtime image optimizer, adapter or Functions.
Node 24.13.0 was used locally; `.node-version` pins this compatible version.
The installed Next.js requires Node >=20.9.0.

Public routes: `/`, `/about`, `/contact`, `/get-a-quote`, `/services/domestic`,
`/services/international`, `/track`, `/faq`, `/privacy`, `/terms`.
Also exported: `404.html`, Next's `_not-found.html`, `robots.txt`, `sitemap.xml`.
Pages serves clean URLs from the exported `.html` files and uses `404.html` for
missing routes. There is no catch-all SPA redirect or retired-endpoint redirect.

The only application environment setting is `NEXT_PUBLIC_SITE_URL`: public,
build-time, the approved HTTPS production origin for metadata and sitemap URLs.
**The production domain is missing and remains a launch blocker.** No production
address has been invented. Until set, sitemap URLs are omitted and robots.txt
disallows crawling. Set the verified origin in the future Pages build environment
and rebuild before launch. Do not copy localhost from older setup examples.
Do not supply SMTP, Supabase, database or storage credentials for this static site.
Existing environment files were not changed or copied into the archive.

Contact and Quote retain direct FormSubmit AJAX to the fixed company inbox
`vkandcompanymohali@gmail.com`. No local API, saved enquiry database or outbox
exists in the published site. The `/track` URL offers shipment update enquiries
through the official phone/email and Contact page; it does not perform lookup.
All other approved visuals and form behaviour are retained.

`public/_headers` is copied unchanged into `out/_headers` and preserves the four
existing runtime security policies: nosniff, strict-origin-when-cross-origin,
disabled camera/microphone/geolocation, and frame DENY. The original application
had no CSP. None was removed or relaxed; no new blanket script restriction was
introduced that would break Next hydration or FormSubmit.

Retired source and original-path restoration notes are in
`archive/server-features/RESTORE.md`; `manifest.json` records each archived file
and checksum. The directory is outside routes/public/output and excluded from
active compilation/lint. SQL migrations remain untouched and were not executed.
Existing backend dependencies remain in the lockfile for deliberate restoration;
they are not imported by active routes or included as working server endpoints.

Local checks (no live enquiry):

```sh
npm run lint
npm run typecheck
npm test
npm run build
node scripts/check-static-export.mjs
npx playwright test
```

`npm start` serves **out/** at `http://127.0.0.1:3102`, using a small local static
preview only. It supports clean HTML paths, a real 404, asset content types and
the exported header rules. It is not a production server or Cloudflare adapter.
Playwright now uses this preview, never next dev. Form tests intercept POSTs;
the exported-site tests cover direct visits, refreshes, images, navigation,
retired/private paths and headers. Screenshots are under `test-results/`.

Actual live FormSubmit acknowledgement, recipient activation and inbox delivery
remain unverified. Provider/browser CORS and spam screening on a real production
origin require a separately authorized live check. A mocked acknowledgement is
not delivery evidence. Cloudflare's actual edge behaviour is also unverified
until a separately approved preview/deployment.

Official references:
[Next.js static exports](https://nextjs.org/docs/app/guides/static-exports),
[Cloudflare Pages static Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/),
[Pages headers](https://developers.cloudflare.com/pages/configuration/headers/).

## Local verification results — 10 September 2026

- `npm run build`: passed with SMTP and Supabase variables unset; all active
  routes are static, and `out/` was generated. No `.env.local` exists in this checkout.
- `npm run lint` and `npm run typecheck`: passed.
- `npm test`: 65 tests passed across five active files. The decrease from the
  previous server build is the explicitly archived backend tests, not suppressed
  failures; see the restoration notes for the mixed-test distinction.
- `npx playwright test`: 97 passed, one existing deliberate duplicate mobile
  About test skipped. Run against the exported files with SMTP/Supabase unset.
  Desktop 1440px and mobile 390px cover all public routes; existing visual/design
  regressions additionally exercise 360px and intermediate widths.
- Both FormSubmit request destinations, payloads and failure handling verified
  by interception; no real provider submission occurred.
- `node scripts/check-static-export.mjs`: passed, including source/retired-route
  exclusions, known private-key/config markers, exact header copy and asset sizes.
  All 69 archived source checksums matched. This is not a complete security audit.
- Rendered screenshots reviewed for the static hero, mobile Contact and desktop/
  mobile shipment enquiry. Route screenshots:
  `test-results/static-export-exported-URL-99157-only-to-public-destinations-desktop/`
  and the corresponding `-mobile/` directory. Hero:
  `test-results/delivery-static-desktop.png`.

Active files changed in this part: `next.config.ts`, `tsconfig.json`,
`eslint.config.mjs`, `.gitignore`, `.node-version`, `package.json`,
`lib/config.ts`, `lib/business-settings.ts`, `app/layout.tsx`, `app/sitemap.ts`,
`app/robots.ts`, `app/(site)/track/page.tsx`, `public/_headers`, the two
`scripts/*static*.mjs` files, all three `playwright*.config.ts` files,
`tests/core.test.ts`, `tests/e2e/public.spec.ts`, `tests/e2e/visual.spec.ts`,
`tests/e2e/image-feedback.spec.ts`, `tests/e2e/static-export.spec.ts`,
`README.md`, `QUOTE_FORMSUBMIT.md`, and this document.
The exact archived path list is `archive/server-features/manifest.json`.
Unrelated working-tree edits were retained, not reset or committed.
