import Image from "next/image";
import Link from "next/link";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <AnimatedBackground />
      <div className="relative w-full max-w-md">
        <div className="rounded-xl border border-line bg-white/90 p-8 shadow-xl shadow-navy/5 backdrop-blur sm:p-10">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="PRIMA Due Diligence Consult"
              width={140}
              height={56}
              priority
              className="h-14 w-auto"
            />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-navy">Workspace sign in</h1>
          <p className="mt-2 text-sm text-slate-body">
            For PRIMA administrators, employees, and registered clients.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-body">
          Access is by invitation. Contact your administrator if you need an account.
        </p>
      </div>
    </div>
  );
}
