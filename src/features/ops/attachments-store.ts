import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  attachmentError,
  fileExtension,
  MAX_ATTACHMENTS,
  type Attachment,
} from "./attachments";

const BUCKET = "ops-attachments";

type UploadResult =
  | { ok: true; attachments: Attachment[] }
  | { ok: false; error: string };

/**
 * Validates and stores newly uploaded files for a document, returning their
 * attachment metadata. Files are keyed under the owner's id with a random name;
 * the original name is preserved in the metadata for display and download.
 */
export async function uploadAttachments(
  files: File[],
  userId: string,
  existingCount: number,
): Promise<UploadResult> {
  const incoming = files.filter((f) => f && f.size > 0);
  if (incoming.length === 0) return { ok: true, attachments: [] };
  if (existingCount + incoming.length > MAX_ATTACHMENTS) {
    return { ok: false, error: `A document may have at most ${MAX_ATTACHMENTS} attachments.` };
  }

  for (const file of incoming) {
    const err = attachmentError(file.name, file.size);
    if (err) return { ok: false, error: err };
  }

  const db = createSupabaseAdminClient();
  const uploaded: Attachment[] = [];
  for (const file of incoming) {
    const ext = fileExtension(file.name);
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) {
      // Roll back anything already stored in this batch.
      await removeAttachmentObjects(uploaded.map((a) => a.path));
      return { ok: false, error: `Could not upload "${file.name}": ${error.message}` };
    }
    uploaded.push({ path, name: file.name, size: file.size, type: file.type || "" });
  }
  return { ok: true, attachments: uploaded };
}

/** Deletes attachment objects from storage (used on edit removal and delete). */
export async function removeAttachmentObjects(paths: string[]): Promise<void> {
  const clean = paths.filter(Boolean);
  if (clean.length === 0) return;
  const db = createSupabaseAdminClient();
  await db.storage.from(BUCKET).remove(clean);
}

/** A short-lived signed URL that downloads the file under its original name. */
export async function signAttachmentUrl(
  path: string,
  filename: string,
): Promise<string | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db.storage
    .from(BUCKET)
    .createSignedUrl(path, 60, { download: filename });
  return data?.signedUrl ?? null;
}
