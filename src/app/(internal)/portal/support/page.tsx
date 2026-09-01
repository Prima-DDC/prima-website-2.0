import { LifeBuoy, Plus } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/features/auth/helpers";
import {
  categoryLabel,
  TICKET_CATEGORIES,
  TICKET_STATUS_STYLES,
  type TicketStatus,
} from "@/features/support/config";
import {
  ListToolbar,
  filterSelectClass,
  matchesQuery,
} from "@/features/internal/ListToolbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SupportListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  await requireRole();
  const { q, status, category } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("support_tickets")
    .select("id, ticket_number, subject, category, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  const { data: allTickets } = await query;
  const hasAny = (allTickets ?? []).length > 0;
  const tickets = (allTickets ?? []).filter((t) =>
    matchesQuery(q, t.ticket_number, t.subject),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Support</h1>
          <p className="mt-1 text-sm text-slate-body">
            Request profile changes, IT help, or anything else from administration.
          </p>
        </div>
        <Link
          href="/portal/support/new"
          className="inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New ticket
        </Link>
      </div>

      {hasAny ? (
        <ListToolbar action="/portal/support" q={q} placeholder="Search by ticket or subject">
          <select name="status" defaultValue={status ?? ""} className={filterSelectClass}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select name="category" defaultValue={category ?? ""} className={filterSelectClass}>
            <option value="">All categories</option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </ListToolbar>
      ) : null}

      {!hasAny ? (
        <div className="mt-10 rounded-lg border border-dashed border-line bg-white p-12 text-center">
          <LifeBuoy className="mx-auto h-10 w-10 text-brand" aria-hidden />
          <p className="mt-4 font-semibold text-navy">No tickets yet</p>
          <p className="mt-1 text-sm text-slate-body">
            Open a ticket and administration will get back to you here.
          </p>
        </div>
      ) : tickets.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          No tickets match your search.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ticket</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="transition-colors hover:bg-mist/40">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/portal/support/${ticket.id}`}
                        className="font-semibold text-brand hover:text-brand-dark"
                      >
                        {ticket.ticket_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-navy">{ticket.subject}</td>
                    <td className="px-5 py-3.5 text-slate-body">
                      {categoryLabel(ticket.category)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${TICKET_STATUS_STYLES[ticket.status as TicketStatus]}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-body">
                      {new Date(ticket.created_at).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
