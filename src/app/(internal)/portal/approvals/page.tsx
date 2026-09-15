import Link from "next/link";
import { DOC_CONFIG, DOC_TYPES, nextStage, type DocType } from "@/features/ops/config";
import { chainFor, getApprovalContext, requireApprover } from "@/features/ops/stages";
import { getApprovalsMap } from "@/features/ops/queries";
import { COLUMN_LABELS, columnsFor } from "@/features/ops/columns";
import { getColumnConfig } from "@/features/ops/columns-store";
import { DOC_LIST_SELECT, renderDocCell, type DocListRow } from "@/features/ops/doc-cell";
import {
  ListToolbar,
  filterSelectClass,
  matchesQuery,
} from "@/features/internal/ListToolbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortalApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { profile, approvableTypes } = await requireApprover();
  const { q, type } = await searchParams;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("ops_documents")
    .select(DOC_LIST_SELECT)
    .eq("status", "submitted")
    .order("created_at")
    .limit(200);
  // Approvers only see request types they are configured to review.
  if (!profile.roles.includes("admin")) {
    query = query.in("doc_type", approvableTypes);
  }
  if (type) query = query.eq("doc_type", type);
  const { data: docs } = await query;

  const [approvalsMap, ctx] = await Promise.all([
    getApprovalsMap((docs ?? []).map((d) => d.id)),
    getApprovalContext(),
  ]);

  const rows = (docs ?? []).map((doc) => {
    const chain = chainFor(ctx, doc.doc_type as DocType);
    const stage = nextStage(approvalsMap.get(doc.id) ?? [], chain);
    return {
      ...doc,
      stageLabel: stage?.label ?? "-",
      yourTurn:
        stage !== null &&
        (profile.roles.includes("admin") || profile.roles.includes(stage.role)),
    };
  });
  const actionable = rows.filter((r) => r.yourTurn).length;
  const shown = rows.filter((r) => {
    const submitter = (r as unknown as DocListRow).submitter;
    return matchesQuery(
      q,
      r.doc_number,
      DOC_CONFIG[r.doc_type as DocType]?.title,
      submitter?.full_name,
      submitter?.email,
    );
  });
  const typeOptions = DOC_TYPES.filter(
    (t) => profile.roles.includes("admin") || approvableTypes.includes(t),
  );
  const cols = columnsFor(await getColumnConfig(), "portal_approvals");

  // "awaiting" is computed here; every other column is shared.
  const cell = (row: (typeof shown)[number], key: (typeof cols)[number]) =>
    key === "awaiting"
      ? row.stageLabel
      : renderDocCell(key, row as unknown as DocListRow);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Approvals</h1>
      <p className="mt-1 text-sm text-slate-body">
        {actionable > 0
          ? `${actionable} document${actionable === 1 ? "" : "s"} awaiting your sign-off.`
          : "Nothing is awaiting your sign-off right now."}
      </p>

      {rows.length > 0 ? (
        <ListToolbar action="/portal/approvals" q={q} placeholder="Search by number, type, or submitter">
          <select name="type" defaultValue={type ?? ""} className={filterSelectClass}>
            <option value="">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{DOC_CONFIG[t].title}</option>
            ))}
          </select>
        </ListToolbar>
      ) : null}

      {shown.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          {rows.length === 0 ? "No documents are in review." : "No documents match your search."}
        </p>
      ) : (
        <>
          {/* Mobile card list */}
          <ul className="mt-6 space-y-3 sm:hidden">
            {shown.map((doc) => {
              const submitter = (doc as unknown as DocListRow).submitter;
              return (
                <li key={doc.id} className="rounded-lg border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/portal/approvals/${doc.id}`}
                      className="font-semibold text-brand hover:text-brand-dark"
                    >
                      {doc.doc_number}
                    </Link>
                    {doc.yourTurn ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                        Your turn
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-navy">
                    {DOC_CONFIG[doc.doc_type as DocType]?.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-body">
                    {submitter?.full_name || submitter?.email} | Awaiting {doc.stageLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-body">
                    {new Date(doc.created_at).toLocaleString("en-GB")}
                  </p>
                </li>
              );
            })}
          </ul>

          {/* Desktop table */}
          <div className="mt-8 hidden overflow-hidden rounded-lg border border-line bg-white sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">Document</th>
                  {cols.map((c) => (
                    <th key={c} className="px-5 py-3 font-semibold">
                      {COLUMN_LABELS[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((doc) => (
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
                    {cols.map((c) => (
                      <td key={c} className="px-5 py-3.5 text-navy">
                        {cell(doc, c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
