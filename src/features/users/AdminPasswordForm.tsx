"use client";

import { CheckCircle2, KeyRound } from "lucide-react";
import { useActionState } from "react";
import { ConfirmButton } from "@/components/ConfirmDialog";
import { adminSetUserPassword, type UsersState } from "./actions";

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

const initialState: UsersState = { error: null };

/**
 * Manual password reset: for when the emailed reset link is not an option,
 * such as a user who cannot reach their mailbox. Validation lives on the
 * server so the confirmation dialog is never shown for an invalid entry.
 */
export function AdminPasswordForm({
  userId,
  name,
  email,
}: {
  userId: string;
  name: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(
    adminSetUserPassword,
    initialState,
  );

  return (
    <form
      key={state.success ?? "new"}
      action={formAction}
      className="max-w-md space-y-5 rounded-lg border border-line bg-white p-7"
    >
      <input type="hidden" name="userId" value={userId} />
      <div>
        <h2 className="text-lg font-bold text-navy">Set password manually</h2>
        <p className="mt-1 text-sm text-slate-body">
          Choose a password for {name} yourself instead of emailing a reset
          link. Pass it on securely; they can change it from their profile.
        </p>
      </div>
      {state.error ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="flex items-center gap-2 rounded-md border border-brand/30 bg-mist px-4 py-3 text-sm text-brand-dark"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {state.success}
        </p>
      ) : null}
      <div>
        <label
          htmlFor="admin-new-password"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          New password (10+ characters)
        </label>
        <input
          id="admin-new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="admin-confirm-password"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          Confirm password
        </label>
        <input
          id="admin-confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <ConfirmButton
        dialog={{
          tone: "danger",
          title: `Set a new password for ${name}?`,
          message: `This replaces the current password on ${email} immediately. ${name} will be notified and will need the new password to sign in.`,
          confirmLabel: "Set password",
        }}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <KeyRound className="h-4 w-4" aria-hidden />
        {pending ? "Saving..." : "Set password"}
      </ConfirmButton>
    </form>
  );
}
