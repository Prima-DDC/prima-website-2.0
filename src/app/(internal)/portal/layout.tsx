import { requireRole } from "@/features/auth/helpers";
import { getRoleCapabilities } from "@/features/capabilities/service";
import { getApprovableTypes, getSubmittableTypes } from "@/features/ops/stages";
import { WorkspaceShell } from "@/features/internal/WorkspaceShell";
import type { WorkspaceNavItem } from "@/features/internal/WorkspaceNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole();
  const [submittable, approvable, capabilities] = await Promise.all([
    getSubmittableTypes(profile.role),
    getApprovableTypes(profile.role),
    getRoleCapabilities(profile.role),
  ]);
  const canSubmit = submittable.length > 0;
  const isApprover = approvable.length > 0;

  const items: WorkspaceNavItem[] = [
    { href: "/portal", label: "My Documents", icon: "LayoutDashboard" },
    ...(canSubmit
      ? [{ href: "/portal/new", label: "New Request", icon: "FilePlus2" } as const]
      : []),
    ...(isApprover
      ? [{ href: "/portal/approvals", label: "Approvals", icon: "ClipboardCheck" } as const]
      : []),
    { href: "/portal/support", label: "Support", icon: "LifeBuoy" },
    { href: "/portal/profile", label: "Profile", icon: "UserRound" },
    // Capability holders can reach administration from any device.
    ...(capabilities.length > 0
      ? [{ href: "/admin", label: "Admin", icon: "Workflow" } as const]
      : []),
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
