"use client";

import { KeyRound, Send, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { ConfirmButton } from "@/components/ConfirmDialog";
import {
  deleteUser,
  resendInvite,
  sendPasswordReset,
  type UsersState,
} from "./actions";

const initialState: UsersState = { error: null };

export function UserRowActions({
  userId,
  email,
  name,
  pending = false,
}: {
  userId: string;
  email: string;
  name: string;
  /** True when the user was invited but has not accepted yet. */
  pending?: boolean;
}) {
  const [resetState, resetAction, resetPending] = useActionState(
    sendPasswordReset,
    initialState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendInvite,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteUser,
    initialState,
  );

  const feedback =
    resetState.error ||
    resendState.error ||
    deleteState.error ||
    resetState.success ||
    resendState.success;
  const isError = resetState.error || resendState.error || deleteState.error;

  return (
    <div>
      <div className="flex items-center gap-2">
        {pending ? (
          <form action={resendAction}>
            <input type="hidden" name="email" value={email} />
            <ConfirmButton
              dialog={{
                tone: "brand",
                title: "Resend invitation?",
                message: `${name} will receive a fresh invitation email at ${email} with a link to set their password and join the workspace.`,
                confirmLabel: "Resend invitation",
              }}
              disabled={resendPending}
              title="Resend the invitation email"
              className="inline-flex items-center gap-1.5 rounded border border-line px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              {resendPending ? "Sending..." : "Resend invite"}
            </ConfirmButton>
          </form>
        ) : (
          <form action={resetAction}>
            <input type="hidden" name="email" value={email} />
            <ConfirmButton
              dialog={{
                tone: "brand",
                title: "Send password reset?",
                message: `${name} will receive an email at ${email} with a secure link to choose a new password.`,
                confirmLabel: "Send reset email",
              }}
              disabled={resetPending}
              title="Send a password reset email"
              className="inline-flex items-center gap-1.5 rounded border border-line px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
            >
              <KeyRound className="h-3.5 w-3.5" aria-hidden />
              {resetPending ? "Sending..." : "Reset password"}
            </ConfirmButton>
          </form>
        )}
        <form action={deleteAction}>
          <input type="hidden" name="userId" value={userId} />
          <ConfirmButton
            dialog={{
              tone: "danger",
              title: `Delete ${name}?`,
              message:
                "This permanently removes their account and every document they submitted. This cannot be undone.",
              confirmLabel: "Delete user",
            }}
            disabled={deletePending}
            title="Delete user"
            className="inline-flex items-center gap-1.5 rounded border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {deletePending ? "Deleting..." : "Delete"}
          </ConfirmButton>
        </form>
      </div>
      {feedback ? (
        <p
          className={`mt-1.5 text-[11px] ${isError ? "text-red-600" : "text-brand-dark"}`}
          role="status"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
