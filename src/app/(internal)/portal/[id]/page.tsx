import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovalTrail } from "@/features/ops/ApprovalTrail";
import { DOC_CONFIG, type DocStatus, type DocType } from "@/features/ops/config";
import { DocDetails } from "@/features/ops/DocDetails";
import { EventTimeline, type OpsEvent } from "@/features/ops/EventTimeline";
import { PdfDownloadButton } from "@/features/ops/PdfDownloadButton";
import { getApprovals } from "@/features/ops/queries";
import { getApprovalStages } from "@/features/ops/stages";
import { StatusBadge } from "@/features/ops/StatusBadge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortalDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: doc } = await supabase
    .from("ops_documents")
    .select("id, doc_type, doc_number, data, status, review_comment, pdf_path, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!doc) notFound();

  const [approvals, stages, { data: events }] = await Promise.all([
    getApprovals(id),
    getApprovalStages(),
    supabase
      .from("ops_events")
      .select("id, action, comment, created_at, actor, profiles:actor (full_name, email)")
      .eq("doc_id", id)
      .order("created_at"),
  ]);

  const timeline: OpsEvent[] = (events ?? []).map((e) => {
    const profile = e.profiles as unknown as { full_name: string | null; email: string } | null;
    return {
      id: e.id,
      action: e.action,
      comment: e.comment,
      created_at: e.created_at,
      actorName: profile?.full_name || profile?.email || "Unknown",
    };
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/portal"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> My documents
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{doc.doc_number}</h1>
          <p className="mt-1 text-sm text-slate-body">
            {DOC_CONFIG[doc.doc_type as DocType].title} | Submitted{" "}
            {new Date(doc.created_at).toLocaleString("en-GB")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={doc.status as DocStatus} />
          {doc.status === "approved" && doc.pdf_path ? (
            <PdfDownloadButton docId={doc.id} />
          ) : null}
        </div>
      </div>

      {doc.status === "rejected" && doc.review_comment ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejected: {doc.review_comment}
        </p>
      ) : null}

      <div className="mt-6 rounded-lg border border-line bg-white p-7">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-body">
          Approval trail
        </h2>
        <ApprovalTrail approvals={approvals} docStatus={doc.status} stages={stages} />
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white p-7">
        <DocDetails
          docType={doc.doc_type as DocType}
          data={doc.data as Record<string, unknown>}
        />
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white p-7">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-body">
          History
        </h2>
        <EventTimeline events={timeline} />
      </div>
    </div>
  );
}
