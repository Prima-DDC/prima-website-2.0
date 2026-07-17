import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Handles Supabase email links (invite, recovery, magic link, email change,
 * signup confirmation). The email templates link here with token_hash + type
 * so verification happens server-side and the session lands in cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  // Only same-origin relative paths are honored.
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      const fallback =
        type === "invite" || type === "recovery" ? "/portal/profile" : "/portal";
      return NextResponse.redirect(new URL(next ?? fallback, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=link-expired", request.url),
  );
}
