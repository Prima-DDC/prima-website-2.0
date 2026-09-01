import { Search } from "lucide-react";
import Link from "next/link";

/** Shared class for filter selects in a ListToolbar. */
export const filterSelectClass =
  "rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-brand";

/** True when q is empty or is a case-insensitive substring of any field. */
export function matchesQuery(
  q: string | undefined,
  ...fields: Array<string | null | undefined>
): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => (f ?? "").toLowerCase().includes(needle));
}

/**
 * A GET-form search and filter bar shared by the internal list pages. Renders a
 * text search plus any filter selects passed as children, and preserves the
 * given hidden params (e.g. the active status tab) on submit. Reset links back
 * to the base path.
 */
export function ListToolbar({
  action,
  q,
  placeholder,
  hidden,
  children,
}: {
  action: string;
  q?: string;
  placeholder: string;
  hidden?: Record<string, string | undefined>;
  children?: React.ReactNode;
}) {
  const hasFilters = Boolean(q) || Object.values(hidden ?? {}).some(Boolean);
  return (
    <form method="get" action={action} className="mt-6 flex flex-wrap items-center gap-3">
      {Object.entries(hidden ?? {}).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <div className="relative min-w-[12rem] flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-body/60"
          aria-hidden
        />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={placeholder}
          aria-label="Search"
          className="w-full rounded-md border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
      {children}
      <button
        type="submit"
        className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Search
      </button>
      {hasFilters ? (
        <Link href={action} className="text-sm font-semibold text-slate-body hover:text-navy">
          Reset
        </Link>
      ) : null}
    </form>
  );
}
