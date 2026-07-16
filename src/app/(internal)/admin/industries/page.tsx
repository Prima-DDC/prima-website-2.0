import { EditorForm } from "@/features/cms/EditorForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function IndustriesAdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: industries } = await supabase
    .from("industries")
    .select("slug, icon, t")
    .order("sort");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Industries</h1>
      <p className="mt-1 text-sm text-slate-body">
        Edit the industry descriptions shown on the public site.
      </p>
      <div className="mt-8 space-y-6">
        {(industries ?? []).map((industry) => (
          <EditorForm
            key={industry.slug}
            kind="entity"
            title={
              (industry.t as { en?: { title?: string } }).en?.title ?? industry.slug
            }
            hidden={{ table: "industries", key: industry.slug }}
            scalars={[{ name: "icon", label: "Icon (Lucide name)", value: industry.icon }]}
            t={industry.t}
          />
        ))}
      </div>
    </div>
  );
}
