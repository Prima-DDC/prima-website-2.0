import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Roles are database-driven (public.roles); admin/employee/client are built in. */
export type Role = string;

export interface SessionProfile {
  id: string;
  email: string;
  fullName: string | null;
  /** The primary (most-privileged) role, for display and default routing. */
  role: Role;
  /** Every role the user holds; the basis for all access decisions. */
  roles: Role[];
  photoPath: string | null;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, photo_path, profile_roles (role)")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  const memberships = (profile.profile_roles ?? []) as Array<{ role: string }>;
  // The primary role is always part of the set (guaranteed by a DB trigger),
  // but fall back to it defensively if the join comes back empty.
  const roles = memberships.length
    ? [...new Set(memberships.map((m) => m.role))]
    : [profile.role];

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
    roles: roles as Role[],
    photoPath: profile.photo_path,
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

  if (roles.length > 0 && !roles.some((r) => profile.roles.includes(r))) {
    redirect(profile.roles.includes("admin") ? "/admin" : "/portal");
  }
  return profile;
}
