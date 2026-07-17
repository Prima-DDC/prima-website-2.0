"use client";

import { Plus, Send, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { submitOpsDocument, updateOpsDocument, type OpsState } from "./actions";
import {
  formatMoney,
  type DocType,
  type DocTypeConfig,
  type FieldConfig,
} from "./config";

const inputClass =
  "w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

type Values = Record<string, unknown>;

function emptyItem(config: DocTypeConfig): Record<string, string> {
  return Object.fromEntries(
    (config.lineItems?.columns ?? []).map((c) => [c.name, ""]),
  );
}

export function OpsForm({
  docType,
  config,
  docId,
  initialData,
}: {
  docType: DocType;
  config: Pick<DocTypeConfig, "fields" | "lineItems" | "title">;
  /** When set, the form edits an existing document (admin correction). */
  docId?: string;
  initialData?: Values;
}) {
  const [state, formAction, pending] = useActionState<OpsState, FormData>(
    docId ? updateOpsDocument : submitOpsDocument,
    { error: null },
  );
  const [values, setValues] = useState<Values>(() => ({
    ...Object.fromEntries(config.fields.map((f) => [f.name, ""])),
    ...(config.lineItems
      ? { [config.lineItems.name]: [emptyItem(config as DocTypeConfig)] }
      : {}),
    ...initialData,
  }));

  const set = (name: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const items = (values[config.lineItems?.name ?? ""] ?? []) as Array<
    Record<string, string>
  >;

  const currency = String(values.currency || "GHS");
  const runningTotal = config.lineItems
    ? items.reduce((sum, item) => {
        if ("amount" in item) return sum + (Number(item.amount) || 0);
        return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      }, 0)
    : null;

  const renderField = (field: FieldConfig) => {
    const common = {
      id: `ops-${field.name}`,
      required: field.required,
      value: String(values[field.name] ?? ""),
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => set(field.name, e.target.value),
      className: inputClass,
    };

    switch (field.type) {
      case "textarea":
        return <textarea {...common} rows={4} />;
      case "select":
        return (
          <select {...common}>
            <option value="" disabled>
              Select...
            </option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "number":
        return <input {...common} type="number" step="0.01" min="0" />;
      case "date":
        return <input {...common} type="date" />;
      default:
        return <input {...common} type="text" />;
    }
  };

  return (
    <form
      action={formAction}
      className="rounded-lg border border-line bg-white p-7"
    >
      <input type="hidden" name="docType" value={docType} />
      <input type="hidden" name="data" value={JSON.stringify(values)} />
      {docId ? <input type="hidden" name="docId" value={docId} /> : null}

      {state.error ? (
        <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {config.fields.map((field) => (
          <div
            key={field.name}
            className={field.type === "textarea" ? "sm:col-span-2" : ""}
          >
            <label
              htmlFor={`ops-${field.name}`}
              className="mb-1.5 block text-sm font-semibold text-navy"
            >
              {field.label}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {config.lineItems ? (
        <div className="mt-7">
          <p className="text-sm font-semibold text-navy">{config.lineItems.label}</p>
          <div className="mt-3 space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-end gap-2">
                {config.lineItems!.columns.map((col) => (
                  <div key={col.name} className={col.type === "text" ? "flex-[3]" : "flex-1"}>
                    {i === 0 ? (
                      <label className="mb-1 block text-xs font-semibold text-slate-body">
                        {col.label}
                      </label>
                    ) : null}
                    <input
                      type={col.type === "number" ? "number" : "text"}
                      step="0.01"
                      min="0"
                      required
                      value={item[col.name] ?? ""}
                      onChange={(e) => {
                        const next = items.map((it, idx) =>
                          idx === i ? { ...it, [col.name]: e.target.value } : it,
                        );
                        set(config.lineItems!.name, next);
                      }}
                      className={inputClass}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  aria-label="Remove item"
                  disabled={items.length === 1}
                  onClick={() =>
                    set(
                      config.lineItems!.name,
                      items.filter((_, idx) => idx !== i),
                    )
                  }
                  className="rounded p-2.5 text-slate-body/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                set(config.lineItems!.name, [
                  ...items,
                  emptyItem(config as DocTypeConfig),
                ])
              }
              className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
            >
              <Plus className="h-3.5 w-3.5" /> Add item
            </button>
            {runningTotal !== null && runningTotal > 0 ? (
              <p className="text-sm font-bold text-brand-dark">
                Total: {formatMoney(runningTotal, currency)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group mt-8 inline-flex items-center gap-2 rounded bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        {pending
          ? "Saving..."
          : docId
            ? "Save changes"
            : `Submit ${config.title.toLowerCase()}`}
      </button>
    </form>
  );
}
