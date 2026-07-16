"use client";

import { CheckCircle2, Save } from "lucide-react";
import { useActionState } from "react";
import {
  saveContentBlock,
  saveEntity,
  saveSiteSettings,
  type CmsState,
} from "./actions";
import { JsonEditor } from "./JsonEditor";
import { LocaleTabs } from "./LocaleTabs";

const ACTIONS = {
  block: saveContentBlock,
  entity: saveEntity,
  settings: saveSiteSettings,
} as const;

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

export interface ScalarField {
  name: string;
  label: string;
  value: string;
}

/**
 * One save form for a CMS record: optional scalar columns, plus either a
 * per-locale tabbed editor (`t`) or a single JSON editor (`value`).
 */
export function EditorForm({
  kind,
  title,
  hidden,
  scalars = [],
  t,
  value,
}: {
  kind: keyof typeof ACTIONS;
  title: string;
  hidden: Record<string, string>;
  scalars?: ScalarField[];
  t?: Record<string, unknown>;
  value?: unknown;
}) {
  const [state, formAction, pending] = useActionState<CmsState, FormData>(
    ACTIONS[kind],
    { error: null },
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-line bg-white p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-navy">{title}</h2>
        <div className="flex items-center gap-3">
          {state.saved ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-brand" role="status">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" aria-hidden />
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {state.error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      {Object.entries(hidden).map(([name, val]) => (
        <input key={name} type="hidden" name={name} value={val} />
      ))}

      {scalars.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {scalars.map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-xs font-semibold text-navy">
                {field.label}
              </label>
              <input name={field.name} defaultValue={field.value} className={inputClass} />
            </div>
          ))}
        </div>
      ) : null}

      {t ? (
        <div className="mt-5">
          <LocaleTabs
            panels={{
              en: <JsonEditor name="t_en" initial={t.en} />,
              fr: <JsonEditor name="t_fr" initial={t.fr} />,
              es: <JsonEditor name="t_es" initial={t.es} />,
            }}
          />
        </div>
      ) : null}

      {value !== undefined ? (
        <div className="mt-5">
          <JsonEditor name="value" initial={value} />
        </div>
      ) : null}
    </form>
  );
}
