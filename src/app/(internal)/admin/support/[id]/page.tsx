import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabel } from "@/features/support/config";
import { ReplyForm } from "@/features/support/ReplyForm";
import { TicketStatusControl } from "@/features/support/TicketStatusControl";
import { TicketThread } from "@/features/support/TicketThread";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select(
      "id, ticket_number, subject, category, status, created_at, profiles:created_by (full_name, email)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!ticket) notFound();

  const owner = ticket.profiles as unknown as {
    full_name: string | null;
    email: string;
  } | null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Support queue
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-body">
            {ticket.ticket_number} | {categoryLabel(ticket.category)} | From{" "}
            {owner?.full_name || owner?.email} |{" "}
            {new Date(ticket.created_at).toLocaleString("en-GB")}
          </p>
        </div>
        <TicketStatusControl ticketId={ticket.id} status={ticket.status} />
      </div>

      <div className="mt-6">
        <TicketThread ticketId={ticket.id} />
        {ticket.status !== "closed" ? <ReplyForm ticketId={ticket.id} /> : null}
      </div>
    </div>
  );
}
