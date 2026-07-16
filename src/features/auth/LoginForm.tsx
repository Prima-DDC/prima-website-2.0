"use client";

import { KeyRound, LogIn } from "lucide-react";
import { useActionState } from "react";
import { login, type AuthState } from "./actions";

const initialState: AuthState = { error: null };

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-navy">
          Work email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-navy">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <KeyRound className="h-4 w-4 animate-pulse" aria-hidden />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden />
        )}
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
