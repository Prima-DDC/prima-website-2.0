"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/features/capabilities/service";
import {
  DOC_VIEWS,
  VIEW_META,
  type ColumnConfig,
  type DocColumnKey,
} from "./columns";
import { saveColumnConfig } from "./columns-store";

export interface ColumnsState {
  ok: boolean;
}

/** Persists the per-view column selection (checkbox name = view, value = key). */
export async function saveDocumentColumns(
  _prev: ColumnsState,
  formData: FormData,
): Promise<ColumnsState> {
  await requireCapability("manage_documents");

  const config: ColumnConfig = {};
  for (const view of DOC_VIEWS) {
    const valid = new Set<DocColumnKey>(VIEW_META[view].columns);
    const selected = formData
      .getAll(view)
      .map((v) => String(v) as DocColumnKey)
      .filter((k) => valid.has(k));
    config[view] = [...new Set(selected)];
  }
  await saveColumnConfig(config);

  revalidatePath("/portal");
  revalidatePath("/portal/approvals");
  revalidatePath("/admin/ops");
  revalidatePath("/admin/document-columns");
  return { ok: true };
}
