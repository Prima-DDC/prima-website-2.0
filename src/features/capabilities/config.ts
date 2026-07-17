/** Management features an admin can delegate to other roles. */
export const CAPABILITIES = [
  {
    key: "manage_content",
    label: "Website content",
    description: "Edit pages, practice areas, industries, offices, and SEO.",
  },
  {
    key: "manage_media",
    label: "Media library",
    description: "Upload, replace, and delete site images and files.",
  },
  {
    key: "manage_inbox",
    label: "Enquiry inbox",
    description: "Read and triage website contact enquiries.",
  },
  {
    key: "manage_documents",
    label: "Request administration",
    description: "Edit and delete submitted requests and documents.",
  },
  {
    key: "manage_support",
    label: "Support desk",
    description: "Respond to and manage staff support tickets.",
  },
  {
    key: "manage_users",
    label: "User management",
    description: "Invite, edit, and remove workspace users.",
  },
  {
    key: "manage_roles",
    label: "Roles & permissions",
    description: "Configure roles, request permissions, and capabilities.",
  },
] as const;

export type Capability = (typeof CAPABILITIES)[number]["key"];

export const CAPABILITY_KEYS = CAPABILITIES.map((c) => c.key) as Capability[];

export function capabilityLabel(key: string): string {
  return CAPABILITIES.find((c) => c.key === key)?.label ?? key;
}
