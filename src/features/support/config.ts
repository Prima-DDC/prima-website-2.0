export const TICKET_CATEGORIES = [
  { value: "profile_change", label: "Profile / staff record change" },
  { value: "it_support", label: "IT support" },
  { value: "access_request", label: "Access request" },
  { value: "other", label: "Other" },
] as const;

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-brand/10 text-brand-dark",
  closed: "bg-line/50 text-slate-body",
};

export function categoryLabel(value: string): string {
  return TICKET_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
