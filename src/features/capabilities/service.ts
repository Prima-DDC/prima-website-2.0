import "server-only";
import { redirect } from "next/navigation";
import { requireRole, type SessionProfile } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CAPABILITY_KEYS, type Capability } from "./config";

/** Capabilities held by a role (admin holds all). */
export async function getRoleCapabilities(role: string): Promise<Capability[]> {
  if (role === "admin") return [...CAPABILITY_KEYS];
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("role_capabilities")
    .select("capability")
    .eq("role", role);
  return (data ?? []).map((r) => r.capability as Capability);
}

export async function hasCapability(
  role: string,
  capability: Capability,
): Promise<boolean> {
  return (await getRoleCapabilities(role)).includes(capability);
}

/** Gate an admin feature page/action by a specific capability. */
export async function requireCapability(
  capability: Capability,
): Promise<SessionProfile> {
  const profile = await requireRole();
  if (!(await hasCapability(profile.role, capability))) redirect("/portal");
  return profile;
}

/** Gate the admin area: at least one management capability. */
export async function requireAnyCapability(): Promise<{
  profile: SessionProfile;
  capabilities: Capability[];
}> {
  const profile = await requireRole();
  const capabilities = await getRoleCapabilities(profile.role);
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
