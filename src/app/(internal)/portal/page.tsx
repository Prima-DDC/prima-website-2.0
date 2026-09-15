import { FilePlus2 } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/features/auth/helpers";
import { getSubmittableTypes } from "@/features/ops/stages";
import {
  DOC_CONFIG,
  DOC_TYPES,
  documentTotal,
  formatMoney,
  type DocStatus,
  type DocType,
} from "@/features/ops/config";
import { COLUMN_LABELS, columnsFor } from "@/features/ops/columns";
import { getColumnConfig } from "@/features/ops/columns-store";
import { StatusBadge } from "@/features/ops/StatusBadge";
import {
  ListToolbar,
  filterSelectClass,
  matchesQuery,
} from "@/features/internal/ListToolbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
}) {
  const profile = await requireRole();
  const { q, type, status } = await searchParams;
  const canSubmit = (await getSubmittableTypes(profile.roles)).length > 0;
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("ops_documents")
    .select("id, doc_type, doc_number, status, created_at, data")
    .order("created_at", { ascending: false })
    .limit(100);
  if (type) query = query.eq("doc_type", type);
  if (status) query = query.eq("status", status);
  const { data: allDocs } = await query;
  const docs = (allDocs ?? []).filter((d) =>
    matchesQuery(q, d.doc_number, DOC_CONFIG[d.doc_type as DocType]?.title),
  );
  const hasDocs = (allDocs ?? []).length > 0;
  const cols = columnsFor(await getColumnConfig(), "my_documents");

  const cell = (doc: (typeof docs)[number], key: string) => {
    const data = (doc.data ?? {}) as Record<string, unknown>;
    switch (key) {
      case "type":
        return DOC_CONFIG[doc.doc_type as DocType]?.title ?? doc.doc_type;
      case "status":
        return <StatusBadge status={doc.status as DocStatus} />;
      case "submitted":
        return (
          <span className="text-xs text-slate-body">
            {new Date(doc.created_at).toLocaleString("en-GB")}
          </span>
        );
      case "total": {
        const total = documentTotal(doc.doc_type as DocType, data);
        return total != null
          ? formatMoney(total, String(data.currency ?? "GHS"))
          : "";
      }
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Welcome, {profile.fullName || profile.email}
          </h1>
          <p className="mt-1 text-sm text-slate-body">
            Submit and track your requests and documents.
          </p>
        </div>
        {canSubmit ? (
          <Link
            href="/portal/new"
            className="inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden />
            New request
          </Link>
        ) : null}
      </div>

      {!hasDocs ? (
        <div className="mt-10 rounded-lg border border-dashed border-line bg-white p-12 text-center">
          <FilePlus2 className="mx-auto h-10 w-10 text-brand" aria-hidden />
          <p className="mt-4 font-semibold text-navy">No documents yet</p>
          <p className="mt-1 text-sm text-slate-body">
            {canSubmit
              ? "Start by creating your first request."
              : "Documents you are involved in will appear here."}
          </p>
        </div>
      ) : (
        <>
          <ListToolbar action="/portal" q={q} placeholder="Search by number or type">
            <select name="type" defaultValue={type ?? ""} className={filterSelectClass}>
              <option value="">All types</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{DOC_CONFIG[t].title}</option>
              ))}
            </select>
            <select name="status" defaultValue={status ?? ""} className={filterSelectClass}>
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </ListToolbar>
          {docs.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
              No documents match your search.
            </div>
          ) : (
          <>
          {/* Mobile card list */}
          <ul className="mt-6 space-y-3 sm:hidden">
            {docs.map((doc) => (
              <li key={doc.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/portal/${doc.id}`}
                    className="font-semibold text-brand hover:text-brand-dark"
                  >
                    {doc.doc_number}
                  </Link>
                  <StatusBadge status={doc.status as DocStatus} />
                </div>
                <p className="mt-1 text-sm text-navy">
                  {DOC_CONFIG[doc.doc_type as DocType]?.title ?? doc.doc_type}
                </p>
                <p className="mt-1 text-xs text-slate-body">
                  {new Date(doc.created_at).toLocaleString("en-GB")}
                </p>
              </li>
            ))}
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
                {docs.map((doc) => (
                  <tr key={doc.id} className="transition-colors hover:bg-mist/40">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/portal/${doc.id}`}
                        className="font-semibold text-brand hover:text-brand-dark"
                      >
                        {doc.doc_number}
                      </Link>
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
        </>
      )}
    </div>
  );
}
