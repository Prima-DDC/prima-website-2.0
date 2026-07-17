"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useActionState } from "react";
import { ConfirmButton } from "@/components/ConfirmDialog";
import { signOffDocument, type OpsState } from "./actions";

/** One stage of the sequential sign-off (HR, Manager, or CEO). */
export function ReviewForm({
  docId,
  stageLabel,
  isFinalStage,
}: {
  docId: string;
  stageLabel: string;
  isFinalStage: boolean;
}) {
  const [state, formAction, pending] = useActionState<OpsState, FormData>(
    signOffDocument,
    { error: null },
  );

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-7">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-body">
        {stageLabel} sign-off
      </h2>
      {state.error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="docId" value={docId} />
      <label htmlFor="review-comment" className="mt-4 block text-sm font-semibold text-navy">
        Comment (required when rejecting)
      </label>
      <textarea
        id="review-comment"
        name="comment"
        rows={3}
        maxLength={2000}
        className="mt-1.5 w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <div className="mt-5 flex flex-wrap gap-3">
        <ConfirmButton
          dialog={{
            tone: "brand",
            title: `Approve as ${stageLabel}?`,
            message: isFinalStage
              ? "This is the final sign-off: the document becomes fully approved and the official branded PDF is generated immediately."
              : `Your ${stageLabel} sign-off is recorded in the approval trail and the document moves to the next stage.`,
            confirmLabel: `Sign off as ${stageLabel}`,
          }}
          name="decision"
          value="approved"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {pending ? "Working..." : `Approve (${stageLabel})`}
        </ConfirmButton>
        <ConfirmButton
          dialog={{
            tone: "danger",
            title: "Reject this document?",
            message:
              "Rejection ends the approval chain. The submitter will see your comment; make sure it explains what needs to change.",
            confirmLabel: "Reject document",
          }}
          name="decision"
          value="rejected"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded border border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <XCircle className="h-4 w-4" aria-hidden />
          Reject
        </ConfirmButton>
      </div>
    </form>
  );
}
