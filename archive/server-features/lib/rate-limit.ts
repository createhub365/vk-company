import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export function requestFingerprint(headers: Headers) {
  const raw = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return raw.slice(0, 100);
}

export async function checkRateLimit(db: SupabaseClient, bucket: string, fingerprint: string, max = 8) {
  const { data, error } = await db.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_fingerprint: fingerprint,
    p_limit: max,
    p_window_seconds: 900,
  });
  if (error) throw new Error("Rate limit service unavailable");
  return Boolean(data);
}
