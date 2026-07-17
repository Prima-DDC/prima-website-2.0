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
  const { data: row } = await supabase
    .from("profiles")
    .select(STAFF_PROFILE_COLUMNS)
    .eq("id", session.id)
    .single();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">My profile</h1>
      <p className="mt-1 text-sm text-slate-body">
        Manage your details, password, and sign-in security.
      </p>
      <div className="mt-8 space-y-6">
        <ProfileForm profile={toStaffProfile(row)} />
        <MfaManager />
        <SetPasswordForm />
      </div>
    </div>
  );
}
