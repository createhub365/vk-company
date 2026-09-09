# VK AND COMPANY visual implementation

## Current direction

The public site now follows a restrained, image-led editorial system. The homepage has one cinematic delivery experience; no other route mounts a 3D/WebGL scene. Service, company, quote, tracking and informational pages use photography-style imagery, typography, spacing and conventional UI.

The hero sequence is intentionally implemented as 2.5D rather than a procedural WebGL truck. This is the stronger visual result for the available assets and is permitted by the brief. It uses a photoreal transparent truck cutout, the supplied company logo, a dimensional delivery point, road, ramp, parcel and controlled depth effects.

## Animation ownership

One `requestAnimationFrame` timeline owns the complete seven-second sequence:

1. 0–1.8 s — truck arrives.
2. 1.8–2.9 s — truck stops and the rear door opens.
3. 2.9–4.2 s — one parcel moves down the supported ramp.
4. 4.2–4.9 s — the rear door closes.
5. 4.9–6.6 s — truck departs.
6. 6.6–7.0 s — the delivered parcel remains in the final composition.

The sequence starts only when visible, pauses when out of view, does not respond to page scroll, and does not restart on resize. Pause/resume retains elapsed time; replay resets the single timeline. System and saved reduced-motion preferences render a composed delivered pose without movement.

## Asset source and licensing record

| Asset | Source | External licence / attribution |
|---|---|---|
| `public/brand/vk-and-company-logo.png` | Supplied directly by the user | User-provided brand asset; no third-party licence supplied |
| `public/media/delivery-truck-cutout.png` | Generated specifically for this project with OpenAI image generation | Not imported from a third-party library; no external attribution file |
| `public/media/domestic-road.png` | Generated specifically for this project with OpenAI image generation | Not imported from a third-party library; no external attribution file |
| `public/media/international-cargo-apron.png` | Generated specifically for this project with OpenAI image generation | Not imported from a third-party library; no external attribution file |
| `public/media/dispatch-workspace.png` | Generated specifically for this project with OpenAI image generation | Not imported from a third-party library; no external attribution file |

No image, model, texture or video from the visual-reference website was copied or bundled.

## Image-generation prompt record

- Delivery truck cutout: photoreal commercial last-mile box truck, broad side profile with a subtle front three-quarter view, facing right; navy cargo box, teal cab, realistic tyres, wheel arches, mirrors, windows, lights, grille, bumper, seams and chassis; plain unbranded cargo side; transparent background; no text, logo or watermark.
- Domestic feature: photoreal unbranded navy-and-teal commercial delivery truck on a clean modern urban/intercity road, directional daylight, editorial courier campaign framing; no text, logo, recognizable landmark or watermark.
- International feature: photoreal cargo aircraft at blue hour on an airport apron with organized parcels and ground equipment, restrained navy/teal grade; no airline branding, airport identifier, text or watermark.
- Company feature: modern courier dispatch workspace with conveyor, organized parcels, shelving and navy/teal architectural details; no people, brand marks, location identifiers, text or watermark.

## Failure and accessibility behavior

- A failed truck-image request swaps to an in-layout illustrated truck silhouette; the hero copy and CTAs remain usable.
- Phase changes are announced through a polite live region.
- Motion controls have explicit accessible names and keyboard focus states.
- Enlarged text and all required viewports have no horizontal document overflow.
- Tracking and quote results still come from their existing APIs; the animation never represents live shipment state.

## Verification

- `npm test`: 12/12 passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test:e2e`: all 24 desktop/mobile public and visual specs passed in the final complete run.
- `npm run build`: passed; all 32 generated pages completed.
- Exact viewport coverage: 1440×900, 1366×768, 1024×900, 768×1024, 390×844 and 360×800.
- Phase captures: `delivery-arrival-*`, `delivery-stopped-*`, `delivery-unloading-*`, `delivery-departure-*` and `delivery-final-*` in `test-results/`.

Supabase credentials are not configured locally, so authenticated administration and live database persistence were not exercised. Their routes, API contracts, validation, authorization boundaries and data model were not changed.
