import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/features/auth/helpers";
import { DOC_CONFIG, type DocType } from "@/features/ops/config";
import { OpsForm } from "@/features/ops/OpsForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EditOwnDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireRole();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: doc } = await supabase
    .from("ops_documents")
    .select("id, doc_type, doc_number, data, status, submitted_by")
    .eq("id", id)
    .maybeSingle();
  if (!doc) notFound();
  if (doc.submitted_by !== profile.id || doc.status !== "submitted") {
    redirect(`/portal/${id}`);
  }

  const docType = doc.doc_type as DocType;
  const { title, fields, lineItems } = DOC_CONFIG[docType];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/portal/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> {doc.doc_number}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-navy">Edit {doc.doc_number}</h1>
      <p className="mt-1 text-sm text-slate-body">
        You can edit this request until it is fully approved. Any sign-offs
        already given will be cleared so the approval restarts on the updated
        details.
      </p>
      <div className="mt-8">
        <OpsForm
          docType={docType}
          config={{ title, fields, lineItems }}
          docId={doc.id}
          initialData={doc.data as Record<string, unknown>}
          editor="owner"
        />
      </div>
    </div>
  );
}
