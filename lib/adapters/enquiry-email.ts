import "server-only";
import { z } from "zod";
import type { NotificationEmail } from "./notification-transport";

export type EnquiryRecordType = "enquiry" | "support_request";

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export function buildEnquiryEmail(
  recordType: EnquiryRecordType,
  payload: Record<string, unknown>,
  recipient: string,
  from: string,
): NotificationEmail {
  // Bare validated addresses only; no customer display names in mail headers.
  const address = z.string().email().max(254);
  address.parse(recipient);
  address.parse(from);
  const replyTo = address.safeParse(payload.email);
  const value = (key: string) => payload[key] == null || payload[key] === ""
    ? "Not supplied" : String(payload[key]);
  const type = recordType === "enquiry" ? "Quote Request" : "Contact Enquiry";
  const reference = value("reference").replace(/[\r\n\x00-\x1f\x7f]/g, " ");
  const fields: [string, string][] = [
    ["Enquiry type", type], ["Reference", reference],
    ["Customer name", value("name")], ["Phone", value("phone")], ["Email", value("email")],
  ];
  if (recordType === "enquiry") {
    fields.push(
      ["Message / additional instructions", value("instructions")],
      ["Origin country", value("origin_country")], ["Origin city", value("origin_city")],
      ["Origin postal code", value("origin_postal_code")],
      ["Destination country", value("destination_country")], ["Destination city", value("destination_city")],
      ["Destination postal code", value("destination_postal_code")],
      ["Contents", value("contents_description")], ["Package count", value("package_count")],
      ["Approximate weight", `${value("approximate_weight")} ${value("weight_unit")}`],
      ["Dimensions", payload.dimensions ? `${value("dimensions")} ${value("dimension_unit")}` : "Not supplied"],
      ["Preferred dispatch date", value("preferred_dispatch_date")],
      ["Pickup requested", payload.pickup_requested === true ? "Yes" : "No"],
    );
  } else {
    fields.push(["Subject", value("subject")], ["Message", value("message")],
      ["Shipment reference", value("shipment_reference")]);
  }
  const subject = `VK AND COMPANY — New ${type} — ${reference}`;
  return {
    from, to: recipient, ...(replyTo.success ? { replyTo: replyTo.data } : {}), subject,
    text: `${subject}\n\n${fields.map(([label, content]) => `${label}: ${content}`).join("\n\n")}`,
    html: `<h1>${escapeHtml(subject)}</h1><dl>${fields.map(([label, content]) =>
      `<dt><strong>${escapeHtml(label)}</strong></dt><dd>${escapeHtml(content).replace(/\r?\n/g, "<br>")}</dd>`).join("")}</dl>`,
  };
}
