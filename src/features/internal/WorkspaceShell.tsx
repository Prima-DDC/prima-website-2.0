import { ArrowLeftRight, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { logout } from "@/features/auth/actions";
import type { SessionProfile } from "@/features/auth/helpers";
import { NotificationsBell } from "@/features/notifications/NotificationsBell";
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
  switchTo,
  children,
}: {
  title: string;
  items: WorkspaceNavItem[];
  rootHref: string;
  profile: SessionProfile;
  /** The other workspace this user may open, shown as a persistent switcher. */
  switchTo?: { href: string; label: string; short: string };
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
          <div className="mb-3 px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-body/70">
              {title}
            </p>
            {switchTo ? (
              <Link
                href={switchTo.href}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
                Go to {switchTo.label}
              </Link>
            ) : null}
          </div>
          <WorkspaceNav items={items} rootHref={rootHref} variant="sidebar" />
        </div>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 px-3">
            <Avatar photoPath={profile.photoPath} name={displayName} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{displayName}</p>
              <p className="text-xs capitalize text-slate-body">{profile.role}</p>
            </div>
          </div>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Desktop utility bar: notifications always visible at the top right */}
      <div className="fixed right-6 top-4 z-40 hidden lg:block">
        <div className="glass rounded-full border border-line/70 px-1.5 py-1 shadow-lg shadow-navy/10">
          <NotificationsBell />
        </div>
      </div>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:hidden">
        <Link href={rootHref}>
          <Image src="/logo.png" alt="PRIMA" width={90} height={36} className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-1.5">
          {switchTo ? (
            <Link
              href={switchTo.href}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white/70 px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
              {switchTo.short}
            </Link>
          ) : null}
          <NotificationsBell />
          <Avatar photoPath={profile.photoPath} name={displayName} size={32} />
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
