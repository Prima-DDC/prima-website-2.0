import { CAPABILITIES } from "@/features/capabilities/config";
import {
  getCapabilityMatrix,
  requireCapability,
} from "@/features/capabilities/service";
import { DOC_CONFIG, DOC_TYPES } from "@/features/ops/config";
import { getApprovalContext } from "@/features/ops/stages";
import { getRoles } from "@/features/roles/queries";
import {
  RolesManager,
  type PermissionMatrix,
} from "@/features/roles/RolesManager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function RolesPage() {
  await requireCapability("manage_roles");

  const [roles, ctx, capabilityMatrix] = await Promise.all([
    getRoles(),
    getApprovalContext(),
    getCapabilityMatrix(),
  ]);

  const supabase = await createSupabaseServerClient();
  const { data: profiles } = await supabase.from("profiles").select("role");
  const memberCounts: Record<string, number> = {};
  for (const row of profiles ?? []) {
    memberCounts[row.role] = (memberCounts[row.role] ?? 0) + 1;
  }

  const matrix: PermissionMatrix = {};
  for (const role of roles) matrix[role.key] = { submit: [], approve: [] };
  for (const perm of ctx.perms) {
    const entry = (matrix[perm.role] ??= { submit: [], approve: [] });
    if (perm.can_submit) entry.submit.push(perm.doc_type);
    if (perm.can_approve) entry.approve.push(perm.doc_type);
  }

  const docTypes = DOC_TYPES.map((key) => ({ key, label: DOC_CONFIG[key].title }));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Roles & permissions</h1>
      <p className="mt-1 text-sm text-slate-body">
        Manage workspace roles and configure, per request type, who may submit
        and who must approve.
      </p>
      <div className="mt-8">
        <RolesManager
          roles={roles}
          stages={ctx.order}
          memberCounts={memberCounts}
          docTypes={docTypes}
          matrix={matrix}
          capabilities={CAPABILITIES.map((c) => ({
            key: c.key,
            label: c.label,
            description: c.description,
          }))}
          capabilityMatrix={capabilityMatrix}
        />
      </div>
    </div>
  );
}
