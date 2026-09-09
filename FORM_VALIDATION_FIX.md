# Contact validation fix

## Source of the reported message

The exact text `Please correct the form.` came from `lib/submit-enquiry.ts` in the
`support_request` branch, returned as HTTP 422 by the retained `/api/support`
endpoint when `supportSchema` rejected input. It was an application validation
response before SMTP sending, not a FormSubmit activation response. The Quote
branch used a different message and still follows its existing SMTP flow.

The current Contact component posts directly to FormSubmit and does not call that
API or display its response. Consequently, the exact reported text cannot be
reproduced through the current Contact component. A previous client build could
have displayed it, but that is not verified: the original failing values/page or
screenshot were not supplied. The concrete current-form bug below was reproduced
independently, without assuming it explains the user's original input.

## Reproduction before the fix

In isolated Chromium, with every POST intercepted and non-local requests blocked:

1. Open `/contact`. Enter a valid name/email, Subject `Shipment question`, Message
   `Please explain the shipment route.`, and three spaces in optional Phone.
2. Click Send message. The visible error was `Please check phone: Enter a phone
   number with country code`. **Zero submission requests occurred.**
3. Clear Phone and enter `Hi` as Message. The form reported its hidden 10-character
   minimum. Again, **zero submission requests occurred**.
4. Restore the valid Message. Exactly one intercepted POST reached
   `https://formsubmit.co/ajax/vkandcompanymohali@gmail.com`.

The Phone root cause was `phone.optional().or(z.literal(""))`: the phone branch
trimmed spaces and then failed its minimum length, while the alternative checked
the original untrimmed value against an empty string. Optional Email had the same
schema construction. Thus semantically blank optional data was rejected despite
valid alternative contact details. Subject/Message had minimums (3/10 characters)
without useful field-level guidance. The browser also reused a legacy schema that
required an API-only idempotency key unrelated to FormSubmit.

A regression test for the spaces-only Phone was run before implementation and
failed because no request occurred; the same test now passes.

## Fix

- Normalize optional contact values before checking whether they are empty. Keep
  email-format, phone-length and at-least-one-contact-detail validation intact.
- Separate the visible Contact schema from the retained API's idempotency-key
  requirement. Keep that API's protection intact; do not send an obsolete key to
  FormSubmit.
- Display specific errors beside invalid fields, associate them using ARIA, and
  focus the first invalid visible field. Preserve every input. Use the existing
  field-error styling without changing the normal form layout.
- Use the shared schema for custom validation on submit (`noValidate` prevents
  native browser bubbles from preempting the accessible inline errors). Required
  fields, length limits, honeypot and submission-rate/click protection remain.
- Keep network/provider errors separate. Clear inputs only after both HTTP and
  FormSubmit success; never turn a failed request into success.
- The retained Contact API now returns the specific validation issue and its
  existing field-error map instead of the old generic message.

Recipient, FormSubmit AJAX URL, fixed email subject and validated customer
Reply-To are unchanged. No provider changes, SMTP restoration for Contact, Quote
migration, database changes, image edits or redesign were made.

## Files changed

- `components/forms/support-form.tsx`
- `lib/schemas.ts`
- `lib/submit-enquiry.ts` (Contact validation response only)
- `tests/contact-formsubmit.test.ts`
- `tests/contact-validation.test.ts`
- `tests/notifications.test.ts`
- `tests/e2e/contact-validation.spec.ts`
- `FORM_VALIDATION_FIX.md`

## Verification

- All 111 Vitest tests passed, including the failing-before-fix regression,
  optional empty/whitespace values, invalid email, minimum lengths, focus, input
  retention, provider failures and retained API validation responses.
- All 10 desktop/mobile Playwright checks passed with requests intercepted. These
  confirm actual browser submit behavior, focus and preserved inputs.
- Type checking, ESLint and the production build passed.

The in-app browser bootstrap failed; reproduction used isolated Playwright
Chromium instead. Every browser submission was mocked, as were unit-test provider
transports. No live emails or activation were triggered, and live delivery is not
verified. Nothing was deployed.
