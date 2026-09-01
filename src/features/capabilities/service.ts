import "server-only";
import { redirect } from "next/navigation";
import { requireRole, type SessionProfile } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CAPABILITY_KEYS, type Capability } from "./config";

/** Capabilities held across a set of roles (admin holds all). */
export async function getRoleCapabilities(
  roles: string[],
): Promise<Capability[]> {
  if (roles.includes("admin")) return [...CAPABILITY_KEYS];
  if (roles.length === 0) return [];
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("role_capabilities")
    .select("capability")
    .in("role", roles);
  return [...new Set((data ?? []).map((r) => r.capability as Capability))];
}

export async function hasCapability(
  roles: string[],
  capability: Capability,
): Promise<boolean> {
  return (await getRoleCapabilities(roles)).includes(capability);
}

/** Gate an admin feature page/action by a specific capability. */
export async function requireCapability(
  capability: Capability,
): Promise<SessionProfile> {
  const profile = await requireRole();
  if (!(await hasCapability(profile.roles, capability))) redirect("/portal");
  return profile;
}

/** Gate the admin area: at least one management capability. */
export async function requireAnyCapability(): Promise<{
  profile: SessionProfile;
  capabilities: Capability[];
}> {
  const profile = await requireRole();
  const capabilities = await getRoleCapabilities(profile.roles);
  if (capabilities.length === 0) redirect("/portal");
  return { profile, capabilities };
}

/** Full role -> capabilities map for the admin configuration screen. */
export async function getCapabilityMatrix(): Promise<Record<string, Capability[]>> {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("role_capabilities").select("role, capability");
  const matrix: Record<string, Capability[]> = {};
  for (const row of data ?? []) {
    (matrix[row.role] ??= []).push(row.capability as Capability);
  }
  return matrix;
}
