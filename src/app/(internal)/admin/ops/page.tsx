import Link from "next/link";
import { DOC_CONFIG, type DocStatus, type DocType } from "@/features/ops/config";
import { StatusBadge } from "@/features/ops/StatusBadge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TABS: Array<{ value: string; label: string }> = [
  { value: "submitted", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default async function OpsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "submitted" } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("ops_documents")
    .select("id, doc_type, doc_number, status, created_at, profiles:submitted_by (full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  const { data: docs } = await query;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Approvals</h1>
      <p className="mt-1 text-sm text-slate-body">
        Review employee submissions: certificates, funds, expenses, leave, and invoices.
      </p>

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

      {!docs || docs.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          Nothing here.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">Document</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Submitted by</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {docs.map((doc) => {
                  const submitter = doc.profiles as unknown as {
                    full_name: string | null;
                    email: string;
                  } | null;
                  return (
                    <tr key={doc.id} className="transition-colors hover:bg-mist/40">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/ops/${doc.id}`}
                          className="font-semibold text-brand hover:text-brand-dark"
                        >
                          {doc.doc_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-navy">
                        {DOC_CONFIG[doc.doc_type as DocType]?.title}
                      </td>
                      <td className="px-5 py-3.5 text-slate-body">
                        {submitter?.full_name || submitter?.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={doc.status as DocStatus} />
                      </td>
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
