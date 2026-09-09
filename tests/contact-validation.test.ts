import { describe, expect, it } from "vitest";
import { contactFormSchema, supportSchema } from "@/lib/schemas";
const fields = { name: "Test Customer", email: "customer@example.com", phone: "", subject: "Shipment question", message: "Please explain the shipment route.", shipmentReference: "", website: "" };

describe("Contact visible-field contract", () => {
  it("does not require the old SMTP/database submission key", () => {
    expect(contactFormSchema.safeParse(fields).success).toBe(true);
    expect(contactFormSchema.safeParse({ ...fields, idempotencyKey: "obsolete" }).success).toBe(true);
    // Preserve the retained API's duplicate-submission requirement.
    expect(supportSchema.safeParse(fields).success).toBe(false);
  });
  it.each([undefined, "", "   "])("accepts an optional empty Phone (%s) with valid Email", phone => {
    const result = contactFormSchema.safeParse({ ...fields, phone });
    expect(result.success).toBe(true);
  });
  it.each([undefined, "", "   "])("accepts an optional empty Email (%s) with valid Phone", email => {
    expect(contactFormSchema.safeParse({ ...fields, email, phone: "+91 9876543210" }).success).toBe(true);
  });
  it("rejects both empty contact details after trimming", () => {
    const result = contactFormSchema.safeParse({ ...fields, email: "   ", phone: "   " });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]).toMatchObject({ path: ["email"], message: "Enter an email address or phone number so we can reply." });
  });
});
