"use client";

import { CheckCircle2, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { saveDocumentColumns, type ColumnsState } from "./columns-actions";
import {
  COLUMN_LABELS,
  DOC_VIEWS,
  VIEW_META,
  type DocColumnKey,
  type DocView,
} from "./columns";

/**
 * Lets an administrator choose which columns each document list view shows.
 * The document number is always shown as the anchor column, so it is not an
 * option here.
 */
export function ColumnSettingsForm({
  enabled,
}: {
  enabled: Record<DocView, DocColumnKey[]>;
}) {
  const [state, formAction, pending] = useActionState<ColumnsState, FormData>(
    saveDocumentColumns,
    { ok: false },
  );
  const [checked, setChecked] = useState<Record<DocView, Set<DocColumnKey>>>(() =>
    Object.fromEntries(
      DOC_VIEWS.map((v) => [v, new Set(enabled[v])]),
    ) as Record<DocView, Set<DocColumnKey>>,
  );

  const toggle = (view: DocView, key: DocColumnKey) =>
    setChecked((prev) => {
      const next = new Set(prev[view]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, [view]: next };
    });

  return (
    <form action={formAction} className="space-y-6">
      {DOC_VIEWS.map((view) => (
        <fieldset key={view} className="rounded-lg border border-line bg-white p-6">
          <legend className="px-1 text-sm font-bold text-navy">
            {VIEW_META[view].label}
          </legend>
          <p className="mt-1 text-xs text-slate-body">
            Document number is always shown. Choose the other columns below.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {VIEW_META[view].columns.map((key) => {
              const on = checked[view].has(key);
              return (
                <label
                  key={key}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    on
                      ? "border-brand bg-mist text-brand-dark"
                      : "border-line bg-white text-navy hover:border-brand/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    name={view}
                    value={key}
                    checked={on}
                    onChange={() => toggle(view, key)}
                    className="h-4 w-4 rounded border-line accent-brand"
                  />
                  {COLUMN_LABELS[key]}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden />
          {pending ? "Saving..." : "Save columns"}
        </button>
        {state.ok && !pending ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark" role="status">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Saved.
          </span>
        ) : null}
      </div>
    </form>
  );
}
