import { APPROVER_ROLES, requireRole } from "@/features/auth/helpers";
import { WorkspaceShell } from "@/features/internal/WorkspaceShell";
import type { WorkspaceNavItem } from "@/features/internal/WorkspaceNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole();

  const items: WorkspaceNavItem[] = [
    { href: "/portal", label: "My Documents", icon: "LayoutDashboard" },
    { href: "/portal/new", label: "New Request", icon: "FilePlus2" },
    ...(APPROVER_ROLES.includes(profile.role)
      ? [{ href: "/portal/approvals", label: "Approvals", icon: "ClipboardCheck" } as const]
      : []),
    { href: "/portal/support", label: "Support", icon: "LifeBuoy" },
    { href: "/portal/profile", label: "Profile", icon: "UserRound" },
  ];

  return (
    <WorkspaceShell
      title="Employee Portal"
      items={items}
      rootHref="/portal"
      profile={profile}
    >
      {children}
    </WorkspaceShell>
  );
}
