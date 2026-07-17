"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { notify } from "@/features/notifications/notify";
import { roleExists } from "@/features/roles/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface UsersState {
  error: string | null;
  success?: string;
}

const roleSchema = z.string().trim().min(1).max(60);

export async function updateUserRole(formData: FormData): Promise<void> {
  const acting = await requireRole("admin");
  const userId = z.string().uuid().parse(formData.get("userId"));
  const role = roleSchema.parse(formData.get("role"));
  if (!(await roleExists(role))) return;

  // An admin cannot demote themselves; prevents locking everyone out.
  if (userId === acting.id) return;

  const admin = createSupabaseAdminClient();
  await admin.from("profiles").update({ role }).eq("id", userId);

  await notify([userId], {
    title: "Your workspace role was updated",
    body: `An administrator set your role to ${role.toUpperCase()}. Your access has changed accordingly.`,
    link: "/portal/profile",
  });

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
  if (!(await roleExists(parsed.data.role))) return { error: "Unknown role." };

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

const staffSchema = z.object({
  userId: z.string().uuid(),
  role: roleSchema,
  firstName: z.string().trim().max(100).optional().or(z.literal("")),
  lastName: z.string().trim().max(100).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(150).optional().or(z.literal("")),
  division: z.string().trim().max(150).optional().or(z.literal("")),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  businessLine: z.string().trim().max(50).optional().or(z.literal("")),
  directLine: z.string().trim().max(50).optional().or(z.literal("")),
  whatsappNumber: z.string().trim().max(50).optional().or(z.literal("")),
  altEmail: z.string().trim().email().max(320).optional().or(z.literal("")),
});

/** Full staff record editor: identity and employment fields are admin-only. */
export async function adminUpdateUser(
  _prev: UsersState,
  formData: FormData,
): Promise<UsersState> {
  const acting = await requireRole("admin");

  const parsed = staffSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    jobTitle: formData.get("jobTitle"),
    division: formData.get("division"),
    startDate: formData.get("startDate"),
    businessLine: formData.get("businessLine"),
    directLine: formData.get("directLine"),
    whatsappNumber: formData.get("whatsappNumber"),
    altEmail: formData.get("altEmail"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".")}: ${issue.message}` };
  }
  const d = parsed.data;
  if (!(await roleExists(d.role))) return { error: "Unknown role." };

  if (d.userId === acting.id && d.role !== "admin") {
    return { error: "You cannot change your own role." };
  }

  const fullName = [d.firstName, d.lastName].filter(Boolean).join(" ");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      role: d.role,
      first_name: d.firstName || null,
      last_name: d.lastName || null,
      full_name: fullName || null,
      job_title: d.jobTitle || null,
      division: d.division || null,
      start_date: d.startDate || null,
      contract_staff: formData.get("contractStaff") === "on",
      business_line: d.businessLine || null,
      direct_line: d.directLine || null,
      whatsapp_number: d.whatsappNumber || null,
      alt_email: d.altEmail || null,
    })
    .eq("id", d.userId);
  if (error) return { error: error.message };

  if (d.userId !== acting.id) {
    await notify([d.userId], {
      title: "Your staff record was updated",
      body: "Administration updated your identity or employment details. Review them on your profile.",
      link: "/portal/profile",
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${d.userId}`);
  return { error: null, success: "Staff record updated." };
}
