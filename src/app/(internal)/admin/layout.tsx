import { requireRole } from "@/features/auth/helpers";
import { WorkspaceShell } from "@/features/internal/WorkspaceShell";
import type { WorkspaceNavItem } from "@/features/internal/WorkspaceNav";

const NAV_ITEMS: WorkspaceNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/content", label: "Content", icon: "FileText" },
  { href: "/admin/services", label: "Services", icon: "Briefcase" },
  { href: "/admin/industries", label: "Industries", icon: "Building2" },
  { href: "/admin/offices", label: "Offices", icon: "MapPin" },
  { href: "/admin/seo", label: "SEO", icon: "Search" },
  { href: "/admin/media", label: "Media", icon: "ImageIcon" },
  { href: "/admin/inbox", label: "Inbox", icon: "Inbox" },
  { href: "/admin/ops", label: "Approvals", icon: "ClipboardCheck" },
  { href: "/admin/support", label: "Support", icon: "LifeBuoy" },
  { href: "/admin/roles", label: "Roles", icon: "Workflow" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/portal/profile", label: "My Profile", icon: "UserRound" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");

  return (
    <WorkspaceShell
      title="Administration"
      items={NAV_ITEMS}
      rootHref="/admin"
      profile={profile}
    >
      {children}
    </WorkspaceShell>
  );
}
