import { requireRole } from "@/features/auth/helpers";
import { SetPasswordForm } from "@/features/auth/SetPasswordForm";
import { MfaManager } from "@/features/profile/MfaManager";
import { ProfileForm } from "@/features/profile/ProfileForm";

export default async function ProfilePage() {
  const profile = await requireRole();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">My profile</h1>
      <p className="mt-1 text-sm text-slate-body">
        Manage your details, password, and sign-in security.
      </p>
      <div className="mt-8 space-y-6">
        <ProfileForm fullName={profile.fullName ?? ""} email={profile.email} />
        <MfaManager />
        <SetPasswordForm />
      </div>
    </div>
  );
}
