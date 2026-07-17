import { requireRole } from "@/features/auth/helpers";
import { getApprovalStages } from "@/features/ops/stages";
import { WorkspaceShell } from "@/features/internal/WorkspaceShell";
import type { WorkspaceNavItem } from "@/features/internal/WorkspaceNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole();
  const stages = await getApprovalStages();
  const isApprover =
    profile.role === "admin" || stages.some((s) => s.role === profile.role);

  const items: WorkspaceNavItem[] = [
    { href: "/portal", label: "My Documents", icon: "LayoutDashboard" },
    ...(profile.canSubmit
      ? [{ href: "/portal/new", label: "New Request", icon: "FilePlus2" } as const]
      : []),
    ...(isApprover
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
