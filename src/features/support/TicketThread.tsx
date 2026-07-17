import { Avatar } from "@/components/Avatar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Message thread for a ticket (RLS keeps it owner/admin only). */
export async function TicketThread({ ticketId }: { ticketId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: messages } = await supabase
    .from("support_messages")
    .select("id, body, created_at, profiles:author (full_name, email, photo_path, role)")
    .eq("ticket_id", ticketId)
    .order("created_at");

  return (
    <ol className="space-y-5">
      {(messages ?? []).map((message) => {
        const author = message.profiles as unknown as {
          full_name: string | null;
          email: string;
          photo_path: string | null;
          role: string;
        } | null;
        const name = author?.full_name || author?.email || "Unknown";
        const isStaffSide = author?.role === "admin";
        return (
          <li key={message.id} className="flex gap-3">
            <Avatar photoPath={author?.photo_path ?? null} name={name} size={36} />
            <div
              className={`min-w-0 flex-1 rounded-lg border p-4 ${
                isStaffSide ? "border-brand/30 bg-mist/50" : "border-line bg-white"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-navy">
                  {name}
                  {isStaffSide ? (
                    <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-dark">
                      Administration
                    </span>
                  ) : null}
                </p>
                <p className="text-[11px] text-slate-body/70">
                  {new Date(message.created_at).toLocaleString("en-GB")}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-body">
                {message.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
