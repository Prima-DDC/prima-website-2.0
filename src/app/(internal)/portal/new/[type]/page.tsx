import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/features/auth/helpers";
import { getLeaveUsage, getSubmittableTypes } from "@/features/ops/stages";
import { DOC_CONFIG, docTypeFromSlug } from "@/features/ops/config";
import { OpsForm } from "@/features/ops/OpsForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const profile = await requireRole();
  const { type } = await params;
  const docType = docTypeFromSlug(type);
  if (!docType) notFound();
  const submittable = await getSubmittableTypes(profile.role);
  if (!submittable.includes(docType)) redirect("/portal/new");

  const { title, description, fields, lineItems, leaveBalance } = DOC_CONFIG[docType];

  // Leave and excuse duty show a live balance against the annual entitlement.
  let balance = null;
  if (leaveBalance) {
    const supabase = await createSupabaseServerClient();
    const { data: me } = await supabase
      .from("profiles")
      .select("leave_entitlement")
      .eq("id", profile.id)
      .maybeSingle();
    const entitlement = me?.leave_entitlement ?? 15;
    const usedThisYear = await getLeaveUsage(profile.id, new Date().getFullYear());
    balance = { entitlement, usedThisYear, ...leaveBalance };
  }
  const defaultCurrency = profile.branch === "rwanda" ? "RWF" : "GHS";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="mt-1 text-sm text-slate-body">{description}</p>
      <div className="mt-8">
        {/* Only serializable config crosses to the client (no zod schema). */}
        <OpsForm
          docType={docType}
          config={{ title, fields, lineItems }}
          balance={balance}
          defaultCurrency={defaultCurrency}
        />
      </div>
    </div>
  );
}
