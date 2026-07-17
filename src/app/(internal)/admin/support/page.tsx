import Link from "next/link";
import { requireCapability } from "@/features/capabilities/service";
import { categoryLabel, TICKET_STATUS_STYLES, type TicketStatus } from "@/features/support/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TABS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireCapability("manage_support");
  const { status = "open" } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("support_tickets")
    .select(
      "id, ticket_number, subject, category, status, created_at, profiles:created_by (full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  const { data: tickets } = await query;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Support</h1>
      <p className="mt-1 text-sm text-slate-body">
        Staff requests: profile changes, IT support, access, and more.
      </p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/support?status=${tab.value}`}
            className={`whitespace-nowrap rounded-t-md px-4 py-2 text-sm font-semibold transition-colors ${
              status === tab.value
                ? "border border-b-0 border-line bg-white text-brand"
                : "text-slate-body hover:text-navy"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!tickets || tickets.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          Nothing here.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ticket</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">From</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tickets.map((ticket) => {
                  const owner = ticket.profiles as unknown as {
                    full_name: string | null;
                    email: string;
                  } | null;
                  return (
                    <tr key={ticket.id} className="transition-colors hover:bg-mist/40">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/support/${ticket.id}`}
                          className="font-semibold text-brand hover:text-brand-dark"
                        >
                          {ticket.ticket_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-navy">{ticket.subject}</td>
                      <td className="px-5 py-3.5 text-slate-body">
                        {owner?.full_name || owner?.email}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
