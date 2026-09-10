import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type Mail from "nodemailer/lib/mailer";

vi.mock("server-only", () => ({}));
const smtp = vi.hoisted(() => ({ createTransport: vi.fn(), sendMail: vi.fn(), close: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: smtp.createTransport } }));
// A regression that imports a database/outbox dependency fails immediately.
vi.mock("@/lib/supabase/admin", () => { throw new Error("Supabase forbidden in enquiry handlers"); });
vi.mock("@/lib/adapters/notifications", () => { throw new Error("Outbox forbidden in enquiry handlers"); });
vi.mock("@/lib/rate-limit", () => { throw new Error("Database rate limiter forbidden in enquiry handlers"); });
import { POST as quotePost } from "@/app/api/enquiries/route";
import { POST as contactPost } from "@/app/api/support/route";
import { buildEnquiryEmail } from "@/lib/adapters/enquiry-email";
import { ENQUIRY_BODY_LIMIT } from "@/lib/enquiry-guards";

const customer = { name: 'Asha <script>alert("x")</script> & Co', phone: "+91 9876543210", email: "customer@example.com", website: "" };
const quote = {
  ...customer, originCountry: "India", originCity: "Mohali", originPostalCode: "160055",
  destinationCountry: "Canada", destinationCity: "Toronto", destinationPostalCode: "M5V 2T6",
  contentsDescription: 'Books & <fragile> "papers"', packageCount: 2, approximateWeight: 3.5,
  weightUnit: "kg", dimensions: "30 x 20 x 10", dimensionUnit: "cm",
  preferredDispatchDate: "2026-10-01", pickupRequested: false, instructions: "Handle <carefully>\nCall on arrival",
};
const contact = { ...customer, subject: "Shipment <question>", message: "Please call & explain <the route>.", shipmentReference: "VKC-TEST123456" };
const cases = [
  { label: "quote", post: quotePost, input: quote, type: "enquiry" as const, title: "Quote Request" },
  { label: "contact", post: contactPost, input: contact, type: "support_request" as const, title: "Contact Enquiry" },
];
const smtpKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "NOTIFICATION_FROM_EMAIL"];
const acceptance = { accepted: ["vkandcompanymohali@gmail.com"], rejected: [], response: "250 2.0.0 Mock accepted", messageId: "memory-only" };
function request(input: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/enquiries", { method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000", ...headers }, body: JSON.stringify(input) });
}
beforeEach(() => {
  vi.stubGlobal("__vkcEnquiryGuards", undefined);
  for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) vi.stubEnv(name, undefined);
  const config = ["smtp.example.com", "587", "false", "mock-user", "mock-password", "notifications@example.com"];
  smtpKeys.forEach((name, index) => vi.stubEnv(name, config[index]));
  vi.stubEnv("ENQUIRY_TRUST_PROXY", "false");
  smtp.sendMail.mockReset().mockResolvedValue(acceptance);
  smtp.close.mockReset();
  smtp.createTransport.mockReset().mockReturnValue({ sendMail: smtp.sendMail, close: smtp.close });
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network forbidden in SMTP unit tests"); }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe.each(cases)("$label direct SMTP submission (Supabase unset)", ({ post, input, type, title }) => {
  it("sends required details with fixed recipient, approved From, Reply-To and escaped HTML/text", async () => {
    const response = await post(request({ ...input, idempotencyKey: randomUUID(), recipient: "attacker@example.com",
      from: "attacker@example.com", replyTo: "attacker@example.com", headers: { Bcc: "attacker@example.com" } }));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result).toMatchObject({ ok: true, notificationStatus: "accepted" });
    expect(result.message).toContain("sending server accepted");
    expect(result.message).toContain("does not confirm inbox delivery");
    expect(smtp.sendMail).toHaveBeenCalledTimes(1);
    const email = smtp.sendMail.mock.calls[0][0] as Mail.Options;
    expect(email).toMatchObject({ from: "notifications@example.com", to: "vkandcompanymohali@gmail.com", replyTo: customer.email,
      envelope: { from: "notifications@example.com", to: ["vkandcompanymohali@gmail.com"] },
      subject: `VK AND COMPANY — New ${title} — ${result.reference}` });
    expect(email.text).toContain(customer.name);
    expect(email.text).toContain(customer.phone);
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).not.toContain("<script>");
    expect(JSON.stringify(email)).not.toContain("attacker@example.com");
    expect(email).not.toHaveProperty("headers");
    if (type === "enquiry") {
      for (const detail of ["India", "Mohali", "160055", "Canada", "Toronto", "M5V 2T6", quote.contentsDescription,
        "Package count: 2", "3.5 kg", "30 x 20 x 10 cm", "2026-10-01", quote.instructions, "Pickup requested: No"]) expect(email.text).toContain(detail);
    } else {
      for (const detail of [contact.subject, contact.message, contact.shipmentReference]) expect(email.text).toContain(detail);
    }
    expect(smtp.createTransport).toHaveBeenCalledWith(expect.objectContaining({ secure: false, requireTLS: true,
      logger: false, debug: false, pool: false, disableFileAccess: true, disableUrlAccess: true,
      tls: { minVersion: "TLSv1.2", rejectUnauthorized: true } }));
    expect(smtp.close).toHaveBeenCalledTimes(1);
  });

  it("omits Reply-To for a phone-only enquiry", async () => {
    expect((await post(request({ ...input, email: "", idempotencyKey: randomUUID() }))).status).toBe(200);
    expect(smtp.sendMail.mock.calls[0][0]).not.toHaveProperty("replyTo");
  });

  it.each([{ name: "" }, { email: "bad-address" }, { email: "customer@example.com\r\nBcc: attacker@example.com" },
    { website: "bot.example" }, { idempotencyKey: "bad-key" }])("rejects invalid inputs before SMTP", async invalid => {
    expect((await post(request({ ...input, idempotencyKey: randomUUID(), ...invalid }))).status).toBe(422);
    expect(smtp.createTransport).not.toHaveBeenCalled();
  });

  it.each(smtpKeys)("reports missing %s honestly without sending", async name => {
    vi.stubEnv(name, undefined);
    const response = await post(request({ ...input, idempotencyKey: randomUUID() }));
    const result = await response.json();
    expect(response.status).toBe(503);
    expect(result).toMatchObject({ ok: false, notificationStatus: "not_configured" });
    expect(result.message).toContain("not sent, saved or queued");
    expect(smtp.createTransport).not.toHaveBeenCalled();
  });

  it.each([{ SMTP_PORT: "invalid" }, { SMTP_PORT: "0" }, { SMTP_SECURE: "yes" },
    { NOTIFICATION_FROM_EMAIL: "sender@example.com\r\nBcc: attacker@example.com" }])("rejects invalid SMTP config", async config => {
    for (const [name, value] of Object.entries(config)) vi.stubEnv(name, value);
    expect((await post(request({ ...input, idempotencyKey: randomUUID() }))).status).toBe(503);
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });

  it("awaits SMTP acceptance and coalesces concurrent/repeated identical submissions", async () => {
    let accept!: (value: typeof acceptance) => void;
    smtp.sendMail.mockReturnValue(new Promise(resolve => { accept = resolve; }));
    const payload = { ...input, idempotencyKey: randomUUID() };
    let returned = false;
    const first = post(request(payload)).then(response => { returned = true; return response.json(); });
    await vi.waitFor(() => expect(smtp.sendMail).toHaveBeenCalledTimes(1));
    const second = post(request(payload)).then(response => response.json());
    expect(returned).toBe(false);
    accept(acceptance);
    const [one, two] = await Promise.all([first, second]);
    expect(one.reference).toBe(two.reference);
    expect(one.ok).toBe(true);
    expect((await (await post(request(payload))).json()).reference).toBe(one.reference);
    expect(smtp.sendMail).toHaveBeenCalledTimes(1);
  });

  it("rejects altered payloads reusing an accepted submission key", async () => {
    const payload = { ...input, idempotencyKey: randomUUID() };
    await post(request(payload));
    expect((await post(request({ ...payload, name: "Different Customer" }))).status).toBe(409);
    expect(smtp.sendMail).toHaveBeenCalledTimes(1);
  });

  it("allows an explicit retry after a definite SMTP rejection; never schedules retries", async () => {
    smtp.sendMail.mockRejectedValueOnce(Object.assign(new Error("mock-secret must not leak"), { responseCode: 550, command: "DATA" }));
    const payload = { ...input, idempotencyKey: randomUUID() };
    const response = await post(request(payload));
    const result = await response.json();
    expect(response.status).toBe(502);
    expect(result).toMatchObject({ ok: false, notificationStatus: "rejected" });
    expect(result.message).toContain("not saved or queued");
    expect(JSON.stringify(result)).not.toContain("mock-secret");
    expect(smtp.sendMail).toHaveBeenCalledTimes(1);
    expect((await post(request(payload))).status).toBe(200);
    expect(smtp.sendMail).toHaveBeenCalledTimes(2);
  });

  it.each([{ code: "ETIMEDOUT", command: "DATA" }, { code: "ECONNECTION", command: "CONN" }])("retains an uncertain outcome and never resends it on repeated clicks", async error => {
    smtp.sendMail.mockRejectedValueOnce(Object.assign(new Error("lost SMTP response"), error));
    const payload = { ...input, idempotencyKey: randomUUID() };
    const result = await (await post(request(payload))).json();
    expect(result).toMatchObject({ ok: false, notificationStatus: "uncertain" });
    expect(result.message).toContain("may have been accepted");
    expect((await (await post(request(payload))).json()).notificationStatus).toBe("uncertain");
    expect(smtp.sendMail).toHaveBeenCalledTimes(1);
  });

  it.each([{ accepted: [], response: "250 OK" }, { accepted: ["wrong@example.com"], response: "250 OK" },
    { accepted: ["vkandcompanymohali@gmail.com"], response: "" }])("never claims acceptance without a valid SMTP receipt", async result => {
    smtp.sendMail.mockResolvedValue({ ...acceptance, ...result });
    expect((await (await post(request({ ...input, idempotencyKey: randomUUID() }))).json()).ok).toBe(false);
  });

  it("rejects cross-origin requests", async () => {
    expect((await post(request({ ...input, idempotencyKey: randomUUID() }, { origin: "https://attacker.example" }))).status).toBe(403);
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });

  it("enforces rate limits even when callers spoof forwarded IPs", async () => {
    const limit = type === "enquiry" ? 8 : 6;
    for (let index = 0; index < limit; index++) {
      await post(request({}, { "x-forwarded-for": `192.0.2.${index + 1}` }));
    }
    const response = await post(request({ ...input, idempotencyKey: randomUUID() }));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("900");
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });

  it("rejects oversized streamed bodies even with a dishonest Content-Length", async () => {
    const response = await post(request({ ...input, message: "x".repeat(ENQUIRY_BODY_LIMIT), idempotencyKey: randomUUID() }, { "content-length": "1" }));
    expect(response.status).toBe(413);
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });

  it("rejects oversized declared bodies, malformed JSON and wrong media types", async () => {
    expect((await post(request({}, { "content-length": String(ENQUIRY_BODY_LIMIT + 1) }))).status).toBe(413);
    const malformed = new NextRequest("http://localhost:3000", { method: "POST", body: "{", headers: { "content-type": "application/json" } });
    expect((await post(malformed)).status).toBe(400);
    expect((await post(request({}, { "content-type": "text/plain" }))).status).toBe(415);
    expect(smtp.sendMail).not.toHaveBeenCalled();
  });
});

it("supports configured implicit TLS", async () => {
  vi.stubEnv("SMTP_PORT", "465"); vi.stubEnv("SMTP_SECURE", "true");
  await quotePost(request({ ...quote, idempotencyKey: randomUUID() }));
  expect(smtp.createTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true, requireTLS: false }));
});

it("returns the exact failed Contact field from the retained API instead of the old generic message", async () => {
  const response = await contactPost(request({ ...contact, message: "Hi", idempotencyKey: randomUUID() }));
  expect(response.status).toBe(422);
  expect(await response.json()).toMatchObject({ ok: false,
    message: "Enter a message with at least 10 characters.",
    fields: { message: "Enter a message with at least 10 characters." } });
  expect(smtp.sendMail).not.toHaveBeenCalled();
});

it("revalidates Reply-To and escapes all HTML metacharacters in the reused template", () => {
  const email = buildEnquiryEmail("support_request", { name: `&<>"'`, email: "bad\r\nheader", reference: "SUP-123\r\nBcc: bad",
    message: "<img src=x onerror=alert(1)>" }, "vkandcompanymohali@gmail.com", "notifications@example.com");
  expect(email).not.toHaveProperty("replyTo");
  expect(email.subject).not.toMatch(/[\r\n]/);
  expect(email.html).toContain("&amp;&lt;&gt;&quot;&#39;");
  expect(email.html).not.toContain("<img");
});
