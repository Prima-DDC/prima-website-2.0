import { ArrowRight, Briefcase } from "lucide-react";
import { requireCapability } from "@/features/capabilities/service";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ServicesAdminPage() {
  await requireCapability("manage_content");
  const supabase = await createSupabaseServerClient();
  const { data: services } = await supabase
    .from("services")
    .select("slug, sort, t")
    .order("sort");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Practice areas</h1>
      <p className="mt-1 text-sm text-slate-body">
        Edit the six practice areas shown on the public site.
      </p>
      <div className="mt-8 space-y-3">
        {(services ?? []).map((service) => (
          <Link
            key={service.slug}
            href={`/admin/services/${service.slug}`}
            className="group flex items-center justify-between rounded-lg border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-brand" aria-hidden />
              <p className="text-sm font-semibold text-navy">
                {(service.t as { en?: { title?: string } }).en?.title ?? service.slug}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-body/40 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
          </Link>
        ))}
      </div>
    </div>
  );
}
