import "server-only";
import { createClient } from "@supabase/supabase-js";
import { hasSupabaseAdminConfig } from "@/lib/config";

export function createPrivilegedClient() {
  if (!hasSupabaseAdminConfig()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
