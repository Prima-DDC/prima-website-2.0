import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "admin" | "employee" | "client";

export interface SessionProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
  };
}

/** Server-side gate for internal layouts/actions. Redirects when not allowed. */
export async function requireRole(...roles: Role[]): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  // MFA enforcement: a session that has not completed a required
  // authenticator challenge may not use the workspace.
  const supabase = await createSupabaseServerClient();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    redirect("/login/mfa");
  }

  if (roles.length > 0 && !roles.includes(profile.role)) {
    redirect(profile.role === "admin" ? "/admin" : "/portal");
  }
  return profile;
}
