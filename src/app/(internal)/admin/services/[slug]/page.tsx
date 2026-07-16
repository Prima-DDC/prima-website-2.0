import { notFound } from "next/navigation";
import { EditorForm } from "@/features/cms/EditorForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ServiceEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: service } = await supabase
    .from("services")
    .select("slug, icon, t")
    .eq("slug", slug)
    .maybeSingle();

  if (!service) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">
        {(service.t as { en?: { title?: string } }).en?.title ?? service.slug}
      </h1>
      <div className="mt-8">
        <EditorForm
          kind="entity"
          title="Practice area content"
          hidden={{ table: "services", key: service.slug }}
          scalars={[{ name: "icon", label: "Icon (Lucide name)", value: service.icon }]}
          t={service.t}
        />
      </div>
    </div>
  );
}
