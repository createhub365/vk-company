# Task A — Service photograph diagnosis

Diagnosed before changing website code, 16 September 2026. Measurements use the existing exported site with its deployed-header-compatible local preview, at 1440/768 CSS pixels and 2× density, and 390/360 CSS pixels and 3× density. No photograph, source selection or website implementation was changed.

## Per-image cause

| File | Actual source pixels | Rendered at 1440px (CSS px) | Cause | Higher-resolution same-photo target |
|---|---|---|---|---|
| public/media/photos/selected-domestic-1440.webp | 1440×745; original 1744×902 | 618.20×319.83 | No demonstrated (a), (b) or (c) at tested densities | No replacement required for tested sizes |
| public/media/photos/selected-domestic-1-392.webp | 392×248 | 625.23×395.55 | (a): 392px source enlarged to ~625 CSS px | At least 1251×792 for 2×; 1876×1187 for 3×, preserving original aspect ratio |
| public/media/photos/selected-domestic-2-392.webp | 392×254 | 625.23×405.13 | (a): 392px source enlarged to ~625 CSS px | At least 1251×811 for 2×; 1876×1216 for 3×, preserving original aspect ratio |
| public/media/photos/selected-domestic-3-392.webp | 392×254 | 625.23×405.13 | (a): 392px source enlarged to ~625 CSS px | At least 1251×811 for 2×; 1876×1216 for 3×, preserving original aspect ratio |
| public/media/photos/selected-international-1440.webp | 1440×698; original 1802×873 | 616.20×298.67 | No demonstrated (a), (b) or (c) at tested densities | No replacement required for tested sizes |
| public/media/photos/selected-international-1-392.webp | 392×248 | 625.23×395.55 | (a): 392px source enlarged to ~625 CSS px | At least 1251×792 for 2×; 1876×1187 for 3×, preserving original aspect ratio |
| public/media/photos/selected-international-2-392.webp | 392×254 | 625.23×405.13 | (a): 392px source enlarged to ~625 CSS px | At least 1251×811 for 2×; 1876×1216 for 3×, preserving original aspect ratio |
| public/media/photos/selected-international-3-392.webp | 392×254 | 625.23×405.13 | (a): 392px source enlarged to ~625 CSS px | At least 1251×811 for 2×; 1876×1216 for 3×, preserving original aspect ratio |

## Why (b) and (c) do not apply here

These two routes do not use ParallaxMedia. Every inspected photograph and its ancestors had no resting transform in the controls. Normal screenshots were compared with all image/ancestor transforms temporarily forced off in the browser, retaining the intentional contrast filters. All 16 desktop/mobile image comparisons were pixel-identical. This control changed only temporary browser styles and restored them afterwards. No rasterization workaround is justified by that evidence.

Photograph renders native static img/srcset, not Next Image optimization. Hero variants are prepared at quality 94 without enlargement; the six service-row variants are lossless native crops. The browser selects suitable hero resolutions at tested densities (see measurements.json). The six rows only have their existing 392px source; changing sizes or quality cannot recover missing detail. The 1744×902 Domestic and 1802×873 International hero originals cover the tested display/density combinations. Higher-density or wider future placements may need larger originals; this is not a claim of unlimited resolution.

## Source limitation and outcome

The six selected-domestic-1/2/3 and selected-international-1/2/3 files originate from public/media/international/image.png (1554×1012). Their individual regions are only 392×248 or 392×254. Existing provenance in artifacts/same-photo-repair/REPORT.md and assets/photographs/selected-originals/SOURCES.md records no larger same-image originals. The prepared inspection ZIP remains artifacts/service-photo-sources.zip, with the original parent and exact crop coordinates. These six need genuinely larger originals of the same images; none was invented or generated.

**Task A outcome: no code fix is appropriate. All six soft service-row images are source-limited. No upscaling, sharpening, cropping, replacement or recompositing was performed.** Task A is complete as a diagnosis; its six visual limitations remain until suitable originals are supplied.

Evidence: measurements.json records 32 image/viewport observations, exact selected files, physical file dimensions, CSS sizes, ancestor styles and the 16 transform controls. Paired *-normal.png and *-transforms-off.png files are still images, not recordings. Browser inspection used project Playwright after the in-app connection failed to bootstrap.
