import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { buildEnquiryEmail, type EnquiryRecordType } from "./enquiry-email";
import { getNotificationTransport } from "./notification-transport";

export type NotificationKind = "enquiry_acknowledgement" | "quote_ready" | "booking_confirmation" | "tracking_update";

export async function queueNotification(
  db: SupabaseClient,
  input: { kind: NotificationKind; recipient?: string | null; recordType: string; recordId: string; payload: Record<string, unknown> },
) {
  const { error } = await db.from("notification_outbox").insert({
    kind: input.kind,
    recipient: input.recipient || null,
    record_type: input.recordType,
    record_id: input.recordId,
    payload: input.payload,
    transport: "outbox",
    status: "pending_configuration",
  });
  return { queued: !error, status: error ? "record_failed" : "pending_configuration" } as const;
}

// Owner notifications are queued transactionally by the enquiry INSERT triggers.
// Use the saved snapshot, never a duplicate request's possibly altered payload.
export async function dispatchOwnerNotification(
  db: SupabaseClient,
  recordType: EnquiryRecordType,
  recordId: string,
  retry = false,
) {
  try {
    const { data: row, error } = await db.from("notification_outbox")
      .select("id,recipient,payload,status,attempts,next_attempt_at")
      .eq("kind", "enquiry_owner_notification").eq("record_type", recordType)
      .eq("record_id", recordId).maybeSingle();
    if (error || !row) return { status: "record_failed" };
    if (row.status !== "pending_configuration" && !(retry && row.status === "failed")) {
      return { status: row.status as string };
    }
    if (row.next_attempt_at && new Date(row.next_attempt_at).getTime() > Date.now()) {
      return { status: row.status as string };
    }

    const transport = getNotificationTransport();
    const from = z.string().email().max(254).safeParse(process.env.NOTIFICATION_FROM_EMAIL);
    if (!transport || !from.success) {
      const { error: updateError } = await db.from("notification_outbox").update({
        status: "pending_configuration",
        last_error: !transport ? "transport_not_configured" : "sender_not_configured",
        updated_at: new Date().toISOString(),
      }).eq("id", row.id).eq("status", row.status).eq("attempts", row.attempts);
      return { status: updateError ? "record_failed" : "pending_configuration" };
    }

    // Atomic compare-and-set prevents concurrent duplicate submissions/retries
    // from both sending. A crash leaves 'processing' for manual reconciliation;
    // never automatically resend a message with an unknown provider outcome.
    const { data: claim, error: claimError } = await db.from("notification_outbox").update({
      status: "processing", attempts: row.attempts + 1, transport: transport.name,
      last_error: null, next_attempt_at: null, updated_at: new Date().toISOString(),
    }).eq("id", row.id).eq("status", row.status).eq("attempts", row.attempts).select("id").maybeSingle();
    if (claimError) return { status: "record_failed" };
    if (!claim) return { status: "processing" };

    let result: { status: string; provider_message_id?: string; last_error: string | null; next_attempt_at: string | null };
    try {
      const email = buildEnquiryEmail(recordType, row.payload, row.recipient, from.data);
      const receipt = await transport.send(email, `owner-notification/${row.id}`);
      if (!receipt.messageId || !["accepted", "test_captured"].includes(receipt.status)) {
        throw new Error("Invalid transport receipt");
      }
      result = { status: receipt.status, provider_message_id: receipt.messageId, last_error: null, next_attempt_at: null };
    } catch {
      // Do not persist/log raw provider errors: they can contain credentials or PII.
      result = { status: "failed", last_error: "notification_dispatch_failed",
        next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString() };
    }
    const { error: recordError } = await db.from("notification_outbox").update({
      ...result, updated_at: new Date().toISOString(),
    }).eq("id", row.id).eq("status", "processing").eq("attempts", row.attempts + 1);
    return { status: recordError ? "record_failed" : result.status };
  } catch {
    // Persistence has already succeeded. The durable outbox row survives a
    // database/network outage and can be inspected/retried by the owner.
    return { status: "record_failed" };
  }
}

// Server-only entry point for a future approved worker/manual retry. No public
// retry endpoint, timer or live provider is installed by this integration.
export async function retryOwnerNotifications(db: SupabaseClient) {
  const { data, error } = await db.from("notification_outbox")
    .select("record_type,record_id").eq("kind", "enquiry_owner_notification")
    .in("status", ["pending_configuration", "failed"])
    .or(`next_attempt_at.is.null,next_attempt_at.lte.${new Date().toISOString()}`)
    .order("created_at").limit(20);
  if (error) return { status: "record_failed", results: [] };
  const results = [];
  for (const row of data || []) {
    if (row.record_type === "enquiry" || row.record_type === "support_request") {
      results.push(await dispatchOwnerNotification(db, row.record_type, row.record_id, true));
    }
  }
  return { status: "processed", results };
}
