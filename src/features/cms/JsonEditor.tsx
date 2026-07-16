"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

/**
 * Generic structured editor for CMS jsonb payloads. Renders recursive form
 * fields from the JSON shape (strings, string arrays, object arrays, nested
 * objects) and serializes the edited value into a hidden input for the
 * enclosing server-action form. Editors cannot change the shape, only values
 * and list lengths, which keeps the public design safe.
 */

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

function labelize(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function setAtPath(root: unknown, path: (string | number)[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = [...root];
    copy[head as number] = setAtPath(copy[head as number], rest, value);
    return copy;
  }
  const obj = { ...(root as Record<string, unknown>) };
  obj[head as string] = setAtPath(obj[head as string], rest, value);
  return obj;
}

function emptyClone(template: unknown): unknown {
  if (typeof template === "string") return "";
  if (typeof template === "number") return 0;
  if (Array.isArray(template)) return [];
  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template).map(([k, v]) => [k, emptyClone(v)]),
    );
  }
  return "";
}

function Field({
  value,
  path,
  onChange,
  label,
}: {
  value: unknown;
  path: (string | number)[];
  onChange: (path: (string | number)[], value: unknown) => void;
  label?: string;
}) {
  if (typeof value === "string") {
    const long = value.length > 80;
    return (
      <div>
        {label ? (
          <label className="mb-1 block text-xs font-semibold text-navy">{label}</label>
        ) : null}
        {long ? (
          <textarea
            value={value}
            rows={Math.min(8, Math.ceil(value.length / 90) + 1)}
            onChange={(e) => onChange(path, e.target.value)}
            className={inputClass}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className={inputClass}
          />
        )}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        {label ? (
          <label className="mb-1 block text-xs font-semibold text-navy">{label}</label>
        ) : null}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(path, Number(e.target.value))}
          className={inputClass}
        />
      </div>
    );
  }

  if (Array.isArray(value)) {
    const template = value[0];
    return (
      <div className="rounded-md border border-line/80 bg-mist/30 p-3">
        {label ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-body">
            {label}
          </p>
        ) : null}
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <Field value={item} path={[...path, i]} onChange={onChange} />
              </div>
              <button
                type="button"
                aria-label="Remove item"
                onClick={() =>
                  onChange(
                    path,
                    value.filter((_, idx) => idx !== i),
                  )
                }
                className="mt-1 rounded p-1.5 text-slate-body/60 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange(path, [...value, emptyClone(template)])}
          className="mt-3 inline-flex items-center gap-1.5 rounded border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
        >
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className={label ? "rounded-md border border-line/80 bg-white p-3" : ""}>
        {label ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-body">
            {label}
          </p>
        ) : null}
        <div className="space-y-3">
          {Object.entries(value).map(([key, val]) => (
            <Field
              key={key}
              value={val}
              path={[...path, key]}
              onChange={onChange}
              label={labelize(key)}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function JsonEditor({
  name,
  initial,
}: {
  name: string;
  initial: unknown;
}) {
  const [value, setValue] = useState(initial);

  const handleChange = (path: (string | number)[], newValue: unknown) => {
    setValue((prev: unknown) => setAtPath(prev, path, newValue));
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <Field value={value} path={[]} onChange={handleChange} />
    </div>
  );
}
