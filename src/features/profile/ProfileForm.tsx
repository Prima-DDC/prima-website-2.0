"use client";

import { CheckCircle2, Lock, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Avatar } from "@/components/Avatar";
import { updateProfile, type ProfileState } from "./actions";
import type { StaffProfile } from "./types";

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-body">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-navy">{value || "-"}</p>
    </div>
  );
}

export function ProfileForm({ profile }: { profile: StaffProfile }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    { error: null },
  );

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.fullName ||
    profile.email;

  return (
    <div className="space-y-6">
      {/* Identity: managed by administration */}
      <div className="rounded-lg border border-line bg-white p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar photoPath={profile.photoPath} name={displayName} size={64} />
            <div>
              <h2 className="text-lg font-bold text-navy">{displayName}</h2>
              <p className="text-sm text-slate-body">
                {profile.jobTitle || "Job title not set"}
                {profile.division ? ` | ${profile.division}` : ""}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-slate-body">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Managed by administration
          </span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ReadOnlyField label="First name" value={profile.firstName ?? ""} />
          <ReadOnlyField label="Last name" value={profile.lastName ?? ""} />
          <ReadOnlyField label="Job title" value={profile.jobTitle ?? ""} />
          <ReadOnlyField label="Division" value={profile.division ?? ""} />
          <ReadOnlyField
            label="Start of employment"
            value={
              profile.startDate
                ? new Date(profile.startDate).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })
                : ""
            }
          />
          <ReadOnlyField
            label="Engagement"
            value={profile.contractStaff ? "Contract / temporary staff" : "Permanent staff"}
          />
          <ReadOnlyField label="Business line" value={profile.businessLine ?? ""} />
          <ReadOnlyField label="Role" value={profile.role} />
        </div>
        <p className="mt-5 text-xs text-slate-body">
          Something incorrect?{" "}
          <Link href="/portal/support" className="font-semibold text-brand hover:text-brand-dark">
            Raise a support ticket
          </Link>{" "}
          and administration will update it.
        </p>
      </div>

      {/* Self-service: photo + contact details */}
      <form action={formAction} className="rounded-lg border border-line bg-white p-7">
        <h2 className="text-lg font-bold text-navy">Contact details & photo</h2>
        <p className="mt-1 text-sm text-slate-body">
          These are yours to keep up to date. Changing the email requires
          confirmation from the new inbox.
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
          <div className="sm:col-span-2">
            <label htmlFor="profile-photo" className="mb-1.5 block text-sm font-semibold text-navy">
              Professional photo (JPG, PNG, or WEBP, max 8 MB)
            </label>
            <input
              id="profile-photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-slate-body file:mr-3 file:rounded file:border-0 file:bg-mist file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-navy hover:file:bg-line/60"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-navy">
              Email address
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              required
              defaultValue={profile.email}
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-alt-email" className="mb-1.5 block text-sm font-semibold text-navy">
              Alternative email (optional)
            </label>
            <input
              id="profile-alt-email"
              name="altEmail"
              type="email"
              defaultValue={profile.altEmail ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-direct" className="mb-1.5 block text-sm font-semibold text-navy">
              Direct line (optional)
            </label>
            <input
              id="profile-direct"
              name="directLine"
              type="tel"
              defaultValue={profile.directLine ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-whatsapp" className="mb-1.5 block text-sm font-semibold text-navy">
              WhatsApp number (optional)
            </label>
            <input
              id="profile-whatsapp"
              name="whatsappNumber"
              type="tel"
              defaultValue={profile.whatsappNumber ?? ""}
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
          {pending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
