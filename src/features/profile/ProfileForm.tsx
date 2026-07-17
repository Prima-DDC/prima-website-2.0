"use client";

import { CheckCircle2, UserRound } from "lucide-react";
import { useActionState } from "react";
import { updateProfile, type ProfileState } from "./actions";

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

export function ProfileForm({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    { error: null },
  );

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-7">
      <h2 className="text-lg font-bold text-navy">Profile</h2>
      <p className="mt-1 text-sm text-slate-body">
        Your name appears on documents and approvals. Changing the email
        requires confirmation from the new inbox.
      </p>

      {state.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 flex items-start gap-2 rounded-md border border-brand/30 bg-mist px-4 py-3 text-sm text-brand-dark" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {state.success}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-navy">
            Full name
          </label>
          <input
            id="profile-name"
            name="fullName"
            required
            minLength={2}
            maxLength={200}
            defaultValue={fullName}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-navy">
            Email
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            required
            defaultValue={email}
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserRound className="h-4 w-4" aria-hidden />
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
