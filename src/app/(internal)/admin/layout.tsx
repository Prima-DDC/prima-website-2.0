import type { Capability } from "@/features/capabilities/config";
import { requireAnyCapability } from "@/features/capabilities/service";
import { WorkspaceShell } from "@/features/internal/WorkspaceShell";
import type { WorkspaceNavItem } from "@/features/internal/WorkspaceNav";

// Each management section is shown only to roles holding its capability.
const NAV_ITEMS: Array<WorkspaceNavItem & { capability?: Capability }> = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/content", label: "Content", icon: "FileText", capability: "manage_content" },
  { href: "/admin/services", label: "Services", icon: "Briefcase", capability: "manage_content" },
  { href: "/admin/industries", label: "Industries", icon: "Building2", capability: "manage_content" },
  { href: "/admin/offices", label: "Offices", icon: "MapPin", capability: "manage_content" },
  { href: "/admin/seo", label: "SEO", icon: "Search", capability: "manage_content" },
  { href: "/admin/media", label: "Media", icon: "ImageIcon", capability: "manage_media" },
  { href: "/admin/inbox", label: "Inbox", icon: "Inbox", capability: "manage_inbox" },
  { href: "/admin/ops", label: "Approvals", icon: "ClipboardCheck", capability: "manage_documents" },
  { href: "/admin/support", label: "Support", icon: "LifeBuoy", capability: "manage_support" },
  { href: "/admin/roles", label: "Roles", icon: "Workflow", capability: "manage_roles" },
  { href: "/admin/users", label: "Users", icon: "Users", capability: "manage_users" },
  { href: "/portal/profile", label: "My Profile", icon: "UserRound" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, capabilities } = await requireAnyCapability();
  const items = NAV_ITEMS.filter(
    (item) => !item.capability || capabilities.includes(item.capability),
  );

  return (
    <WorkspaceShell
      title="Administration"
      items={items}
      rootHref="/admin"
      profile={profile}
    >
      {children}
    </WorkspaceShell>
  );
}
