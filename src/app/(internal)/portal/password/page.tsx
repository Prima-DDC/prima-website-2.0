import { requireRole } from "@/features/auth/helpers";
import { SetPasswordForm } from "@/features/auth/SetPasswordForm";

/**
 * Landing page for password reset and invitation links. Deliberately minimal:
 * someone arriving from a reset email must be able to set a password even if
 * their wider staff record cannot be loaded.
 */
export default async function PasswordPage() {
  await requireRole();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Account password</h1>
      <p className="mt-1 text-sm text-slate-body">
        Choose a new password for your account. Your other details are on your
        profile.
      </p>
      <div className="mt-8">
        <SetPasswordForm />
      </div>
    </div>
  );
}
