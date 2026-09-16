# Generated service-row photograph replacement

The six source-limited Domestic/International photographs were replaced using the built-in raster image-generation tool. The subsequent instruction to add VK AND COMPANY branding supersedes the initial no-text/no-logo constraint. Branding edits used `public/brand/vk-and-company-logo-transparent.png` as a reference. The original logo file is unchanged.

These are generated illustrative photographs, not documentary images of actual company staff, premises, vehicles, aircraft or operations. Aircraft and ships remain neutral; branding appears on parcels, paperwork, the courier uniform and delivery trucks.

## Assets

All six existing public filenames and URLs remain unchanged, including the legacy `-392` suffix. That suffix no longer describes the physical pixel dimensions. No component, layout, alt text, caption, image attribute or page copy was edited for this task.

| Public file under `public/media/photos/` | Previous pixels | Replacement pixels | Exact ratio |
| --- | --- | --- | --- |
| selected-domestic-1-392.webp | 392×248 | 1568×992 | 49:31 |
| selected-domestic-2-392.webp | 392×254 | 1372×889 | 196:127 |
| selected-domestic-3-392.webp | 392×254 | 1372×889 | 196:127 |
| selected-international-1-392.webp | 392×248 | 1568×992 | 49:31 |
| selected-international-2-392.webp | 392×254 | 1372×889 | 196:127 |
| selected-international-3-392.webp | 392×254 | 1372×889 | 196:127 |

Generated native PNGs are retained unchanged in `originals/`. `manifest.json` records their actual generation paths, native dimensions, final dimensions, byte sizes and before/after SHA-256 hashes. `generation-prompts.json` and `branding-prompts.json` contain the prompt set. The old six files are retained in `before/`.

Final WebP files use quality 94, downsampling only and tiny edge normalization to exact integer aspect ratios. There is no enlargement, synthetic sharpening or photo stretching. Important subjects remain in frame. Natural photographic depth of field remains; distant background details are not intended to be uniformly sharp.

## Preservation

Only the six image-byte hashes in `artifacts/motion-audit/baseline.json` were approved, and its integrity pin in `scripts/verify-content.mjs` was refreshed. The baseline was not recaptured. The other 60 image hashes and every non-image contract field remain identical. Existing uncommitted Stage 7 work is preserved unchanged.

The single-candidate static image URLs and their existing HTML sizing descriptors remain unchanged by request. The browser receives the full higher-resolution bytes from those URLs. Physical file dimensions, rather than density-adjusted `naturalWidth`, are used for the Retina checks.

## Verification

- `npm run verify:content`: passed, including a fresh static production build, 11 page contracts, 66 image hashes and byte-identical Domestic/International prose. Only the six authorized new hashes were approved; no assertion was removed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 8 test files / 78 tests passed, including rejection of unapproved image-byte changes.
- `node artifacts/generated-service-photos/verify-scope.mjs`: passed. Exactly six public image files, the image-manifest entries and its integrity pin changed relative to the pre-task snapshot of 1043 files.
- Exported `out/` preview with deployed Cloudflare-compatible headers: 30 image/viewport/density checks passed. All six decode at the original URLs, match exact ratios, meet physical pixel requirements, and fill unchanged frames without overflow or browser errors. Desktop frames remain approximately 625.23×395.55 or 625.23×405.13 CSS pixels.
- Two repeated click/tap interactions per image at desktop 2× and mobile 390px: 24 interactions passed, with one feedback layer at a time, layer cleanup and stationary headings. Network interception blocks enquiries and all nonlocal requests.
- All six new photos were visually inspected in their actual 1× and 2× browser captures, alongside the old images. Parcel edges, faces, truck details and lettering are clearer than the previous enlarged 392px crops; no added side strips or distorted subjects were observed. Natural distance/depth-of-field softness remains intentional.

Browser checks used project Playwright/Chromium against `out/`, not just `next dev`. The sandbox blocked Chromium process bootstrap; the same local-only verification then ran successfully with the approved process permission. This is browser emulation, not a claim of physical-device testing.

## Review artifacts and limitations

- `*-1x-before.png` / `*-1x-after.png` and `*-2x-before.png` / `*-2x-after.png`: six paired comparisons at the actual 1440px layout, captured at native device density. Before captures temporarily fulfill the same image URL with the saved previous bytes; the DOM and layout are identical.
- `browser-results.json`: selected URL, CSS dimensions, physical pixels and density for all six photographs at 1440px (1× and 2×), 768px, 390px and 360px (2×).
- `scope-results.json`: exact task-specific file and contract changes.
- `changes.patch`: image replacement notices and the manifest/pin diff, separate from pre-existing Stage 7 changes.

Existing alt text was kept verbatim as requested. The International first-row alt still refers to a world map and the words “From India to the World”; these are absent from the new air-cargo photograph. No claim of exact documentary authenticity or pixel-identical logo reproduction through generative editing is made.

The legacy manual `prepare-selected-photographs` workflow still points at the old composite crops. It was not run or altered because runtime/source changes were out of scope; running it would replace these assets and fail the updated image-byte guard. Use the retained generated originals and `prepare-assets.mjs` to reproduce these replacements.

No recordings, enquiries, commits, pushes or deployments were made for this task. Physical-device testing and 3× desktop resolution are not claimed.
