import { requireCapability } from "@/features/capabilities/service";
import { columnsFor, DOC_VIEWS, type DocColumnKey, type DocView } from "@/features/ops/columns";
import { getColumnConfig } from "@/features/ops/columns-store";
import { ColumnSettingsForm } from "@/features/ops/ColumnSettingsForm";

export default async function DocumentColumnsPage() {
  await requireCapability("manage_documents");
  const config = await getColumnConfig();
  const enabled = Object.fromEntries(
    DOC_VIEWS.map((v) => [v, columnsFor(config, v)]),
  ) as Record<DocView, DocColumnKey[]>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-navy">Document columns</h1>
      <p className="mt-1 text-sm text-slate-body">
        Choose which columns appear in the My Documents and Approvals lists.
        This applies to every user.
      </p>
      <div className="mt-8">
        <ColumnSettingsForm enabled={enabled} />
      </div>
    </div>
  );
}
