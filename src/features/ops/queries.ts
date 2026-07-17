import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApprovalRow } from "./config";

/** Approvals for one document, with approver names (RLS-scoped). */
export async function getApprovals(docId: string): Promise<ApprovalRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("ops_approvals")
    .select("stage, status, comment, created_at, profiles:approver (full_name, email)")
    .eq("doc_id", docId)
    .order("created_at");
  return (data ?? []).map((row) => {
    const approver = row.profiles as unknown as {
      full_name: string | null;
      email: string;
    } | null;
    return {
      stage: row.stage,
      status: row.status as "approved" | "rejected",
      comment: row.comment,
      created_at: row.created_at,
      approverName: approver?.full_name || approver?.email || "Unknown",
    };
  });
}

/** Stage/status pairs for many documents at once (queue views). */
export async function getApprovalsMap(
  docIds: string[],
): Promise<Map<string, Array<{ stage: string; status: string }>>> {
  const map = new Map<string, Array<{ stage: string; status: string }>>();
  if (docIds.length === 0) return map;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("ops_approvals")
    .select("doc_id, stage, status")
    .in("doc_id", docIds);
  for (const row of data ?? []) {
    const list = map.get(row.doc_id) ?? [];
    list.push({ stage: row.stage, status: row.status });
    map.set(row.doc_id, list);
  }
  return map;
}
