"use client";

import { ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { verifyMfa, type AuthState } from "./actions";

export function MfaChallengeForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    verifyMfa,
    { error: null },
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="mfa-login-code" className="mb-1.5 block text-sm font-semibold text-navy">
          6-digit authenticator code
        </label>
        <input
          id="mfa-login-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          className="w-full rounded-md border border-line bg-white px-4 py-3 text-center font-mono text-xl tracking-[0.4em] text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden />
        {pending ? "Verifying..." : "Verify and continue"}
      </button>
    </form>
  );
}
