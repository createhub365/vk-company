# Photograph audit

Baseline: production export before changes, 1440×900 at DPR 1. After: 1440 and 768 at DPR 2; 390 and 360 at DPR 3. Dimensions below are CSS pixels. `naturalWidth` in the raw browser audit can be density-corrected by srcset; actual selected file dimensions are read separately with Sharp.

## Before

| Route | Source | Actual source pixels | Displayed image box | Styling |
|---|---|---|---|---|
| / | /media/domestic-courier-road.png | 1744×902 | 1440×900 | cover; filter none; opacity 1; transform none |
| / | /media/domestic-road.png | 1744×902 | 637×520 | cover; filter none; opacity 1; transform none |
| / | /media/homepage-international-cargo.jpg | 2400×1600 | 442×295 | contain; filter none; opacity 1; transform none |
| / | /media/process/review.jpg | 1200×800 | 258×172 | fill; filter none; opacity 1; transform none |
| / | /media/process/dispatch.jpg | 1200×800 | 258×172 | fill; filter none; opacity 1; transform none |
| / | /media/process/scan.jpg | 1080×570 | 258×136 | fill; filter none; opacity 1; transform none |
| / | /media/dispatch-workspace.png | 1717×916 | 637×520 | cover; filter none; opacity 1; transform none |
| /services/domestic | /media/domestic-road.png | 1744×902 | 618×360 | cover; filter none; opacity 1; transform none |
| /services/domestic | /_next/static/media/image.c01682b0.png | 1554×1012 | 2479×1614 | fill; filter none; opacity 1; transform none |
| /services/domestic | /_next/static/media/image.c01682b0.png | 1554×1012 | 2479×1614 | fill; filter none; opacity 1; transform none |
| /services/domestic | /_next/static/media/image.c01682b0.png | 1554×1012 | 2479×1614 | fill; filter none; opacity 1; transform none |
| /services/international | /media/international-cargo-apron.png | 1802×873 | 616×358 | cover; filter brightness(0.82) saturate(0.85); opacity 1; transform none |
| /services/international | /_next/static/media/image.c01682b0.png | 1554×1012 | 2479×1614 | fill; filter none; opacity 1; transform none |
| /services/international | /_next/static/media/image.c01682b0.png | 1554×1012 | 2479×1614 | fill; filter none; opacity 1; transform none |
| /services/international | /_next/static/media/image.c01682b0.png | 1554×1012 | 2479×1614 | fill; filter none; opacity 1; transform none |
| /about | /media/dispatch-workspace.png | 1717×916 | 618×360 | cover; filter none; opacity 1; transform none |
| /about | /images/about/logistics-network.webp | 642×595 | 443×410 | fill; filter none; opacity 1; transform none |
| /about | /images/about/customer-journey.webp | 277×215 | 277×215 | fill; filter none; opacity 1; transform none |
| /about | /images/about/service-confirmation.webp | 277×216 | 277×216 | fill; filter none; opacity 1; transform none |
| /about | /images/about/customer-support.webp | 277×218 | 277×218 | fill; filter none; opacity 1; transform none |
| /contact | /_next/static/media/image.1885cb4c.png | 1536×1024 | 1371×914 | fill; filter none; opacity 1; transform none |

Service mockup source `/media/international/image.png`: 1554×1012 file, but each visible region was only 392×248 or 392×254 pixels, expanded into roughly 625px-wide desktop frames. The large rendered `<img>` box in this table reflects the CSS crop technique, not usable detail. Contact similarly cropped a 760×448 region from its 1536px-wide imported mockup. About thumbnails were only 277px wide. No photo had CSS blur or a lingering loading-placeholder style. The international hero retains its useful brightness(.82)/saturate(.85) treatment.

## After

| Viewport / DPR | Route | Selected file | Actual selected pixels | Displayed box | Fit / filter |
|---|---|---|---|---|---|
| 1440 / 2 | / | /media/photos/hero-1536.webp | 1536×1024 | 1440×900 | cover; none |
| 1440 / 2 | / | /media/photos/domestic-1536.webp | 1536×1024 | 637×520 | contain; none |
| 1440 / 2 | / | /media/photos/existing-aircraft-1440.webp | 1440×960 | 442×295 | contain; none |
| 1440 / 2 | / | /media/photos/details-768.webp | 768×512 | 259×173 | fill; none |
| 1440 / 2 | / | /media/photos/review-768.webp | 768×512 | 258×172 | fill; none |
| 1440 / 2 | / | /media/photos/dispatch-768.webp | 768×512 | 258×172 | fill; none |
| 1440 / 2 | / | /media/photos/scan-768.webp | 768×512 | 258×172 | fill; none |
| 1440 / 2 | / | /media/photos/workspace-1717.webp | 1717×916 | 637×520 | cover; none |
| 1440 / 2 | /services/domestic | /media/photos/domestic-1440.webp | 1440×960 | 618×360 | contain; none |
| 1440 / 2 | /services/domestic | /media/photos/details-1440.webp | 1440×960 | 625×396 | contain; none |
| 1440 / 2 | /services/domestic | /media/photos/review-1440.webp | 1440×960 | 625×405 | contain; none |
| 1440 / 2 | /services/domestic | /media/photos/dispatch-1440.webp | 1440×960 | 625×405 | contain; none |
| 1440 / 2 | /services/international | /media/photos/aircraft-1440.webp | 1440×960 | 616×358 | contain; brightness(0.82) saturate(0.85) |
| 1440 / 2 | /services/international | /media/photos/aircraft-1440.webp | 1440×960 | 625×396 | contain; none |
| 1440 / 2 | /services/international | /media/photos/review-1440.webp | 1440×960 | 625×405 | contain; none |
| 1440 / 2 | /services/international | /media/photos/details-1440.webp | 1440×960 | 625×405 | contain; none |
| 1440 / 2 | /about | /media/photos/workspace-1440.webp | 1440×768 | 618×360 | cover; none |
| 1440 / 2 | /about | /media/photos/dispatch-1440.webp | 1440×960 | 443×410 | contain; none |
| 1440 / 2 | /about | /media/photos/details-768.webp | 768×512 | 277×215 | contain; none |
| 1440 / 2 | /about | /media/photos/review-768.webp | 768×512 | 277×216 | contain; none |
| 1440 / 2 | /about | /media/photos/support-768.webp | 768×512 | 277×218 | contain; none |
| 1440 / 2 | /contact | /media/photos/support-1440.webp | 1440×960 | 678×400 | contain; none |
| 768 / 2 | / | /media/photos/hero-1536.webp | 1536×1024 | 768×1024 | contain; none |
| 768 / 2 | / | /media/photos/domestic-1536.webp | 1536×1024 | 728×480 | contain; none |
| 768 / 2 | / | /media/photos/existing-aircraft-2400.webp | 2400×1600 | 728×485 | contain; none |
| 768 / 2 | / | /media/photos/details-768.webp | 768×512 | 328×219 | fill; none |
| 768 / 2 | / | /media/photos/review-768.webp | 768×512 | 327×218 | fill; none |
| 768 / 2 | / | /media/photos/dispatch-768.webp | 768×512 | 328×219 | fill; none |
| 768 / 2 | / | /media/photos/scan-768.webp | 768×512 | 327×218 | fill; none |
| 768 / 2 | / | /media/photos/workspace-1717.webp | 1717×916 | 728×480 | cover; none |
| 768 / 2 | /services/domestic | /media/photos/domestic-1536.webp | 1536×1024 | 728×390 | contain; none |
| 768 / 2 | /services/domestic | /media/photos/details-1024.webp | 1024×683 | 378×239 | contain; none |
| 768 / 2 | /services/domestic | /media/photos/review-1024.webp | 1024×683 | 378×245 | contain; none |
| 768 / 2 | /services/domestic | /media/photos/dispatch-1024.webp | 1024×683 | 378×245 | contain; none |
| 768 / 2 | /services/international | /media/photos/aircraft-1536.webp | 1536×1024 | 726×388 | contain; brightness(0.82) saturate(0.85) |
| 768 / 2 | /services/international | /media/photos/aircraft-1024.webp | 1024×683 | 378×239 | contain; none |
| 768 / 2 | /services/international | /media/photos/review-1024.webp | 1024×683 | 378×245 | contain; none |
| 768 / 2 | /services/international | /media/photos/details-1024.webp | 1024×683 | 378×245 | contain; none |
| 768 / 2 | /about | /media/photos/workspace-1717.webp | 1717×916 | 728×390 | cover; none |
| 768 / 2 | /about | /media/photos/dispatch-1536.webp | 1536×1024 | 680×630 | contain; none |
| 768 / 2 | /about | /media/photos/details-480.webp | 480×320 | 277×215 | contain; none |
| 768 / 2 | /about | /media/photos/review-480.webp | 480×320 | 277×216 | contain; none |
| 768 / 2 | /about | /media/photos/support-480.webp | 480×320 | 277×218 | contain; none |
| 768 / 2 | /contact | /media/photos/support-1440.webp | 1440×960 | 736×434 | contain; none |
| 390 / 3 | / | /media/photos/hero-1440.webp | 1440×960 | 390×900 | contain; none |
| 390 / 3 | / | /media/photos/domestic-1440.webp | 1440×960 | 362×320 | contain; none |
| 390 / 3 | / | /media/photos/existing-aircraft-1440.webp | 1440×960 | 362×241 | contain; none |
| 390 / 3 | / | /media/photos/details-1440.webp | 1440×960 | 362×241 | fill; none |
| 390 / 3 | / | /media/photos/review-1440.webp | 1440×960 | 362×241 | fill; none |
| 390 / 3 | / | /media/photos/dispatch-1440.webp | 1440×960 | 362×241 | fill; none |
| 390 / 3 | / | /media/photos/scan-1440.webp | 1440×960 | 362×241 | fill; none |
| 390 / 3 | / | /media/photos/workspace-1440.webp | 1440×768 | 362×320 | cover; none |
| 390 / 3 | /services/domestic | /media/photos/domestic-1440.webp | 1440×960 | 362×290 | contain; none |
| 390 / 3 | /services/domestic | /media/photos/details-1440.webp | 1440×960 | 358×226 | contain; none |
| 390 / 3 | /services/domestic | /media/photos/review-1440.webp | 1440×960 | 358×232 | contain; none |
| 390 / 3 | /services/domestic | /media/photos/dispatch-1440.webp | 1440×960 | 358×232 | contain; none |
| 390 / 3 | /services/international | /media/photos/aircraft-1440.webp | 1440×960 | 360×288 | contain; brightness(0.82) saturate(0.85) |
| 390 / 3 | /services/international | /media/photos/aircraft-1440.webp | 1440×960 | 358×226 | contain; none |
| 390 / 3 | /services/international | /media/photos/review-1440.webp | 1440×960 | 358×232 | contain; none |
| 390 / 3 | /services/international | /media/photos/details-1440.webp | 1440×960 | 358×232 | contain; none |
| 390 / 3 | /about | /media/photos/workspace-1440.webp | 1440×768 | 362×290 | cover; none |
| 390 / 3 | /about | /media/photos/dispatch-1440.webp | 1440×960 | 362×335 | contain; none |
| 390 / 3 | /about | /media/photos/details-1024.webp | 1024×683 | 277×215 | contain; none |
| 390 / 3 | /about | /media/photos/review-1024.webp | 1024×683 | 277×216 | contain; none |
| 390 / 3 | /about | /media/photos/support-1024.webp | 1024×683 | 277×218 | contain; none |
| 390 / 3 | /contact | /media/photos/support-1440.webp | 1440×960 | 358×211 | contain; none |
| 360 / 3 | / | /media/photos/hero-1440.webp | 1440×960 | 360×900 | contain; none |
| 360 / 3 | / | /media/photos/domestic-1440.webp | 1440×960 | 332×320 | contain; none |
| 360 / 3 | / | /media/photos/existing-aircraft-1440.webp | 1440×960 | 332×221 | contain; none |
| 360 / 3 | / | /media/photos/details-1024.webp | 1024×683 | 332×221 | fill; none |
| 360 / 3 | / | /media/photos/review-1024.webp | 1024×683 | 332×221 | fill; none |
| 360 / 3 | / | /media/photos/dispatch-1024.webp | 1024×683 | 332×221 | fill; none |
| 360 / 3 | / | /media/photos/scan-1024.webp | 1024×683 | 332×221 | fill; none |
| 360 / 3 | / | /media/photos/workspace-1440.webp | 1440×768 | 332×320 | cover; none |
| 360 / 3 | /services/domestic | /media/photos/domestic-1440.webp | 1440×960 | 332×290 | contain; none |
| 360 / 3 | /services/domestic | /media/photos/details-1024.webp | 1024×683 | 328×208 | contain; none |
| 360 / 3 | /services/domestic | /media/photos/review-1024.webp | 1024×683 | 328×213 | contain; none |
| 360 / 3 | /services/domestic | /media/photos/dispatch-1024.webp | 1024×683 | 328×213 | contain; none |
| 360 / 3 | /services/international | /media/photos/aircraft-1440.webp | 1440×960 | 330×288 | contain; brightness(0.82) saturate(0.85) |
| 360 / 3 | /services/international | /media/photos/aircraft-1024.webp | 1024×683 | 328×208 | contain; none |
| 360 / 3 | /services/international | /media/photos/review-1024.webp | 1024×683 | 328×213 | contain; none |
| 360 / 3 | /services/international | /media/photos/details-1024.webp | 1024×683 | 328×213 | contain; none |
| 360 / 3 | /about | /media/photos/workspace-1440.webp | 1440×768 | 332×290 | cover; none |
| 360 / 3 | /about | /media/photos/dispatch-1440.webp | 1440×960 | 332×308 | contain; none |
| 360 / 3 | /about | /media/photos/details-1024.webp | 1024×683 | 277×215 | contain; none |
| 360 / 3 | /about | /media/photos/review-1024.webp | 1024×683 | 277×216 | contain; none |
| 360 / 3 | /about | /media/photos/support-1024.webp | 1024×683 | 277×218 | contain; none |
| 360 / 3 | /contact | /media/photos/support-1024.webp | 1024×683 | 328×193 | contain; none |

All after photographs have opacity 1, no transform/scale at rest, and no placeholder. Object-fit contain uses the original aspect ratio inside the listed box. Full raw records: `baseline.json`, `photo-audit-after.json`. Sources and generated-original dimensions: `../../lib/photographs.json`.
