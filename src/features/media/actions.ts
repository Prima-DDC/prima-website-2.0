"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MEDIA_BUCKET = "public-media";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
]);

export interface MediaState {
  error: string | null;
  success?: string;
}

export async function uploadMedia(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  await requireRole("admin");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "Files must be 10 MB or smaller." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Allowed types: JPEG, PNG, WebP, SVG, GIF, PDF." };
  }

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const path = `${Date.now()}-${safeName}`;

  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  revalidatePath("/admin/media");
  return { error: null, success: `Uploaded ${file.name}.` };
}

export async function deleteMedia(formData: FormData): Promise<void> {
  await requireRole("admin");
  const path = z.string().min(1).parse(formData.get("path"));
  const admin = createSupabaseAdminClient();
  await admin.storage.from(MEDIA_BUCKET).remove([path]);
  revalidatePath("/admin/media");
}
