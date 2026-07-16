"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DOC_CONFIG, type DocType, DOC_TYPES } from "./config";
import { generateDocumentPdf } from "./pdf/generate";

export interface OpsState {
  error: string | null;
}

export async function submitOpsDocument(
  _prev: OpsState,
  formData: FormData,
): Promise<OpsState> {
  const profile = await requireRole();

  const docType = z
    .enum(DOC_TYPES as unknown as [DocType, ...DocType[]])
    .parse(formData.get("docType"));
  const config = DOC_CONFIG[docType];

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("data")));
  } catch {
    return { error: "Invalid form payload." };
  }

  const parsed = config.schema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".")}: ${issue.message}` };
  }

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

  revalidatePath("/portal");
  revalidatePath("/admin/ops");
  redirect(`/portal/${doc.id}`);
}

export async function reviewOpsDocument(
  _prev: OpsState,
  formData: FormData,
): Promise<OpsState> {
  const admin = await requireRole("admin");

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

  let pdfPath: string | null = null;
  if (decision === "approved") {
    try {
      const { data: submitter } = await db
        .from("profiles")
        .select("full_name, email")
        .eq("id", doc.submitted_by)
        .maybeSingle();
      pdfPath = await generateDocumentPdf({
        docType: doc.doc_type,
        docNumber: doc.doc_number,
        data: doc.data,
        submitterName: submitter?.full_name || submitter?.email || "Unknown",
        approverName: admin.fullName || admin.email,
      });
    } catch (err) {
      return {
        error: `PDF generation failed: ${err instanceof Error ? err.message : "unknown error"}`,
      };
    }
  }

  const { error } = await db
    .from("ops_documents")
    .update({
      status: decision,
      reviewed_by: admin.id,
      review_comment: comment || null,
      pdf_path: pdfPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId);
  if (error) return { error: error.message };

  await db.from("ops_events").insert({
    doc_id: docId,
    actor: admin.id,
    action: decision,
    comment: comment || null,
  });

  revalidatePath("/admin/ops");
  revalidatePath(`/admin/ops/${docId}`);
  revalidatePath("/portal");
  revalidatePath(`/portal/${docId}`);
  return { error: null };
}

/** Creates a short-lived signed URL for an approved document's PDF. */
export async function getPdfUrl(docId: string): Promise<string | null> {
  const profile = await requireRole();

  // Visibility enforced by RLS through the user's own client.
  const supabase = await createSupabaseServerClient();
  const { data: doc } = await supabase
    .from("ops_documents")
    .select("pdf_path, submitted_by")
    .eq("id", docId)
    .maybeSingle();
  if (!doc?.pdf_path) return null;
  if (doc.submitted_by !== profile.id && profile.role !== "admin") return null;

  const admin = createSupabaseAdminClient();
  const { data } = await admin.storage
    .from("ops-pdfs")
    .createSignedUrl(doc.pdf_path, 60);
  return data?.signedUrl ?? null;
}
