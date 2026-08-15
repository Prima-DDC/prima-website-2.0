"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/features/capabilities/service";
import { MONEY_DOC_TYPES, type DocType } from "@/features/ops/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AccountingState {
  error: string | null;
  success?: string;
}

/** Records a disbursement or collection against an approved money document. */
export async function recordPayment(
  _prev: AccountingState,
  formData: FormData,
): Promise<AccountingState> {
  await requireCapability("manage_accounting");
  const docId = z.string().uuid().parse(formData.get("docId"));
  const reference = z.string().trim().max(200).parse(formData.get("reference") ?? "");

  const db = createSupabaseAdminClient();
  const { data: doc } = await db
    .from("ops_documents")
    .select("id, doc_type, status")
    .eq("id", docId)
    .maybeSingle();
  if (!doc) return { error: "Document not found." };
  if (!MONEY_DOC_TYPES.includes(doc.doc_type as DocType)) {
    return { error: "This document has no monetary amount." };
  }
  if (doc.status !== "approved") {
    return { error: "Only approved documents can be marked paid." };
  }

  const { error } = await db
    .from("ops_documents")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      payment_ref: reference || null,
    })
    .eq("id", docId);
  if (error) return { error: error.message };

  revalidatePath("/admin/accounting");
  revalidatePath(`/admin/ops/${docId}`);
  return { error: null, success: "Payment recorded." };
}

/** Reverses a recorded payment (correction). */
export async function reversePayment(
  _prev: AccountingState,
  formData: FormData,
): Promise<AccountingState> {
  await requireCapability("manage_accounting");
  const docId = z.string().uuid().parse(formData.get("docId"));

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("ops_documents")
    .update({ payment_status: "unpaid", paid_at: null, payment_ref: null })
    .eq("id", docId);
  if (error) return { error: error.message };

  revalidatePath("/admin/accounting");
  revalidatePath(`/admin/ops/${docId}`);
  return { error: null, success: "Payment reversed." };
}
