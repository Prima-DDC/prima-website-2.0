import { FilePlus2 } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/features/auth/helpers";
import { getSubmittableTypes } from "@/features/ops/stages";
import { DOC_CONFIG, type DocStatus, type DocType } from "@/features/ops/config";
import { StatusBadge } from "@/features/ops/StatusBadge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortalHome() {
  const profile = await requireRole();
  const canSubmit = (await getSubmittableTypes(profile.role)).length > 0;
  const supabase = await createSupabaseServerClient();
  const { data: docs } = await supabase
    .from("ops_documents")
    .select("id, doc_type, doc_number, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

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

      {!docs || docs.length === 0 ? (
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
        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">Document</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
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
                    <td className="px-5 py-3.5 text-navy">
                      {DOC_CONFIG[doc.doc_type as DocType]?.title ?? doc.doc_type}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={doc.status as DocStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-body">
                      {new Date(doc.created_at).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
