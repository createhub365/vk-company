import { describe, expect, it } from "vitest";
import { buildQuotePayload, quoteFormSchema, quoteOutcome } from "@/lib/quote-formsubmit";
import { enquirySchema } from "@/lib/schemas";

const input = { name: "Test Customer", phone: "+91 9876543210", email: "customer@example.com",
  originCountry: "India", originCity: "Mohali", originPostalCode: "140301",
  destinationCountry: "India", destinationCity: "Delhi", destinationPostalCode: "110001",
  contentsDescription: "Printed documents", packageCount: "2", approximateWeight: "1.5",
  weightUnit: "kg", dimensions: "0", dimensionUnit: "cm", preferredDispatchDate: "2026-10-01",
  instructions: "Handle carefully\n<test> & retain literal text", website: "", pickupRequested: false };

describe("Quote FormSubmit contract", () => {
  it("reuses validation without imposing the old API key requirement", () => {
    expect(quoteFormSchema.safeParse(input).success).toBe(true);
    expect(enquirySchema.safeParse(input).success).toBe(false);
  });
  it.each([{ email: "invalid" }, { name: "x" }, { phone: "123" }, { packageCount: 0 },
    { approximateWeight: 0 }, { weightUnit: "ton" }, { dimensionUnit: "m" },
    { preferredDispatchDate: "bad" }, { website: "bot" }, { instructions: "x".repeat(2001) },
    { email: "customer@example.com\r\nBcc: attacker@example.com" }, { pickupRequested: true }])("rejects invalid input %j", invalid => {
    expect(quoteFormSchema.safeParse({ ...input, ...invalid }).success).toBe(false);
  });
  it("whitelists readable scalars, preserves false/zero text and excludes provider overrides", () => {
    const payload = buildQuotePayload(quoteFormSchema.parse({ ...input, _cc: "attacker@example.com", _autoresponse: "hello", recipient: "attacker@example.com" }));
    expect(payload).toMatchObject({ Dimensions: "0", "Pickup requested": "false", "Package count": "2",
      "Approximate weight": "1.5", Instructions: input.instructions, _replyto: input.email,
      _subject: "VK AND COMPANY — New Quote Request", _honey: "" });
    for (const key of ["_cc", "_autoresponse", "_captcha", "recipient", "idempotencyKey"]) expect(payload).not.toHaveProperty(key);
    expect(Object.values(payload).every(value => typeof value === "string")).toBe(true);
  });
  it("omits optional empty values and Reply-To", () => {
    const payload = buildQuotePayload(quoteFormSchema.parse({ ...input, email: "   ", dimensions: "", instructions: undefined, preferredDispatchDate: "" }));
    for (const key of ["email", "_replyto", "Dimensions", "Instructions", "Preferred dispatch date"]) expect(payload).not.toHaveProperty(key);
  });
  it.each([
    [200, { success: true }, "accepted"], [200, { success: "true" }, "accepted"],
    [200, { success: false }, "rejected"], [422, { success: "false" }, "rejected"],
    [503, { success: true }, "uncertain"], [503, { success: false }, "uncertain"],
    [200, {}, "uncertain"], [200, null, "uncertain"], [200, { success: "yes" }, "uncertain"],
  ])("classifies status %s and body %j conservatively", (status, body, outcome) => {
    expect(quoteOutcome(status as number, body)).toBe(outcome);
  });
});
