"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { requireCapability } from "@/features/capabilities/service";
import { notify, userIdsByRole } from "@/features/notifications/notify";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DOC_CONFIG, nextStage, type DocType, DOC_TYPES } from "./config";
import { chainForType, getApprovableTypes, getSubmittableTypes } from "./stages";
import { generateDocumentPdf } from "./pdf/generate";

export interface OpsState {
  error: string | null;
}

function revalidateOps(docId?: string) {
  revalidatePath("/portal");
  revalidatePath("/portal/approvals");
  revalidatePath("/admin/ops");
  revalidatePath("/admin");
  if (docId) {
    revalidatePath(`/portal/${docId}`);
    revalidatePath(`/portal/approvals/${docId}`);
    revalidatePath(`/admin/ops/${docId}`);
  }
}

function parsePayload(docType: DocType, raw: unknown):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string } {
  let payload: unknown;
  try {
    payload = JSON.parse(String(raw));
  } catch {
    return { ok: false, error: "Invalid form payload." };
  }
  const parsed = DOC_CONFIG[docType].schema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join(".")}: ${issue.message}` };
  }
  return { ok: true, data: parsed.data as Record<string, unknown> };
}

export async function submitOpsDocument(
  _prev: OpsState,
  formData: FormData,
): Promise<OpsState> {
  const profile = await requireRole();

  const docType = z
    .enum(DOC_TYPES as unknown as [DocType, ...DocType[]])
    .parse(formData.get("docType"));

  const submittable = await getSubmittableTypes(profile.role);
  if (!submittable.includes(docType)) {
    return {
      error: `Your role is not permitted to submit ${DOC_CONFIG[docType].title.toLowerCase()} requests. Contact administration.`,
    };
  }

  const parsed = parsePayload(docType, formData.get("data"));
  if (!parsed.ok) return { error: parsed.error };

  // Inserted with the user's own session so RLS owner checks apply.
  const supabase = await createSupabaseServerClient();
  const { data: doc, error } = await supabase
    .from("ops_documents")
    .insert({
      doc_type: docType,
      data: parsed.data,
      status: "submitted",
      submitted_by: profile.id,
    })
    .select("id")
    .single();
  if (error || !doc) return { error: error?.message ?? "Could not submit." };

  await supabase.from("ops_events").insert({
    doc_id: doc.id,
    actor: profile.id,
    action: "submitted",
  });

  // First configured stage for this request type, plus administration.
  const chain = await chainForType(docType);
  const firstStage = chain[0];
  const { data: created } = await supabase
    .from("ops_documents")
    .select("doc_number")
    .eq("id", doc.id)
    .single();
  await notify(await userIdsByRole(firstStage ? [firstStage.role, "admin"] : ["admin"]), {
    title: `New ${DOC_CONFIG[docType].title.toLowerCase()} for sign-off`,
    body: `${created?.doc_number ?? "A new document"} was submitted by ${profile.fullName || profile.email} and awaits the ${firstStage?.label ?? "first"} sign-off.`,
    link: `/portal/approvals/${doc.id}`,
  });

  revalidateOps(doc.id);
  redirect(`/portal/${doc.id}`);
}

/**
 * One sequential sign-off (HR, then Manager, then CEO). A rejection at any
 * stage is final; the last approval generates the official PDF carrying
 * every signatory.
 */
export async function signOffDocument(
  _prev: OpsState,
  formData: FormData,
): Promise<OpsState> {
  const profile = await requireRole();

  const docId = z.string().uuid().parse(formData.get("docId"));
  const decision = z.enum(["approved", "rejected"]).parse(formData.get("decision"));
  const comment = z.string().trim().max(2000).parse(formData.get("comment") ?? "");

  if (decision === "rejected" && !comment) {
    return { error: "A comment is required when rejecting." };
  }

  const db = createSupabaseAdminClient();
  const { data: doc } = await db
    .from("ops_documents")
    .select("id, doc_type, doc_number, data, status, submitted_by")
    .eq("id", docId)
    .maybeSingle();
  if (!doc) return { error: "Document not found." };
  if (doc.status !== "submitted") {
    return { error: "Only submitted documents can be reviewed." };
  }

  const stages = await chainForType(doc.doc_type);
  if (stages.length === 0) {
    return { error: "No approvers are configured for this request type." };
  }

  const { data: existing } = await db
    .from("ops_approvals")
    .select("stage, status")
    .eq("doc_id", docId);
  const stage = nextStage(existing ?? [], stages);
  if (!stage) return { error: "This document is already fully signed." };

  const stageLabel = stage.label;
  if (profile.role !== "admin" && profile.role !== stage.role) {
    return { error: `This document is awaiting the ${stageLabel} sign-off.` };
  }

  const { error: approvalError } = await db.from("ops_approvals").insert({
    doc_id: docId,
    stage: stage.role,
    status: decision,
    approver: profile.id,
    comment: comment || null,
  });
  if (approvalError) return { error: approvalError.message };

  await db.from("ops_events").insert({
    doc_id: docId,
    actor: profile.id,
    action: decision === "approved" ? "signed" : "rejected",
    comment: comment
      ? `${stageLabel} stage: ${comment}`
      : `${stageLabel} sign-off`,
  });

  const docTitle = DOC_CONFIG[doc.doc_type as DocType].title;

  if (decision === "rejected") {
    const { error } = await db
      .from("ops_documents")
      .update({
        status: "rejected",
        reviewed_by: profile.id,
        review_comment: comment,
        updated_at: new Date().toISOString(),
      })
      .eq("id", docId);
    if (error) return { error: error.message };

    await notify([doc.submitted_by], {
      title: `${doc.doc_number} was rejected`,
      body: `Your ${docTitle.toLowerCase()} was rejected at the ${stageLabel} stage: ${comment}`,
      link: `/portal/${docId}`,
    });
  } else if (stage.role === stages[stages.length - 1].role) {
    // Final stage approved: assemble the signatory list and issue the PDF.
    const { data: rows } = await db
      .from("ops_approvals")
      .select("stage, created_at, profiles:approver (full_name, email)")
      .eq("doc_id", docId)
      .eq("status", "approved");
    const approvals = stages.map((s) => {
      const row = rows?.find((r) => r.stage === s.role);
      const approver = row?.profiles as unknown as {
        full_name: string | null;
        email: string;
      } | null;
      return {
        label: s.label,
        name: approver?.full_name || approver?.email || "Unknown",
        date: (row?.created_at ?? new Date().toISOString()).slice(0, 10),
      };
    });

    const { data: submitter } = await db
      .from("profiles")
      .select("full_name, email")
      .eq("id", doc.submitted_by)
      .maybeSingle();

    let pdfPath: string;
    try {
      pdfPath = await generateDocumentPdf({
        docType: doc.doc_type,
        docNumber: doc.doc_number,
        data: doc.data,
        submitterName: submitter?.full_name || submitter?.email || "Unknown",
        approvals,
      });
    } catch (err) {
      // Roll back this sign-off so the CEO can retry cleanly.
      await db.from("ops_approvals").delete().eq("doc_id", docId).eq("stage", stage.role);
      return {
        error: `PDF generation failed: ${err instanceof Error ? err.message : "unknown error"}`,
      };
    }

    const { error } = await db
      .from("ops_documents")
      .update({
        status: "approved",
        reviewed_by: profile.id,
        review_comment: comment || null,
        pdf_path: pdfPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", docId);
    if (error) return { error: error.message };

    await notify([doc.submitted_by], {
      title: `${doc.doc_number} is fully approved`,
      body: `Your ${docTitle.toLowerCase()} completed all required sign-offs (${stages.map((s) => s.label).join(", ")}). The official PDF is ready to download.`,
      link: `/portal/${docId}`,
    });
  } else {
    // Intermediate approval: tell the submitter and wake the next stage.
    const upcoming = stages[stages.findIndex((s) => s.role === stage.role) + 1];
    await notify([doc.submitted_by], {
      title: `${doc.doc_number}: ${stageLabel} approved`,
      body: `The ${stageLabel} stage signed off. Next up: ${upcoming.label}.`,
      link: `/portal/${docId}`,
    });
    await notify(await userIdsByRole([upcoming.role]), {
      title: `${doc.doc_number} awaits your ${upcoming.label} sign-off`,
      body: `The ${stageLabel} stage approved this ${docTitle.toLowerCase()}; it now needs the ${upcoming.label} decision.`,
      link: `/portal/approvals/${docId}`,
    });
  }

  revalidateOps(docId);
  return { error: null };
}

/**
 * Owner edit of a submitted document. Allowed until final approval; any
 * sign-offs already given are cleared so the chain restarts on the new
 * content (logged in the trail, approvers re-notified).
 */
export async function editOwnDocument(
  _prev: OpsState,
  formData: FormData,
): Promise<OpsState> {
  const profile = await requireRole();

  const docId = z.string().uuid().parse(formData.get("docId"));
  const docType = z
    .enum(DOC_TYPES as unknown as [DocType, ...DocType[]])
    .parse(formData.get("docType"));
  const parsed = parsePayload(docType, formData.get("data"));
  if (!parsed.ok) return { error: parsed.error };

  const db = createSupabaseAdminClient();
  const { data: doc } = await db
    .from("ops_documents")
    .select("id, doc_type, doc_number, status, submitted_by")
    .eq("id", docId)
    .maybeSingle();
  if (!doc || doc.doc_type !== docType) return { error: "Document not found." };
  if (doc.submitted_by !== profile.id) {
    return { error: "Only the submitter can edit this document." };
  }
  if (doc.status !== "submitted") {
    return { error: "Documents can no longer be edited after a final decision." };
  }

  const { count: signOffs } = await db
    .from("ops_approvals")
    .select("id", { count: "exact", head: true })
    .eq("doc_id", docId);
  if ((signOffs ?? 0) > 0) {
    await db.from("ops_approvals").delete().eq("doc_id", docId);
  }

  const { error } = await db
    .from("ops_documents")
    .update({ data: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", docId);
  if (error) return { error: error.message };

  await db.from("ops_events").insert({
    doc_id: docId,
    actor: profile.id,
    action: "edited",
    comment:
      (signOffs ?? 0) > 0
        ? "Details edited by the submitter; earlier sign-offs cleared"
        : "Details edited by the submitter",
  });

  const chain = await chainForType(docType);
  const firstStage = chain[0];
  await notify(await userIdsByRole(firstStage ? [firstStage.role, "admin"] : ["admin"]), {
    title: `${doc.doc_number} was edited and needs sign-off`,
    body: `${profile.fullName || profile.email} updated this ${DOC_CONFIG[docType].title.toLowerCase()}${(signOffs ?? 0) > 0 ? "; earlier sign-offs were cleared" : ""}. It awaits the ${firstStage?.label ?? "first"} decision.`,
    link: `/portal/approvals/${docId}`,
  });

  revalidateOps(docId);
  redirect(`/portal/${docId}`);
}

/** Admin correction of a submitted document's details (logged in the trail). */
export async function updateOpsDocument(
  _prev: OpsState,
  formData: FormData,
): Promise<OpsState> {
  const admin = await requireCapability("manage_documents");

  const docId = z.string().uuid().parse(formData.get("docId"));
  const docType = z
    .enum(DOC_TYPES as unknown as [DocType, ...DocType[]])
    .parse(formData.get("docType"));
  const parsed = parsePayload(docType, formData.get("data"));
  if (!parsed.ok) return { error: parsed.error };

  const db = createSupabaseAdminClient();
  const { data: doc } = await db
    .from("ops_documents")
    .select("id, doc_type, status")
    .eq("id", docId)
    .maybeSingle();
  if (!doc || doc.doc_type !== docType) return { error: "Document not found." };
  if (doc.status !== "submitted") {
    return { error: "Only documents still in review can be edited." };
  }

  const { error } = await db
    .from("ops_documents")
    .update({ data: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", docId);
  if (error) return { error: error.message };

  await db.from("ops_events").insert({
    doc_id: docId,
    actor: admin.id,
    action: "edited",
    comment: "Details edited by administration",
  });

  const { data: edited } = await db
    .from("ops_documents")
    .select("doc_number, submitted_by")
    .eq("id", docId)
    .single();
  if (edited && edited.submitted_by !== admin.id) {
    await notify([edited.submitted_by], {
      title: `${edited.doc_number} was corrected by administration`,
      body: "The document details were edited. Open it to review the changes; the full history is preserved.",
      link: `/portal/${docId}`,
    });
  }

  revalidateOps(docId);
  redirect(`/admin/ops/${docId}`);
}

/** Admin deletion of a document, including its generated PDF. */
export async function deleteOpsDocument(
  _prev: OpsState,
  formData: FormData,
): Promise<OpsState> {
  const acting = await requireCapability("manage_documents");
  const docId = z.string().uuid().parse(formData.get("docId"));

  const db = createSupabaseAdminClient();
  const { data: doc } = await db
    .from("ops_documents")
    .select("id, doc_type, doc_number, pdf_path, submitted_by")
    .eq("id", docId)
    .maybeSingle();
  if (!doc) return { error: "Document not found." };

  // Remove the official PDF and any on-demand preview copy.
  const paths = [`${doc.doc_type}/${doc.doc_number}-preview.pdf`];
  if (doc.pdf_path) paths.push(doc.pdf_path);
  await db.storage.from("ops-pdfs").remove(paths);
  const { error } = await db.from("ops_documents").delete().eq("id", docId);
  if (error) return { error: error.message };

  if (doc.submitted_by !== acting.id) {
    await notify([doc.submitted_by], {
      title: `${doc.doc_number} was removed`,
      body: "Administration deleted this document. Contact them via a support ticket if this is unexpected.",
      link: "/portal/support",
    });
  }

  revalidateOps();
  redirect("/admin/ops");
}

/**
 * Creates a short-lived signed URL for a document's PDF. Approved documents
 * serve the stored official PDF; documents still in review are rendered on
 * demand as a clearly marked preliminary copy with pending stages listed.
 */
export async function getPdfUrl(docId: string): Promise<string | null> {
  const profile = await requireRole();

  // Visibility enforced by RLS through the user's own client.
  const supabase = await createSupabaseServerClient();
  const { data: doc } = await supabase
    .from("ops_documents")
    .select("doc_type, doc_number, data, pdf_path, submitted_by")
    .eq("id", docId)
    .maybeSingle();
  if (!doc) return null;
  if (doc.submitted_by !== profile.id && profile.role !== "admin") {
    // An approver of this request type may also download the PDF.
    const approvable = await getApprovableTypes(profile.role);
    if (!approvable.includes(doc.doc_type)) return null;
  }

  const admin = createSupabaseAdminClient();
  let path = doc.pdf_path;
  if (!path) {
    const stages = await chainForType(doc.doc_type);
    const { data: rows } = await admin
      .from("ops_approvals")
      .select("stage, status, created_at, profiles:approver (full_name, email)")
      .eq("doc_id", docId);
    const approvals = stages.map((stage) => {
      const row = rows?.find((r) => r.stage === stage.role);
      const approver = row?.profiles as unknown as {
        full_name: string | null;
        email: string;
      } | null;
      return {
        label: stage.label,
        name: row
          ? `${approver?.full_name || approver?.email || "Unknown"}${row.status === "rejected" ? " (rejected)" : ""}`
          : "Pending",
        date: row ? row.created_at.slice(0, 10) : "",
      };
    });

    const { data: submitter } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", doc.submitted_by)
      .maybeSingle();

    try {
      path = await generateDocumentPdf({
        docType: doc.doc_type,
        docNumber: doc.doc_number,
        data: doc.data,
        submitterName: submitter?.full_name || submitter?.email || "Unknown",
        approvals,
        preliminary: true,
      });
    } catch {
      return null;
    }
  }

  const { data } = await admin.storage.from("ops-pdfs").createSignedUrl(path, 60);
  return data?.signedUrl ?? null;
}
