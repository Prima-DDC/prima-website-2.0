import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ColumnConfig } from "./columns";

const KEY = "list_columns";

/** The stored per-view column selection (empty object when never configured). */
export async function getColumnConfig(): Promise<ColumnConfig> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("ops_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();
  return (data?.value as ColumnConfig) ?? {};
}

export async function saveColumnConfig(config: ColumnConfig): Promise<void> {
  const db = createSupabaseAdminClient();
  await db.from("ops_settings").upsert(
    { key: KEY, value: config, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
}
