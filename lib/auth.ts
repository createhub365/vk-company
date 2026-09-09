import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/admin";

export type Owner = { id: string; email?: string };

export async function getOwner(): Promise<Owner | null> {
  const auth = await createSupabaseServerClient();
  const db = createPrivilegedClient();
  if (!auth || !db) return null;
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user) return null;
  const { data: role } = await db
    .from("admin_users")
    .select("auth_user_id, active")
    .eq("auth_user_id", data.user.id)
    .eq("active", true)
    .maybeSingle();
  if (!role) return null;
  return { id: data.user.id, email: data.user.email };
}

export async function requireOwner() {
  const owner = await getOwner();
  if (!owner) redirect("/admin/login");
  return owner;
}
