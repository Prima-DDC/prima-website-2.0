import Image from "next/image";
import { redirect } from "next/navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { logout } from "@/features/auth/actions";
import { MfaChallengeForm } from "@/features/auth/MfaChallengeForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MfaPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AnimatedBackground />
      <div className="relative w-full max-w-md">
        <div className="rounded-xl border border-line bg-white/90 p-8 shadow-xl shadow-navy/5 backdrop-blur sm:p-10">
          <Image
            src="/logo.png"
            alt="PRIMA Due Diligence Consult"
            width={140}
            height={56}
            priority
            className="h-14 w-auto"
          />
          <h1 className="mt-6 text-2xl font-bold text-navy">Two-factor verification</h1>
          <p className="mt-2 text-sm text-slate-body">
            Signed in as <strong className="text-navy">{user.email}</strong>.
            Enter the code from your authenticator app to continue.
          </p>
          <div className="mt-8">
            <MfaChallengeForm />
          </div>
        </div>
        <form action={logout} className="mt-6 text-center">
          <button type="submit" className="text-xs font-semibold text-slate-body hover:text-navy">
            Cancel and sign out
          </button>
        </form>
      </div>
    </div>
  );
}
