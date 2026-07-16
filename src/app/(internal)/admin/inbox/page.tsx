import { Archive, MailOpen } from "lucide-react";
import { updateSubmissionStatus } from "@/features/contact/admin-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand/10 text-brand-dark",
  read: "bg-mist text-slate-body",
  archived: "bg-line/50 text-slate-body/70",
};

export default async function InboxPage() {
  const supabase = await createSupabaseServerClient();
  const { data: submissions } = await supabase
    .from("contact_submissions")
    .select("id, name, email, phone, service_interest, message, locale, status, created_at")
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Enquiry inbox</h1>
      <p className="mt-1 text-sm text-slate-body">
        Confidential enquiries submitted through the public contact form.
      </p>

      {!submissions || submissions.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          No enquiries yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {submissions.map((s) => (
            <details
              key={s.id}
              className="group rounded-lg border border-line bg-white open:border-brand/40 open:shadow-lg open:shadow-brand/5"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-6 py-4 [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="text-sm font-semibold text-navy">{s.name}</p>
                  <p className="text-xs text-slate-body">
                    {s.email}
                    {s.service_interest ? ` | ${s.service_interest}` : ""} |{" "}
                    {new Date(s.created_at).toLocaleString("en-GB")} |{" "}
                    {s.locale.toUpperCase()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[s.status]}`}
                >
                  {s.status}
                </span>
              </summary>
              <div className="border-t border-line px-6 py-4">
                {s.phone ? (
                  <p className="text-xs text-slate-body">Phone: {s.phone}</p>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {s.message}
                </p>
                <div className="mt-4 flex gap-2">
                  {s.status === "new" ? (
                    <form action={updateSubmissionStatus}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="status" value="read" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
                      >
                        <MailOpen className="h-3.5 w-3.5" /> Mark as read
                      </button>
                    </form>
                  ) : null}
                  <form action={updateSubmissionStatus}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value="archived" />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-xs font-semibold text-slate-body transition-colors hover:border-navy hover:text-navy"
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </button>
                  </form>
                  <a
                    href={`mailto:${s.email}`}
                    className="inline-flex items-center gap-1.5 rounded bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Reply by email
                  </a>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
