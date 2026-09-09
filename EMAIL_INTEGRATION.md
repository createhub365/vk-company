# Quote SMTP and the retained support API

**Current Contact form:** uses FormSubmit AJAX directly; see
[Contact setup and manual activation](CONTACT_FORMSUBMIT.md). It no longer calls
`/api/support` and needs no SMTP or Supabase configuration. The SMTP documentation
below applies to the unchanged Quote flow and the retained support API only.

`POST /api/enquiries` and `POST /api/support` run in the Node.js runtime and send
straight through Nodemailer SMTP. Neither path imports Supabase, database rate
limiting, persistence or the outbox. They work with all Supabase variables unset.
Existing database tables, migrations, outbox code, authentication, tracking and
admin workflows are retained. New public submissions do **not** appear in the
admin enquiry/support lists. References identify emails, not saved records.

The shared submission handler validates and maps only allowed form fields into
the existing `buildEnquiryEmail()` template. It includes customer name/contact
information, enquiry type/reference, message/instructions and submitted shipment
details. HTML is escaped and a plain-text body is included.

The server-only recipient constant in `lib/adapters/enquiry-smtp.ts` is
`vkandcompanymohali@gmail.com`. The SMTP envelope uses the same fixed recipient.
Customers cannot set recipients, From, envelope, Bcc or arbitrary headers. From
comes from the configured authorized sender; Reply-To is the validated customer
email when supplied. Customer addresses are never used as the SMTP login or From.

## Required private configuration

All six settings must be configured on the server:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `NOTIFICATION_FROM_EMAIL`

`.env.example` documents these names and non-secret port/TLS defaults. No
`.env.local` was created or overwritten. Use your SMTP provider's authorized
credentials and a sender address it permits. The receiving Gmail address does not
by itself authorize sending from Gmail or supply SMTP credentials.

Use port 465 with `SMTP_SECURE=true` for implicit TLS, or port 587 with
`SMTP_SECURE=false` for mandatory STARTTLS. Authentication is required; certificate
verification stays enabled. File/URL access and SMTP debug logging are disabled.
Connection/greeting timeouts are 10 seconds, DNS timeout 5 seconds and idle socket
timeout 15 seconds. Configure a Node.js hosting request budget of at least 60
seconds, outbound access to the provider's SMTP port, and an ingress body timeout.
See the [Nodemailer SMTP documentation](https://nodemailer.com/smtp).

`NOTIFICATION_TRANSPORT` belongs to the retained legacy outbox code and has no
effect on these forms. No Supabase keys, API email provider or database migration
is needed for direct sending. No SMTP credentials are included in source files.

## Responses, failures and duplicate protection

The handler awaits `sendMail()`. Success requires the fixed envelope recipient in
Nodemailer's accepted list, no rejected recipients and a final SMTP `250` response.
The response explicitly says that the sending server accepted the email; it does
not claim receiving-inbox delivery. No `verify()` call or mock capture is treated
as a live send.

Missing/invalid configuration returns HTTP 503; definite SMTP non-acceptance
returns HTTP 502. Both responses say the enquiry was not saved or queued. Form
inputs and the submission key are retained, and the user can retry manually.

A timeout, dropped connection or other ambiguous outcome returns an honest HTTP
502 warning: the email may already have been accepted. There is **no automatic
resend**. Matching attempts on that process receive the same uncertain result
for 15 minutes. Check with the company before resubmitting. Even Nodemailer's
`CONN` error command can occur after DATA, so it is not treated as proof that the
message was never sent. Raw SMTP errors/credentials are not logged or returned.

The forms use a synchronous submission lock plus a disabled pending button.
Server memory coalesces concurrent identical submissions, replays accepted
results for 15 minutes and rejects changed data using the same key with HTTP 409.
Known non-acceptance permits a subsequent manual attempt. There is no database,
durable retry queue or exactly-once guarantee: restarts, multiple instances,
expired memory or a new key can allow duplicates. SMTP Message-ID is not a durable
idempotency mechanism. Completed entries retain only a content digest and a
generic result, not the email body. Inputs remain in the current page on failures;
refreshing/navigating away may lose them.

## Database-free spam safeguards and deployment requirements

- Existing Zod field validation and honeypots remain active, as do origin checks.
- JSON-only bodies are capped at 32 KiB by actual streamed bytes, regardless of
  Content-Length. Body reads have a 10-second deadline.
- In-memory fixed-window limits: 8 quote and 6 contact requests per 15 minutes per
  client bucket, plus 100 requests across both forms per process per 15 minutes.
  Invalid requests count too. At most 5 sends are in progress on a process.
- Memory maps are capped at 2,000 entries and expired entries are cleaned up as
  requests arrive. Capacity exhaustion fails closed.
- `ENQUIRY_TRUST_PROXY=false` is the safe default: client IP headers are ignored,
  and visitors share conservative limits. Enable `ENQUIRY_TRUST_PROXY=true` only
  when a trusted ingress **overwrites** X-Forwarded-For with one verified client
  IP and prevents direct origin access. Appended/multiple or invalid IPs fall back
  to the shared bucket. Do not trust user-supplied forwarded headers.
- Before public deployment, enforce edge/WAF rate limits and bot filtering on
  both POST paths, cap request size/time at ingress and set SMTP sending quotas.
  In-memory limits are per process and reset on restart; they are not distributed
  abuse protection. Configure `NEXT_PUBLIC_SITE_URL` to the official HTTPS origin.

## Verification and scope

Automated tests exercise both actual handlers and the SMTP adapter with a mocked
Nodemailer transport, with all three Supabase variables explicitly unset. Imports
of the database client, database rate limiter and outbox fail these tests. They
check fixed recipient/envelope, content, escaping, sender/Reply-To, validation,
missing/invalid SMTP configuration, awaited acceptance, definite rejection,
ambiguous failure, duplicate requests, rate limiting, body limits and TLS options.
React DOM tests check both forms retain inputs/keys after failures, prevent
immediate duplicate clicks, and clear inputs only after accepted success.

These are safe mock/DOM tests, not verified live email delivery. No live test
emails, production database changes or deployment have been performed.

Actual local results (2026-09-09): all 82 tests passed; TypeScript, ESLint and
the production build passed. The build also ran with Supabase variables unset.
A scan of the generated browser bundles found no SMTP configuration names or
the server-only receiving-inbox constant. Only `.env.example` exists; all six
required SMTP settings are absent from the process environment. Configure them
privately with the chosen SMTP provider before any authorized live test.

## Files changed in this update

- `app/api/enquiries/route.ts`, `app/api/support/route.ts`: Node.js handlers delegate to direct email submission.
- `lib/submit-enquiry.ts`: shared validation, field mapping and honest SMTP responses.
- `lib/enquiry-guards.ts`: body limits, process-local spam and duplicate safeguards.
- `lib/adapters/enquiry-smtp.ts`: authenticated Nodemailer SMTP and fixed recipient.
- `components/forms/enquiry-form.tsx`, `components/forms/support-form.tsx`: immediate duplicate-click locks and honest failure handling.
- `tests/notifications.test.ts`: replace database-dependent form tests with direct SMTP tests.
- `tests/enquiry-forms.test.ts`: input retention and submission-state tests.
- `package.json`, `package-lock.json`: Nodemailer dependency (includes its own TypeScript types).
- `.env.example`: required private SMTP settings and optional trusted-proxy setting.
- `README.md`, `EMAIL_INTEGRATION.md`: updated setup, behavior and limitations.

Existing safe email templates are reused unchanged. Design, images, animations,
database files and unrelated functionality are unchanged. This workspace has no
Git repository, so this list records the edits rather than a Git diff.
