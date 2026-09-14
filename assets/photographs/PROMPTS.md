# Photographic originals — 14 September 2026

Generated using the built-in image_gen tool, one call per distinct photograph. All eight returned native 1536×1024 PNG files. A larger native resolution was requested but was not returned. No originals or variants were upscaled. These are AI-generated illustrative scenes, not actual VK AND COMPANY staff, customers, vehicles or premises. Any depicted label details are synthetic, not shipment records.

Originals: `originals/{hero,details,review,dispatch,scan,domestic,support,aircraft}.png`.

Common prompt for details, review, dispatch, scan, domestic and support:

> Use case: photorealistic-natural. One individual standalone photographic asset, landscape 3:2. Highest suitable native resolution supported, prefer 3072x2048 or greater. [SUBJECT] Navy and subtle teal accents. Sharp realistic foreground subjects, clear textures, deep focus, natural lighting, no heavy depth-of-field blur. Illustrative scene, not actual company premises. No brands, logos, endorsements, watermarks, website UI, collage or text overlays.

+- **details** — A parcel on a digital shipping scale while an Indian courier measures its dimensions with a tape measure. Complete parcel, scale, tape and hands in frame with generous margins. Bright tidy parcel counter.
- **review** — An Indian courier representative and Indian customer reviewing shipment paperwork on a clipboard at a parcel counter. Both people, hands, clipboard and parcel comfortably in frame, believable everyday Indian courier setting.
- **dispatch** — Indian courier workers loading a cardboard parcel into a small delivery van. Complete parcel and hands clearly visible, practical loading area, natural daylight.
- **scan** — Close editorial photograph of a handheld barcode scanner reading a plain shipping label on a cardboard parcel in an Indian courier facility. Whole scanner, hand and parcel label in frame, accurate practical handling.
- **domestic** — A complete unbranded small navy and teal courier delivery van parked on a believable Indian city street, an Indian courier handing a parcel to a customer beside it. All people and vehicle comfortably in frame with generous margin.
- **support** — Indian customer support representative wearing a headset at a tidy courier office desk with parcels and a computer. Complete face and hands in frame, professional everyday scene.

Hero prompt:

> Use case: photorealistic-natural. Generate one standalone editorial photograph, landscape 3:2, at the highest suitable native resolution available (prefer 3072x2048 or greater if supported). Indian courier delivery truck in navy and subtle teal on the RIGHT half of a realistic Indian logistics forecourt, complete vehicle and wheels comfortably in frame. Left half quiet open paved forecourt and distant low buildings for existing website text. Natural daylight, foreground and vehicle extremely sharp, realistic textures, deep focus, no artificial bokeh or motion blur. This is illustrative, not actual company premises. No company logos, no text, no watermarks, no website layout, no collage.

Aircraft prompt:

> Use case photorealistic-natural. One standalone editorial photograph of a complete unbranded cargo aircraft at an Indian airport apron. Nose, tail, both wingtips and landing gear fully comfortably in frame with generous 15 percent clear margins. Wide landscape 3:2 composition. Highest available native resolution, 3072x2048 if supported. Navy and teal accents without logos. Natural daylight, deep focus, sharp fuselage and cargo carts. No motion blur, no heavy bokeh, no text overlays or watermark or collage or website screenshot. Illustrative scene, not actual company premises.

Conversion: `node scripts/prepare-photographs.mjs`. WebP quality 90, widths 480, 768, 1024, 1440 and native width; `withoutEnlargement: true`. Sources and dimensions are in `lib/photographs.json`. Generated originals remain outside `public/` to avoid shipping PNG masters. Existing sharp workspace and homepage aircraft photos are reused; original provenance remains in `public/media/homepage-international-cargo.md` for the aircraft.

Clarity update: aircraft, details, dispatch, domestic, review and scan WebP variants now use lossless encoding. Their native 1536×1024 variants were decoded and checked to match the original PNG pixels exactly. Responsive variants are still resized without enlargement. Other photograph conversions remain at quality 90.
