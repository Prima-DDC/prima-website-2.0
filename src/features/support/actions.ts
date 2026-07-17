"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { requireCapability } from "@/features/capabilities/service";
import { notify, userIdsByRole } from "@/features/notifications/notify";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SupportState {
  error: string | null;
}

const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.enum(["profile_change", "it_support", "access_request", "other"]),
  message: z.string().trim().min(5).max(5000),
});

export async function createTicket(
  _prev: SupportState,
  formData: FormData,
): Promise<SupportState> {
  const profile = await requireRole();

  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: "Fill in a subject and a message." };

  // Inserted with the user's session so RLS ownership applies.
  const supabase = await createSupabaseServerClient();
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      subject: parsed.data.subject,
      category: parsed.data.category,
      created_by: profile.id,
    })
    .select("id, ticket_number")
    .single();
  if (error || !ticket) return { error: error?.message ?? "Could not create ticket." };

  await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    author: profile.id,
    body: parsed.data.message,
  });

  await notify(await userIdsByRole(["admin"]), {
    title: `New support ticket ${ticket.ticket_number}`,
    body: `${profile.fullName || profile.email}: ${parsed.data.subject}`,
    link: `/admin/support/${ticket.id}`,
  });

  revalidatePath("/portal/support");
  revalidatePath("/admin/support");
  redirect(`/portal/support/${ticket.id}`);
}

const replySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
});

export async function replyTicket(
  _prev: SupportState,
  formData: FormData,
): Promise<SupportState> {
  const profile = await requireRole();

  const parsed = replySchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "Write a message first." };

  const supabase = await createSupabaseServerClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, subject, status, created_by")
    .eq("id", parsed.data.ticketId)
    .maybeSingle();
  if (!ticket) return { error: "Ticket not found." };
  if (ticket.status === "closed") return { error: "This ticket is closed." };

  const { error } = await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    author: profile.id,
    body: parsed.data.body,
  });
  if (error) return { error: error.message };

  const fromOwner = profile.id === ticket.created_by;
  const admin = createSupabaseAdminClient();
  if (!fromOwner && ticket.status === "open") {
    await admin
      .from("support_tickets")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", ticket.id);
  }

  await notify(
    fromOwner ? await userIdsByRole(["admin"]) : [ticket.created_by],
    {
      title: `Reply on ticket ${ticket.ticket_number}`,
      body: `${profile.fullName || profile.email}: ${parsed.data.body.slice(0, 140)}`,
      link: fromOwner
        ? `/admin/support/${ticket.id}`
        : `/portal/support/${ticket.id}`,
    },
  );

  revalidatePath(`/portal/support/${ticket.id}`);
  revalidatePath(`/admin/support/${ticket.id}`);
  revalidatePath("/portal/support");
  revalidatePath("/admin/support");
  return { error: null };
}

export async function updateTicketStatus(
  _prev: SupportState,
  formData: FormData,
): Promise<SupportState> {
  await requireCapability("manage_support");

  const ticketId = z.string().uuid().parse(formData.get("ticketId"));
  const status = z
    .enum(["open", "in_progress", "resolved", "closed"])
    .parse(formData.get("status"));

  const admin = createSupabaseAdminClient();
  const { data: ticket, error } = await admin
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId)
    .select("id, ticket_number, created_by")
    .single();
  if (error || !ticket) return { error: error?.message ?? "Update failed." };

  await notify([ticket.created_by], {
    title: `Ticket ${ticket.ticket_number} is now ${status.replace("_", " ")}`,
    body: "Open the ticket to see the latest updates from administration.",
    link: `/portal/support/${ticket.id}`,
  });

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath(`/portal/support/${ticketId}`);
  revalidatePath("/admin/support");
  revalidatePath("/portal/support");
  return { error: null };
}
