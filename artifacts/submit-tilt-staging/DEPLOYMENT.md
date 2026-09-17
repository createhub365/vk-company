# Verified staging deployment

- Commit: `5cfc48b6d57d9888460449210d9576afbf9e9dad` on `staging`.
- Preview: https://a2e83635.vk-company.pages.dev
- Cloudflare Pages: **completed / success**, confirmed 2026-09-16T14:24:24.606Z through the GitHub check for this exact commit. See `deployment-check.json` and `deployment-watch.log`.
- Push succeeded: `push.log`. The pre-commit content check rebuilt the static export and passed: `commit.log`.
- Live Playwright verification: **13 passed, 0 failed**, including 360/390/768/1024/1440px Quote submits with and without prior validation errors, all six service-image tilts at 1440px, and reduced motion. See `live-e2e.log`, `live-results.json` and `live-results/`.
- All form POSTs were intercepted with mock responses. No enquiries were sent.
- Live Quote page returns HTTP 200 with the original four security headers; see `live-headers.txt`.

## Intensity and interception conclusion

The exact requested lower intensity values were already present before the repair and remain unchanged. At 768px after validation, the original hit target was FORM.form-panel even with these values. Consequently the intensity bump was not the cause of the reproduced bug. Isolating the form depth wrapper fixes the 3D hit-testing problem without disabling pointer events or changing form logic. The deployed regression checks now find the submit button on top and click it successfully.

## Evidence boundaries

All implementation, tests, preflight reports and screenshots are committed in the SHA above. This post-deployment evidence is saved locally after the verified deployment, so it is not part of that commit. No additional deployment was triggered merely to publish its own evidence.

The complete local gate is in REPORT.md: 85 unit tests, 188 browser tests with 2 existing skips, lint, typecheck, content verification and export build. Final local mobile Lighthouse medians are 96/96/95/96/90 for Home/Domestic/International/Contact/Quote, all CLS 0. These are local simulated-mobile results; live checks use Chromium, not physical devices or Safari. Source diff whitespace checks passed; raw generated reports, logs and patch context retain their original whitespace.
