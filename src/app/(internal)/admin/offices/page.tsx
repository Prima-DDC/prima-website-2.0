import { EditorForm } from "@/features/cms/EditorForm";
import { requireCapability } from "@/features/capabilities/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OfficesAdminPage() {
  await requireCapability("manage_content");
  const supabase = await createSupabaseServerClient();
  const { data: offices } = await supabase
    .from("offices")
    .select("slug, phone, whatsapp, email, map_url, t")
    .order("sort");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Offices</h1>
      <p className="mt-1 text-sm text-slate-body">
        Contact details shown in the footer, contact page, and search results.
      </p>
      <div className="mt-8 space-y-6">
        {(offices ?? []).map((office) => (
          <EditorForm
            key={office.slug}
            kind="entity"
            title={(office.t as { en?: { name?: string } }).en?.name ?? office.slug}
            hidden={{ table: "offices", key: office.slug }}
            scalars={[
              { name: "phone", label: "Phone", value: office.phone ?? "" },
              { name: "whatsapp", label: "WhatsApp number", value: office.whatsapp ?? "" },
              { name: "email", label: "Email", value: office.email ?? "" },
              { name: "map_url", label: "Map URL", value: office.map_url ?? "" },
            ]}
            t={office.t}
          />
        ))}
      </div>
    </div>
  );
}
