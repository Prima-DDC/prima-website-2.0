import "server-only";
import { redirect } from "next/navigation";
import { requireRole, type SessionProfile } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ApprovalStage } from "./config";

/** The configured sign-off chain, in order. */
export async function getApprovalStages(): Promise<ApprovalStage[]> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("approval_stages")
    .select("role, sort, roles (label)")
    .order("sort");
  return (data ?? []).map((row) => ({
    role: row.role,
    sort: row.sort,
    label:
      (row.roles as unknown as { label: string } | null)?.label ?? row.role,
  }));
}

/** Gate for approval pages: admins or any role in the configured chain. */
export async function requireApprover(): Promise<{
  profile: SessionProfile;
  stages: ApprovalStage[];
}> {
  const profile = await requireRole();
  const stages = await getApprovalStages();
  if (profile.role !== "admin" && !stages.some((s) => s.role === profile.role)) {
    redirect("/portal");
  }
  return { profile, stages };
}
