"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateSubmissionStatus(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(["new", "read", "archived"]).parse(formData.get("status"));

  const admin = createSupabaseAdminClient();
  await admin.from("contact_submissions").update({ status }).eq("id", id);
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}
