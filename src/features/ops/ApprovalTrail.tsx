import { Check, Clock3, X } from "lucide-react";
import { APPROVAL_STAGES, nextStage, type ApprovalRow } from "./config";

/**
 * Sequential sign-off trail (HR -> Manager -> CEO) with the state of each
 * stage: who signed, when, or which stage the document is waiting on.
 */
export function ApprovalTrail({
  approvals,
  docStatus,
}: {
  approvals: ApprovalRow[];
  docStatus: string;
}) {
  const rejected = approvals.some((a) => a.status === "rejected");
  const current =
    docStatus === "submitted" && !rejected ? nextStage(approvals) : null;

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {APPROVAL_STAGES.map(({ role, label }) => {
        const row = approvals.find((a) => a.stage === role);
        const state = row?.status ?? (role === current ? "current" : "pending");
        const styles =
          state === "approved"
            ? "border-brand/40 bg-mist/60"
            : state === "rejected"
              ? "border-red-200 bg-red-50"
              : state === "current"
                ? "border-amber-300 bg-amber-50"
                : "border-line bg-white opacity-60";

        return (
          <li key={role} className={`rounded-lg border p-4 ${styles}`}>
            <div className="flex items-center gap-2">
              {state === "approved" ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
              ) : state === "rejected" ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
                  <X className="h-3.5 w-3.5" aria-hidden />
                </span>
              ) : (
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    state === "current"
                      ? "bg-amber-400 text-white"
                      : "bg-line text-slate-body"
                  }`}
                >
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
              <p className="text-sm font-bold text-navy">{label}</p>
            </div>
            <p className="mt-2 text-xs text-slate-body">
              {row
                ? `${row.status === "approved" ? "Signed" : "Rejected"} by ${row.approverName} on ${new Date(row.created_at).toLocaleDateString("en-GB")}`
                : state === "current"
                  ? "Awaiting sign-off"
                  : "Pending earlier stages"}
            </p>
            {row?.comment ? (
              <p className="mt-1.5 rounded bg-white/70 px-2 py-1 text-xs text-slate-body">
                {row.comment}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
