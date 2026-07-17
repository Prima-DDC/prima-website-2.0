"use client";

import {
  Award,
  Briefcase,
  Building2,
  ClipboardCheck,
  FilePlus2,
  FileText,
  Globe2,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  MapPin,
  Search,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Briefcase,
  Globe2,
  MapPin,
  Search,
  ImageIcon,
  Inbox,
  ClipboardCheck,
  UserRound,
  Users,
  FilePlus2,
  Award,
  Building2,
};

export interface WorkspaceNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
}

function isActive(pathname: string, href: string, rootHref: string) {
  if (href === rootHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNav({
  items,
  rootHref,
  variant,
}: {
  items: WorkspaceNavItem[];
  rootHref: string;
  variant: "sidebar" | "bottom";
}) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col gap-1" aria-label="Workspace">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(pathname, item.href, rootHref);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand text-white shadow-md shadow-brand/25"
                  : "text-slate-body hover:bg-mist hover:text-navy"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Workspace"
      className="glass-dark fixed inset-x-3 bottom-3 z-50 rounded-2xl px-2 py-2 shadow-2xl lg:hidden"
    >
      <div className="flex items-stretch gap-1 overflow-x-auto">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(pathname, item.href, rootHref);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-all ${
                active
                  ? "bg-brand text-white shadow-lg shadow-brand/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
