"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileState {
  error: string | null;
  success?: string;
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
});

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const profile = await requireRole();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid name and email address." };
  }
  const { fullName, email } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error: metaError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  if (metaError) return { error: metaError.message };

  // profiles is admin-write only under RLS; this runs behind requireRole().
  const admin = createSupabaseAdminClient();
  await admin.from("profiles").update({ full_name: fullName }).eq("id", profile.id);

  let success = "Profile updated.";
  if (email.toLowerCase() !== profile.email.toLowerCase()) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) return { error: emailError.message };
    success =
      "Profile updated. A confirmation link has been sent to the new email address; the change applies once confirmed.";
  }

  revalidatePath("/portal/profile");
  return { error: null, success };
}
