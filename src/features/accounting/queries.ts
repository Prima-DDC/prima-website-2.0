import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  DOC_CONFIG,
  documentTotal,
  MONEY_DOC_TYPES,
  moneyCategory,
  type DocType,
} from "@/features/ops/config";

export interface MoneyRow {
  id: string;
  docNumber: string;
  docType: DocType;
  typeLabel: string;
  category: "receivable" | "payable";
  branch: string;
  currency: string;
  amount: number;
  status: string;
  paymentStatus: string;
  paidAt: string | null;
  paymentRef: string | null;
  submitter: string;
  createdAt: string;
}

export interface AccountingFilters {
  branch?: string;
  status?: string;
  type?: string;
  currency?: string;
  from?: string;
  to?: string;
}

/** Every money document (the five types that carry a currency), shaped for
 * reporting with its computed amount. Admin client: gated by the caller. */
export async function getMoneyRows(f: AccountingFilters): Promise<MoneyRow[]> {
  const db = createSupabaseAdminClient();
  let q = db
    .from("ops_documents")
    .select(
      "id, doc_type, doc_number, data, status, branch, payment_status, paid_at, payment_ref, created_at, profiles:submitted_by (full_name, email)",
    )
    .in("doc_type", MONEY_DOC_TYPES)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (f.branch) q = q.eq("branch", f.branch);
  if (f.status) q = q.eq("status", f.status);
  if (f.type) q = q.eq("doc_type", f.type);
  if (f.from) q = q.gte("created_at", f.from);
  if (f.to) q = q.lte("created_at", `${f.to}T23:59:59`);
  const { data } = await q;

  const rows: MoneyRow[] = [];
  for (const d of data ?? []) {
    const dt = d.doc_type as DocType;
    const docData = d.data as Record<string, unknown>;
    const currency = String(docData?.currency ?? "");
    if (f.currency && currency !== f.currency) continue;
    const submitter = d.profiles as unknown as {
      full_name: string | null;
      email: string;
    } | null;
    rows.push({
      id: d.id,
      docNumber: d.doc_number,
      docType: dt,
      typeLabel: DOC_CONFIG[dt].title,
      category: moneyCategory(dt),
      branch: d.branch,
      currency,
      amount: documentTotal(dt, docData) ?? 0,
      status: d.status,
      paymentStatus: d.payment_status,
      paidAt: d.paid_at,
      paymentRef: d.payment_ref,
      submitter: submitter?.full_name || submitter?.email || "Unknown",
      createdAt: d.created_at,
    });
  }
  return rows;
}

export interface Bucket {
  branch: string;
  currency: string;
  approved: number;
  paid: number;
  outstanding: number;
  count: number;
}

/**
 * Approved money totals grouped by category (payable vs receivable), then by
 * branch and currency. Currencies and branches are never combined, so Ghana
 * GHS and Rwanda RWF stay separate for auditing.
 */
export function summarize(
  rows: MoneyRow[],
): Record<"payable" | "receivable", Bucket[]> {
  const groups: Record<"payable" | "receivable", Record<string, Bucket>> = {
    payable: {},
    receivable: {},
  };
  for (const r of rows) {
    if (r.status !== "approved") continue;
    const key = `${r.branch}|${r.currency}`;
    const g = (groups[r.category][key] ??= {
      branch: r.branch,
      currency: r.currency,
      approved: 0,
      paid: 0,
      outstanding: 0,
      count: 0,
    });
    g.approved += r.amount;
    g.count += 1;
    if (r.paymentStatus === "paid") g.paid += r.amount;
    else g.outstanding += r.amount;
  }
  const sort = (b: Record<string, Bucket>) =>
    Object.values(b).sort((a, z) => a.branch.localeCompare(z.branch) || a.currency.localeCompare(z.currency));
  return { payable: sort(groups.payable), receivable: sort(groups.receivable) };
}

/** Builds a CSV (audit export) of the given rows. */
export function rowsToCsv(rows: MoneyRow[]): string {
  const head = [
    "Document",
    "Type",
    "Category",
    "Branch",
    "Submitter",
    "Currency",
    "Amount",
    "Status",
    "Payment",
    "Paid on",
    "Payment reference",
    "Created",
  ];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.docNumber,
      r.typeLabel,
      r.category,
      r.branch,
      r.submitter,
      r.currency,
      r.amount.toFixed(2),
      r.status,
      r.paymentStatus,
      r.paidAt ? r.paidAt.slice(0, 10) : "",
      r.paymentRef ?? "",
      r.createdAt.slice(0, 10),
    ]
      .map((c) => esc(String(c)))
      .join(","),
  );
  return [head.map(esc).join(","), ...lines].join("\n");
}
