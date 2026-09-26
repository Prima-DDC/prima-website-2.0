"use client";

import { Paperclip, Plus, Send, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import {
  editOwnDocument,
  submitOpsDocument,
  updateOpsDocument,
  type OpsState,
} from "./actions";
import {
  daysInclusive,
  formatMoney,
  type DocType,
  type DocTypeConfig,
  type FieldConfig,
} from "./config";
import {
  attachmentError,
  formatFileSize,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
  MAX_UPLOAD_BATCH_SIZE,
  type Attachment,
} from "./attachments";

export interface LeaveBalanceProps {
  entitlement: number;
  usedThisYear: number;
  startField: string;
  endField: string;
}

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
  editor = "admin",
  balance = null,
  allowAttachments = false,
}: {
  docType: DocType;
  config: Pick<DocTypeConfig, "fields" | "lineItems" | "title">;
  /** When set, the form edits an existing document. */
  docId?: string;
  initialData?: Values;
  /** Who is editing: the submitter ("owner") or administration ("admin"). */
  editor?: "owner" | "admin";
  /** Live annual-leave balance summary (leave and excuse duty only). */
  balance?: LeaveBalanceProps | null;
  /** Whether supporting files may be attached. */
  allowAttachments?: boolean;
}) {
  const [state, formAction, pending] = useActionState<OpsState, FormData>(
    docId ? (editor === "owner" ? editOwnDocument : updateOpsDocument) : submitOpsDocument,
    { error: null },
  );
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [values, setValues] = useState<Values>(() => ({
    ...Object.fromEntries(
      config.fields.map((f) => [f.name, f.name === "currency" ? "GHS" : ""]),
    ),
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

  const attachments = (values.attachments as Attachment[] | undefined) ?? [];
  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      const err = attachmentError(f.name, f.size);
      if (err) {
        setFileError(err);
        setSelectedNames([]);
        e.target.value = "";
        return;
      }
    }
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setFileError(`A document may have at most ${MAX_ATTACHMENTS} attachments.`);
      setSelectedNames([]);
      e.target.value = "";
      return;
    }
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_UPLOAD_BATCH_SIZE) {
      setFileError(
        `Please keep each upload under ${Math.round(MAX_UPLOAD_BATCH_SIZE / (1024 * 1024))} MB in total.`,
      );
      setSelectedNames([]);
      e.target.value = "";
      return;
    }
    setFileError(null);
    setSelectedNames(files.map((f) => f.name));
  };
  const removeAttachment = (path: string) =>
    set(
      "attachments",
      attachments.filter((a) => a.path !== path),
    );

  const currency = String(values.currency || "GHS");
  const leaveDays = balance
    ? daysInclusive(
        String(values[balance.startField] ?? ""),
        String(values[balance.endField] ?? ""),
      )
    : 0;
  const remaining = balance
    ? balance.entitlement - balance.usedThisYear - leaveDays
    : 0;
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

      {balance ? (
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-line bg-mist/40 p-5 sm:grid-cols-4">
          <Stat label="Days entitled" value={String(balance.entitlement)} />
          <Stat label="Used this year" value={String(balance.usedThisYear)} />
          <Stat label="This request" value={`${leaveDays} day${leaveDays === 1 ? "" : "s"}`} />
          <Stat
            label="Remaining"
            value={String(Math.max(0, remaining))}
            warn={remaining < 0}
          />
          {remaining < 0 ? (
            <p className="col-span-2 text-xs text-red-600 sm:col-span-4">
              This request exceeds the remaining annual leave balance.
            </p>
          ) : null}
        </div>
      ) : null}

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
                      type={
                        col.type === "number"
                          ? "number"
                          : col.type === "date"
                            ? "date"
                            : "text"
                      }
                      {...(col.type === "number" ? { step: "0.01", min: "0" } : {})}
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

      {allowAttachments ? (
        <div className="mt-7">
          <p className="text-sm font-semibold text-navy">Attachments (optional)</p>
          <p className="mt-1 text-xs text-slate-body">
            Attach supporting files such as receipts, invoices, or quotations.
            Up to {MAX_ATTACHMENTS} files, {Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024))} MB each.
            Executable and script files are not accepted.
          </p>

          {attachments.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {attachments.map((a) => (
                <li
                  key={a.path}
                  className="flex items-center justify-between gap-2 rounded-md border border-line bg-mist/40 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-navy">
                    <Paperclip className="h-4 w-4 shrink-0 text-slate-body" aria-hidden />
                    <span className="truncate">{a.name}</span>
                    <span className="shrink-0 text-xs text-slate-body">
                      ({formatFileSize(a.size)})
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${a.name}`}
                    onClick={() => removeAttachment(a.path)}
                    className="rounded p-1.5 text-slate-body/60 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <label
            htmlFor="ops-files"
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-line px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
          >
            <Paperclip className="h-4 w-4" aria-hidden />
            Choose files
          </label>
          <input
            id="ops-files"
            type="file"
            name="files"
            multiple
            onChange={onFilesChange}
            className="hidden"
          />
          {selectedNames.length > 0 ? (
            <p className="mt-2 text-xs text-slate-body">
              Ready to upload: {selectedNames.join(", ")}
            </p>
          ) : null}
          {fileError ? (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {fileError}
            </p>
          ) : null}
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

function Stat({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-body">{label}</p>
      <p className={`mt-1 text-lg font-bold ${warn ? "text-red-600" : "text-navy"}`}>{value}</p>
    </div>
  );
}
