import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/features/auth/actions";
import type { SessionProfile } from "@/features/auth/helpers";
import { WorkspaceNav, type WorkspaceNavItem } from "./WorkspaceNav";

function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={`flex items-center gap-2 rounded-md text-sm font-medium text-slate-body transition-colors hover:bg-mist hover:text-navy ${
          compact ? "p-2" : "w-full px-3 py-2.5"
        }`}
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        {compact ? null : "Sign out"}
      </button>
    </form>
  );
}

export function WorkspaceShell({
  title,
  items,
  rootHref,
  profile,
  children,
}: {
  title: string;
  items: WorkspaceNavItem[];
  rootHref: string;
  profile: SessionProfile;
  children: React.ReactNode;
}) {
  const displayName = profile.fullName || profile.email;

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-line px-5">
          <Link href={rootHref} className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="PRIMA"
              width={110}
              height={44}
              className="h-11 w-auto"
            />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-body/70">
            {title}
          </p>
          <WorkspaceNav items={items} rootHref={rootHref} variant="sidebar" />
        </div>
        <div className="border-t border-line p-4">
          <p className="truncate px-3 text-sm font-semibold text-navy">{displayName}</p>
          <p className="px-3 text-xs capitalize text-slate-body">{profile.role}</p>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:hidden">
        <Link href={rootHref}>
          <Image src="/logo.png" alt="PRIMA" width={90} height={36} className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="max-w-[10rem] truncate text-sm font-semibold text-navy">
            {displayName}
          </span>
          <LogoutButton compact />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:pb-12 lg:pt-8">
        {children}
      </main>

      {/* Mobile/tablet bottom button navbar */}
      <WorkspaceNav items={items} rootHref={rootHref} variant="bottom" />
    </div>
  );
}
