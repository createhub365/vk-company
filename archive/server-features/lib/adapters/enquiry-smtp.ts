import "server-only";
import nodemailer from "nodemailer";
import { z } from "zod";
import { buildEnquiryEmail, type EnquiryRecordType } from "./enquiry-email";

export const ENQUIRY_RECIPIENT = "vkandcompanymohali@gmail.com";

const smtpSchema = z.object({
  host: z.string().trim().min(1).max(253).regex(/^[a-z0-9][a-z0-9.-]*$/i),
  port: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(65535)),
  secure: z.enum(["true", "false"]).transform(value => value === "true"),
  user: z.string().trim().min(1),
  pass: z.string().min(1),
  from: z.string().trim().email().max(254),
});

export type SmtpOutcome = "accepted" | "not_configured" | "rejected" | "uncertain";

export async function sendEnquiryEmail(
  type: EnquiryRecordType,
  payload: Record<string, unknown>,
): Promise<SmtpOutcome> {
  const config = smtpSchema.safeParse({
    host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER, pass: process.env.SMTP_PASS, from: process.env.NOTIFICATION_FROM_EMAIL,
  });
  if (!config.success) return "not_configured";
  const { host, port, secure, user, pass, from } = config.data;
  // Explicit TLS or mandatory STARTTLS; never downgrade or bypass certificates.
  const transport = nodemailer.createTransport({
    host, port, secure, requireTLS: !secure, forceAuth: true, auth: { user, pass },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    pool: false, logger: false, debug: false,
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000, dnsTimeout: 5_000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  try {
    const email = buildEnquiryEmail(type, payload, ENQUIRY_RECIPIENT, from);
    const result = await transport.sendMail({ ...email, envelope: { from, to: [ENQUIRY_RECIPIENT] } });
    // Final SMTP DATA acceptance, not receiving-inbox delivery.
    const accepted = result.accepted.some(address => address.toLowerCase() === ENQUIRY_RECIPIENT);
    return accepted && result.rejected.length === 0 && /^250(?:[ -]|$)/.test(result.response || "")
      ? "accepted" : "uncertain";
  } catch (error) {
    const smtpError = error as { code?: string; responseCode?: number; command?: string } | null;
    // A negative SMTP response or known pre-DATA failure permits a manual retry.
    // A lost DATA acknowledgement may mean the server accepted the message.
    if (smtpError && ((smtpError.responseCode && smtpError.responseCode >= 400 && smtpError.responseCode < 600)
      || ["EAUTH", "EDNS", "EENVELOPE"].includes(smtpError.code || ""))) return "rejected";
    return "uncertain";
  } finally {
    transport.close();
  }
}
