"use client";

import { KeyRound, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deleteUser, sendPasswordReset, type UsersState } from "./actions";

const initialState: UsersState = { error: null };

export function UserRowActions({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}) {
  const [resetState, resetAction, resetPending] = useActionState(
    sendPasswordReset,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteUser,
    initialState,
  );

  const feedback = resetState.error || deleteState.error || resetState.success;

  return (
    <div>
      <div className="flex items-center gap-2">
        <form action={resetAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={resetPending}
            title="Send a password reset email"
            className="inline-flex items-center gap-1.5 rounded border border-line px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            <KeyRound className="h-3.5 w-3.5" aria-hidden />
            {resetPending ? "Sending..." : "Reset password"}
          </button>
        </form>
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (
              !window.confirm(
                `Delete ${name}? This permanently removes their account and all documents they submitted. This cannot be undone.`,
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="userId" value={userId} />
          <button
            type="submit"
            disabled={deletePending}
            title="Delete user"
            className="inline-flex items-center gap-1.5 rounded border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {deletePending ? "Deleting..." : "Delete"}
          </button>
        </form>
      </div>
      {feedback ? (
        <p
          className={`mt-1.5 text-[11px] ${
            resetState.error || deleteState.error ? "text-red-600" : "text-brand-dark"
          }`}
          role="status"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
