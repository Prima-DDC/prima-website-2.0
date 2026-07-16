"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useActionState } from "react";
import { reviewOpsDocument, type OpsState } from "./actions";

export function ReviewForm({ docId }: { docId: string }) {
  const [state, formAction, pending] = useActionState<OpsState, FormData>(
    reviewOpsDocument,
    { error: null },
  );

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-7">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-body">
        Review decision
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
        <button
          type="submit"
          name="decision"
          value="approved"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {pending ? "Working..." : "Approve & generate PDF"}
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded border border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <XCircle className="h-4 w-4" aria-hidden />
          Reject
        </button>
      </div>
    </form>
  );
}
