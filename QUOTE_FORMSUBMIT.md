# Quote FormSubmit migration

The `/get-a-quote` browser form now posts JSON directly to
`https://formsubmit.co/ajax/vkandcompanymohali@gmail.com`, with `Accept` and
`Content-Type` set to `application/json`. This follows the
[official AJAX documentation](https://formsubmit.co/ajax-documentation).
The fixed subject is `VK AND COMPANY — New Quote Request`; `_replyto` is added
only for a validated customer email. No automatic customer reply is requested.

The payload explicitly lists customer details, route, contents, package count,
weight and units, dimensions and units, preferred date, pickup flag, and
instructions. Empty optional values are omitted; scalar false/zero values are
preserved. Arbitrary form fields cannot set recipients or provider controls.

The browser shares the existing enquiry field rules but does not require the
legacy API's submission UUID. The honeypot, 32 KiB payload limit, in-flight
duplicate guard, and eight-attempt/fifteen-minute session limit apply before
sending. Client guards can be bypassed and reset on reload; provider-side abuse
protection remains necessary. FormSubmit's CAPTCHA setting is not disabled.

Only a 2xx response with `success: true` or `success: "true"` resets the form.
An explicit negative acknowledgement below HTTP 500 is treated as rejection.
Missing or malformed acknowledgements, contradictory responses, network loss,
and the 20-second timeout are uncertain. Failures retain inputs. A manual retry
is available, but uncertain submissions instruct customers to check with the
company first. No automatic retry, durable queue, or exactly-once delivery is
promised. Provider acceptance does not verify inbox delivery or confirm a quote
or booking.

Quote requires no SMTP or Supabase environment variables. The old
`/api/enquiries`, SMTP code, admin/authentication and token-review routes are now
archived outside the active application. See CLOUDFLARE_PAGES.md for the approved
public-only static export. Older SMTP setup notes describe that
retained API, not the current Quote browser submission path. Contact is unchanged.

Verification commands:

```sh
npm test
npm run lint
npm run typecheck
npm run build
npx playwright test --config=playwright.quote-formsubmit.config.ts
```

The dedicated Playwright configuration starts a production server with SMTP
and Supabase variables unset. It intercepts all Quote POST requests, asserts
the exact destination and payload, and covers validation, empty optional fields,
duplicate clicks, rate limiting, rejection, malformed/contradictory responses,
network failure, timeout, and manual retry on desktop and mobile. Existing
Contact validation tests also run. Screenshots are saved under
`test-results/quote-formsubmit/`.

No live enquiry or activation request was sent. Live provider behaviour,
recipient activation status, and inbox delivery remain unverified. Any future
live test must be explicitly authorized and checked with the receiving company.
