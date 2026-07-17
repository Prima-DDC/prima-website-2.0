"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Safety net for Supabase links that deliver tokens in the URL hash
 * (implicit flow fallback, e.g. when a redirect URL is not allow-listed
 * and Supabase falls back to the Site URL). Adopts the session into
 * cookies and forwards the user into the right onboarding flow.
 */
export function AuthHashHandler() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token=")) return;

    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (!accessToken || !refreshToken) return;

    const supabase = createSupabaseBrowserClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) return;
        window.history.replaceState(null, "", window.location.pathname);
        const next =
          type === "invite" || type === "recovery"
            ? "/portal/profile"
            : "/portal";
        window.location.assign(next);
      });
  }, []);

  return null;
}
