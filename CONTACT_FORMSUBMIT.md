# Contact form — FormSubmit AJAX

The existing Contact form now posts JSON directly from the browser to
`https://formsubmit.co/ajax/vkandcompanymohali@gmail.com`, using the official
[Fetch AJAX example](https://formsubmit.co/ajax-documentation).
Only the Contact form changed. The Quote form still uses its existing SMTP path.
The old `/api/support` endpoint is retained but is no longer called by the Contact
form. No SMTP, Gmail, Supabase credentials or environment variables are needed for
Contact. Existing SMTP settings continue to apply to Quote.

## Payload and behavior

The payload includes the original name, email, phone, subject, message and optional
shipment-reference fields. `_subject` is fixed to
`VK AND COMPANY — New Contact Enquiry`; `_replyto` uses the validated customer
email when supplied. Phone-only enquiries remain supported with no Reply-To.
The existing hidden Website field maps to FormSubmit's `_honey` honeypot.
These special fields follow the [official documentation](https://formsubmit.co/documentation).
No `_autoresponse`, CC, custom From, webhook, redirect or captcha-disable option
is sent. Only explicitly allowed fields are forwarded; inserted custom inputs
cannot override the configured recipient or special settings.

The component reuses the existing contact validation schema in the browser,
including limits, contact-detail requirements and honeypot validation. It retains
the original fields, markup and design. A synchronous lock and disabled button
prevent concurrent clicks. A 20-second timeout releases stalled requests. Errors
and unrecognized responses retain all inputs; no automatic retry occurs.

Both HTTP success and an explicit boolean/string `success=true` response are
required to clear the form. The message says FormSubmit accepted the enquiry for
processing, explicitly without claiming inbox delivery. Activation and actual
delivery must be checked independently. No server reference or saved database
record is claimed.

## Spam protection and limits

The honeypot, field validation and a six-attempt/15-minute limit per mounted form
discourage accidental abuse. Browser limits are bypassable and reset on reload;
they are not server-side rate limits or durable deduplication. Direct AJAX requests
do not pass through the application's SMTP rate limiter or its server validation.
FormSubmit owns receiving-end spam filtering; no setting disabling its default
protection is sent. Review provider filtering and monitor spam after activation.
The fixed recipient is visible in the browser, as expected for the documented
email-address AJAX endpoint. Website-only WAF rules cannot protect the provider's
public endpoint from direct requests.

If your hosting platform enforces Content Security Policy, allow
`https://formsubmit.co` in `connect-src`. Serve the page over HTTP(S), not `file://`.
Customer contact data is submitted to FormSubmit as an external service.

## Manual activation — owner action only

1. When ready, open the Contact page on the intended website through HTTP(S) and
   manually submit one clearly labelled setup enquiry using contact details you
   control. This first use can trigger the activation email.
2. Open **vkandcompanymohali@gmail.com**, check Inbox and Spam, and follow
   FormSubmit's confirmation/activation link.
3. After activation, manually submit a separate verification enquiry when you
   choose to test live sending. Check the actual receiving inbox, message details
   and Reply-To; an AJAX success response alone does not verify delivery.

FormSubmit explains this first-use confirmation flow in its
[setup guide](https://formsubmit.co/) and [activation help](https://formsubmit.co/help).
Do not repeatedly submit while waiting for activation; check Spam first. This
implementation has not submitted a live enquiry or initiated activation.

## Changed files and checks

- `components/forms/support-form.tsx`: Contact-only AJAX submission behavior.
- `tests/contact-formsubmit.test.ts`: mocked Contact payload, validation, errors,
  loading, timeout, activation-required response and spam-limit checks.
- `tests/enquiry-forms.test.ts`: retain Quote SMTP form tests; Contact tests now
  live in the dedicated FormSubmit suite.
- `README.md`, `EMAIL_INTEGRATION.md`, `CONTACT_FORMSUBMIT.md`: current integration
  scope and manual setup instructions.

All requests in the Contact tests are mocked, with SMTP and Supabase variables
unset. The tests cannot send email or activate FormSubmit. Existing Quote and
server-route tests remain in the suite. Live delivery and activation are unverified.

Local results on 2026-09-09: all 98 tests passed, including 21 dedicated Contact
FormSubmit cases. Type checking, ESLint and the production build also passed.
