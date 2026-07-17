import { requireRole } from "@/features/auth/helpers";
import { getApprovalStages } from "@/features/ops/stages";
import { getRoles } from "@/features/roles/queries";
import { RolesManager } from "@/features/roles/RolesManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function RolesPage() {
  await requireRole("admin");

  const [roles, stages] = await Promise.all([getRoles(), getApprovalStages()]);

  const supabase = await createSupabaseServerClient();
  const { data: profiles } = await supabase.from("profiles").select("role");
  const memberCounts: Record<string, number> = {};
  for (const row of profiles ?? []) {
    memberCounts[row.role] = (memberCounts[row.role] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Roles & approval chain</h1>
      <p className="mt-1 text-sm text-slate-body">
        Manage workspace roles and configure which roles must sign off on
        requests, in sequence.
      </p>
      <div className="mt-8">
        <RolesManager roles={roles} stages={stages} memberCounts={memberCounts} />
      </div>
    </div>
  );
}
