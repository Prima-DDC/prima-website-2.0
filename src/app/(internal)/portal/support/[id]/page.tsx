import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabel, TICKET_STATUS_STYLES, type TicketStatus } from "@/features/support/config";
import { ReplyForm } from "@/features/support/ReplyForm";
import { TicketThread } from "@/features/support/TicketThread";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortalTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, subject, category, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/portal/support"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Support
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-body">
            {ticket.ticket_number} | {categoryLabel(ticket.category)} | Opened{" "}
            {new Date(ticket.created_at).toLocaleString("en-GB")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${TICKET_STATUS_STYLES[ticket.status as TicketStatus]}`}
        >
          {ticket.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-6">
        <TicketThread ticketId={ticket.id} />
        {ticket.status !== "closed" ? (
          <ReplyForm ticketId={ticket.id} />
        ) : (
          <p className="mt-5 rounded-md border border-line bg-mist/50 px-4 py-3 text-sm text-slate-body">
            This ticket is closed. Open a new one if you need anything else.
          </p>
        )}
      </div>
    </div>
  );
}
