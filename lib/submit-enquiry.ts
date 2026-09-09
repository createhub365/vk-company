import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { enquirySchema, supportSchema, zodErrors } from "./schemas";
import { createReference } from "./references";
import { jsonError, sameOrigin } from "./http";
import { allowEnquiryRequest, EnquiryRequestError, guardEnquirySend, readEnquiryJson } from "./enquiry-guards";
import { sendEnquiryEmail } from "./adapters/enquiry-smtp";
import type { EnquiryRecordType } from "./adapters/enquiry-email";

export async function submitEnquiry(request: NextRequest, type: EnquiryRecordType) {
  if (!sameOrigin(request)) return jsonError("Request origin was not accepted.", 403);
  if (!allowEnquiryRequest(request.headers, type, type === "enquiry" ? 8 : 6)) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } });
  }
  let input: unknown;
  try { input = await readEnquiryJson(request); }
  catch (error) {
    if (error instanceof EnquiryRequestError) return jsonError(error.message, error.status);
    return jsonError("Invalid request body.", 400);
  }
  let key: string;
  let payload: Record<string, unknown>;
  if (type === "enquiry") {
    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success) return jsonError("Please correct the highlighted fields.", 422, zodErrors(parsed.error));
    const v = parsed.data;
    key = v.idempotencyKey;
    payload = {
      name: v.name, phone: v.phone, email: v.email || null,
      origin_country: v.originCountry, origin_city: v.originCity, origin_postal_code: v.originPostalCode,
      destination_country: v.destinationCountry, destination_city: v.destinationCity, destination_postal_code: v.destinationPostalCode,
      contents_description: v.contentsDescription, package_count: v.packageCount, approximate_weight: v.approximateWeight,
      weight_unit: v.weightUnit, dimensions: v.dimensions || null, dimension_unit: v.dimensionUnit,
      preferred_dispatch_date: v.preferredDispatchDate || null, pickup_requested: false, instructions: v.instructions || null,
    };
  } else {
    const parsed = supportSchema.safeParse(input);
    if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422, zodErrors(parsed.error));
    const v = parsed.data;
    key = v.idempotencyKey;
    payload = { name: v.name, email: v.email || null, phone: v.phone || null, subject: v.subject,
      message: v.message, shipment_reference: v.shipmentReference || null };
  }
  const result = await guardEnquirySend(`${type}/${key}`, payload, async () => {
    const reference = type === "enquiry" ? createReference("ENQ") : `SUP-${createReference("ENQ").slice(4)}`;
    const outcome = await sendEnquiryEmail(type, { ...payload, reference });
    if (outcome === "accepted") return { status: 200, body: { ok: true, reference, notificationStatus: outcome,
      message: "The sending server accepted your enquiry email. This does not confirm inbox delivery. Our team can respond using the contact details provided." } };
    if (outcome === "not_configured") return { status: 503, body: { ok: false, notificationStatus: outcome,
      message: "Email sending is not configured. Your enquiry was not sent, saved or queued. Please try again once the service is configured." } };
    if (outcome === "rejected") return { status: 502, body: { ok: false, notificationStatus: outcome,
      message: "The sending server did not accept your enquiry email. It was not saved or queued. Please try again later." } };
    return { status: 502, body: { ok: false, reference, notificationStatus: outcome,
      message: "We could not confirm sending. The email may have been accepted. Please check with the company before resubmitting; no automatic retry is scheduled." } };
  });
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
