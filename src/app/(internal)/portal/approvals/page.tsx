import Link from "next/link";
import { APPROVER_ROLES, requireRole } from "@/features/auth/helpers";
import {
  APPROVAL_STAGES,
  DOC_CONFIG,
  nextStage,
  type DocType,
} from "@/features/ops/config";
import { getApprovalsMap } from "@/features/ops/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortalApprovalsPage() {
  const profile = await requireRole(...APPROVER_ROLES);

  const supabase = await createSupabaseServerClient();
  const { data: docs } = await supabase
    .from("ops_documents")
    .select("id, doc_type, doc_number, created_at, profiles:submitted_by (full_name, email)")
    .eq("status", "submitted")
    .order("created_at")
    .limit(200);
  const approvalsMap = await getApprovalsMap((docs ?? []).map((d) => d.id));

  const rows = (docs ?? []).map((doc) => {
    const stage = nextStage(approvalsMap.get(doc.id) ?? []);
    return {
      ...doc,
      stage,
      stageLabel: APPROVAL_STAGES.find((s) => s.role === stage)?.label ?? "-",
      yourTurn: stage !== null && (profile.role === "admin" || stage === profile.role),
    };
  });
  const actionable = rows.filter((r) => r.yourTurn).length;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Approvals</h1>
      <p className="mt-1 text-sm text-slate-body">
        {actionable > 0
          ? `${actionable} document${actionable === 1 ? "" : "s"} awaiting your sign-off.`
          : "Nothing is awaiting your sign-off right now."}
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          No documents are in review.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">Document</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Submitted by</th>
                  <th className="px-5 py-3 font-semibold">Awaiting</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((doc) => {
                  const submitter = doc.profiles as unknown as {
                    full_name: string | null;
                    email: string;
                  } | null;
                  return (
                    <tr key={doc.id} className="transition-colors hover:bg-mist/40">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/portal/approvals/${doc.id}`}
                          className="font-semibold text-brand hover:text-brand-dark"
                        >
                          {doc.doc_number}
                        </Link>
                        {doc.yourTurn ? (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                            Your turn
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-navy">
                        {DOC_CONFIG[doc.doc_type as DocType]?.title}
                      </td>
                      <td className="px-5 py-3.5 text-slate-body">
                        {submitter?.full_name || submitter?.email}
                      </td>
                      <td className="px-5 py-3.5 text-slate-body">{doc.stageLabel}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-body">
                        {new Date(doc.created_at).toLocaleString("en-GB")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
