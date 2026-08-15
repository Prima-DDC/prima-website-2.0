"use client";

import { useActionState } from "react";
import { recordPayment, reversePayment, type AccountingState } from "./actions";

const initialState: AccountingState = { error: null };

/** Inline control to record or reverse a payment on an approved money doc. */
export function PaymentControl({ docId, paid }: { docId: string; paid: boolean }) {
  const [state, action, pending] = useActionState(
    paid ? reversePayment : recordPayment,
    initialState,
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="docId" value={docId} />
      {paid ? null : (
        <input
          name="reference"
          placeholder="Reference"
          maxLength={200}
          className="w-28 rounded border border-line bg-white px-2 py-1 text-xs outline-none focus:border-brand"
        />
      )}
      <button
        type="submit"
        disabled={pending}
        className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
          paid
            ? "border border-line text-slate-body hover:border-brand hover:text-brand"
            : "bg-brand text-white hover:bg-brand-dark"
        }`}
      >
        {pending ? "..." : paid ? "Reverse" : "Mark paid"}
      </button>
      {state.error ? <span className="text-[11px] text-red-600">{state.error}</span> : null}
    </form>
  );
}
