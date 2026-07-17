import { ArrowLeft, PencilLine } from "lucide-react";
import { requireCapability } from "@/features/capabilities/service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovalTrail } from "@/features/ops/ApprovalTrail";
import {
  DOC_CONFIG,
  nextStage,
  type DocStatus,
  type DocType,
} from "@/features/ops/config";
import { chainForType } from "@/features/ops/stages";
import { DeleteDocButton } from "@/features/ops/DeleteDocButton";
import { DocDetails } from "@/features/ops/DocDetails";
import { EventTimeline, type OpsEvent } from "@/features/ops/EventTimeline";
import { PdfDownloadButton } from "@/features/ops/PdfDownloadButton";
import { getApprovals } from "@/features/ops/queries";
import { ReviewForm } from "@/features/ops/ReviewForm";
import { StatusBadge } from "@/features/ops/StatusBadge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminOpsDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCapability("manage_documents");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: doc } = await supabase
    .from("ops_documents")
    .select(
      "id, doc_type, doc_number, data, status, review_comment, pdf_path, created_at, profiles:submitted_by (full_name, email)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!doc) notFound();

  const submitter = doc.profiles as unknown as {
    full_name: string | null;
    email: string;
  } | null;

  const [approvals, stages, { data: events }] = await Promise.all([
    getApprovals(id),
    chainForType(doc.doc_type as DocType),
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

  const stage = nextStage(approvals, stages);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/ops"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Approvals queue
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{doc.doc_number}</h1>
          <p className="mt-1 text-sm text-slate-body">
            {DOC_CONFIG[doc.doc_type as DocType].title} | Submitted by{" "}
            {submitter?.full_name || submitter?.email} |{" "}
            {new Date(doc.created_at).toLocaleString("en-GB")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={doc.status as DocStatus} />
          {doc.status === "approved" && doc.pdf_path ? (
            <PdfDownloadButton docId={doc.id} />
          ) : null}
          {doc.status === "submitted" ? (
            <Link
              href={`/admin/ops/${doc.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded border border-line px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
            >
              <PencilLine className="h-4 w-4" aria-hidden /> Edit
            </Link>
          ) : null}
          <DeleteDocButton docId={doc.id} docNumber={doc.doc_number} />
        </div>
      </div>

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

      {doc.status === "submitted" && stage ? (
        <div className="mt-6">
          <ReviewForm
            docId={doc.id}
            stageLabel={stage.label}
            isFinalStage={stage.role === stages[stages.length - 1]?.role}
          />
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border border-line bg-white p-7">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-body">
          History
        </h2>
        <EventTimeline events={timeline} />
      </div>
    </div>
  );
}
