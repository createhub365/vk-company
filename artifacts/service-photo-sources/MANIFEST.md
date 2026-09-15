# Six service-image sources

Inspection-only package. All seven image files are unchanged byte-for-byte copies of existing repository files. No generation, resizing, sharpening or re-encoding was performed.

## Provenance and limitation

The six service-row illustrations are native lossless WebP crops of the supplied design composition at `public/media/international/image.png`. The existing repair report and source notes document no larger originals of these exact six images in the repository, inspected Git revisions or supplied ZIP. No photographer, external source URL or individual original is documented for them. These are illustrative artwork, not verified company staff/premises. The parent is a public-facing design composition, not customer records. Its 1554px width does not make the individual 392px regions higher resolution.

Evidence read from the project (not bundled):

- `artifacts/same-photo-repair/REPORT.md`
- `assets/photographs/selected-originals/SOURCES.md`
- `scripts/prepare-selected-photographs.mjs` (exact crop coordinates and lossless extraction)
- `lib/photographs.json` and `components/service-process.tsx` (selected files and placements)
- `artifacts/same-photo-repair/verified.json` (display measurements)

## Shared parent

Packaged file: `parent-service-design-composite.png`

Original path: `public/media/international/image.png`

Actual dimensions: 1554×1012 pixels, PNG. Included once as the common parent of all six crops. Not itself displayed as a full composition in the current service rows.

SHA-256: `4e3a26ad7e2d7ff1aff4aa2ef4494ef0ca24493d89ece4fcd85d8e0b2987f20d`

## Images

Crop coordinates are zero-based **(left, top, width, height)** in native parent pixels, from the top-left corner. Decoded RGB pixels of each packaged crop were verified against that exact parent region; file hashes verify unchanged copies.

Displayed sizes below are the recorded CSS frame dimensions from the 14 September 2026 repair verification, not a new live-site measurement. Format: **viewport width: displayed width×height**, all in CSS pixels. Resting proportional fitting; source resolution stays 392px wide.

| Packaged file | Original path | Native dimensions | Page / placement | Parent crop | Recorded displayed sizes |
|---|---|---|---|---|---|
| selected-domestic-1-392.webp | public/media/photos/selected-domestic-1-392.webp | 392×248 | /services/domestic — row 1: Begin with the real shipment details. | (38, 144, 392, 248) | 1440: 625×396; 768: 378×239; 390: 358×226; 360: 328×208 |
| selected-domestic-2-392.webp | public/media/photos/selected-domestic-2-392.webp | 392×254 | /services/domestic — row 2: Review before commitment. | (38, 432, 392, 254) | 1440: 625×405; 768: 378×245; 390: 358×232; 360: 328×213 |
| selected-domestic-3-392.webp | public/media/photos/selected-domestic-3-392.webp | 392×254 | /services/domestic — row 3: We move it with care. | (38, 724, 392, 254) | 1440: 625×405; 768: 378×245; 390: 358×232; 360: 328×213 |
| selected-international-1-392.webp | public/media/photos/selected-international-1-392.webp | 392×248 | /services/international — row 1: Route and contents review. | (814, 144, 392, 248) | 1440: 625×396; 768: 378×239; 390: 358×226; 360: 328×208 |
| selected-international-2-392.webp | public/media/photos/selected-international-2-392.webp | 392×254 | /services/international — row 2: Documentation is shipment-specific. | (814, 432, 392, 254) | 1440: 625×405; 768: 378×245; 390: 358×232; 360: 328×213 |
| selected-international-3-392.webp | public/media/photos/selected-international-3-392.webp | 392×254 | /services/international — row 3: Clear quotation boundaries. | (814, 724, 392, 254) | 1440: 625×405; 768: 378×245; 390: 358×232; 360: 328×213 |

## Copy integrity

| Packaged crop | SHA-256 |
|---|---|
| selected-domestic-1-392.webp | `15bc57b35558304d2d44d335b5a2e8b3824b3d679606df27d834a5c21d014e3e` |
| selected-domestic-2-392.webp | `9cc08fd117615584f4896e5b38e38e69546415b38dda35aed902aac66f908caa` |
| selected-domestic-3-392.webp | `90bb4fc2a9a115b2caa0ff406bab5cc1ba4aa7077560bb36e212daf96fd2675c` |
| selected-international-1-392.webp | `6cc33a1ee45a9941d2f11edfc6c5a3d37b620c73f85dab1f6154185b7b9360b4` |
| selected-international-2-392.webp | `600438f1465b9ce490ce7499399a6a73d5ef76b54a23466c7c01790b4a883edc` |
| selected-international-3-392.webp | `6aefc38c1776a71025499dc6b2eba5ddc2adfa6808e17dcfbaba1f9503bf4c4f` |

Package allowlist: the six WebP files above, their one PNG parent, and this manifest only. No website code, environment files, credentials, customer information or unrelated project files are included.
