import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free anon client for public content reads (safe inside static
 * rendering). Returns null when Supabase env vars are not configured so
 * callers can fall back to bundled content.
 */
export function createPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
