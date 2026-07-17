import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DocType } from "../config";
import { DocumentPdf } from "./templates";

const PDF_BUCKET = "ops-pdfs";

/** Renders the branded PDF and stores it privately; returns the storage path. */
export async function generateDocumentPdf({
  docType,
  docNumber,
  data,
  submitterName,
  approvals,
}: {
  docType: DocType;
  docNumber: string;
  data: Record<string, unknown>;
  submitterName: string;
  approvals: Array<{ label: string; name: string; date: string }>;
}): Promise<string> {
  const logo = readFileSync(path.join(process.cwd(), "public", "logo.png"));

  const buffer = await renderToBuffer(
    DocumentPdf({ docType, docNumber, data, submitterName, approvals, logo }),
  );

  const storagePath = `${docType}/${docNumber}.pdf`;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage
    .from(PDF_BUCKET)
    .upload(storagePath, buffer, { contentType: "application/pdf", upsert: true });
  if (error) throw new Error(error.message);

  return storagePath;
}
