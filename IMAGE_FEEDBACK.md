# Image click/tap feedback

One client-only controller (`components/image-feedback.tsx`) is mounted inside the server root layout. Pages remain server components. Existing image containers are marked `data-image-feedback="photo"` or `"background"`; logos are marked `"logo"`. No asset or dependency was added or replaced.

- Photographs: a 450ms teal ripple from the click/tap point and image-only scale 1 → 1.025 → 1. The container and caption stay stationary. The previous editorial hover zoom was removed so the resting image always returns to its original scale.
- Backgrounds: ripple only. Existing contrast overlays and foreground layout remain intact. Foreground copy/controls are excluded from activation; feedback layers cannot intercept pointers.
- Logos: a restrained stationary inset outline for 450ms, without scaling. Native links and accessible names are preserved, including Enter activation. Passive photographs receive no extra role or tab stop.
- Reduced motion: stationary outline, with no ripple or scale. Switching preferences cancels an active effect.
- Pointer gestures: no prevention of default actions, pointer capture, or automatic playback. Scrolling, movement beyond 8px, native dragging, cancelled/multiple touches, long presses and selected text suppress feedback. Native click activation is used after pointer validation.
- Lifecycle: one active effect per surface, replacing previous animations; no timers. Completed effects, route changes and detached surfaces cancel animations and remove layers.

## Route and image inventory

| Route | Rendered imagery / verification |
| --- | --- |
| `/` | Full background truck hero (ripple only), all three editorial photographs (pulse/ripple), shared header/footer logos |
| `/services/domestic` | Road photograph in PageHero, shared logos |
| `/services/international` | Cargo aircraft photograph in PageHero, shared logos |
| `/about` | Dispatch workspace photograph in PageHero, shared logos |
| `/contact`, `/get-a-quote`, `/faq`, `/privacy`, `/terms` | Shared logos; hero markers are CSS/text decoration, not photographs |
| `/admin/login` | Dispatch background and standalone logo; tested without authentication configuration |
| `/quote/[token]` | Only the unconfigured quote-review state and shared logo feedback were accessible using a synthetic token. No real customer quote or acceptance tested. |
| `/admin`, `/admin/content`, `/admin/enquiries`, `/admin/enquiries/[id]`, `/admin/quotes`, `/admin/bookings`, `/admin/shipments`, `/admin/support`, `/admin/support/[id]`, `/admin/settings`, `/admin/audit` | Login redirects verified. Authenticated pages were inaccessible. Their shared admin logo is marked for the same feedback, but not verified behind authentication. |
| Unknown route / 404 | Verified existing not-found page; no images |

All rendered photographs use Next Image; no photographic CSS `url()` backgrounds or plain `<img>` sources were found. The reusable background marker supports a positioned CSS image background too. CSS gradients, SVG UI icons, unused assets and dormant canvas/3D components remain unchanged. The only linked images currently rendered are brand logos; no linked photograph navigation exists to test.

## Verification

Final results: **45/45 browser tests passed** (15 cases across three viewports), **111/111 unit tests passed**, and production build, TypeScript check and ESLint all passed. Initial browser assertion failures involved subpixel click coordinates, the existing 404 heading and a mobile background test point covered by the login card; the corrected assertions and exposed-background point passed in the complete rerun.

Run the isolated browser suite after building:

```sh
npm run build
npx playwright test --config=playwright.image-feedback.config.ts
npm test
npm run typecheck
npm run lint
```

The browser configuration starts a dedicated production server at 127.0.0.1:3101 with Supabase configuration empty. It never overwrites environment files. The tests block external requests and non-GET requests. No email, call, authentication, tracking or quote submission is performed.

Coverage uses Chromium at 1440×900, 390×844 and 360×800; mobile contexts use real browser touch events (including CDP touch-scroll/cancel gestures), not just dispatched click mocks. These are emulated mobile viewports, not physical-device or Safari tests. The in-app browser could not connect (`Cannot redefine property: process`), so isolated Chromium was used.

Checks include per-route feedback, hover staying static, active-animation duration/scale/origin, stationary containers and text, completion cleanup, repeated activation, reduced motion, exact native logo navigation and Enter activation, foreground exclusion, text selection, drag, touch scroll/cancel and unmount cleanup. Screenshots freeze an already-started animation at 200ms for visual inspection; runtime assertions also sample it while running. No horizontal overflow was found at the three tested widths. Artifacts are under ignored `test-results/image-feedback-results/`.

Checksum verification confirms the Contact details page/CSS and enquiry/acceptance form components and validation schema are unchanged. No backend implementation was edited.

## Changed files

- `components/image-feedback.tsx`: reusable delegated effect and gesture/lifecycle handling.
- `app/layout.tsx`: mounts the controller without changing the server component boundary of the pages.
- `app/globals.css`: clipped ripple styling, caption stacking and removal of the old hover zoom.
- `app/(site)/page.tsx`, `components/page-hero.tsx`: photo/background markers and foreground exclusion.
- `components/site-header.tsx`, `components/site-footer.tsx`: logo markers.
- `app/admin/login/page.tsx`, `app/admin/(protected)/layout.tsx`: background/logo markers only; authentication and data logic unchanged.
- `tests/e2e/image-feedback.spec.ts`, `playwright.image-feedback.config.ts`: reproducible isolated browser regression suite.
- `IMAGE_FEEDBACK.md`: implementation, coverage, results and exceptions.

## Unrelated observations (not changed)

- The existing mobile admin login layout clips the logo at the top due to its existing negative card margin. This is not caused by an image transform (logo transforms remain `none`).
- With Supabase unset, visiting `/admin/enquiries/test` and `/admin/support/test` logs `Cannot read properties of null (reading 'from')` on the server while the browser redirects to login. Those detail handlers are unchanged.
- No provider delivery or the previous Contact confirmation issue was tested or changed in this task.
