"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";
import { inviteUser, type UsersState } from "./actions";

const initialState: UsersState = { error: null };

const inputClass =
  "w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

export function InviteUserForm() {
  const [state, formAction, pending] = useActionState(inviteUser, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-6">
      <h2 className="font-semibold text-navy">Invite a user</h2>
      <p className="mt-1 text-xs text-slate-body">
        They will receive an email with a link to set their password.
      </p>

      {state.error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-3 rounded-md border border-brand/30 bg-mist px-3 py-2 text-xs text-brand-dark" role="status">
          {state.success}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="invite-email" className="mb-1 block text-xs font-semibold text-navy">
            Email
          </label>
          <input id="invite-email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="invite-name" className="mb-1 block text-xs font-semibold text-navy">
            Full name (optional)
          </label>
          <input id="invite-name" name="fullName" className={inputClass} />
        </div>
        <div>
          <label htmlFor="invite-role" className="mb-1 block text-xs font-semibold text-navy">
            Role
          </label>
          <select id="invite-role" name="role" defaultValue="employee" className={inputClass}>
            <option value="employee">Employee</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" aria-hidden />
        {pending ? "Sending..." : "Send invitation"}
      </button>
    </form>
  );
}
