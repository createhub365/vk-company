# Exact deployed photograph sources — 14 September 2026

These are higher-resolution copies of the same photographs observed on vkandcompany.com, not new selections. Original downloaded files and the pre-existing repository files remain intact.

| Photo | Downloaded original | Prior local copy | Exact source |
|---|---|---|---|
| Courier/customer paperwork | `process-review.jpg`, 6000×4000 | `public/media/process/review.jpg`, 1200×800 | https://www.pexels.com/photo/a-woman-checking-the-delivery-receipt-on-clipboard-6969956/ |
| Workers loading parcels | `process-dispatch.jpg`, 5000×3333 | `public/media/process/dispatch.jpg`, 1200×800 | https://www.pexels.com/photo/men-loading-boxes-4487486/ |

Download URLs:
- https://images.pexels.com/photos/6969956/pexels-photo-6969956.jpeg?cs=srgb&dl=pexels-mikhail-nilov-6969956.jpg&fm=jpg
- https://images.pexels.com/photos/4487486/pexels-photo-4487486.jpeg

Pexels licence and existing attribution remain documented in `public/media/process/SOURCES.md`. These are illustrative stock photos, not company staff/premises.

Scanner: the exact existing `public/media/process/scan.jpg` (1080×570) is retained. The documented PikWizard image resolves to the same 1080px medium image. Direct source-page retrieval returned 403. No larger original was obtained. The original scanner foreground is soft; re-encoding cannot restore detail it never contained. A left-aligned 3:2 crop removes empty cardboard at the right while retaining the visible scanner, hand and barcode. This leaves 855×570 effective source pixels.

Missing first step: the live HTML and committed homepage render no image for step 01. The old stock-photo notes explicitly say weighing imagery was pending. The current project already contains the selected weighing/measuring original `assets/photographs/originals/details.png` (1536×1024), also used in Quote. That exact existing asset is retained for step 01; no image was generated for this repair. Its prior illustrative AI provenance remains in `assets/photographs/PROMPTS.md`.

Service heroes: exact originals `public/media/domestic-road.png` (1744×902) and `public/media/international-cargo-apron.png` (1802×873). The homepage's exact original is `public/media/domestic-courier-road.png` (1744×902). International's intentional contrast filter is preserved.

Six service-row images: the live site uses `public/media/international/image.png` (1554×1012), showing one 392×248 or 392×254 region per card. Repository files, both Git revisions and the supplied ZIP have no higher-resolution originals of those exact six illustrations. Prepared lossless native-size crops preserve the exact original pixels; they are not high-resolution restored photographs. No sharpening, enlargement or new artwork was applied. Desktop/Retina clarity remains limited by the 392px source regions.

Reproduce local variants with `node scripts/prepare-selected-photographs.mjs`. Output is responsive WebP quality 94, no enlargement, at 480/768/1024/1440/native-or-2400 widths. The large photographic masters stay outside public. Service crops are lossless and remain 392px wide.
