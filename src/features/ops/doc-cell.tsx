import type { ReactNode } from "react";
import {
  DOC_CONFIG,
  MONEY_DOC_TYPES,
  documentTotal,
  formatMoney,
  type DocStatus,
  type DocType,
} from "./config";
import type { DocColumnKey } from "./columns";
import { StatusBadge } from "./StatusBadge";

type Person = { full_name: string | null; email: string } | null;

/** The superset of ops_documents fields the list views select and render. */
export interface DocListRow {
  id: string;
  doc_type: string;
  doc_number: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  data?: Record<string, unknown> | null;
  review_comment?: string | null;
  payment_status?: string | null;
  paid_at?: string | null;
  payment_ref?: string | null;
  submitter?: Person;
  reviewer?: Person;
}

/** Shared select for the list views: every displayable column plus the joins. */
export const DOC_LIST_SELECT =
  "id, doc_type, doc_number, status, created_at, updated_at, data, review_comment, payment_status, paid_at, payment_ref, submitter:submitted_by (full_name, email), reviewer:reviewed_by (full_name, email)";

const personName = (p: Person) => p?.full_name || p?.email || "";
const dateTime = (v?: string | null) =>
  v ? new Date(v).toLocaleString("en-GB") : "";
const dateOnly = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB") : "";

/**
 * Renders a single list cell for a database-backed column. The computed
 * approval columns ("awaiting", "stage") are produced by each page and are not
 * handled here.
 */
export function renderDocCell(key: DocColumnKey, doc: DocListRow): ReactNode {
  const data = (doc.data ?? {}) as Record<string, unknown>;
  const isMoney = MONEY_DOC_TYPES.includes(doc.doc_type as DocType);

  switch (key) {
    case "type":
      return DOC_CONFIG[doc.doc_type as DocType]?.title ?? doc.doc_type;
    case "submitter":
      return personName(doc.submitter ?? null);
    case "status":
      return <StatusBadge status={doc.status as DocStatus} />;
    case "submitted":
      return dateTime(doc.created_at);
    case "updated":
      return dateTime(doc.updated_at);
    case "total": {
      const total = documentTotal(doc.doc_type as DocType, data);
      return total != null ? formatMoney(total, String(data.currency ?? "GHS")) : "";
    }
    case "reviewer":
      return personName(doc.reviewer ?? null);
    case "review_comment":
      return doc.review_comment ?? "";
    case "payment_status":
      // Payment tracking only applies to money documents.
      return isMoney && doc.payment_status
        ? doc.payment_status === "paid"
          ? "Paid"
          : "Unpaid"
        : "";
    case "paid_at":
      return isMoney ? dateOnly(doc.paid_at) : "";
    case "payment_ref":
      return isMoney ? (doc.payment_ref ?? "") : "";
    default:
      return "";
  }
}
