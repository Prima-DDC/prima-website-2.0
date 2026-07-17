"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileState {
  error: string | null;
  success?: string;
}

const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PHOTO_MAX_BYTES = 8 * 1024 * 1024;

const contactSchema = z.object({
  email: z.string().trim().email().max(320),
  directLine: z.string().trim().max(50).optional().or(z.literal("")),
  whatsappNumber: z.string().trim().max(50).optional().or(z.literal("")),
  altEmail: z.string().trim().email().max(320).optional().or(z.literal("")),
});

/**
 * Self-service profile update: photo and personal contact details only.
 * Identity and employment fields are managed by administration.
 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const profile = await requireRole();

  const parsed = contactSchema.safeParse({
    email: formData.get("email"),
    directLine: formData.get("directLine"),
    whatsappNumber: formData.get("whatsappNumber"),
    altEmail: formData.get("altEmail"),
  });
  if (!parsed.success) return { error: "Check the contact details and try again." };

  const admin = createSupabaseAdminClient();
  const patch: Record<string, unknown> = {
    direct_line: parsed.data.directLine || null,
    whatsapp_number: parsed.data.whatsappNumber || null,
    alt_email: parsed.data.altEmail || null,
  };

  // Professional photo: JPG/PNG/WEBP up to 8 MB, normalized to 512px webp.
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!PHOTO_TYPES.has(photo.type)) {
      return { error: "Photo must be a JPG, PNG, or WEBP image." };
    }
    if (photo.size > PHOTO_MAX_BYTES) {
      return { error: "Photo must be 8 MB or smaller." };
    }
    const processed = await sharp(Buffer.from(await photo.arrayBuffer()))
      .rotate()
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();
    const path = `${profile.id}-${Date.now()}.webp`;
    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(path, processed, { contentType: "image/webp" });
    if (uploadError) return { error: uploadError.message };
    if (profile.photoPath) {
      await admin.storage.from("avatars").remove([profile.photoPath]);
    }
    patch.photo_path = path;
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", profile.id);
  if (updateError) return { error: updateError.message };

  let success = "Profile updated.";
  if (parsed.data.email.toLowerCase() !== profile.email.toLowerCase()) {
    const supabase = await createSupabaseServerClient();
    const { error: emailError } = await supabase.auth.updateUser({
      email: parsed.data.email,
    });
    if (emailError) return { error: emailError.message };
    success =
      "Profile updated. A confirmation link has been sent to the new email address; the change applies once confirmed.";
  }

  revalidatePath("/portal/profile");
  revalidatePath("/portal", "layout");
  return { error: null, success };
}
