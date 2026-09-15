# Stage 4 — navigation review

Only the shared navigation and its supporting motion/scroll-lock code changed. Every original label, href, order and accessible name is preserved, including the existing “Get a quote” capitalization. No page module, hero tuning, image, form, metadata or route changed. Quote WebGL and the existing image feedback implementation are untouched.

## Review

- [1440px recording](nav-review-1440.webm): link hover, Quote hover/press, scroll threshold, keyboard focus.
- [390px recording](nav-review-390.webm): keyboard-operated door menu, Escape, reduced-motion fade and touch opening/closing.
- [Stage 4 patch](stage-4.patch).
- Desktop: [before](before/nav-1440.png), [rest](nav-1440-rest.png), [hover](nav-1440-hover.png), [press](nav-1440-press.png), [scrolled](nav-1440-scrolled.png), [keyboard](nav-1440-keyboard.png).
- Mobile: [before](before/nav-390.png), [door in motion](nav-390-door-moving.png), [open keyboard focus](nav-390-open-keyboard.png), [reduced-motion fade](nav-390-reduced-moving.png), [reduced-motion focus](nav-390-reduced-keyboard.png).

The screenshots and sampled decoded recording frames were visually inspected. An initial CTA/background depth intersection found during visual review was corrected before the final recordings: the inner navigation projects its depth separately and is grouped above the bar background. The hovered CTA also explicitly retains its original white label color.

## Behavior

The nav surface sits at Z 60px in 1200px perspective, halved below 768px. Compensating its perspective magnification retains the existing header dimensions and page grid. One boolean changes only at the 80px scroll boundary. Blur transitions over 200ms; a separate static-shadow pseudo-element fades in to deepen the shadow without animating box-shadow.

Links use a 240ms transform underline wipe and -1px / Z 8px lift. The CTA uses -8deg rotateX, a soft radial teal pseudo-element glow, and scale .97 / Z 0 on press. Pointer hover transforms are disabled on touch and below 768px. The Quote route retains its existing pointer-tilt exclusion.

The existing responsive container breakpoint is retained. The menu opens from its right edge with a 380ms, -12deg rotateY entrance using the shared expo curve. Reduced motion removes transforms and uses a 150ms plain fade. Menu close is immediate.

Tab and Shift+Tab cycle through the trigger and five links. Escape restores focus to the trigger. Programmatic focus is contained, and short menus scroll their own panel to expose the complete focus ring. Existing outline styling is preserved above the depth layers.

A shared lock request calls stop()/start() on the existing Lenis owner. There is no second instance, new rAF loop or body overflow lock. Reduced motion temporarily uses one stopped, non-animating owner while the menu is open. Wheel, touch and keyboard lock/unlock behavior was verified; native panel scrolling remains available. Lock ownership and listeners clean up after repeated openings, navigation, resize and closing.

## Verification

All checks used the exported `out/` build and Pages-compatible previews applying its unchanged `_headers` file.

- Fresh build and `verify:content`: passed — all 11 audited outputs and 66 image hashes preserved, with unchanged copy, links, metadata, form contracts and exported headers.
- Lint and typecheck: passed.
- Automated tests: 71 passed, including the new lock ownership/cleanup test.
- Navigation browser suite: 36 passed across 1440px, 768px, 390px and 360px, using 2×/3× display density.
- Existing public-page/form browser suite: 71 passed, 1 existing skip. Form submissions were intercepted; no enquiry was sent.
- Keyboard checks cover closed and open navigation, all five links, reverse traversal in the open menu, focus trapping/return, short-screen visibility and topmost hit testing.
- Reduced-motion checks cover the fade keyframes and duration, no transforms, live preference changes, lock retention and cleanup.
- Static geometry checks confirm unchanged header/main/footer dimensions and no horizontal overflow at all four widths.

Evidence: [navigation log](nav-tests.log), [public/form log](public-tests.log), [unit log](unit-tests.log), [build/content log](build.log), [lint](lint.log), [typecheck](typecheck.log), [scope check](scope-check.json), [recording metadata](recording-metadata.json).

## Files and limits

Implementation: `components/site-header.tsx`, `components/motion/scroll-runtime.tsx`, `lib/motion/scroll-lock.ts`, `styles/navigation.css`. Tests/config: `tests/e2e/nav-motion.spec.ts`, `tests/scroll-lock.test.ts`, `playwright.nav-motion.config.ts`. Documentation: `MOTION_SYSTEM.md` and this artifact folder.

Browser verification used Chromium with desktop/touch emulation; physical devices and Safari were not tested. Lighthouse remains the later performance stage. Videos are local review artifacts ignored by Git; patches, screenshots and reports remain eligible for tracking. No commit, push or deployment was performed. Stage 5 has not started.
