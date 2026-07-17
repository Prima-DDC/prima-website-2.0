import { ArrowRight, ClipboardCheck, FileText, Inbox, Users } from "lucide-react";
import Link from "next/link";
import { requireAnyCapability } from "@/features/capabilities/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const { profile, capabilities } = await requireAnyCapability();
  const can = (c: string) => capabilities.includes(c as never);
  const supabase = await createSupabaseServerClient();

  const [submissions, blocks, users, ops, recent] = await Promise.all([
    can("manage_inbox")
      ? supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new")
      : Promise.resolve({ count: 0 }),
    can("manage_content")
      ? supabase.from("content_blocks").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: 0 }),
    can("manage_users")
      ? supabase.from("profiles").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: 0 }),
    can("manage_documents")
      ? supabase.from("ops_documents").select("id", { count: "exact", head: true }).eq("status", "submitted")
      : Promise.resolve({ count: 0 }),
    can("manage_inbox")
      ? supabase
          .from("contact_submissions")
          .select("id, name, email, service_interest, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] as Array<Record<string, string>> }),
  ]);

  const cards = [
    { href: "/admin/inbox", label: "New enquiries", value: submissions.count ?? 0, Icon: Inbox, cap: "manage_inbox" },
    { href: "/admin/ops", label: "Pending approvals", value: ops.count ?? 0, Icon: ClipboardCheck, cap: "manage_documents" },
    { href: "/admin/content", label: "Content blocks", value: blocks.count ?? 0, Icon: FileText, cap: "manage_content" },
    { href: "/admin/users", label: "Workspace users", value: users.count ?? 0, Icon: Users, cap: "manage_users" },
  ].filter((c) => can(c.cap));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-body">
        Welcome, {profile.fullName || profile.email}. Your assigned management
        tools are below.
      </p>

      {cards.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ href, label, value, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand" aria-hidden />
                <ArrowRight className="h-4 w-4 text-slate-body/40 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
              </div>
              <p className="mt-4 font-serif text-4xl font-bold text-navy">{value}</p>
              <p className="mt-1 text-sm font-medium text-slate-body">{label}</p>
            </Link>
          ))}
        </div>
      ) : null}

      {can("manage_inbox") ? (
        <div className="mt-10 rounded-lg border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-semibold text-navy">Latest enquiries</h2>
            <Link href="/admin/inbox" className="text-sm font-semibold text-brand hover:text-brand-dark">
              View all
            </Link>
          </div>
          {recent.data && recent.data.length > 0 ? (
            <ul className="divide-y divide-line">
              {recent.data.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-navy">{s.name}</p>
                    <p className="text-xs text-slate-body">
                      {s.email}
                      {s.service_interest ? ` - ${s.service_interest}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      s.status === "new" ? "bg-brand/10 text-brand-dark" : "bg-mist text-slate-body"
                    }`}
                  >
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-slate-body">No enquiries yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
