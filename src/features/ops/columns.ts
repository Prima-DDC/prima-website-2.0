// Admin-configurable display columns for the document list views. This module
// is pure config (no server-only imports) so the admin form and the server
// pages can both use it. The document number is always shown as the anchor
// column and is not part of the configurable set.

export type DocView = "my_documents" | "portal_approvals" | "admin_ops";

export type DocColumnKey =
  | "type"
  | "submitter"
  | "status"
  | "awaiting"
  | "stage"
  | "submitted"
  | "total";

export const COLUMN_LABELS: Record<DocColumnKey, string> = {
  type: "Type",
  submitter: "Submitted by",
  status: "Status",
  awaiting: "Awaiting",
  stage: "Sign-offs",
  submitted: "Submitted",
  total: "Total",
};

/** Per-view catalog (which columns the view can show) and its default set. */
export const VIEW_META: Record<
  DocView,
  { label: string; columns: DocColumnKey[]; default: DocColumnKey[] }
> = {
  my_documents: {
    label: "My Documents",
    columns: ["type", "status", "submitted", "total"],
    default: ["type", "status", "submitted"],
  },
  portal_approvals: {
    label: "Approvals (Employee Portal)",
    columns: ["type", "submitter", "awaiting", "submitted", "total"],
    default: ["type", "submitter", "awaiting", "submitted"],
  },
  admin_ops: {
    label: "Approvals (Administration)",
    columns: ["type", "submitter", "status", "stage", "submitted", "total"],
    default: ["type", "submitter", "status", "stage", "submitted"],
  },
};

export const DOC_VIEWS = Object.keys(VIEW_META) as DocView[];

export type ColumnConfig = Partial<Record<DocView, DocColumnKey[]>>;

/**
 * The columns to render for a view: the admin's stored selection filtered to
 * the valid catalog and kept in catalog order. When the view has never been
 * configured (undefined), the default set is used; an explicit empty array is
 * respected (only the document anchor column shows).
 */
export function columnsFor(config: ColumnConfig | null, view: DocView): DocColumnKey[] {
  const meta = VIEW_META[view];
  const stored = config?.[view];
  if (!stored) return meta.default;
  return meta.columns.filter((c) => stored.includes(c));
}
