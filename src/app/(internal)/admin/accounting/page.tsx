import { Download } from "lucide-react";
import Link from "next/link";
import { requireCapability } from "@/features/capabilities/service";
import {
  DOC_CONFIG,
  MONEY_DOC_TYPES,
  formatMoney,
  type DocStatus,
} from "@/features/ops/config";
import {
  getMoneyRows,
  summarize,
  type Bucket,
} from "@/features/accounting/queries";
import { PaymentControl } from "@/features/accounting/PaymentControl";
import { StatusBadge } from "@/features/ops/StatusBadge";

const inputClass =
  "rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-navy outline-none focus:border-brand";

const STATUSES = ["submitted", "approved", "rejected"];

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireCapability("manage_accounting");
  const sp = await searchParams;
  const filters = {
    branch: sp.branch,
    status: sp.status,
    type: sp.type,
    currency: sp.currency,
    from: sp.from,
    to: sp.to,
  };
  const rows = await getMoneyRows(filters);
  const summary = summarize(rows);
  const exportQs = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][],
  ).toString();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Accounting</h1>
          <p className="mt-1 text-sm text-slate-body">
            Approved money is reported per branch and per currency; Ghana and
            Rwanda never combine. Mark disbursements and invoice collections as paid.
          </p>
        </div>
        <Link
          href={`/admin/accounting/export${exportQs ? `?${exportQs}` : ""}`}
          className="inline-flex items-center gap-2 rounded border border-line px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
        >
          <Download className="h-4 w-4" aria-hidden />
          Export CSV
        </Link>
      </div>

      {/* Summary: payables (money out) and receivables (money in) */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SummaryCard title="Disbursements (payable)" buckets={summary.payable} paidLabel="Disbursed" />
        <SummaryCard title="Invoices (receivable)" buckets={summary.receivable} paidLabel="Collected" />
      </div>

      {/* Filters */}
      <form method="get" className="mt-8 flex flex-wrap items-end gap-3">
        <Field label="Branch">
          <select name="branch" defaultValue={filters.branch ?? ""} className={inputClass}>
            <option value="">All branches</option>
            <option value="ghana">Ghana</option>
            <option value="rwanda">Rwanda</option>
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={filters.status ?? ""} className={inputClass}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select name="type" defaultValue={filters.type ?? ""} className={inputClass}>
            <option value="">All types</option>
            {MONEY_DOC_TYPES.map((t) => (
              <option key={t} value={t}>{DOC_CONFIG[t].title}</option>
            ))}
          </select>
        </Field>
        <Field label="Currency">
          <select name="currency" defaultValue={filters.currency ?? ""} className={inputClass}>
            <option value="">All</option>
            {["GHS", "RWF", "USD", "EUR"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <input type="date" name="from" defaultValue={filters.from ?? ""} className={inputClass} />
        </Field>
        <Field label="To">
          <input type="date" name="to" defaultValue={filters.to ?? ""} className={inputClass} />
        </Field>
        <button type="submit" className="rounded bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
          Apply
        </button>
        <Link href="/admin/accounting" className="text-xs font-semibold text-slate-body hover:text-navy">
          Reset
        </Link>
      </form>

      {/* Register */}
      {rows.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          No money documents match these filters.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-4 py-3 font-semibold">Document</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Branch</th>
                  <th className="px-4 py-3 font-semibold">Submitter</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-mist/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/ops/${r.id}`} className="font-semibold text-brand hover:text-brand-dark">
                        {r.docNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy">{r.typeLabel}</td>
                    <td className="px-4 py-3 text-slate-body">{r.branch === "rwanda" ? "Rwanda" : "Ghana"}</td>
                    <td className="px-4 py-3 text-slate-body">{r.submitter}</td>
                    <td className="px-4 py-3 text-right font-semibold text-navy">
                      {formatMoney(r.amount, r.currency || "GHS")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status as DocStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {r.status !== "approved" ? (
                        <span className="text-xs text-slate-body/60">-</span>
                      ) : r.paymentStatus === "paid" ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-brand-dark">
                            Paid{r.paidAt ? ` ${r.paidAt.slice(0, 10)}` : ""}
                            {r.paymentRef ? ` (${r.paymentRef})` : ""}
                          </span>
                          <PaymentControl docId={r.id} paid />
                        </div>
                      ) : (
                        <PaymentControl docId={r.id} paid={false} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-body">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({
  title,
  buckets,
  paidLabel,
}: {
  title: string;
  buckets: Bucket[];
  paidLabel: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-body">{title}</h2>
      {buckets.length === 0 ? (
        <p className="mt-3 text-sm text-slate-body/70">No approved amounts.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {buckets.map((b) => (
            <div key={`${b.branch}-${b.currency}`} className="rounded-md border border-line bg-mist/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-navy">
                  {b.branch === "rwanda" ? "Rwanda" : "Ghana"} | {b.currency || "n/a"}
                </p>
                <p className="text-xs text-slate-body">{b.count} approved</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Metric label="Approved" value={formatMoney(b.approved, b.currency || "GHS")} />
                <Metric label={paidLabel} value={formatMoney(b.paid, b.currency || "GHS")} />
                <Metric label="Outstanding" value={formatMoney(b.outstanding, b.currency || "GHS")} warn={b.outstanding > 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-body">{label}</p>
      <p className={`mt-0.5 text-xs font-bold ${warn ? "text-amber-700" : "text-navy"}`}>{value}</p>
    </div>
  );
}
