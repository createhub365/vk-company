import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const phone = z.string().trim().min(7, "Enter a phone number with country code").max(32);
const country = z.string().trim().min(2).max(80);
const city = z.string().trim().min(2).max(120);
const postal = z.string().trim().min(2).max(20);

const enquiryFieldsSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    phone,
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
    originCountry: country,
    originCity: city,
    originPostalCode: postal,
    destinationCountry: country,
    destinationCity: city,
    destinationPostalCode: postal,
    contentsDescription: z.string().trim().min(5).max(1000),
    packageCount: z.coerce.number().int().min(1).max(1000),
    approximateWeight: z.coerce.number().positive().max(100_000),
    weightUnit: z.enum(["kg", "lb"]),
    dimensions: optionalText(160),
    dimensionUnit: z.enum(["cm", "in"]),
    preferredDispatchDate: z.string().date().optional().or(z.literal("")),
    pickupRequested: z.coerce.boolean().default(false),
    instructions: optionalText(2000),
    website: z.string().max(0).optional().default(""),
  });
const checkPickup = (value: { pickupRequested: boolean }, ctx: z.RefinementCtx) => {
    if (value.pickupRequested) {
      ctx.addIssue({ code: "custom", path: ["pickupRequested"], message: "Pickup requests are not currently enabled" });
    }
  };
export const enquirySchema = enquiryFieldsSchema.extend({ idempotencyKey: z.string().uuid() }).superRefine(checkPickup);
export const quoteFormSchema = enquiryFieldsSchema.extend({
  email: z.string().trim().pipe(z.string().email().max(254).or(z.literal(""))).optional(),
}).superRefine(checkPickup);

// Normalize before the empty-string alternative: optional spaces are empty,
// not a too-short phone number or an invalid email address.
const contactEmailFormat = z.string().email();
const contactFields = {
  name: z.string().trim().min(2, "Enter your name using at least 2 characters.").max(120, "Keep your name within 120 characters."),
  email: z.string().trim().max(254, "Keep your email address within 254 characters.")
    .refine(value => value === "" || contactEmailFormat.safeParse(value).success, "Enter a valid email address, such as name@example.com.").optional(),
  phone: z.string().trim().max(32, "Keep your phone number within 32 characters.")
    .refine(value => value === "" || value.length >= 7, "Enter a phone number with at least 7 characters, including the country code.").optional(),
  subject: z.string().trim().min(3, "Enter a subject with at least 3 characters.").max(160, "Keep your subject within 160 characters."),
  message: z.string().trim().min(10, "Enter a message with at least 10 characters.").max(3000, "Keep your message within 3000 characters."),
  shipmentReference: z.string().trim().max(64, "Keep the shipment reference within 64 characters.").optional(),
  website: z.string().max(0, "We could not validate this form. Please reload and try again.").optional().default(""),
};
const contactDetailsRequired = (value: { email?: string; phone?: string }) => Boolean(value.email || value.phone);
const contactDetailsError = { path: ["email"], message: "Enter an email address or phone number so we can reply." };

// The FormSubmit form validates only its actual fields. The retained server API
// still needs its idempotency key; do not impose that old requirement in the UI.
export const contactFormSchema = z.object(contactFields).refine(contactDetailsRequired, contactDetailsError);
export const supportSchema = z.object({
  ...contactFields,
  idempotencyKey: z.string().uuid("This form session is invalid. Refresh the page and try again."),
}).refine(contactDetailsRequired, contactDetailsError);

export const trackingEventSchema = z.object({
  shipmentId: z.string().uuid(),
  status: z.enum(["booked", "collected", "dispatched", "in_transit", "out_for_delivery", "delivery_attempted", "delivered", "delayed", "return_in_transit", "returned", "cancelled"]),
  description: z.string().trim().min(3).max(500),
  location: optionalText(160),
  occurredAt: z.string().datetime({ offset: true }),
});

export function zodErrors(error: z.ZodError) {
  return Object.fromEntries(error.issues.map((issue) => [issue.path.join("."), issue.message]));
}
