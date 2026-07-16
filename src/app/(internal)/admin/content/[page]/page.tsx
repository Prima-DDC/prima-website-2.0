import { notFound } from "next/navigation";
import { EditorForm } from "@/features/cms/EditorForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ContentPageEditor({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("page, section, sort, t")
    .eq("page", page)
    .order("sort");

  if (!blocks || blocks.length === 0) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold capitalize text-navy">
        {page.replace(/-/g, " ")}
      </h1>
      <p className="mt-1 text-sm text-slate-body">
        Changes go live on the public site within a few minutes of saving.
      </p>
      <div className="mt-8 space-y-6">
        {blocks.map((block) => (
          <EditorForm
            key={block.section}
            kind="block"
            title={block.section.replace(/-/g, " ")}
            hidden={{ page: block.page, section: block.section }}
            t={block.t}
          />
        ))}
      </div>
    </div>
  );
}
