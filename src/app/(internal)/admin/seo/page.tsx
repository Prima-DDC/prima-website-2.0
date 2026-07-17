import { EditorForm } from "@/features/cms/EditorForm";
import { requireCapability } from "@/features/capabilities/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SeoAdminPage() {
  await requireCapability("manage_content");
  const supabase = await createSupabaseServerClient();
  const [{ data: pages }, { data: settings }] = await Promise.all([
    supabase.from("page_seo").select("page, t").order("page"),
    supabase.from("site_settings").select("value").eq("key", "site").maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">SEO & site settings</h1>
      <p className="mt-1 text-sm text-slate-body">
        Search titles and descriptions per page, plus organization-wide
        settings (tagline, social links, certifications).
      </p>

      <div className="mt-8 space-y-6">
        {settings ? (
          <EditorForm
            kind="settings"
            title="Site settings"
            hidden={{}}
            value={settings.value}
          />
        ) : null}

        {(pages ?? []).map((page) => (
          <EditorForm
            key={page.page}
            kind="entity"
            title={`SEO: ${page.page.replace(/-/g, " ")}`}
            hidden={{ table: "page_seo", key: page.page }}
            t={page.t}
          />
        ))}
      </div>
    </div>
  );
}
