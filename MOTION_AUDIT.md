# MOTION AUDIT — Stage 1 pre-work contract

Captured 14 September 2026, from the current local working tree and a fresh successful `npm run build`. No presentation code, dependencies, content, routes or images were changed to create this audit. The local image repairs from the previous task are part of this baseline. Existing uncommitted changes must not be mistaken for motion-retrofit changes or bundled indiscriminately into future commits.

## Repository map

| Area | Observed implementation |
|---|---|
| Framework | Next.js 16.3.4, React 19.2.8; App Router under `app/(site)` |
| Export | `output: "export"`, output `out/`, unoptimized static images, no application server needed |
| CSS | Tailwind 4 import in `app/globals.css`; predominantly authored global CSS; CSS modules for Contact, ServiceProcess and the unused ReferenceArtwork helper |
| Fonts | Existing Arial/Helvetica sans-serif and Georgia/Times New Roman serif stacks |
| Palette | Existing navy `#203a55` / deep navy `#132c43`, teal `#227d91` / dark teal `#17677a`, cream `#f6f5f1`, paper, and existing supporting tokens; do not substitute colours |
| Public pages | `/`, `/services/domestic`, `/services/international`, `/about`, `/contact`, `/get-a-quote`, `/faq`, `/track`, `/privacy`, `/terms`; separate not-found output `/404.html` |
| Metadata outputs | `app/robots.ts` → `/robots.txt`; `app/sitemap.ts` → `/sitemap.xml`; root metadata inherited where applicable; capture exact rendered metadata below |
| Shell | `app/layout.tsx`: ImageFeedback and children; `app/(site)/layout.tsx`: RouteTransition, SiteHeader, main, SiteFooter |
| Image rendering | Shared `Photograph`, responsive local WebP manifest `lib/photographs.json`; proportional hero photos, scoped 3:2 process photos; original transparent CompanyLogo unchanged |
| Forms | Client EnquiryForm and SupportForm; existing POST fetch to `https://formsubmit.co/ajax/vkandcompanymohali@gmail.com`; validation/response handling in protected source snapshots below |
| Headers | `public/_headers`, copied to export; existing local preview applies these headers |
| Installed motion libraries | GSAP 3.15.0, Three.js 0.182.0, R3F 9.7.0, Drei 10.7.8 already installed; Motion/Framer Motion and Lenis absent |
| Other dependencies | Existing Supabase and nodemailer packages are present but not part of this public motion task; do not restore archived server functionality |
| Local Next.js guidance read | `node_modules/next/dist/docs/01-app/02-guides/static-exports.md` and `lazy-loading.md`; DOM-only `ssr:false` dynamic imports must originate from a client component |

## Existing effects and conflicts to resolve during implementation

- `components/image-feedback.tsx` is the current shared owner of photo pointer tilt, moving highlight, tap discrimination and ripple/depth feedback. It installs passive pointer/click/scroll listeners and uses requestAnimationFrame and Web Animations. Extend or coordinate this owner; do not layer competing transforms or another global pointer system on the same frames. Resting photo transforms and process aspect ratios were verified by the preceding repair.
- `components/route-transition.tsx` currently renders an aria-hidden thin route indicator keyed by pathname; CSS drives a short horizontal sweep. A new scroll indicator must coordinate with this presentation rather than accidentally duplicate it.
- `components/quote-media.tsx` actively lazy-loads `components/three/quote-bubbles.ts` on the Quote page. Its photograph and static decorative fallback are server-rendered. This conflicts with the new WebGL-free request: retire the WebGL activation during the retrofit while preserving the exact photograph, existing media area and essential DOM. Do not add Three.js or reactivate other scenes.
- Other Three.js/R3F scene helpers (`scene-stage`, `courier-canvas`, `dispatch-experience`, `dispatch-canvas`, `delivery-canvas`) exist but are not imported by the current public pages. `MotionControl` and `ReferenceArtwork` are also not mounted on current public routes. Their unused labels are not new content to add.
- The header already uses sticky positioning, backdrop blur, an expanding mobile nav, Escape/outside/blur closing, and focus restoration. Keep those behaviors and focus order.
- Native FAQ `<details><summary>` elements are used on Home and FAQ. There is no current custom answer-panel wrapper or explicit chevron component. A decorative chevron may be added without changing existing semantics or words.
- Forms use conventional visible labels above fields; moving labels must not replace them with placeholders, overlap typed text, alter IDs, or change the grid. The quote enquiry notice must remain immediately visible and stationary.
- Existing global `html { scroll-behavior: smooth }`, reduced-motion rules, CSS button transforms and photo feedback need one coordinated reduced-motion path. Lenis must not run against a second smoothing mechanism. Native touch scrolling, zoom, focus navigation and anchor behavior must remain usable.

## Mapping the requested motion onto existing sections

| Requested effect | Existing target / boundary |
|---|---|
| Global shell | Existing SiteLayout shell, RouteTransition, SiteHeader, SiteFooter; presentation-only client layer |
| Hero | `.cinematic-hero`, existing background image, `.cinematic-copy`, existing `<br/>` and `<em>Across borders.</em>`; preserve all lines and CTA |
| Domestic / International cards | Currently two separate `.editorial-section` sections, not a two-card row. Apply depth within these existing editorial blocks; no new card content, icons, sections or grid |
| Four-step process | `.process-flow`, existing ordered list and four items/photographs. Decorative connecting-line overlay must not replace/reorder list items or affect their equal 3:2 frames |
| Service pages | PageHero, ServiceProcess's three articles, QuoteBand; keep exact selected art, source limits and text |
| About | PageHero, existing What We Do composition and three nested sections, QuoteBand |
| FAQ | Existing native details on `/` and `/faq`; preserve all four questions and answers |
| Contact / Quote | Existing `.form-panel`, `.field`, buttons and labels; keep notices, validation, pending/result wording and submission behavior |
| Footer | Existing footer columns, links and copyright; do not add a motion toggle or other copy |
| Other routes | FAQ/Track/Privacy/Terms and not-found copy remain protected; keep legal notices immediately readable |

## Specification reconciliation and acceptance boundaries

1. The section spec requests animating FAQ height, but the non-negotiable performance gate permits only transform/opacity animation. Preserve the native details height change and animate the answer's hinge/opacity; do not interpolate layout height. This is an explicit interpretation to review before the FAQ stage.
2. A shared token system must include the requested base depth/easing/duration tokens plus named tokens for the other supplied numeric values (e.g. nav 60px, transition 300ms). No scattered per-element constants. Mobile depth uses one shared half-distance factor.
3. The new hero pointer/scroll movement is a change from the earlier task's stationary-background requirement; the latest explicit hero specification is the scope for this retrofit. Photos and their frame geometry must remain unchanged at rest.
4. Existing Quote WebGL behavior conflicts with the new WebGL-free requirement. Disable that presentation initializer while retaining the photograph and static fallback; no new scenes or asset changes.
5. No initial hidden content: server-rendered HTML stays at its final readable state. Only an effects-only layer may be dynamically loaded without SSR; never place page content behind `ssr:false`. Reduced motion must immediately remove motion transforms and expose final content. Any entry effect must avoid the enquiry/legal notices.
6. App Router route transitions must preserve native Next links, focus and URL semantics. Do not introduce navigation delays, manual route interception or content cloning to force an exit animation.
7. Performance targets are acceptance targets, not existing measurements. No Lighthouse score, CLS result, or scroll long-task result has been measured for this new retrofit yet. Save the before run before Stage 2; compare the same local exported pages and throttling settings after implementation. Report any misses honestly. Earlier test passes are not a Lighthouse result.
8. “Zero removed elements” means retain every existing content-bearing element, form control, image, section and link. Presentation wrappers/decorations may be added and existing effect owners coordinated. CSS depth may change apparent position during animation, but must not alter the layout grid, section order or resting image fitting.

## Working order and stage status

1. Audit and this contract — complete; ready for user review before implementation.
2. Depth tokens, Motion/Lenis, coordinated reduced-motion foundation — not started.
3. Hero — not started.
4. Navigation — not started.
5. Existing service editorial sections — not started.
6. Process sequence — not started.
7. FAQ, forms, footer — not started.
8. Performance/accessibility pass and Lighthouse comparison — not started.

The user requested each stage be shown before moving on. Stage 1 introduces only documentation and a repeatable audit/check script; no dependency installation or motion implementation has started. Future logical commits must contain only new motion work, not unrelated pre-existing changes. No deployment or enquiry is authorized by this retrofit.

## Verification contract

`artifacts/motion-audit/baseline.json` records all 11 page outputs, ordered text/headings/links/images/controls/labels, native details, metadata, section counts, original source snapshots and hashes of every referenced static image variant. It also preserves robots, sitemap and headers. Frozen business/form source files include conditional error/success copy and submission logic that initial HTML cannot cover.

After each later stage, rebuild and run:

```sh
npm run build
node scripts/audit-motion-content.mjs
```

The check rejects copy, section-count, heading, link, image, control, label, details, metadata, route-file, image-byte, protected business-source and static-header changes. Layout and focus must additionally be verified in a browser; source equality alone does not prove visual or accessibility equivalence. Do not recapture the baseline to make a failing change pass. The script refuses to overwrite an existing baseline.


## Exact rendered copy, by route and existing section

Copy below is decoded from a fresh local static export; line breaks separate existing text blocks. Hidden honeypot labels and closed FAQ answers are intentionally included. Exact source snapshots in the companion JSON preserve JSX spelling, entities and dynamic branches as well. This is the local working-tree contract, not a claim about deployment.

### Shared SiteHeader

```text
VK AND COMPANY
DomesticInternationalAboutContactGet a quote
```

### Shared SiteFooter

```text
VK AND COMPANY
Domestic and international courier services, arranged around the details of each shipment.
Services
Domestic courierInternational courierRequest a quote
Company
AboutContactFAQsPrivacyTermsEmail us
© 2026 VK AND COMPANYCourier information is confirmed for each shipment.
```

### /

Source: `app/(site)/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "VK AND COMPANY | Courier Services",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Domestic and international courier enquiries and quotations from VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. HomePage: cinematic hero

```text
Domestic & international courier services
Across cities.
Across borders.
We keep your parcels moving.
Domestic and international courier services from VK AND COMPANY. Share your shipment details and let our team help arrange the next step.
Get a quote
```

#### 2. HomePage: domestic editorial feature

```text
Illustrative route imagery
01 / Domestic
Courier services between cities
Planned around your actual route.
Share the origin, destination and parcel details. We review availability and prepare an offer for the specific shipment—without making blanket coverage or timing claims.
Explore domestic services
```

#### 3. HomePage: international editorial feature

```text
Illustrative international logistics
02 / International
Across borders, details first
Clear before it leaves the ground.
Acceptance, documentation, availability and charges depend on the route and parcel. Our team confirms what applies before anything is arranged.
Explore international services
```

#### 4. HomePage: four-step process / ProcessPhoto ×4

```text
How shipping works
Four steps.
One clear process.
Every status follows a real operational action. An enquiry is never presented as a confirmed booking or dispatch.
01
Share shipment details
Tell us the route, contents, package count and approximate weight.
02
Receive a reviewed quote
Service details, inclusions and exclusions are confirmed for the enquiry.
03
Arrange dispatch
An accepted quote becomes a booking ready for coordination.
04
Follow verified updates
Contact the team for customer-safe shipment updates.
```

#### 5. HomePage: quote action entry

```text
01
Start with the shipment
Request a considered quote.
Share the details once. Our team reviews each request before confirming service or charges.
Get a quote
```

#### 6. HomePage: company editorial feature

```text
Illustrative operations environment
03 / Company
About VK AND COMPANY
Built around each shipment.
Our customer journey is straightforward: share the details, receive a reviewed offer, arrange a booking and follow genuine updates.
More about our process
```

#### 7. HomePage: common questions / FaqList

```text
Common questions
Useful answers,
before you send.
View all FAQs
How do I request a courier quote?
Share your contact, route and parcel details in the quotation form. The team will review your request and contact you with a confirmed offer.
Does submitting the form confirm my booking?
No. It creates an enquiry only. A booking is created after a quote has been prepared and accepted.
Can all international parcels be accepted?
Acceptance depends on the contents, documentation, route availability and applicable restrictions. These are confirmed for the specific shipment.
Is pickup automatically scheduled?
No. Pickup requests are currently unavailable. When enabled, a requested date will still need staff confirmation.
```

#### 8. HomePage: contact finale

```text
Contact & support
Need help with the next step?
Send a secure general or shipment-related enquiry for the team to review.
Contact the team
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-home-hero-1744.webp",
      "srcset": "/media/photos/selected-home-hero-480.webp 480w, /media/photos/selected-home-hero-768.webp 768w, /media/photos/selected-home-hero-1024.webp 1024w, /media/photos/selected-home-hero-1440.webp 1440w, /media/photos/selected-home-hero-1744.webp 1744w",
      "sizes": "100vw",
      "alt": "Illustrative navy and teal courier truck at an Indian delivery forecourt",
      "width": "1744",
      "height": "902"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-domestic-1744.webp",
      "srcset": "/media/photos/selected-domestic-480.webp 480w, /media/photos/selected-domestic-768.webp 768w, /media/photos/selected-domestic-1024.webp 1024w, /media/photos/selected-domestic-1440.webp 1440w, /media/photos/selected-domestic-1744.webp 1744w",
      "sizes": "(max-width: 800px) 100vw, 58vw",
      "alt": "Illustrative delivery truck travelling on an intercity road",
      "width": "1744",
      "height": "902"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/existing-aircraft-2400.webp",
      "srcset": "/media/photos/existing-aircraft-480.webp 480w, /media/photos/existing-aircraft-768.webp 768w, /media/photos/existing-aircraft-1024.webp 1024w, /media/photos/existing-aircraft-1440.webp 1440w, /media/photos/existing-aircraft-2400.webp 2400w",
      "sizes": "(max-width: 900px) 100vw, 41vw",
      "alt": "Antonov An-124 cargo aircraft above Lviv airport, with nose, tail and both wingtips in frame",
      "width": "2400",
      "height": "1600"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/details-1536.webp",
      "srcset": "/media/photos/details-480.webp 480w, /media/photos/details-768.webp 768w, /media/photos/details-1024.webp 1024w, /media/photos/details-1440.webp 1440w, /media/photos/details-1536.webp 1536w",
      "sizes": "(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw",
      "alt": "Illustrative parcel being weighed and measured",
      "width": "1536",
      "height": "1024"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/process-review-2400.webp",
      "srcset": "/media/photos/process-review-480.webp 480w, /media/photos/process-review-768.webp 768w, /media/photos/process-review-1024.webp 1024w, /media/photos/process-review-1440.webp 1440w, /media/photos/process-review-2400.webp 2400w",
      "sizes": "(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw",
      "alt": "A courier and customer reviewing delivery paperwork together on a clipboard",
      "width": "2400",
      "height": "1600"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/process-dispatch-2400.webp",
      "srcset": "/media/photos/process-dispatch-480.webp 480w, /media/photos/process-dispatch-768.webp 768w, /media/photos/process-dispatch-1024.webp 1024w, /media/photos/process-dispatch-1440.webp 1440w, /media/photos/process-dispatch-2400.webp 2400w",
      "sizes": "(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw",
      "alt": "Two delivery workers loading cardboard parcels into the back of a van",
      "width": "2400",
      "height": "1600"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/process-scan-1080.webp",
      "srcset": "/media/photos/process-scan-480.webp 480w, /media/photos/process-scan-768.webp 768w, /media/photos/process-scan-1024.webp 1024w, /media/photos/process-scan-1080.webp 1080w",
      "sizes": "(max-width: 640px) 90vw, (max-width: 900px) 43vw, 21vw",
      "alt": "A handheld barcode scanner reading the label on a cardboard parcel",
      "width": "1080",
      "height": "570"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/workspace-1717.webp",
      "srcset": "/media/photos/workspace-480.webp 480w, /media/photos/workspace-768.webp 768w, /media/photos/workspace-1024.webp 1024w, /media/photos/workspace-1440.webp 1440w, /media/photos/workspace-1717.webp 1717w",
      "sizes": "(max-width: 800px) 100vw, 58vw",
      "alt": "Illustrative modern parcel dispatch workspace",
      "width": "1717",
      "height": "916"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Explore domestic services",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Explore international services",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "More about our process",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "View all FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact the team",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /services/domestic

Source: `app/(site)/services/domestic/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "Domestic courier services | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Request a reviewed domestic courier quote from VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (domestic)

```text
Domestic courier enquiries
A considered route from one city to the next.
Tell us where your parcel is going and what it contains. Availability, service options, timing and charges are confirmed for the specific shipment.
Illustrative courier environment
```

#### 2. ServiceProcess (domestic): three existing articles

```text
domestic process
Begin with the real shipment details.
Provide the origin and destination, package count, approximate weight, contents and preferred dispatch date. We use those details to assess the available next step.
Review before commitment.
A submitted enquiry is not a booking. The team will prepare a quote with relevant service details, estimates, inclusions, exclusions, currency and validity date. Your booking is created only after acceptance.
We move it with care.
Once confirmed, your shipment is handed over to our operational team and moves through our domestic network. You can reach out for updates whenever required.
```

#### 3. QuoteBand

```text
Start with the shipment details
Let’s work out the right next step for your parcel.
No instant estimates without an approved rate card. Our team reviews each request before making an offer.
Request a quote
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /services/domestic</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-domestic-1744.webp",
      "srcset": "/media/photos/selected-domestic-480.webp 480w, /media/photos/selected-domestic-768.webp 768w, /media/photos/selected-domestic-1024.webp 1024w, /media/photos/selected-domestic-1440.webp 1440w, /media/photos/selected-domestic-1744.webp 1744w",
      "sizes": "(max-width: 900px) 100vw, 50vw",
      "alt": "Illustrative delivery truck travelling on an intercity road",
      "width": "1744",
      "height": "902"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-domestic-1-392.webp",
      "srcset": "/media/photos/selected-domestic-1-392.webp 392w",
      "sizes": "(max-width: 640px) calc(100vw - 32px), (max-width: 1236px) 52vw, 625px",
      "alt": "Illustration of a domestic shipment quotation form on a laptop beside a parcel",
      "width": "392",
      "height": "248"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-domestic-2-392.webp",
      "srcset": "/media/photos/selected-domestic-2-392.webp 392w",
      "sizes": "(max-width: 640px) calc(100vw - 32px), (max-width: 1236px) 52vw, 625px",
      "alt": "Illustration of a courier and customer reviewing paperwork at a doorstep",
      "width": "392",
      "height": "254"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-domestic-3-392.webp",
      "srcset": "/media/photos/selected-domestic-3-392.webp 392w",
      "sizes": "(max-width: 640px) calc(100vw - 32px), (max-width: 1236px) 52vw, 625px",
      "alt": "Illustration of a VK AND COMPANY delivery truck travelling through a city",
      "width": "392",
      "height": "254"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /services/international

Source: `app/(site)/services/international/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "International courier services | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Discuss international courier acceptance, documentation and charges with VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (international)

```text
International courier enquiries
Across borders, with the details checked first.
International shipment requirements vary by contents, origin and destination. We review each enquiry before confirming what can be arranged.
Illustrative courier environment
```

#### 2. ServiceProcess (international): three existing articles

```text
international process
Route and contents review.
Share accurate origin, destination, contents, package count, weight and dimensions where known. This supports an initial acceptance and availability review.
Documentation is shipment-specific.
Required documentation and restrictions depend on the route and parcel. The team will explain confirmed requirements for your shipment; this website does not substitute generic claims for that review.
Clear quotation boundaries.
Charges, estimates, inclusions and exclusions appear in the quote for the reviewed route. Times, routes and partner handling are subject to change based on operational factors and destination requirements.
```

#### 3. QuoteBand

```text
Start with the shipment details
Let’s work out the right next step for your parcel.
No instant estimates without an approved rate card. Our team reviews each request before making an offer.
Request a quote
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /services/international</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-international-1802.webp",
      "srcset": "/media/photos/selected-international-480.webp 480w, /media/photos/selected-international-768.webp 768w, /media/photos/selected-international-1024.webp 1024w, /media/photos/selected-international-1440.webp 1440w, /media/photos/selected-international-1802.webp 1802w",
      "sizes": "(max-width: 900px) 100vw, 50vw",
      "alt": "Illustrative cargo aircraft at an international logistics apron",
      "width": "1802",
      "height": "873"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-international-1-392.webp",
      "srcset": "/media/photos/selected-international-1-392.webp 392w",
      "sizes": "(max-width: 640px) calc(100vw - 32px), (max-width: 1236px) 52vw, 625px",
      "alt": "Illustration of aircraft cargo loading with a world map and the words From India to the World",
      "width": "392",
      "height": "248"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-international-2-392.webp",
      "srcset": "/media/photos/selected-international-2-392.webp 392w",
      "sizes": "(max-width: 640px) calc(100vw - 32px), (max-width: 1236px) 52vw, 625px",
      "alt": "Illustrative export-document checklist beside a passport and globe; actual requirements depend on the shipment",
      "width": "392",
      "height": "254"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/selected-international-3-392.webp",
      "srcset": "/media/photos/selected-international-3-392.webp 392w",
      "sizes": "(max-width: 640px) calc(100vw - 32px), (max-width: 1236px) 52vw, 625px",
      "alt": "Illustration of a cargo ship, aircraft and delivery truck at an international port",
      "width": "392",
      "height": "254"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /about

Source: `app/(site)/about/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "About | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Learn about VK AND COMPANY's enquiry-led domestic and international courier service.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (about)

```text
About VK AND COMPANY
Courier arrangements built around each shipment.
VK AND COMPANY provides domestic and international courier services through a clear enquiry, quotation and booking process.
Illustrative courier environment
```

#### 2. AboutPage: what we do, four service labels, three nested journey sections, purpose caption

```text
What we do
Connecting People & Possibilities
Shipment Details
Route Review
Booking Support
Shipment Updates
A straightforward customer journey.
Customers share their shipment details, receive a reviewed offer, arrange a booking and follow genuine shipment updates. Support requests remain connected to the operational team when questions arise.
Careful about what is confirmed.
We do not publish invented coverage, courier partners, guarantees or rate cards. Service facts are confirmed for the route and shipment details provided.
Prepared to connect.
Shipment updates are maintained manually by the team. The application has a defined boundary for approved courier integrations when partners and credentials are supplied.
Delivered with Purpose
```

#### 3. QuoteBand

```text
Start with the shipment details
Let’s work out the right next step for your parcel.
No instant estimates without an approved rate card. Our team reviews each request before making an offer.
Request a quote
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /about</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/workspace-1717.webp",
      "srcset": "/media/photos/workspace-480.webp 480w, /media/photos/workspace-768.webp 768w, /media/photos/workspace-1024.webp 1024w, /media/photos/workspace-1440.webp 1440w, /media/photos/workspace-1717.webp 1717w",
      "sizes": "(max-width: 900px) 100vw, 50vw",
      "alt": "Illustrative parcel dispatch workspace",
      "width": "1717",
      "height": "916"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/dispatch-1536.webp",
      "srcset": "/media/photos/dispatch-480.webp 480w, /media/photos/dispatch-768.webp 768w, /media/photos/dispatch-1024.webp 1024w, /media/photos/dispatch-1440.webp 1440w, /media/photos/dispatch-1536.webp 1536w",
      "sizes": "(max-width: 900px) 100vw, 40vw",
      "alt": "Illustrative courier team loading parcels for dispatch",
      "width": "1536",
      "height": "1024"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/details-1536.webp",
      "srcset": "/media/photos/details-480.webp 480w, /media/photos/details-768.webp 768w, /media/photos/details-1024.webp 1024w, /media/photos/details-1440.webp 1440w, /media/photos/details-1536.webp 1536w",
      "sizes": "277px",
      "alt": "Illustrative parcel being weighed and measured",
      "width": "1536",
      "height": "1024"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/review-1536.webp",
      "srcset": "/media/photos/review-480.webp 480w, /media/photos/review-768.webp 768w, /media/photos/review-1024.webp 1024w, /media/photos/review-1440.webp 1440w, /media/photos/review-1536.webp 1536w",
      "sizes": "277px",
      "alt": "Illustrative courier and customer reviewing shipment details",
      "width": "1536",
      "height": "1024"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/support-1536.webp",
      "srcset": "/media/photos/support-480.webp 480w, /media/photos/support-768.webp 768w, /media/photos/support-1024.webp 1024w, /media/photos/support-1440.webp 1440w, /media/photos/support-1536.webp 1536w",
      "sizes": "277px",
      "alt": "Illustrative customer support representative wearing a headset",
      "width": "1536",
      "height": "1024"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /contact

Source: `app/(site)/contact/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "Contact | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Send a courier or delivery support enquiry to VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. ContactPage: introduction, illustration, enquiry topics, company channels, SupportForm, response-time caption

```text
How can we
help?
Send a general question or ask about a shipment. Your message will be saved for the team to review.
Here to Keep
You Moving
General
Enquiries
Quote
Requests
Shipment
Support
Partnerships
& Other
From
Your Place to the World
Contact channels
Contact VK AND COMPANY.
+91 93177 24056
vkandcompanymohali@gmail.com
Website
Name
Phone
Email
Provide an email or phone number so the team can respond.
Subject
General Enquiry
Quote Request
Shipment Support
Partnerships & Other
Message
Send message
We usually respond within one business day.
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /contact</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/support-1536.webp",
      "srcset": "/media/photos/support-480.webp 480w, /media/photos/support-768.webp 768w, /media/photos/support-1024.webp 1024w, /media/photos/support-1440.webp 1440w, /media/photos/support-1536.webp 1536w",
      "sizes": "(max-width: 900px) calc(100vw - 32px), 50vw",
      "alt": "Illustrative Indian courier customer support representative",
      "width": "1536",
      "height": "1024"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "+91 93177 24056",
      "href": "tel:+919317724056",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "vkandcompanymohali@gmail.com",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [
    {
      "tag": "form",
      "action": null,
      "method": null,
      "novalidate": ""
    }
  ],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": null,
      "name": "website",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": "-1"
    },
    {
      "tag": "input",
      "text": "",
      "id": "name",
      "name": "name",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": "2",
      "maxlength": "120",
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "phone",
      "name": "phone",
      "type": "tel",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": "7",
      "maxlength": "32",
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "email",
      "name": "email",
      "type": "email",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": "254",
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "select",
      "text": "General Enquiry Quote Request Shipment Support Partnerships & Other",
      "id": "subject",
      "name": "subject",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "General Enquiry",
      "id": null,
      "name": null,
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "Quote Request",
      "id": null,
      "name": null,
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "Shipment Support",
      "id": null,
      "name": null,
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "Partnerships & Other",
      "id": null,
      "name": null,
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "textarea",
      "text": "",
      "id": "message",
      "name": "message",
      "type": null,
      "value": null,
      "placeholder": "Tell us how we can help…",
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": "10",
      "maxlength": "3000",
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "button",
      "text": "Send message",
      "id": null,
      "name": null,
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    }
  ],
  "labels": [
    {
      "tag": "label",
      "text": "Website",
      "for": null
    },
    {
      "tag": "label",
      "text": "Name",
      "for": "name"
    },
    {
      "tag": "label",
      "text": "Phone",
      "for": "phone"
    },
    {
      "tag": "label",
      "text": "Email",
      "for": "email"
    },
    {
      "tag": "label",
      "text": "Subject",
      "for": "subject"
    },
    {
      "tag": "label",
      "text": "Message",
      "for": "message"
    }
  ]
}
```

</details>

### /get-a-quote

Source: `app/(site)/get-a-quote/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "Request a quote | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Share your route and parcel details with VK AND COMPANY for a reviewed courier quotation.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (quote) / QuoteMedia

```text
Quotation request
Tell us about your shipment.
Share the route and parcel details below. Our team will review the information before confirming service and charges.
```

#### 2. QuotePage: before-you-begin aside / EnquiryForm

```text
Before you begin
Details make the difference.
Approximate information is fine where requested. Accurate contents, weight and route details help the team assess the shipment.
Pickup requests are not currently enabled.
Website
Your details
Name
Phone number
Email (optional)
Route
Origin country
Origin city
Origin postal code
Destination country
Destination city
Destination postal code
Shipment
Contents description
Be clear about the actual contents; acceptance is confirmed after review.
Number of packages
Approximate weight
kg
lb
Dimensions (when known)
Dimension unit
centimetres
inches
Preferred dispatch date (not guaranteed)
Additional instructions
Submitting this form creates an enquiry. It does not confirm a quote, booking, pickup or dispatch.
Send quote request
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /get-a-quote</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/media/photos/details-1536.webp",
      "srcset": "/media/photos/details-480.webp 480w, /media/photos/details-768.webp 768w, /media/photos/details-1024.webp 1024w, /media/photos/details-1440.webp 1440w, /media/photos/details-1536.webp 1536w",
      "sizes": "(max-width: 900px) 243px, 423px",
      "alt": "Illustrative Indian courier measuring a parcel on a weighing scale beside shipping paperwork; not actual company staff or premises",
      "width": "1536",
      "height": "1024"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [
    {
      "tag": "form",
      "action": null,
      "method": null,
      "novalidate": ""
    }
  ],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": null,
      "name": "website",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": "off",
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": "-1"
    },
    {
      "tag": "input",
      "text": "",
      "id": "name",
      "name": "name",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": "name",
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "phone",
      "name": "phone",
      "type": "tel",
      "value": null,
      "placeholder": "Include country code",
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": "tel",
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "email",
      "name": "email",
      "type": "email",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": "email",
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "originCountry",
      "name": "originCountry",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": "country-name",
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "originCity",
      "name": "originCity",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": "address-level2",
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "originPostalCode",
      "name": "originPostalCode",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": "postal-code",
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "destinationCountry",
      "name": "destinationCountry",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "destinationCity",
      "name": "destinationCity",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "destinationPostalCode",
      "name": "destinationPostalCode",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "textarea",
      "text": "",
      "id": "contentsDescription",
      "name": "contentsDescription",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": "",
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "packageCount",
      "name": "packageCount",
      "type": "number",
      "value": "1",
      "placeholder": null,
      "required": "",
      "min": "1",
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "approximateWeight",
      "name": "approximateWeight",
      "type": "number",
      "value": null,
      "placeholder": null,
      "required": "",
      "min": "0.001",
      "max": null,
      "step": "0.001",
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "select",
      "text": "kg lb",
      "id": null,
      "name": "weightUnit",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Weight unit",
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "kg",
      "id": null,
      "name": null,
      "type": null,
      "value": "kg",
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "lb",
      "id": null,
      "name": null,
      "type": null,
      "value": "lb",
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "dimensions",
      "name": "dimensions",
      "type": null,
      "value": null,
      "placeholder": "L × W × H",
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "select",
      "text": "centimetres inches",
      "id": "dimensionUnit",
      "name": "dimensionUnit",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "centimetres",
      "id": null,
      "name": null,
      "type": null,
      "value": "cm",
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "option",
      "text": "inches",
      "id": null,
      "name": null,
      "type": null,
      "value": "in",
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "input",
      "text": "",
      "id": "preferredDispatchDate",
      "name": "preferredDispatchDate",
      "type": "date",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "textarea",
      "text": "",
      "id": "instructions",
      "name": "instructions",
      "type": null,
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    },
    {
      "tag": "button",
      "text": "Send quote request",
      "id": null,
      "name": null,
      "type": "submit",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": null,
      "aria-controls": null,
      "aria-expanded": null,
      "tabindex": null
    }
  ],
  "labels": [
    {
      "tag": "label",
      "text": "Website",
      "for": null
    },
    {
      "tag": "legend",
      "text": "Your details",
      "for": null
    },
    {
      "tag": "label",
      "text": "Name",
      "for": "name"
    },
    {
      "tag": "label",
      "text": "Phone number",
      "for": "phone"
    },
    {
      "tag": "label",
      "text": "Email (optional)",
      "for": "email"
    },
    {
      "tag": "legend",
      "text": "Route",
      "for": null
    },
    {
      "tag": "label",
      "text": "Origin country",
      "for": "originCountry"
    },
    {
      "tag": "label",
      "text": "Origin city",
      "for": "originCity"
    },
    {
      "tag": "label",
      "text": "Origin postal code",
      "for": "originPostalCode"
    },
    {
      "tag": "label",
      "text": "Destination country",
      "for": "destinationCountry"
    },
    {
      "tag": "label",
      "text": "Destination city",
      "for": "destinationCity"
    },
    {
      "tag": "label",
      "text": "Destination postal code",
      "for": "destinationPostalCode"
    },
    {
      "tag": "legend",
      "text": "Shipment",
      "for": null
    },
    {
      "tag": "label",
      "text": "Contents description",
      "for": "contentsDescription"
    },
    {
      "tag": "label",
      "text": "Number of packages",
      "for": "packageCount"
    },
    {
      "tag": "label",
      "text": "Approximate weight",
      "for": "approximateWeight"
    },
    {
      "tag": "label",
      "text": "Dimensions (when known)",
      "for": "dimensions"
    },
    {
      "tag": "label",
      "text": "Dimension unit",
      "for": "dimensionUnit"
    },
    {
      "tag": "label",
      "text": "Preferred dispatch date (not guaranteed)",
      "for": "preferredDispatchDate"
    },
    {
      "tag": "label",
      "text": "Additional instructions",
      "for": "instructions"
    }
  ]
}
```

</details>

### /faq

Source: `app/(site)/faq/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "Frequently asked questions | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Answers about courier enquiries, quotations and booking with VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (faq)

```text
Frequently asked questions
Answers before you send.
Useful guidance about our enquiry-led courier workflow.
VKC
```

#### 2. FaqList: four native details elements

```text
How do I request a courier quote?
Share your contact, route and parcel details in the quotation form. The team will review your request and contact you with a confirmed offer.
Does submitting the form confirm my booking?
No. It creates an enquiry only. A booking is created after a quote has been prepared and accepted.
Can all international parcels be accepted?
Acceptance depends on the contents, documentation, route availability and applicable restrictions. These are confirmed for the specific shipment.
Is pickup automatically scheduled?
No. Pickup requests are currently unavailable. When enabled, a requested date will still need staff confirmation.
```

#### 3. QuoteBand

```text
Start with the shipment details
Let’s work out the right next step for your parcel.
No instant estimates without an approved rate card. Our team reviews each request before making an offer.
Request a quote
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /faq</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /track

Source: `app/(site)/track/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "Shipment update enquiry | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Domestic and international courier enquiries and quotations from VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (legal/default)

```text
Shipment support
Shipment update enquiry
Contact the company for an update on your shipment. Please include your shipment reference so the team can help.
VKC
```

#### 2. ShipmentUpdatePage: contact-based shipment support

```text
Ask about your shipment.
Online shipment lookup is unavailable. Contact VK AND COMPANY by phone or email, or use the Contact form. Include your shipment reference in your message.
+91 93177 24056
vkandcompanymohali@gmail.com
Contact the team
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /track</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "+91 93177 24056",
      "href": "tel:+919317724056",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "vkandcompanymohali@gmail.com",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact the team",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /privacy

Source: `app/(site)/privacy/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "Privacy information | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Domestic and international courier enquiries and quotations from VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "robots",
    "property": null,
    "content": "noindex, nofollow",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (legal/default)

```text
Owner review required
Privacy content is not yet approved.
This page is reserved for VK AND COMPANY's reviewed privacy information.
VKC
```

#### 2. PrivacyPage: launch requirement and existing privacy information

```text
Launch requirement: The business owner and an appropriate legal adviser must review and approve the final privacy notice before this page is published or indexed.
The application collects contact, route and shipment information when a person intentionally submits a quotation or support request. Final disclosures—including purposes, retention, rights, processors and contact details—depend on confirmed business practices and must not be invented.
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /privacy</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /terms

Source: `app/(site)/terms/page.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "Service terms | VK AND COMPANY",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Domestic and international courier enquiries and quotations from VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "robots",
    "property": null,
    "content": "noindex, nofollow",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. PageHero (legal/default)

```text
Owner review required
Service terms are not yet approved.
This page is reserved for VK AND COMPANY's reviewed customer terms.
VKC
```

#### 2. TermsPage: launch requirement and existing terms information

```text
Launch requirement: Approved terms must address the actual courier process, responsibilities, restrictions, charges, claims and applicable law before publication.
No unreviewed boilerplate is presented as company policy. Quotes include shipment-specific service details, estimates, inclusions, exclusions, currency and validity.
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /terms</summary>

```json
{
  "images": [
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    },
    {
      "tag": "img",
      "text": "",
      "src": "/brand/vk-and-company-logo-transparent.png",
      "srcset": null,
      "sizes": null,
      "alt": "VK AND COMPANY",
      "width": "500",
      "height": "500"
    }
  ],
  "links": [
    {
      "tag": "a",
      "text": "VK AND COMPANY",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": "VK AND COMPANY home"
    },
    {
      "tag": "a",
      "text": "Domestic",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Get a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Domestic courier",
      "href": "/services/domestic",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "International courier",
      "href": "/services/international",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Request a quote",
      "href": "/get-a-quote",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "About",
      "href": "/about",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Contact",
      "href": "/contact",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "FAQs",
      "href": "/faq",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Privacy",
      "href": "/privacy",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Terms",
      "href": "/terms",
      "target": null,
      "rel": null,
      "aria-label": null
    },
    {
      "tag": "a",
      "text": "Email us",
      "href": "mailto:vkandcompanymohali@gmail.com",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [
    {
      "tag": "button",
      "text": "",
      "id": null,
      "name": null,
      "type": "button",
      "value": null,
      "placeholder": null,
      "required": null,
      "min": null,
      "max": null,
      "step": null,
      "minlength": null,
      "maxlength": null,
      "autocomplete": null,
      "aria-label": "Open menu",
      "aria-controls": "main-navigation",
      "aria-expanded": "false",
      "tabindex": null
    }
  ],
  "labels": []
}
```

</details>

### /404.html

Source: `app/not-found.tsx`

Metadata:

```json
[
  {
    "tag": "meta",
    "text": "",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "viewport",
    "property": null,
    "content": "width=device-width, initial-scale=1",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "robots",
    "property": null,
    "content": "noindex",
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "title",
    "text": "VK AND COMPANY | Courier Services",
    "name": null,
    "property": null,
    "content": null,
    "rel": null,
    "href": null,
    "type": null
  },
  {
    "tag": "meta",
    "text": "",
    "name": "description",
    "property": null,
    "content": "Domestic and international courier enquiries and quotations from VK AND COMPANY.",
    "rel": null,
    "href": null,
    "type": null
  }
]
```

#### 1. NotFound: message and return-home link

```text
Not found
This page is not available.
The link may be invalid, expired or no longer active.
Return home
```

Image, link, form and accessibility inventory:

<details><summary>Exact attributes for /404.html</summary>

```json
{
  "images": [],
  "links": [
    {
      "tag": "a",
      "text": "Return home",
      "href": "/",
      "target": null,
      "rel": null,
      "aria-label": null
    }
  ],
  "forms": [],
  "controls": [],
  "labels": []
}
```

</details>

## Dynamic copy and submission contract

These unmodified source snapshots include pending/success/error messages, validation wording, names, endpoints and payload mapping that are not all visible in an initial page render. Keep these files unchanged; presentation can target their existing DOM from outside.

### components/forms/enquiry-form.tsx

<details><summary>Exact pre-work source</summary>

```tsx
"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { zodErrors } from "@/lib/schemas";
import { buildQuotePayload, quoteFormSchema, quoteOutcome, quoteOutcomeMessages, QUOTE_BODY_LIMIT, QUOTE_FORMSUBMIT_ENDPOINT, QUOTE_TIMEOUT_MS } from "@/lib/quote-formsubmit";

type Result = { ok: boolean; message: string; fields?: Record<string,string> };

function FieldError({ name, errors }: { name: string; errors: Record<string,string> }) {
  return errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
}

export function EnquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const attempts = useRef<number[]>([]);
  const submitting = useRef(false);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const parsed = quoteFormSchema.safeParse({ ...Object.fromEntries(new FormData(form)), pickupRequested: false });
    if (!parsed.success) {
      const fields = zodErrors(parsed.error);
      setResult({ ok: false, message: fields.website ? "We could not validate this form. Please reload and try again." : "Please correct the highlighted fields.", fields });
      const firstInvalid = Array.from(form.elements).find(element =>
        (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)
        && element.name !== "website" && fields[element.name]);
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }
    const body = JSON.stringify(buildQuotePayload(parsed.data));
    if (new TextEncoder().encode(body).byteLength > QUOTE_BODY_LIMIT) {
      setResult({ ok: false, message: "The request is too large. Please shorten your message." });
      return;
    }
    const now = Date.now();
    attempts.current = attempts.current.filter(time => time > now - 15 * 60_000);
    if (attempts.current.length >= 8) {
      setResult({ ok: false, message: "Too many attempts. Please wait 15 minutes before trying again." });
      return;
    }
    attempts.current.push(now);
    submitting.current = true;
    setPending(true); setResult(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), QUOTE_TIMEOUT_MS);
    try {
      const response = await fetch(QUOTE_FORMSUBMIT_ENDPOINT, { method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" }, body, signal: controller.signal });
      const json: unknown = await response.json();
      const outcome = quoteOutcome(response.status, json);
      setResult({ ok: outcome === "accepted", message: quoteOutcomeMessages[outcome] });
      if (outcome === "accepted") formRef.current?.reset();
    } catch { setResult({ ok: false, message: quoteOutcomeMessages.uncertain }); }
    finally { clearTimeout(timeout); submitting.current = false; setPending(false); }
  }
  const errors = result?.fields || {};
  const fieldProps = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });
  return <form className="form-panel" ref={formRef} onSubmit={submit} noValidate>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <fieldset className="form-section"><legend>Your details</legend><div className="form-grid">
      <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required {...fieldProps("name")}/><FieldError name="name" errors={errors}/></div>
      <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Include country code" required {...fieldProps("phone")}/><FieldError name="phone" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="email">Email <small>(optional)</small></label><input id="email" name="email" type="email" autoComplete="email" {...fieldProps("email")}/><FieldError name="email" errors={errors}/></div>
    </div></fieldset>
    <fieldset className="form-section"><legend>Route</legend><div className="form-grid">
      <div className="field"><label htmlFor="originCountry">Origin country</label><input id="originCountry" name="originCountry" autoComplete="country-name" required {...fieldProps("originCountry")}/><FieldError name="originCountry" errors={errors}/></div>
      <div className="field"><label htmlFor="originCity">Origin city</label><input id="originCity" name="originCity" autoComplete="address-level2" required {...fieldProps("originCity")}/><FieldError name="originCity" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="originPostalCode">Origin postal code</label><input id="originPostalCode" name="originPostalCode" autoComplete="postal-code" required {...fieldProps("originPostalCode")}/><FieldError name="originPostalCode" errors={errors}/></div>
      <div className="field"><label htmlFor="destinationCountry">Destination country</label><input id="destinationCountry" name="destinationCountry" required {...fieldProps("destinationCountry")}/><FieldError name="destinationCountry" errors={errors}/></div>
      <div className="field"><label htmlFor="destinationCity">Destination city</label><input id="destinationCity" name="destinationCity" required {...fieldProps("destinationCity")}/><FieldError name="destinationCity" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="destinationPostalCode">Destination postal code</label><input id="destinationPostalCode" name="destinationPostalCode" required {...fieldProps("destinationPostalCode")}/><FieldError name="destinationPostalCode" errors={errors}/></div>
    </div></fieldset>
    <fieldset className="form-section"><legend>Shipment</legend><div className="form-grid">
      <div className="field field-full"><label htmlFor="contentsDescription">Contents description</label><textarea id="contentsDescription" name="contentsDescription" required {...fieldProps("contentsDescription")}/><small>Be clear about the actual contents; acceptance is confirmed after review.</small><FieldError name="contentsDescription" errors={errors}/></div>
      <div className="field"><label htmlFor="packageCount">Number of packages</label><input id="packageCount" name="packageCount" type="number" min="1" defaultValue="1" required {...fieldProps("packageCount")}/><FieldError name="packageCount" errors={errors}/></div>
      <div className="field"><label htmlFor="approximateWeight">Approximate weight</label><div style={{display:"grid",gridTemplateColumns:"1fr 85px",gap:8}}><input id="approximateWeight" name="approximateWeight" type="number" min="0.001" step="0.001" required {...fieldProps("approximateWeight")}/><select name="weightUnit" aria-label="Weight unit"><option value="kg">kg</option><option value="lb">lb</option></select></div><FieldError name="approximateWeight" errors={errors}/></div>
      <div className="field"><label htmlFor="dimensions">Dimensions <small>(when known)</small></label><input id="dimensions" name="dimensions" placeholder="L × W × H" {...fieldProps("dimensions")}/><FieldError name="dimensions" errors={errors}/></div>
      <div className="field"><label htmlFor="dimensionUnit">Dimension unit</label><select id="dimensionUnit" name="dimensionUnit"><option value="cm">centimetres</option><option value="in">inches</option></select></div>
      <div className="field field-full"><label htmlFor="preferredDispatchDate">Preferred dispatch date <small>(not guaranteed)</small></label><input id="preferredDispatchDate" name="preferredDispatchDate" type="date" {...fieldProps("preferredDispatchDate")}/><FieldError name="preferredDispatchDate" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="instructions">Additional instructions</label><textarea id="instructions" name="instructions" {...fieldProps("instructions")}/><FieldError name="instructions" errors={errors}/></div>
    </div></fieldset>
    <p className="notice">Submitting this form creates an enquiry. It does not confirm a quote, booking, pickup or dispatch.</p>
    {result && <div className={`form-status ${result.ok ? "" : "error"}`} role="status">{result.message}</div>}
    <button className="button" type="submit" disabled={pending}>{pending ? "Submitting…" : <>Send quote request <Send size={17}/></>}</button>
  </form>;
}

```

</details>

### components/forms/support-form.tsx

<details><summary>Exact pre-work source</summary>

```tsx
"use client";

import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { contactFormSchema, zodErrors } from "@/lib/schemas";

const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/vkandcompanymohali@gmail.com";
const CONTACT_SUBJECT = "VK AND COMPANY — New Contact Enquiry";
const UNCONFIRMED = "We could not confirm your submission. It may have been accepted. Please check with the company before resubmitting.";

function FieldError({ name, errors }: { name: string; errors: Record<string, string> }) {
  return errors[name] ? <span className="field-error" id={`contact-${name}-error`}>{errors[name]}</span> : null;
}

export function SupportForm() {
  const submitting = useRef(false);
  const attempts = useRef<number[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending,setPending]=useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result,setResult]=useState<{ok:boolean;message:string;reference?:string}|null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const parsed = contactFormSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const fields = zodErrors(parsed.error);
      setErrors(fields);
      setResult({ ok: false, message: fields.website || "Please check the highlighted fields." });
      const firstInvalid = Array.from(form.elements).find(element =>
        (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)
        && element.name !== "website" && fields[element.name]);
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }
    setErrors({});
    const now = Date.now();
    attempts.current = attempts.current.filter(time => time > now - 15 * 60_000);
    if (attempts.current.length >= 6) {
      setResult({ ok: false, message: "Too many attempts. Please wait 15 minutes before trying again." });
      return;
    }
    const value = parsed.data;
    // Whitelist fields: never forward customer-supplied FormSubmit settings.
    const payload = {
      name: value.name, email: value.email || "", phone: value.phone || "", message: value.message,
      subject: value.subject, shipmentReference: value.shipmentReference || "",
      _subject: CONTACT_SUBJECT, _honey: value.website,
      ...(value.email ? { _replyto: value.email } : {}),
    };
    submitting.current = true;
    attempts.current.push(now);
    setPending(true); setResult(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const body: unknown = await response.json();
      const success = typeof body === "object" && body !== null && "success" in body
        && (body.success === true || body.success === "true");
      if (!response.ok || !success) {
        setResult({ ok: false, message: UNCONFIRMED });
        return;
      }
      setResult({ ok: true, message: "FormSubmit accepted your enquiry for processing. This does not confirm inbox delivery." });
      formRef.current?.reset();
    } catch {
      setResult({ ok: false, message: UNCONFIRMED });
    } finally {
      clearTimeout(timeout);
      submitting.current = false; setPending(false);
    }
  }
  const fieldProps = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": [name === "email" ? "contact-details-hint" : "", errors[name] ? `contact-${name}-error` : ""].filter(Boolean).join(" ") || undefined,
  });
  return <form className="form-panel" ref={formRef} onSubmit={submit} noValidate>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1}/></label></div>
    <div className="form-grid">
      <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required minLength={2} maxLength={120} {...fieldProps("name")}/><FieldError name="name" errors={errors}/></div>
      <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" minLength={7} maxLength={32} {...fieldProps("phone")}/><FieldError name="phone" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="email">Email</label><input id="email" name="email" type="email" maxLength={254} {...fieldProps("email")}/><small id="contact-details-hint">Provide an email or phone number so the team can respond.</small><FieldError name="email" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="subject">Subject</label><select id="subject" name="subject" required defaultValue="General Enquiry" {...fieldProps("subject")}><option>General Enquiry</option><option>Quote Request</option><option>Shipment Support</option><option>Partnerships &amp; Other</option></select><FieldError name="subject" errors={errors}/></div>
      <div className="field field-full"><label htmlFor="message">Message</label><textarea id="message" name="message" placeholder="Tell us how we can help…" required minLength={10} maxLength={3000} {...fieldProps("message")}/><FieldError name="message" errors={errors}/></div>
    </div>
    {result&&<div className={`form-status ${result.ok?"":"error"}`} role="status">{result.message}{result.reference&&<><br/><strong>Reference: {result.reference}</strong></>}</div>}
    <button className="button" disabled={pending}>{pending?"Sending…":"Send message"}<ArrowRight size={18} aria-hidden="true"/></button>
  </form>;
}

```

</details>

### lib/schemas.ts

<details><summary>Exact pre-work source</summary>

```tsx
import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const phone = z.string().trim().min(7, "Enter a phone number with country code").max(32);
const country = z.string().trim().min(2).max(80);
const city = z.string().trim().min(2).max(120);
const postal = z.string().trim().min(2).max(20);

const enquiryFieldsSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    phone,
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
    originCountry: country,
    originCity: city,
    originPostalCode: postal,
    destinationCountry: country,
    destinationCity: city,
    destinationPostalCode: postal,
    contentsDescription: z.string().trim().min(5).max(1000),
    packageCount: z.coerce.number().int().min(1).max(1000),
    approximateWeight: z.coerce.number().positive().max(100_000),
    weightUnit: z.enum(["kg", "lb"]),
    dimensions: optionalText(160),
    dimensionUnit: z.enum(["cm", "in"]),
    preferredDispatchDate: z.string().date().optional().or(z.literal("")),
    pickupRequested: z.coerce.boolean().default(false),
    instructions: optionalText(2000),
    website: z.string().max(0).optional().default(""),
  });
const checkPickup = (value: { pickupRequested: boolean }, ctx: z.RefinementCtx) => {
    if (value.pickupRequested) {
      ctx.addIssue({ code: "custom", path: ["pickupRequested"], message: "Pickup requests are not currently enabled" });
    }
  };
export const enquirySchema = enquiryFieldsSchema.extend({ idempotencyKey: z.string().uuid() }).superRefine(checkPickup);
export const quoteFormSchema = enquiryFieldsSchema.extend({
  email: z.string().trim().pipe(z.string().email().max(254).or(z.literal(""))).optional(),
}).superRefine(checkPickup);

// Normalize before the empty-string alternative: optional spaces are empty,
// not a too-short phone number or an invalid email address.
const contactEmailFormat = z.string().email();
const contactFields = {
  name: z.string().trim().min(2, "Enter your name using at least 2 characters.").max(120, "Keep your name within 120 characters."),
  email: z.string().trim().max(254, "Keep your email address within 254 characters.")
    .refine(value => value === "" || contactEmailFormat.safeParse(value).success, "Enter a valid email address, such as name@example.com.").optional(),
  phone: z.string().trim().max(32, "Keep your phone number within 32 characters.")
    .refine(value => value === "" || value.length >= 7, "Enter a phone number with at least 7 characters, including the country code.").optional(),
  subject: z.string().trim().min(3, "Enter a subject with at least 3 characters.").max(160, "Keep your subject within 160 characters."),
  message: z.string().trim().min(10, "Enter a message with at least 10 characters.").max(3000, "Keep your message within 3000 characters."),
  shipmentReference: z.string().trim().max(64, "Keep the shipment reference within 64 characters.").optional(),
  website: z.string().max(0, "We could not validate this form. Please reload and try again.").optional().default(""),
};
const contactDetailsRequired = (value: { email?: string; phone?: string }) => Boolean(value.email || value.phone);
const contactDetailsError = { path: ["email"], message: "Enter an email address or phone number so we can reply." };

// The FormSubmit form validates only its actual fields. The retained server API
// still needs its idempotency key; do not impose that old requirement in the UI.
export const contactFormSchema = z.object(contactFields).refine(contactDetailsRequired, contactDetailsError);
export const supportSchema = z.object({
  ...contactFields,
  idempotencyKey: z.string().uuid("This form session is invalid. Refresh the page and try again."),
}).refine(contactDetailsRequired, contactDetailsError);

export const trackingEventSchema = z.object({
  shipmentId: z.string().uuid(),
  status: z.enum(["booked", "collected", "dispatched", "in_transit", "out_for_delivery", "delivery_attempted", "delivered", "delayed", "return_in_transit", "returned", "cancelled"]),
  description: z.string().trim().min(3).max(500),
  location: optionalText(160),
  occurredAt: z.string().datetime({ offset: true }),
});

export function zodErrors(error: z.ZodError) {
  return Object.fromEntries(error.issues.map((issue) => [issue.path.join("."), issue.message]));
}

```

</details>

### lib/quote-formsubmit.ts

<details><summary>Exact pre-work source</summary>

```tsx
import { z } from "zod";
import { quoteFormSchema } from "./schemas";
export { quoteFormSchema } from "./schemas";

// Public, fixed configuration; never derived from form fields or query strings.
export const QUOTE_FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/vkandcompanymohali@gmail.com";
export const QUOTE_FORMSUBMIT_SUBJECT = "VK AND COMPANY — New Quote Request";
export const QUOTE_BODY_LIMIT = 32 * 1024;
export const QUOTE_TIMEOUT_MS = 20_000;

export function buildQuotePayload(value: z.output<typeof quoteFormSchema>) {
  const fields: Record<string, string | number | boolean | undefined> = {
    name: value.name, email: value.email, Phone: value.phone,
    "Enquiry type": "Quote Request",
    "Origin country": value.originCountry, "Origin city": value.originCity,
    "Origin postal code": value.originPostalCode,
    "Destination country": value.destinationCountry, "Destination city": value.destinationCity,
    "Destination postal code": value.destinationPostalCode,
    Contents: value.contentsDescription, "Package count": value.packageCount,
    "Approximate weight": value.approximateWeight, "Weight unit": value.weightUnit,
    Dimensions: value.dimensions, "Dimension unit": value.dimensionUnit,
    "Preferred dispatch date": value.preferredDispatchDate,
    "Pickup requested": value.pickupRequested, Instructions: value.instructions,
  };
  // Explicit scalar whitelist: preserve 0/false, omit empty optional values,
  // and never forward arbitrary FormSubmit controls or customer HTML templates.
  const payload: Record<string, string> = {};
  for (const [label, content] of Object.entries(fields)) {
    if (content !== undefined && content !== "") payload[label] = String(content);
  }
  return { ...payload, _subject: QUOTE_FORMSUBMIT_SUBJECT, _honey: value.website,
    ...(value.email ? { _replyto: value.email } : {}) };
}

export type QuoteOutcome = "accepted" | "rejected" | "uncertain";
export function quoteOutcome(status: number, body: unknown): QuoteOutcome {
  if (typeof body !== "object" || body === null || !("success" in body)) return "uncertain";
  if (status >= 200 && status < 300 && (body.success === true || body.success === "true")) return "accepted";
  // Explicit negative acknowledgement, not a guess based on HTTP status alone.
  if (status >= 200 && status < 500 && (body.success === false || body.success === "false")) return "rejected";
  return "uncertain";
}

export const quoteOutcomeMessages: Record<QuoteOutcome, string> = {
  accepted: "FormSubmit accepted your quote request for processing. This does not confirm inbox delivery, an approved quotation, or a booking.",
  rejected: "FormSubmit did not accept your quote request. Your details are still here. You can try again manually or contact the company for help.",
  uncertain: "We could not confirm your submission. It may have been accepted. Your details are still here. Please check with the company before resubmitting; no automatic retry will occur.",
};

```

</details>

### lib/config.ts

<details><summary>Exact pre-work source</summary>

```tsx
export const businessConfig = {
  name: "VK AND COMPANY",
  legalName: null as string | null,
  phone: "+91 93177 24056" as string | null,
  whatsapp: null as string | null,
  email: "vkandcompanymohali@gmail.com" as string | null,
  address: null as string | null,
  mapUrl: null as string | null,
  operatingHours: null as string | null,
  pickupRequestsEnabled: false,
  logoPath: "/brand/vk-and-company-logo-transparent.png",
} as const;

// No invented production origin. Missing origin is a launch blocker, not a
// reason to publish localhost in the sitemap or metadata.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || undefined;

```

</details>

### lib/business-settings.ts

<details><summary>Exact pre-work source</summary>

```tsx
import { businessConfig } from "@/lib/config";
export type PublicBusinessSettings = { phone: string | null; whatsapp: string | null; email: string | null; address: string | null; mapUrl: string | null; operatingHours: string | null; pickupEnabled: boolean };
// Verified build-time settings; no request context, database, or credentials.
export function getPublicBusinessSettings(): PublicBusinessSettings {
  return { phone: businessConfig.phone, whatsapp: businessConfig.whatsapp, email: businessConfig.email, address: businessConfig.address, mapUrl: businessConfig.mapUrl, operatingHours: businessConfig.operatingHours, pickupEnabled: businessConfig.pickupRequestsEnabled };
}

```

</details>

### next.config.ts

<details><summary>Exact pre-work source</summary>

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["three"],
  poweredByHeader: false,
};

export default nextConfig;

```

</details>

## Source snapshot integrity

The baseline JSON contains complete source snapshots. These hashes identify the pre-work versions; presentation files may change, while the rendered contract and frozen business files must remain equal.

| File | SHA-256 |
|---|---|
| `app/(site)/about/page.tsx` | `955bc573f76052a7ab176c7ae721d6538eafbd6d3ca41ad1a790277ab1c5f471` |
| `app/(site)/contact/contact.module.css` | `112c650576ddc117ec09afc37f01e0a477fb4133a3f67555588287784992a376` |
| `app/(site)/contact/page.tsx` | `8c6a6401bea11e19fb5968fa4e28fc22a1e42e4486a32e2085845bc77c8bc899` |
| `app/(site)/faq/page.tsx` | `7391ad4db3aefc0fdbfef2fabe2982063c1cdb124f30a63591e8762a0a8b0012` |
| `app/(site)/get-a-quote/page.tsx` | `2f86fc1a21951328774390d5d3c00432c0f681d5fd03a48a07fb3d3932af9385` |
| `app/(site)/layout.tsx` | `c668f4ed44a7bf3d0494ef243b1a957c10b4e676a4fe15b61d589e054f9215a7` |
| `app/(site)/page.tsx` | `654fc27475458f195a18165ef840550370b992ef3e53043142631583c7cba2f5` |
| `app/(site)/privacy/page.tsx` | `b48bfdeaed65c51cd3fa75ed42658c564af75a98cd34b6839d8485e18a388f27` |
| `app/(site)/services/domestic/page.tsx` | `27ab327c633a1b9422f190f592fdab3d5c2c6920d0766e5a858b2c21ecca9eea` |
| `app/(site)/services/international/page.tsx` | `370bf2bb27af302abb4c059e714327c06b8fb93bca45ec7ec45bdca262b2a6e1` |
| `app/(site)/terms/page.tsx` | `6f2056357bf4a53867a6a901d20b757bf86ac2019c324aa773091399e505bb21` |
| `app/(site)/track/page.tsx` | `92bcef35e5b396d1416630ceee777fc69607644b4cbd7de659599b00c4bf3e14` |
| `app/globals.css` | `93fffcf25aafdcd821a88223f7b877a8df6fd7532982c08a98f9048c58d23551` |
| `app/layout.tsx` | `16d768f981db6becd31f60e26badd5bd6991440cbf33bb742181bcd90fcf669b` |
| `app/not-found.tsx` | `366b355c73abf96b60f5a94bb87a26d320ad19543ec9d71fcb01c86e61f4e35e` |
| `app/robots.ts` | `dc347ae803c2e1435a544bcfa1c3e4724d06da2572b0d5112064c4b5be3b0ae1` |
| `app/sitemap.ts` | `db99b48b39c413dfb1609036f92d709e0a1a4c6e4c1a8a4cfaf2b64acc3ea57c` |
| `components/company-logo.tsx` | `7c3d33ea3473b4619bf2e081c6056ee17e4413665ece82750363a73fc2ac9bee` |
| `components/faq-list.tsx` | `3fd043b5061a141d7fbaef7513c3c43152808102a66cbd152bced8ae49f9b88d` |
| `components/forms/enquiry-form.tsx` | `bdc77e9f692b5834d5aa884718fd587a622bbf40ee806fc4dc8f7c56607ea45f` |
| `components/forms/support-form.tsx` | `a0f4141beeb54ff0bc357809f88a52735b2defe4e055f43cb18b834bf26c2f80` |
| `components/image-feedback.tsx` | `12efb2ebb341afbca456433753f86dfeebac6776bd5b538a8a2c475a520796dd` |
| `components/motion-control.tsx` | `674b5a59aa4f6b75557e2c6a3c6459834db1f6d68ec43950a0df4b7fa05ba5fa` |
| `components/page-hero.tsx` | `6f264591d65adb4b534a408c5a7891359039fae630db7f191fead97680a0200a` |
| `components/photograph.tsx` | `f741d9d44d785b0be14e5b727265e719bbad471feeb94bc9ff55ee4627ebfcc6` |
| `components/process-photo.tsx` | `6c055dd3deb175dd2388eb0438fae76d0a8e5940e1f8141ebf7c4830ed5f4836` |
| `components/quote-band.tsx` | `fae4aaf7afbb22f975033a712fb3028e19f0fd5304e10963deea703f6d58ad3f` |
| `components/quote-media.tsx` | `43dc94e30c18d9e1290d3dd2b7ce17e5294943799886f3385b735668f2629827` |
| `components/reference-artwork.module.css` | `9f43fcf9173c23cec0f2c7c0f75be819c5e2fa96f21953f320cc9dbdc6a10ee7` |
| `components/reference-artwork.tsx` | `ba0c9532461863f57e9e2e4240f75e15d20d01e9fe2dcf8b9194614b84a8500b` |
| `components/route-transition.tsx` | `131c8d69a7471618484bfb9d6834997638f64c661458ad92addef44c1f26d4ee` |
| `components/service-process.module.css` | `8c981971da075dbae5f9d314367e1cf896a8454a92c3b765ffe012863d75e88a` |
| `components/service-process.tsx` | `a448ea81795d12b09ab3e2df1a02bd0549e49efc29dacdabaa994120aa131471` |
| `components/site-footer.tsx` | `0a84c72292ac1d14ec24c678732c38137eb6b398f8dcc85bd7586b529b8c3d71` |
| `components/site-header.tsx` | `80d883a2fac4195cae133ef0cc43e42c0f9caae047d537e57d23e2e80f9c0834` |
| `components/three/courier-canvas.tsx` | `36cb96d67c3292e76f5389496b5d876cefac5c9faa646b2ca7dce3cb3cac588d` |
| `components/three/delivery-canvas.tsx` | `3e06196b7d675b9bf7411aeefab06e50e00063b21bb77936deeb8fbb28f22971` |
| `components/three/dispatch-canvas.tsx` | `57ee3c2107db34a1e17a2a1dc1a37a4db38a1a884556f97f589f4241f6f475e0` |
| `components/three/dispatch-experience.tsx` | `6234202427eec4fc90fe6b0e4c3fa846e69b905b53b7952fa05b17f81b466721` |
| `components/three/quote-bubbles.ts` | `59911444ffa26611cb202748e2f70d9bfd2123e5d3cefa7e87078b35b66c60fc` |
| `components/three/scene-stage.tsx` | `52a968e61446e7b185ce586b6b353bcfea7f0a4a9c2a6051cf63e0b9ed96ec36` |
| `components/three/scene-types.ts` | `e20fb9346ebd0a86355088b80f3658734a7a152ef215bd70e81ef72f5848a38f` |
| `lib/business-settings.ts` | `7a86cf16a63186ec7bd1d836a2ec8abdaeb8d486844bdabeb90d38854e18e891` |
| `lib/config.ts` | `9ab2d19c08761921718205877604fb8be043bedad136bddc9e44acbe30b9ff59` |
| `lib/media-interaction.ts` | `ca74b121a3cdcb36bdca0c00b6f4573fba7066def368133985c5d41fca6a3eff` |
| `lib/photographs.json` | `15d52dc9ab2b45fa43371630811654489bb101f58272f4526288d5a3ad33a550` |
| `lib/quote-formsubmit.ts` | `b036fa487c35dee7efd2ecedf5e8db72d0a0f90198c5511107ad402b0661e57a` |
| `lib/schemas.ts` | `2e8611c73b37d5528da3d5dbf57c6d910be37e3ce0deb515a5916d252309f33a` |
| `next.config.ts` | `20413b8ceda166ec2346a301f3bf3d3fe301348a6c1d7451ee967a01aea0deb0` |
| `package.json` | `165c669d0af9163ba98c53170c2d866853494dfd43eb3e36c760f6a223e4b60d` |
| `public/_headers` | `90a41244d89222b20555268caff3b4a737741297d4bce83b387343c31d006328` |
