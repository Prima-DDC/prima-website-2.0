import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovalTrail } from "@/features/ops/ApprovalTrail";
import {
  DOC_CONFIG,
  nextStage,
  type DocStatus,
  type DocType,
} from "@/features/ops/config";
import { chainForType, requireApprover } from "@/features/ops/stages";
import { DocDetails } from "@/features/ops/DocDetails";
import { EventTimeline, type OpsEvent } from "@/features/ops/EventTimeline";
import { PdfDownloadButton } from "@/features/ops/PdfDownloadButton";
import { getApprovals } from "@/features/ops/queries";
import { ReviewForm } from "@/features/ops/ReviewForm";
import { StatusBadge } from "@/features/ops/StatusBadge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { profile } = await requireApprover();

  const supabase = await createSupabaseServerClient();
  const { data: doc } = await supabase
    .from("ops_documents")
    .select(
      "id, doc_type, doc_number, data, status, pdf_path, created_at, profiles:submitted_by (full_name, email)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!doc) notFound();

  const submitter = doc.profiles as unknown as {
    full_name: string | null;
    email: string;
  } | null;

  const stages = await chainForType(doc.doc_type as DocType);
  const [approvals, { data: events }] = await Promise.all([
    getApprovals(id),
    supabase
      .from("ops_events")
      .select("id, action, comment, created_at, actor, profiles:actor (full_name, email)")
      .eq("doc_id", id)
      .order("created_at"),
  ]);

  const timeline: OpsEvent[] = (events ?? []).map((e) => {
    const p = e.profiles as unknown as { full_name: string | null; email: string } | null;
    return {
      id: e.id,
      action: e.action,
      comment: e.comment,
      created_at: e.created_at,
      actorName: p?.full_name || p?.email || "Unknown",
    };
  });

  const stage = nextStage(approvals, stages);
  const canAct =
    doc.status === "submitted" &&
    stage !== null &&
    (profile.role === "admin" || stage.role === profile.role);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/portal/approvals"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Approvals
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
        <div className="flex items-center gap-3">
          <StatusBadge status={doc.status as DocStatus} />
          <PdfDownloadButton docId={doc.id} />
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

      {canAct && stage ? (
        <div className="mt-6">
          <ReviewForm
            docId={doc.id}
            stageLabel={stage.label}
            isFinalStage={stage.role === stages[stages.length - 1]?.role}
          />
        </div>
      ) : doc.status === "submitted" && stage ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          This document is awaiting the {stage.label} sign-off.
        </p>
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
