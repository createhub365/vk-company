import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";

export const ENQUIRY_BODY_LIMIT = 32 * 1024;
const WINDOW_MS = 15 * 60_000;
const MAX_ENTRIES = 2000;

export class EnquiryRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// Count streamed bytes, including missing or dishonest Content-Length.
export async function readEnquiryJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new EnquiryRequestError(415, "Please submit the form as JSON.");
  }
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > ENQUIRY_BODY_LIMIT)) {
    throw new EnquiryRequestError(413, "The request is too large. Please shorten your message.");
  }
  if (!request.body) throw new EnquiryRequestError(400, "Invalid request body.");
  const reader = request.body.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new EnquiryRequestError(408, "The request timed out before sending. Please retry.")), 10_000);
  });
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      size += value.byteLength;
      if (size > ENQUIRY_BODY_LIMIT) throw new EnquiryRequestError(413, "The request is too large. Please shorten your message.");
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    void reader.cancel().catch(() => {});
    if (error instanceof EnquiryRequestError) throw error;
    throw new EnquiryRequestError(400, "Invalid request body.");
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

export type EnquiryResult = {
  status: number;
  body: { ok: boolean; message: string; reference?: string; notificationStatus?: string };
};
type Attempt = { digest: string; expires: number; pending: boolean; result: Promise<EnquiryResult> };
type GuardState = { rates: Map<string, { count: number; expires: number }>; attempts: Map<string, Attempt>; active: number };
const processGlobal = globalThis as typeof globalThis & { __vkcEnquiryGuards?: GuardState };
function state() {
  return processGlobal.__vkcEnquiryGuards ??= { rates: new Map(), attempts: new Map(), active: 0 };
}

export function allowEnquiryRequest(headers: Headers, type: string, limit: number) {
  const { rates } = state();
  const now = Date.now();
  for (const [key, value] of rates) if (value.expires <= now) rates.delete(key);
  // Opt in only when a deployment proxy OVERWRITES this header and blocks
  // direct origin access. Otherwise use a conservative shared bucket.
  const forwarded = process.env.ENQUIRY_TRUST_PROXY === "true" ? headers.get("x-forwarded-for")?.trim() : undefined;
  const ip = forwarded && isIP(forwarded) ? forwarded : "shared";
  const fingerprint = createHash("sha256").update(ip).digest("hex");
  const keys = [{ key: "global", limit: 100 }, { key: `${type}/${fingerprint}`, limit }];
  for (const { key, limit: maximum } of keys) {
    const entry = rates.get(key);
    if ((entry && entry.count >= maximum) || (!entry && rates.size >= MAX_ENTRIES)) return false;
  }
  for (const { key } of keys) {
    const entry = rates.get(key);
    if (entry) entry.count++;
    else rates.set(key, { count: 1, expires: now + WINDOW_MS });
  }
  return true;
}

// Process-local deduplication only. Completed entries contain a digest and a
// generic response, not customer content. No queue or automatic retries.
export async function guardEnquirySend(
  key: string, payload: unknown, send: () => Promise<EnquiryResult>,
): Promise<EnquiryResult> {
  const current = state();
  const now = Date.now();
  for (const [id, entry] of current.attempts) {
    if (!entry.pending && entry.expires <= now) current.attempts.delete(id);
  }
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const existing = current.attempts.get(key);
  if (existing) {
    if (existing.digest !== digest) return { status: 409, body: { ok: false,
      message: "This submission has already been attempted with different details. Please check its sending status before starting a new enquiry." } };
    return existing.result;
  }
  if (current.attempts.size >= MAX_ENTRIES || current.active >= 5) {
    return { status: 429, body: { ok: false, message: "The enquiry service is busy. Please wait before trying again." } };
  }
  current.active++;
  const entry: Attempt = { digest, expires: now + WINDOW_MS, pending: true,
    result: Promise.resolve().then(send).catch((): EnquiryResult => ({ status: 502, body: { ok: false,
      notificationStatus: "uncertain", message: "We could not confirm sending. The email may have been accepted. Please check with the company before resubmitting." } })) };
  current.attempts.set(key, entry);
  try {
    const result = await entry.result;
    // Only known non-acceptance permits another manual attempt.
    if (result.body.notificationStatus === "rejected" || result.body.notificationStatus === "not_configured") {
      current.attempts.delete(key);
    }
    return result;
  } finally {
    entry.pending = false;
    entry.expires = Date.now() + WINDOW_MS;
    current.active--;
  }
}
