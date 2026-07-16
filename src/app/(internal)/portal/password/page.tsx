import { SetPasswordForm } from "@/features/auth/SetPasswordForm";

export default function PasswordPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Account security</h1>
      <p className="mt-1 text-sm text-slate-body">
        Set or update the password you use to sign in.
      </p>
      <div className="mt-8">
        <SetPasswordForm />
      </div>
    </div>
  );
}
