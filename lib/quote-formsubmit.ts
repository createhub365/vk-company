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
