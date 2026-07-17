import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface RoleRow {
  key: string;
  label: string;
  sort: number;
  builtIn: boolean;
}

export async function getRoles(): Promise<RoleRow[]> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("roles")
    .select("key, label, sort, built_in")
    .order("sort");
  return (data ?? []).map((row) => ({
    key: row.key,
    label: row.label,
    sort: row.sort,
    builtIn: row.built_in,
  }));
}

export async function roleExists(key: string): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("roles").select("key").eq("key", key).maybeSingle();
  return Boolean(data);
}
