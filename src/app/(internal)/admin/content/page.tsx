import { ArrowRight, FileText } from "lucide-react";
import { requireCapability } from "@/features/capabilities/service";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ContentIndexPage() {
  await requireCapability("manage_content");
  const supabase = await createSupabaseServerClient();
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("page, section")
    .order("page");

  const pages = new Map<string, number>();
  for (const block of blocks ?? []) {
    pages.set(block.page, (pages.get(block.page) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Page content</h1>
      <p className="mt-1 text-sm text-slate-body">
        Edit every text block on the public site, per language.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[...pages.entries()].map(([page, count]) => (
          <Link
            key={page}
            href={`/admin/content/${page}`}
            className="group flex items-center justify-between rounded-lg border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-brand" aria-hidden />
              <div>
                <p className="text-sm font-semibold capitalize text-navy">
                  {page.replace(/-/g, " ")}
                </p>
                <p className="text-xs text-slate-body">
                  {count} block{count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-body/40 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
          </Link>
        ))}
      </div>
    </div>
  );
}
