import { FilePlus2 } from "lucide-react";
import Link from "next/link";
import {
  DOC_CONFIG,
  DOC_TYPES,
  documentTotal,
  formatMoney,
  nextStage,
  type DocStatus,
  type DocType,
} from "@/features/ops/config";
import {
  ListToolbar,
  filterSelectClass,
  matchesQuery,
} from "@/features/internal/ListToolbar";
import {
  chainFor,
  getApprovalContext,
  getSubmittableTypes,
} from "@/features/ops/stages";
import { getApprovalsMap } from "@/features/ops/queries";
import { COLUMN_LABELS, columnsFor } from "@/features/ops/columns";
import { getColumnConfig } from "@/features/ops/columns-store";
import { StatusBadge } from "@/features/ops/StatusBadge";
import { getSessionProfile } from "@/features/auth/helpers";
import { requireCapability } from "@/features/capabilities/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// stageProgress uses the chain configured for that request type.

const TABS: Array<{ value: string; label: string }> = [
  { value: "submitted", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default async function OpsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; type?: string }>;
}) {
  await requireCapability("manage_documents");
  const { status = "submitted", q, type } = await searchParams;
  const profile = await getSessionProfile();
  const canSubmit =
    !!profile && (await getSubmittableTypes(profile.roles)).length > 0;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("ops_documents")
    .select("id, doc_type, doc_number, status, created_at, data, profiles:submitted_by (full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  if (type) query = query.eq("doc_type", type);
  const { data: allDocs } = await query;
  const docs = (allDocs ?? []).filter((d) => {
    const submitter = d.profiles as unknown as {
      full_name: string | null;
      email: string;
    } | null;
    return matchesQuery(
      q,
      d.doc_number,
      DOC_CONFIG[d.doc_type as DocType]?.title,
      submitter?.full_name,
      submitter?.email,
    );
  });
  const [approvalsMap, ctx] = await Promise.all([
    getApprovalsMap((docs ?? []).map((d) => d.id)),
    getApprovalContext(),
  ]);
  const stageProgress = (docType: DocType, status: string, approvals: Array<{ stage: string; status: string }>) => {
    if (status !== "submitted") return "-";
    const chain = chainFor(ctx, docType);
    const stage = nextStage(approvals, chain);
    const done = approvals.filter((a) => a.status === "approved").length;
    return stage ? `${done}/${chain.length}, awaiting ${stage.label}` : "-";
  };
  const cols = columnsFor(await getColumnConfig(), "admin_ops");

  const cell = (doc: (typeof docs)[number], key: string) => {
    const submitter = doc.profiles as unknown as {
      full_name: string | null;
      email: string;
    } | null;
    const data = (doc.data ?? {}) as Record<string, unknown>;
    switch (key) {
      case "type":
        return DOC_CONFIG[doc.doc_type as DocType]?.title;
      case "submitter":
        return submitter?.full_name || submitter?.email;
      case "status":
        return <StatusBadge status={doc.status as DocStatus} />;
      case "stage":
        return stageProgress(
          doc.doc_type as DocType,
          doc.status,
          approvalsMap.get(doc.id) ?? [],
        );
      case "submitted":
        return new Date(doc.created_at).toLocaleString("en-GB");
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
          <h1 className="text-2xl font-bold text-navy">Approvals</h1>
          <p className="mt-1 text-sm text-slate-body">
            Sequential role sign-off (configured in Roles) on certificates, funds,
            expenses, leave, and invoices.
          </p>
        </div>
        {canSubmit ? (
          <Link
            href="/portal/new"
            className="inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden />
            New document
          </Link>
        ) : null}
      </div>

      <div className="mt-6 flex gap-1 border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/ops?status=${tab.value}`}
            className={`rounded-t-md px-4 py-2 text-sm font-semibold transition-colors ${
              status === tab.value
                ? "border border-b-0 border-line bg-white text-brand"
                : "text-slate-body hover:text-navy"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ListToolbar
        action="/admin/ops"
        q={q}
        placeholder="Search by number, type, or submitter"
        hidden={{ status: status === "submitted" ? undefined : status }}
      >
        <select name="type" defaultValue={type ?? ""} className={filterSelectClass}>
          <option value="">All types</option>
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>{DOC_CONFIG[t].title}</option>
          ))}
        </select>
      </ListToolbar>

      {docs.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          Nothing here.
        </p>
      ) : (
        <>
          {/* Mobile card list */}
          <ul className="mt-6 space-y-3 sm:hidden">
            {docs.map((doc) => {
              const submitter = doc.profiles as unknown as {
                full_name: string | null;
                email: string;
              } | null;
              return (
                <li key={doc.id} className="rounded-lg border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/ops/${doc.id}`}
                      className="font-semibold text-brand hover:text-brand-dark"
                    >
                      {doc.doc_number}
                    </Link>
                    <StatusBadge status={doc.status as DocStatus} />
                  </div>
                  <p className="mt-1 text-sm text-navy">
                    {DOC_CONFIG[doc.doc_type as DocType]?.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-body">
                    {submitter?.full_name || submitter?.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-body">
                    {stageProgress(doc.doc_type as DocType, doc.status, approvalsMap.get(doc.id) ?? [])}{" "}
                    | {new Date(doc.created_at).toLocaleString("en-GB")}
                  </p>
                </li>
              );
            })}
          </ul>

          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-lg border border-line bg-white sm:block">
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
                        href={`/admin/ops/${doc.id}`}
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
    </div>
  );
}
