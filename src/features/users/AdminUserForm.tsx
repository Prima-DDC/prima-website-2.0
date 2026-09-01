"use client";

import { CheckCircle2, Save } from "lucide-react";
import { useActionState } from "react";
import type { StaffProfile } from "@/features/profile/types";
import { adminUpdateUser, type UsersState } from "./actions";

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Admin-only staff record editor: identity, employment, contact, and role. */
export function AdminUserForm({
  profile,
  isSelf,
  roles,
}: {
  profile: StaffProfile;
  isSelf: boolean;
  roles: Array<{ key: string; label: string }>;
}) {
  const [state, formAction, pending] = useActionState<UsersState, FormData>(
    adminUpdateUser,
    { error: null },
  );

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-7">
      <input type="hidden" name="userId" value={profile.id} />

      {state.error ? (
        <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mb-5 flex items-center gap-2 rounded-md border border-brand/30 bg-mist px-4 py-3 text-sm text-brand-dark" role="status">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {state.success}
        </p>
      ) : null}

      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-body">
        Identity information
      </h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="u-first" className="mb-1.5 block text-sm font-semibold text-navy">First name</label>
          <input id="u-first" name="firstName" defaultValue={profile.firstName ?? ""} maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="u-last" className="mb-1.5 block text-sm font-semibold text-navy">Last name</label>
          <input id="u-last" name="lastName" defaultValue={profile.lastName ?? ""} maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="u-title" className="mb-1.5 block text-sm font-semibold text-navy">Job title</label>
          <input id="u-title" name="jobTitle" defaultValue={profile.jobTitle ?? ""} maxLength={150} className={inputClass} />
        </div>
        <div>
          <label htmlFor="u-division" className="mb-1.5 block text-sm font-semibold text-navy">Division</label>
          <input id="u-division" name="division" defaultValue={profile.division ?? ""} maxLength={150} className={inputClass} />
        </div>
        <div>
          <label htmlFor="u-start" className="mb-1.5 block text-sm font-semibold text-navy">Start of employment</label>
          <input id="u-start" name="startDate" type="date" defaultValue={profile.startDate ?? ""} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-navy">Workspace roles</span>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => {
              const checked = profile.roles.includes(r.key);
              return (
                <label
                  key={r.key}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    checked
                      ? "border-brand bg-mist text-brand-dark"
                      : "border-line bg-white text-navy hover:border-brand/50"
                  } ${isSelf ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={r.key}
                    defaultChecked={checked}
                    disabled={isSelf}
                    className="h-4 w-4 rounded border-line accent-brand"
                  />
                  {r.label}
                </label>
              );
            })}
          </div>
          {/* Self-edits keep the current roles so an admin cannot lock themselves out. */}
          {isSelf
            ? profile.roles.map((r) => (
                <input key={r} type="hidden" name="roles" value={r} />
              ))
            : null}
          <p className="mt-1.5 text-xs text-slate-body">
            Assign one or more roles. Access is the combination of every role granted.
          </p>
        </div>
        <div>
          <label htmlFor="u-entitlement" className="mb-1.5 block text-sm font-semibold text-navy">Annual leave days entitled</label>
          <select id="u-entitlement" name="leaveEntitlement" defaultValue={String(profile.leaveEntitlement)} className={inputClass}>
            {[15, 18, 21, 30].map((n) => (
              <option key={n} value={n}>{n} days</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-navy sm:col-span-2">
          <input
            type="checkbox"
            name="contractStaff"
            defaultChecked={profile.contractStaff}
            className="h-4 w-4 rounded border-line accent-brand"
          />
          Contract / temporary staff
        </label>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-slate-body">
        Contact information
      </h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="u-business" className="mb-1.5 block text-sm font-semibold text-navy">Business line</label>
          <input id="u-business" name="businessLine" type="tel" defaultValue={profile.businessLine ?? ""} maxLength={50} className={inputClass} />
        </div>
        <div>
          <label htmlFor="u-direct" className="mb-1.5 block text-sm font-semibold text-navy">Direct line</label>
          <input id="u-direct" name="directLine" type="tel" defaultValue={profile.directLine ?? ""} maxLength={50} className={inputClass} />
        </div>
        <div>
          <label htmlFor="u-whatsapp" className="mb-1.5 block text-sm font-semibold text-navy">WhatsApp number</label>
          <input id="u-whatsapp" name="whatsappNumber" type="tel" defaultValue={profile.whatsappNumber ?? ""} maxLength={50} className={inputClass} />
        </div>
        <div>
          <label htmlFor="u-alt-email" className="mb-1.5 block text-sm font-semibold text-navy">Alternative email</label>
          <input id="u-alt-email" name="altEmail" type="email" defaultValue={profile.altEmail ?? ""} className={inputClass} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-body">
        The primary email address is the sign-in identity; the user changes it
        themselves from their profile (with confirmation).
      </p>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-4 w-4" aria-hidden />
        {pending ? "Saving..." : "Save staff record"}
      </button>
    </form>
  );
}
