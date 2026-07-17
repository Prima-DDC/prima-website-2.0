import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/features/auth/helpers";
import { getSubmittableTypes } from "@/features/ops/stages";
import { DOC_CONFIG, docTypeFromSlug } from "@/features/ops/config";
import { OpsForm } from "@/features/ops/OpsForm";

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

  const { title, description, fields, lineItems } = DOC_CONFIG[docType];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="mt-1 text-sm text-slate-body">{description}</p>
      <div className="mt-8">
        {/* Only serializable config crosses to the client (no zod schema). */}
        <OpsForm docType={docType} config={{ title, fields, lineItems }} />
      </div>
    </div>
  );
}
