"use client";

import { CheckCircle2, Lock } from "lucide-react";
import { useActionState } from "react";
import { setPassword } from "./actions";

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPassword, {
    error: null,
  });

  return (
    <form action={formAction} className="max-w-md space-y-5 rounded-lg border border-line bg-white p-7">
      <h2 className="text-lg font-bold text-navy">Set your password</h2>
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="flex items-center gap-2 rounded-md border border-brand/30 bg-mist px-4 py-3 text-sm text-brand-dark" role="status">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Password updated successfully.
        </p>
      ) : null}
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold text-navy">
          New password (10+ characters)
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold text-navy">
          Confirm password
        </label>
        <input
          id="confirm-password"
          name="confirm"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Lock className="h-4 w-4" aria-hidden />
        {pending ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
