"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface UsersState {
  error: string | null;
  success?: string;
}

const roleSchema = z.enum(["admin", "employee", "client"]);

export async function updateUserRole(formData: FormData): Promise<void> {
  const acting = await requireRole("admin");
  const userId = z.string().uuid().parse(formData.get("userId"));
  const role = roleSchema.parse(formData.get("role"));

  // An admin cannot demote themselves; prevents locking everyone out.
  if (userId === acting.id) return;

  const admin = createSupabaseAdminClient();
  await admin.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}

const inviteSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().max(200).optional().or(z.literal("")),
  role: roleSchema,
});

export async function sendPasswordReset(
  _prev: UsersState,
  formData: FormData,
): Promise<UsersState> {
  await requireRole("admin");
  const email = z.string().trim().email().parse(formData.get("email"));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm`,
  });
  if (error) return { error: error.message };
  return { error: null, success: `Password reset email sent to ${email}.` };
}

export async function deleteUser(
  _prev: UsersState,
  formData: FormData,
): Promise<UsersState> {
  const acting = await requireRole("admin");
  const userId = z.string().uuid().parse(formData.get("userId"));

  // An admin cannot delete themselves; prevents locking everyone out.
  if (userId === acting.id) {
    return { error: "You cannot delete your own account." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { error: null, success: "User deleted." };
}

export async function inviteUser(
  _prev: UsersState,
  formData: FormData,
): Promise<UsersState> {
  await requireRole("admin");

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Enter a valid email and role." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { full_name: parsed.data.fullName || "" },
      redirectTo: `${siteUrl}/auth/confirm`,
    },
  );
  if (error) return { error: error.message };

  if (data.user) {
    await admin
      .from("profiles")
      .update({ role: parsed.data.role, full_name: parsed.data.fullName || null })
      .eq("id", data.user.id);
  }

  revalidatePath("/admin/users");
  return { error: null, success: `Invitation sent to ${parsed.data.email}.` };
}
