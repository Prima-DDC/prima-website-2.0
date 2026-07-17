"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser client sharing the same cookie session as the server. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
