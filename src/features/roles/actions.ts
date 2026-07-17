"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface RolesState {
  error: string | null;
  success?: string;
}

function revalidateRoles() {
  revalidatePath("/admin/roles");
  revalidatePath("/admin/users");
  revalidatePath("/portal", "layout");
}

const labelSchema = z.string().trim().min(2).max(60);

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function createRole(
  _prev: RolesState,
  formData: FormData,
): Promise<RolesState> {
  await requireRole("admin");

  const parsed = labelSchema.safeParse(formData.get("label"));
  if (!parsed.success) return { error: "Enter a role name (2-60 characters)." };
  const key = slugify(parsed.data);
  if (!key) return { error: "The role name must contain letters or numbers." };

  const db = createSupabaseAdminClient();
  const { data: max } = await db
    .from("roles")
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await db.from("roles").insert({
    key,
    label: parsed.data,
    sort: (max?.sort ?? 0) + 1,
  });
  if (error) {
    return {
      error: error.code === "23505" ? "A role with this name already exists." : error.message,
    };
  }

  revalidateRoles();
  return { error: null, success: `Role "${parsed.data}" created.` };
}

export async function renameRole(
  _prev: RolesState,
  formData: FormData,
): Promise<RolesState> {
  await requireRole("admin");

  const key = z.string().min(1).parse(formData.get("key"));
  const parsed = labelSchema.safeParse(formData.get("label"));
  if (!parsed.success) return { error: "Enter a role name (2-60 characters)." };

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("roles")
    .update({ label: parsed.data })
    .eq("key", key);
  if (error) return { error: error.message };

  revalidateRoles();
  return { error: null, success: "Role renamed." };
}

export async function deleteRole(
  _prev: RolesState,
  formData: FormData,
): Promise<RolesState> {
  await requireRole("admin");
  const key = z.string().min(1).parse(formData.get("key"));

  const db = createSupabaseAdminClient();
  const { data: role } = await db
    .from("roles")
    .select("key, label, built_in")
    .eq("key", key)
    .maybeSingle();
  if (!role) return { error: "Role not found." };
  if (role.built_in) return { error: "Built-in roles cannot be deleted." };

  const { count: members } = await db
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", key);
  if ((members ?? 0) > 0) {
    return { error: `Reassign the ${members} member(s) holding this role first.` };
  }

  // Remove it from the approval chain first, then delete the role.
  await db.from("approval_stages").delete().eq("role", key);
  const { error } = await db.from("roles").delete().eq("key", key);
  if (error) return { error: error.message };

  revalidateRoles();
  return { error: null, success: `Role "${role.label}" deleted.` };
}

export async function addStage(
  _prev: RolesState,
  formData: FormData,
): Promise<RolesState> {
  await requireRole("admin");
  const role = z.string().min(1).parse(formData.get("role"));

  const db = createSupabaseAdminClient();
  const { data: max } = await db
    .from("approval_stages")
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await db
    .from("approval_stages")
    .insert({ role, sort: (max?.sort ?? 0) + 1 });
  if (error) {
    return {
      error: error.code === "23505" ? "This role is already in the chain." : error.message,
    };
  }

  revalidateRoles();
  return { error: null, success: "Stage added to the approval chain." };
}

export async function removeStage(
  _prev: RolesState,
  formData: FormData,
): Promise<RolesState> {
  await requireRole("admin");
  const role = z.string().min(1).parse(formData.get("role"));

  const db = createSupabaseAdminClient();
  const { count } = await db
    .from("approval_stages")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    return { error: "At least one sign-off stage is required." };
  }

  const { error } = await db.from("approval_stages").delete().eq("role", role);
  if (error) return { error: error.message };

  revalidateRoles();
  return { error: null, success: "Stage removed from the approval chain." };
}

export async function moveStage(
  _prev: RolesState,
  formData: FormData,
): Promise<RolesState> {
  await requireRole("admin");
  const role = z.string().min(1).parse(formData.get("role"));
  const direction = z.enum(["up", "down"]).parse(formData.get("direction"));

  const db = createSupabaseAdminClient();
  const { data: stages } = await db
    .from("approval_stages")
    .select("id, role, sort")
    .order("sort");
  const list = stages ?? [];
  const index = list.findIndex((s) => s.role === role);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= list.length) {
    return { error: null };
  }

  await db
    .from("approval_stages")
    .update({ sort: list[swapWith].sort })
    .eq("id", list[index].id);
  await db
    .from("approval_stages")
    .update({ sort: list[index].sort })
    .eq("id", list[swapWith].id);

  revalidateRoles();
  return { error: null };
}
