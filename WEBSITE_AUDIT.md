# VK AND COMPANY — website audit

Date: 9 September 2026. **Audit only: no application, dependency, schema, configuration or test files changed.** Diagnostic screenshots are in [test-results/website-audit](test-results/website-audit/). Existing-file checksums were compared before and after the audit.

The website is **not ready to describe all customer workflows as operational**. Quote sending lacks SMTP configuration, Tracking lacks its data service, Contact's real provider acknowledgement is still unverified, and customer-facing validation/accessibility issues remain. No Critical exploit or confirmed customer-data disclosure was demonstrated; that is not a security clearance.

## Scope and evidence boundaries

- Rendered the production build on a separate local server at `127.0.0.1:3102`. Main inspections used **1440×900, 390×844 and 360×800**, covering 11 routes at each size, plus 200% root-text enlargement. Chromium touch emulation was used; these were not physical-device or Safari tests.
- The in-app browser could not initialize (`Cannot redefine property: process`). Isolated Chromium was used instead.
- Every diagnostic form POST was intercepted and fulfilled/aborted locally before reaching the application or FormSubmit. Synthetic values were clearly labelled `AUDIT`/`NOT SENT`. No live enquiries, activation, emails, calls, login attempts, bookings or mutations were made. Tracking's unconfigured/invalid responses were **real local GET responses**.
- Schema/guard reproductions invoked the actual modules in isolated diagnostic processes without network requests. Existing tests were run unchanged; no assertion was weakened to pass.
- Normal-size screenshots and scans found no broken rendered images on the three requested sizes, no horizontal document overflow, and no layout-shift entries during the measured initial page-load windows. These short local observations are not a field performance measurement. Enlarged-text clipping and an extra tablet image failure are recorded below.

## Ranked actionable findings

### 1. Important — Quote is offered without a configured sending transport

**Route/reproduction:** Open `/get-a-quote` in this workspace. The full form is available despite all six SMTP settings being absent. In a safe browser test, intercept `/api/enquiries` with the exact `503/not_configured` response implemented by the handler; the customer reaches an error only after entering their shipment details.

**Expected / observed:** A customer should know before completing the form when sending is unavailable, with a useful existing contact alternative. The page implies the team can receive the request; its configured-code path cannot send here. The failure response itself is honest: “Your enquiry was not sent, saved or queued,” and inputs are retained.

**Evidence/cause:** [Quote page](app/(site)/get-a-quote/page.tsx), [SMTP configuration gate](lib/adapters/enquiry-smtp.ts:23), [response mapping](lib/submit-enquiry.ts:44). Only `.env.example` exists; required SMTP variables are absent from the audit process. This is configuration inspection plus an intercepted browser response, **not a live failed send**.

**Smallest recommended fix:** Configure the existing approved SMTP transport separately; until then, display its unavailable state before form completion and link to the existing company contact details. Do not add Supabase or replace the provider.

### 2. Important — Contact collapses distinct failures into the same uncertain warning

**Route/reproduction:** On `/contact`, enter valid synthetic fields and intercept the fixed FormSubmit endpoint with (a) HTTP 400 JSON `{success:false,message:"AUDIT MOCK: request rejected before acceptance"}`, (b) HTTP 200 JSON `{success:"false",message:"AUDIT MOCK: Please activate this form"}`, (c) non-JSON HTML, or (d) an aborted request.

**Expected / observed:** Known provider rejection/activation guidance should be distinguishable from lost acknowledgement where its actual documented response supports that distinction. All four cases display “We could not confirm your submission. It may have been accepted…”. Inputs survive, and no false success occurs in these Contact tests.

**Evidence/cause:** [SupportForm](components/forms/support-form.tsx:54) unconditionally parses JSON, accepts only `response.ok` plus boolean `true` or string `"true"`, ignores provider message/error fields, and maps every other outcome or exception to `UNCONFIRMED`. [Intercepted rejection screenshot](test-results/website-audit/contact-rejection-intercepted.png). The existing unit suite also confirms the 20-second abort path. There is no saved uncertain-submission state: status, attempt counts and pending locks are component memory only.

**Smallest recommended fix:** First obtain one authorized real failed-request capture, then map only demonstrated provider responses to safe distinct outcomes. Keep ambiguous network/parse/timeout outcomes uncertain and avoid automatic retries. **This audit does not establish the cause of the user's previous real FormSubmit failure, prove activation is missing, or prove CORS is failing.** The rejection/activation response bodies above are mocks, not captured FormSubmit replies.

### 3. Important — Tracking is unavailable, but the page does not disclose this before lookup

**Route/reproduction:** Open `/track`; enter `VKC-AUDIT000001` and perform a local read-only lookup with Supabase absent.

**Expected / observed:** Either verified tracking data, or upfront availability guidance and an actionable support path. Actual HTTP **503**, JSON `{"ok":false,"message":"Tracking is not configured yet."}`. The page initially invites a lookup; its “Contact support” instruction is plain text. Invalid `bad` correctly returns **422** with “Enter a valid VK tracking code.” No invented status is shown.

**Evidence/cause:** [Tracking API](app/api/track/route.ts:9), [Tracking page](app/(site)/track/page.tsx), [form](components/forms/tracking-form.tsx). The nullable admin client is handled safely here.

**Smallest recommended fix:** Surface the existing configuration status before lookup and make Contact support a link. Configure the existing tracking service independently; neither enquiry form needs a database.

### 4. Important — Enlarged mobile text makes footer navigation inaccessible

**Route/reproduction:** Any public page, e.g. `/contact`, at 390×844 or 360×800; set root text to 200%, then scroll to the footer.

**Expected / observed:** All service/company links should reflow and remain readable and reachable. The Company column is outside the screen. At 390px its links begin around **x=406.9px** and end around **x=552.2px**. The footer grid has **538px** scroll width inside a **362px** container (332px at 360). The footer clips it even though the document-overflow assertion reports zero.

**Evidence/cause:** [390px screenshot](test-results/website-audit/390-footer-text200.png), [360px screenshot](test-results/website-audit/360-footer-text200.png). A later [three-column rule](app/globals.css:308) overrides the earlier mobile single-column rule at line 199; `.site-footer` at line 307 hides overflow. Off-screen honeypot fields were excluded as intentional spam protection, not reported as layout defects.

**Smallest recommended fix:** Restore a narrow-screen footer column override after the later rule, with shrinkable/wrapping grid children. Preserve the typography/theme and do not conceal overflow with more clipping.

### 5. Important — Both forms accept text that is not a phone number

**Route/reproduction:** Contact: use phone `abcdefg`, leave Email empty, fill other fields validly, and intercept the submission. Quote: validate an otherwise valid payload with the same phone through its actual schema in an isolated process.

**Expected / observed:** At least one usable contact method should be required. Both schemas accept `abcdefg`. Contact reaches the mocked provider request with no `_replyto`; a mocked positive acknowledgement clears the form even though the company cannot respond using those details.

**Evidence/cause:** [Quote phone validation](lib/schemas.ts:4) and [Contact phone validation](lib/schemas.ts:45) check length only. Browser interception and actual-schema evaluation both reproduced acceptance. This does not claim FormSubmit would accept that payload live.

**Smallest recommended fix:** Normalize permitted phone formatting and require a plausible digit count, while allowing international prefixes and common separators. Retain the email-or-phone rule and field-specific errors; do not impose an India-only restriction unless intended.

### 6. Important — Public Privacy and Terms are still owner-review placeholders

**Route/reproduction:** Follow footer links to `/privacy` and `/terms` at any tested width.

**Expected / observed:** Reviewed company information appropriate to the active enquiry workflows. The headings explicitly say “Privacy content is not yet approved” and “Service terms are not yet approved.” They are linked publicly despite their `noindex` metadata. No approved provider/retention disclosures are supplied.

**Evidence/cause:** [Privacy page](app/(site)/privacy/page.tsx), [Terms page](app/(site)/terms/page.tsx), screenshots [Privacy](test-results/website-audit/1440-privacy.png) and [Terms](test-results/website-audit/1440-terms.png). These are deliberate unfinished pages, not broken links.

**Smallest recommended fix:** Have the owner supply/review the factual content for the current FormSubmit and SMTP workflows, then replace the placeholders. This audit supplies no legal opinion or invented policy.

### 7. Important — Admin detail reads execute before authorization/configuration is resolved

**Route/reproduction:** With no credentials or Supabase settings, navigate normally to `/admin/enquiries/00000000-0000-4000-8000-000000000001` and `/admin/support/00000000-0000-4000-8000-000000000001`.

**Expected / observed:** Redirect to login before privileged data access, without exceptions. The browser ultimately reaches `/admin/login`; the server logs **`TypeError: Cannot read properties of null (reading 'from')`** for both detail pages. Reproduced independently in the existing image suite and the audit server. Production error digests were `2559128189` and `1069323708`.

**Evidence/cause:** [Enquiry detail](app/admin/(protected)/enquiries/[id]/page.tsx:2) and [Support detail](app/admin/(protected)/support/[id]/page.tsx:2) use `createPrivilegedClient()!` and immediately call `.from()`. The TypeScript assertion does not check null at runtime. They rely on [the parent layout](app/admin/(protected)/layout.tsx:3), while [proxy.ts](proxy.ts:6) intentionally passes through when unconfigured. Installed Next documentation explicitly notes that layouts do not stop child route segments from executing: `node_modules/next/dist/docs/01-app/02-guides/authentication.md:1350`.

There is also a related authorization boundary gap in [adminRows/count](lib/admin-data.ts:1) and [Settings](app/admin/(protected)/settings/page.tsx): privileged reads have no local owner check. This warrants review before connecting private data. **No actual customer-data exposure was demonstrated; configured authorization/RSC behavior could not be tested.**

**Smallest recommended fix:** Await `requireOwner()` in each sensitive page or a shared protected data-access helper before any privileged read, and handle a missing client safely. Do not merely suppress the exception, bypass authentication, or add credentials to make the error disappear.

### 8. Important — Additional tablet viewport leaves the home hero image unloaded

**Route/reproduction:** The unchanged existing desktop visual test visits 1440×900, 1366×768, 1024×900, then **768×1024**. Run `tests/e2e/visual.spec.ts`; the assertion at line 15 fails at the final size. An independent browser diagnostic also found `complete=false`, `naturalWidth=0`, `currentSrc=""` at 768×1024 after six seconds.

**Expected / observed:** The same static hero asset should render at tablet sizes. Its element remains unloaded, while 1440px and the two requested mobile sizes render successfully. The browser requests the responsive `/_next/image?...w=2048&q=75` candidate. A direct local GET of the HTML fallback URL (`w=3840&q=75`, without browser image-format negotiation) returns **200**, `image/png`, 401,627 bytes. The source asset exists; that fallback response does not verify the failing responsive candidate. A separate GET of the exact `w=2048` candidate with browser image Accept headers timed out after **10.0 seconds with zero response bytes** (no HTTP status received).

**Evidence/files:** [Home Image declaration](app/(site)/page.tsx:9), [existing failing test](tests/e2e/visual.spec.ts:15), diagnostic [tablet screenshot](test-results/website-audit/768-hero-unloaded.png). The desktop test failed twice unchanged; the separate responsive diagnostic reproduced the state.

**Smallest recommended fix:** Investigate the optimizer response for the exact 2048px candidate with browser image Accept headers, alongside this Image's responsive source/preload selection, and correct only the demonstrated cause. Do not replace the static hero, animations, or asset, and do not relax the load assertion. The exact loading root cause remains unresolved in this audit.

### 9. Minor — Quote's optional email rejects whitespace-only input

**Route/reproduction:** Submit an otherwise valid Quote payload to the actual `enquirySchema.safeParse` in isolation, with `email="   "`. Compare with `email=""`.

**Expected / observed:** Both represent an empty optional field. Empty string succeeds; whitespace fails with `{email:"Invalid email address"}`. No network was used.

**Evidence/cause:** [Schema](lib/schemas.ts:13) applies email validation before the separate empty-literal alternative can accept the original whitespace input. Contact already has the correct normalization pattern at lines 43–44. This is a **Quote-only** leftover; Contact was not changed.

**Smallest recommended fix:** Normalize whitespace before deciding whether an optional email is empty, retaining full validation for supplied addresses.

### 10. Minor — Quote errors do not focus the first invalid field

**Route/reproduction:** On mobile `/get-a-quote`, enter an invalid email and intercept the response with the actual handler's 422-shaped field-error object, then activate Send quote request.

**Expected / observed:** Focus should move to the first invalid input while keeping the customer's text. Field errors appear, but `document.activeElement` remains `BODY` in the touch context; the first invalid Name input is approximately **1,304px above the viewport**. Inputs are preserved.

**Evidence/cause:** [EnquiryForm](components/forms/enquiry-form.tsx:30) stores errors but has no first-invalid focus logic; `noValidate` disables native browser focus behavior. [Screenshot](test-results/website-audit/quote-invalid-intercepted.png). This was an intercepted response, not a real submission.

**Smallest recommended fix:** Reuse the Contact form's field-error focus pattern after Quote receives validation errors; keep server validation and idempotency handling.

### 11. Minor — Quote can display success styling on an HTTP failure

**Route/reproduction:** Intercept `/api/enquiries` with HTTP 502 and `{ok:true,notificationStatus:"accepted",message:"AUDIT MOCK accepted"}`.

**Expected / observed:** A failed HTTP response should not render as a successful outcome. The customer sees the success-styled message (`class="form-status "`), although their inputs are retained. This is a **synthetic inconsistent-response regression**, not a response observed from the existing server handler.

**Evidence/cause:** [EnquiryForm](components/forms/enquiry-form.tsx:30) assigns the response body directly to result. HTTP status is checked for reset but not for message styling/acceptance.

**Smallest recommended fix:** Gate the displayed accepted state on both HTTP success and the expected acceptance contract, preserving uncertain/failure handling and entered data.

### 12. Minor — Contact copy promises saving that the current flow does not provide

**Route/reproduction:** Read the `/contact` hero before submitting anything.

**Expected / observed:** Copy should describe the direct-email flow without implying persistence. It says “Your message will be saved for the team to review.” Contact no longer saves or queues an application database record.

**Evidence/cause:** [Contact hero text](app/(site)/contact/page.tsx:19) remains from the old flow, while [SupportForm](components/forms/support-form.tsx:54) calls FormSubmit directly.

**Smallest recommended fix:** Change only the promise to accurate enquiry-processing wording, conditional on acceptance. Keep the hero composition, provider and official contact block intact.

### 13. Minor — Tracking shows the previous shipment during a new lookup

**Route/reproduction:** With GET responses intercepted, show synthetic `VKC-AUDITFIRST` as Delivered. Change the input to `VKC-AUDITSECOND` and hold its response for 2.5 seconds.

**Expected / observed:** The displayed shipment should not be mistaken for the new lookup. The button says “Checking…” while the old Delivered result remains visible beneath the new input. The old result does retain its own code, which limits the ambiguity. It disappears when the mocked unavailable response completes.

**Evidence/cause:** [TrackingForm](components/forms/tracking-form.tsx:7) sets pending without clearing or labelling the prior result. [Screenshot](test-results/website-audit/tracking-stale-intercepted.png). No real shipment was queried.

**Smallest recommended fix:** Clear the previous result at lookup start or explicitly label it as the previous lookup until the new response arrives.

### 14. Minor — Mobile admin login clips the logo

**Route/reproduction:** Open `/admin/login` directly at 390×844 and 360×800, scroll position zero.

**Expected / observed:** The whole company logo should be inside the page. Its top is **y=-7px**, so seven pixels are clipped; its transform is `none`. At 1440×900 the logo is fully visible.

**Evidence/cause:** [390 screenshot](test-results/website-audit/390-login-clipped.png), [360 screenshot](test-results/website-audit/360-login-clipped.png). [CSS](app/globals.css:399) gives the wrapper 22px top padding and the card a **-58px** top margin; card border/padding place the logo at -7px. The wrapper's [overflow hidden](app/globals.css:322) clips it. The obsolete overlap rules at lines 363/401 were designed around the former scene layout; the current [login background](app/admin/login/page.tsx:2) is absolutely positioned. The image-click controller does not transform logos.

**Smallest recommended fix:** Remove/adjust only the obsolete mobile negative card margin so normal flow contains the logo. Keep authentication and the static background unchanged.

## Enquiry workflows: code readiness versus delivery

| Item | Contact | Quote request |
| --- | --- | --- |
| Browser route | `/contact` | `/get-a-quote` |
| Current path | Direct POST `https://formsubmit.co/ajax/vkandcompanymohali@gmail.com` | POST `/api/enquiries` → `submitEnquiry` → Nodemailer SMTP, Node runtime |
| Recipient | Fixed endpoint inbox | Fixed server recipient `vkandcompanymohali@gmail.com` |
| Reply-To | Validated customer email in `_replyto`; omitted for phone-only contact | Validated email in `replyTo`; authorized configured From/envelope sender |
| Details | Name, email, phone, message, subject, optional shipment reference; fixed `_subject` “VK AND COMPANY — New Contact Enquiry” | Customer/contact, reference, route, contents, packages, weight/units, dimensions, dispatch date, instructions; escaped HTML and plain text |
| Persistence | None in application submission path | None; process-local deduplication only |
| Safeguards | Field validation, honeypot, field whitelist, immediate pending lock, 6 attempts/15 minutes per mounted form, 20-second timeout; no custom auto-reply or captcha-disabling override | Same-origin check, actual streamed 32KiB limit, 10-second body-read deadline, schema/honeypot, pending lock, bounded process-local rate/idempotency guards, authenticated TLS SMTP |
| Accepted outcome | HTTP success plus `success === true` or `"true"`; message explicitly denies inbox-delivery confirmation | Requires recipient acceptance and final SMTP 250; HTTP message explicitly denies inbox-delivery confirmation |
| Failure/retry | Inputs retained; no auto-retry; broad uncertain warning. No durable uncertain state after reload/navigation | Inputs/key retained; not-configured/rejected/uncertain distinguished. Known non-acceptance allows manual retry; ambiguous attempts remain process-cached. No durable retries/exactly-once guarantee |
| Audit verification | Browser requests intercepted; existing mock tests pass. **No real response, activation or delivery verified** | SMTP/server behavior covered by existing safe mocks; browser outcomes intercepted; configuration absent. **No live SMTP connection, acceptance or delivery verified** |

The retained `/api/support` SMTP endpoint and legacy database outbox are **not used by the current Contact form**. The legacy notification-transport adapter returns no live provider; that does not negate the separate direct Quote SMTP implementation. Neither enquiry flow should be reconnected to a database as an audit follow-up.

Official Contact details rendered correctly at all three requested widths, with exact destinations `mailto:vkandcompanymohali@gmail.com` and `tel:+919317724056`, displayed as `vkandcompanymohali@gmail.com` and `+91 93177 24056`. Customer fields start empty. Links were inspected, never activated.

## Missing configuration and unverified deployment work

Only variable names are listed; no secret values were read into the report.

- **Quote SMTP (all absent):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `NOTIFICATION_FROM_EMAIL`. Next action: owner configures the existing provider and authorized sender in server environment, then separately authorizes a single labelled end-to-end test. Do not infer inbox delivery from SMTP acknowledgement.
- **Admin/tracking/real quote review (absent):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus applied existing migrations and a provisioned owner identity. These are not prerequisites for Contact or Quote request emailing.
- **Production origin:** `NEXT_PUBLIC_SITE_URL` is absent. Local `/robots.txt` and `/sitemap.xml` therefore contain `http://localhost:3000` from the fallback. Set the confirmed deployed origin before deployment; no production domain was supplied or audited.
- **Quote deployment rate protection:** `ENQUIRY_TRUST_PROXY` is absent/default-off. The conservative shared bucket allows eight Quote attempts across all clients per 15 minutes per process. Isolated invocation with nine distinct forwarded IP strings returned eight `true`, then `false` (zero network traffic). Configure a trusted edge that overwrites client IP and prevents direct-origin access before enabling trust, or supply appropriate deployment-level limits. Do not simply trust arbitrary forwarded headers or disable safeguards. Contact's in-memory per-form limit is also not deployment-wide protection; provider-side spam controls/limits remain unverified.
- **FormSubmit:** no Gmail, SMTP or Supabase credentials are required by Contact. Actual endpoint activation, real browser response format, spam filtering and receiving-inbox delivery are unknown. No activation request was triggered.
- Quote and Tracking fetches have no explicit browser-side deadline (unlike Contact). Server SMTP/body deadlines exist, but prolonged intermediary/network stalls and offline recovery need dedicated follow-up validation. No automatic retry should be added for ambiguous email outcomes.
- Privacy/Terms require approved factual content. Database-backed settings/address/hours/courier integrations were not configured or verified. Pickup is explicitly unavailable; no live GPS, online payment or partner integration was treated as working.

## Coverage, checks and limits

| Route group | Result |
| --- | --- |
| `/`, `/services/domestic`, `/services/international`, `/about`, `/contact`, `/get-a-quote`, `/track`, `/faq`, `/privacy`, `/terms` | Rendered and inspected at all three requested sizes. All 10 distinct internal link destinations returned 200. Service links, header/footer navigation and direct navigation resolve. Privacy/Terms content remains unfinished. |
| `/admin/login` | Rendered without credentials at all three sizes; correct unconfigured notice, clipping reproduced; no sign-in performed. |
| `/admin`, `/admin/content`, `/admin/enquiries`, `/admin/enquiries/[id]`, `/admin/quotes`, `/admin/bookings`, `/admin/shipments`, `/admin/support`, `/admin/support/[id]`, `/admin/settings`, `/admin/audit` | Normal navigation redirected to login. Protected content and mutations **not tested**; detail-page server exceptions reproduced. |
| `/quote/[token]` | Synthetic well-formed token showed “Quote review is not configured.” Real offers, expiry, acceptance and bookings **not tested**. |
| `/robots.txt`, `/sitemap.xml` | Actual local 200; origin fallback noted above. |
| 404 | Existing image regression suite verifies the not-found state; it contains no images. |

**Existing checks, actual results:**

- `npm test`: **111/111 passed**, six files. These include mocked email/transport and source-based database-contract checks; they do not validate deployed database policies or real delivery.
- `npm run build`: **passed**. `npm run typecheck`: **passed**. `npm run lint`: **passed**.
- `npx playwright test --config=playwright.image-feedback.config.ts`: **45/45 passed**, at 1440, 390 and 360 widths. Includes active animation sampling/screenshots, repeated clicks, touch scroll/cancel, reduced motion, logo Enter/navigation, static foreground/container checks and cleanup. Existing static hero/image effects were preserved.
- Existing `public.spec.ts`, `contact-validation.spec.ts`, `visual.spec.ts` run unchanged via a temporary external runner pointing to the audit server: **27 passed, 1 failed**. The desktop visual failure at 768×1024 was rerun unchanged and **failed again**. It was not hidden by a longer timeout or a weaker assertion. Other existing tests retain their own additional viewport choices.
- Separate diagnostic browser inspection: **33 route/viewport combinations**, normal and enlarged-text screenshots; mocked Contact/Quote success, failure and loading states; true local Tracking 422/503; keyboard FAQ toggling; mobile menu focus to Domestic and Escape focus restoration at both mobile sizes, also checked with enlarged text.
- No uncaught page exception was observed in the 33-page scan. Focused normal/enlarged-text browser-console checks were clean. Resource failures during rapid navigation were Next RSC prefetch cancellations (`net::ERR_ABORTED`), not evidence of broken destination links; the hero-load failure is recorded separately. Server null-client exceptions were confirmed. Intentional mocked network errors are not production outages.

**Security observations, limited to inspectable paths:** SMTP credentials and the service-role client stay in `server-only` modules. Narrow scans found no private-key blocks, AWS-style access keys or hardcoded SMTP/service-role assignments in inspected application source/static JS; built browser chunks had no `SMTP_PASS`/`SUPABASE_SERVICE_ROLE_KEY` references. No real secrets were configured, so this cannot demonstrate how a future deployment packages them. Customer-provided email HTML is escaped; Contact's outgoing provider controls are whitelisted; React renders messages as text. Inspected admin mutation routes call `requireOwner` and same-origin checks; sensitive admin read paths have the gap in finding 7. Tracking selects public event fields and excludes test/archived shipments in source. Real customer data, deployed RLS policies, session expiry/revocation, CSP/edge/TLS configuration, provider accounts and configured partner URLs were not exercised. **This is not a complete security assessment or penetration test.**

Physical iOS/Android devices, Safari/Firefox, assistive-technology sessions, deployed network performance, live provider responses, inbox receipt, and authenticated admin operation remain outside verified coverage. No authentication was bypassed.

## Optional feature suggestions — not implemented

1. An owner-only integration-readiness panel that separates Contact activation evidence, Quote SMTP configuration and Tracking availability without revealing credentials.
2. A copy-tracking-code control alongside an actual verified result, to reduce transcription errors when asking the company for help.

Resolve the confirmed failures and missing configuration before adding these features. No deployment or remote push was performed.
