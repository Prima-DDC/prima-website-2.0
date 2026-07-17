import { requireRole } from "@/features/auth/helpers";
import { WorkspaceShell } from "@/features/internal/WorkspaceShell";
import type { WorkspaceNavItem } from "@/features/internal/WorkspaceNav";

const NAV_ITEMS: WorkspaceNavItem[] = [
  { href: "/portal", label: "My Documents", icon: "LayoutDashboard" },
  { href: "/portal/new", label: "New Request", icon: "FilePlus2" },
  { href: "/portal/profile", label: "Profile", icon: "Users" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole();

  return (
    <WorkspaceShell
      title="Employee Portal"
      items={NAV_ITEMS}
      rootHref="/portal"
      profile={profile}
    >
      {children}
    </WorkspaceShell>
  );
}
