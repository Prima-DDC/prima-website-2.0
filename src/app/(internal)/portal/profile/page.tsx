import { requireRole } from "@/features/auth/helpers";
import { SetPasswordForm } from "@/features/auth/SetPasswordForm";
import { MfaManager } from "@/features/profile/MfaManager";
import { ProfileForm } from "@/features/profile/ProfileForm";
import {
  STAFF_PROFILE_COLUMNS,
  toStaffProfile,
} from "@/features/profile/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const session = await requireRole();
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("profiles")
    .select(STAFF_PROFILE_COLUMNS)
    .eq("id", session.id)
    .single();
  // A failed read must not take down the page: the password and security
  // controls below have to stay reachable (reset links land here).
  if (error) console.error("profile load failed:", error.message);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">My profile</h1>
      <p className="mt-1 text-sm text-slate-body">
        Manage your details, password, and sign-in security.
      </p>
      <div className="mt-8 space-y-6">
        {row ? (
          <ProfileForm profile={toStaffProfile(row)} />
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your staff details could not be loaded just now. You can still
            update your password and security settings below.
          </p>
        )}
        <MfaManager />
        <SetPasswordForm />
      </div>
    </div>
  );
}
