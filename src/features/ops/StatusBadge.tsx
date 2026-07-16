import type { DocStatus } from "./config";

const STYLES: Record<DocStatus, string> = {
  draft: "bg-line/50 text-slate-body",
  submitted: "bg-amber-100 text-amber-800",
  approved: "bg-brand/10 text-brand-dark",
  rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: DocStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
