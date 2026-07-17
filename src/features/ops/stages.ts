import "server-only";
import { redirect } from "next/navigation";
import { requireRole, type SessionProfile } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DOC_TYPES, type ApprovalStage, type DocType } from "./config";

export interface PermissionRow {
  role: string;
  doc_type: DocType;
  can_submit: boolean;
  can_approve: boolean;
}

/**
 * Everything needed to resolve per-request-type permissions in one load:
 * the ordered approver roster, the permission matrix, and role labels.
 */
export interface ApprovalContext {
  order: ApprovalStage[];
  perms: PermissionRow[];
  labelOf: (role: string) => string;
}

export async function getApprovalContext(): Promise<ApprovalContext> {
  const db = createSupabaseAdminClient();
  const [stages, perms, roles] = await Promise.all([
    db.from("approval_stages").select("role, sort").order("sort"),
    db.from("role_permissions").select("role, doc_type, can_submit, can_approve"),
    db.from("roles").select("key, label"),
  ]);
  const labels = new Map((roles.data ?? []).map((r) => [r.key, r.label]));
  const labelOf = (role: string) => labels.get(role) ?? role;
  return {
    order: (stages.data ?? []).map((s) => ({
      role: s.role,
      sort: s.sort,
      label: labelOf(s.role),
    })),
    perms: (perms.data ?? []) as PermissionRow[],
    labelOf,
  };
}

/** The ordered sign-off chain for one request type (approvers of that type). */
export function chainFor(ctx: ApprovalContext, docType: DocType): ApprovalStage[] {
  const approvers = new Set(
    ctx.perms.filter((p) => p.doc_type === docType && p.can_approve).map((p) => p.role),
  );
  return ctx.order.filter((s) => approvers.has(s.role));
}

export function submitTypesOf(ctx: ApprovalContext, role: string): DocType[] {
  return ctx.perms.filter((p) => p.role === role && p.can_submit).map((p) => p.doc_type);
}

export function approveTypesOf(ctx: ApprovalContext, role: string): DocType[] {
  return ctx.perms.filter((p) => p.role === role && p.can_approve).map((p) => p.doc_type);
}

/** Convenience single-type chain fetch. */
export async function chainForType(docType: DocType): Promise<ApprovalStage[]> {
  return chainFor(await getApprovalContext(), docType);
}

/** Request types the role may submit (admin included if granted). */
export async function getSubmittableTypes(role: string): Promise<DocType[]> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("role_permissions")
    .select("doc_type")
    .eq("role", role)
    .eq("can_submit", true);
  return (data ?? []).map((r) => r.doc_type as DocType);
}

/** Request types the role may approve (admin can approve everything). */
export async function getApprovableTypes(role: string): Promise<DocType[]> {
  if (role === "admin") return [...DOC_TYPES];
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("role_permissions")
    .select("doc_type")
    .eq("role", role)
    .eq("can_approve", true);
  return (data ?? []).map((r) => r.doc_type as DocType);
}

/** Gate for approval pages: admins or any role that approves at least one type. */
export async function requireApprover(): Promise<{
  profile: SessionProfile;
  approvableTypes: DocType[];
}> {
  const profile = await requireRole();
  const approvableTypes = await getApprovableTypes(profile.role);
  if (approvableTypes.length === 0) redirect("/portal");
  return { profile, approvableTypes };
}
