import { z } from "zod";

export const DOC_TYPES = [
  "honour_certificate",
  "fund_request",
  "expense_form",
  "leave_form",
  "invoice",
] as const;

export type DocType = (typeof DOC_TYPES)[number];
export type DocStatus = "draft" | "submitted" | "approved" | "rejected";

/** One step of the admin-configurable sequential sign-off chain. */
export interface ApprovalStage {
  role: string;
  label: string;
  sort: number;
}

export interface ApprovalRow {
  stage: string;
  status: "approved" | "rejected";
  comment: string | null;
  created_at: string;
  approverName: string;
}

/** The first configured stage without an approval; null when complete. */
export function nextStage(
  approvals: Array<{ stage: string; status: string }>,
  stages: ApprovalStage[],
): ApprovalStage | null {
  for (const stage of stages) {
    if (!approvals.some((a) => a.stage === stage.role && a.status === "approved")) {
      return stage;
    }
  }
  return null;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select";
  options?: string[];
  required?: boolean;
}

export interface LineItemsConfig {
  name: string;
  label: string;
  columns: Array<{ name: string; label: string; type: "text" | "number" }>;
}

export interface DocTypeConfig {
  title: string;
  description: string;
  icon: string;
  fields: FieldConfig[];
  lineItems?: LineItemsConfig;
  schema: z.ZodType;
}

const money = z.coerce.number().positive().max(1_000_000_000);
const CURRENCIES = ["GHS", "RWF", "USD", "EUR"];

export const DOC_CONFIG: Record<DocType, DocTypeConfig> = {
  honour_certificate: {
    title: "Honour Certificate",
    description: "Request a branded certificate of honour or recognition.",
    icon: "Award",
    fields: [
      { name: "recipientName", label: "Recipient full name", type: "text", required: true },
      { name: "achievement", label: "Achievement or reason for recognition", type: "textarea", required: true },
      { name: "eventDate", label: "Date of award", type: "date", required: true },
      { name: "notes", label: "Additional notes (optional)", type: "textarea" },
    ],
    schema: z.object({
      recipientName: z.string().trim().min(2).max(200),
      achievement: z.string().trim().min(5).max(2000),
      eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      notes: z.string().trim().max(2000).optional().or(z.literal("")),
    }),
  },
  fund_request: {
    title: "Fund Request",
    description: "Request funds for an engagement, purchase, or activity.",
    icon: "Wallet",
    fields: [
      { name: "purpose", label: "Purpose of funds", type: "text", required: true },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "currency", label: "Currency", type: "select", options: CURRENCIES, required: true },
      { name: "neededBy", label: "Needed by", type: "date", required: true },
      { name: "details", label: "Details / breakdown", type: "textarea", required: true },
    ],
    schema: z.object({
      purpose: z.string().trim().min(3).max(300),
      amount: money,
      currency: z.enum(CURRENCIES as [string, ...string[]]),
      neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      details: z.string().trim().min(5).max(5000),
    }),
  },
  expense_form: {
    title: "Expense Form",
    description: "Submit expenses for reimbursement with line items.",
    icon: "Receipt",
    fields: [
      { name: "title", label: "Expense summary", type: "text", required: true },
      { name: "currency", label: "Currency", type: "select", options: CURRENCIES, required: true },
      { name: "notes", label: "Notes (optional)", type: "textarea" },
    ],
    lineItems: {
      name: "items",
      label: "Expense items",
      columns: [
        { name: "description", label: "Description", type: "text" },
        { name: "amount", label: "Amount", type: "number" },
      ],
    },
    schema: z.object({
      title: z.string().trim().min(3).max(300),
      currency: z.enum(CURRENCIES as [string, ...string[]]),
      notes: z.string().trim().max(2000).optional().or(z.literal("")),
      items: z
        .array(
          z.object({
            description: z.string().trim().min(1).max(300),
            amount: money,
          }),
        )
        .min(1)
        .max(50),
    }),
  },
  leave_form: {
    title: "Leave Form",
    description: "Request annual, sick, or other leave.",
    icon: "CalendarDays",
    fields: [
      {
        name: "leaveType",
        label: "Type of leave",
        type: "select",
        options: ["Annual", "Sick", "Maternity/Paternity", "Compassionate", "Unpaid", "Other"],
        required: true,
      },
      { name: "startDate", label: "First day of leave", type: "date", required: true },
      { name: "endDate", label: "Last day of leave", type: "date", required: true },
      { name: "reason", label: "Reason / handover notes", type: "textarea", required: true },
    ],
    schema: z
      .object({
        leaveType: z.enum([
          "Annual",
          "Sick",
          "Maternity/Paternity",
          "Compassionate",
          "Unpaid",
          "Other",
        ]),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        reason: z.string().trim().min(3).max(2000),
      })
      .refine((v) => v.endDate >= v.startDate, {
        message: "End date must be on or after the start date",
        path: ["endDate"],
      }),
  },
  invoice: {
    title: "Invoice",
    description: "Issue a client invoice with line items and totals.",
    icon: "FileText",
    fields: [
      { name: "clientName", label: "Client name", type: "text", required: true },
      { name: "clientAddress", label: "Client address", type: "textarea", required: true },
      { name: "currency", label: "Currency", type: "select", options: CURRENCIES, required: true },
      { name: "dueDate", label: "Payment due date", type: "date", required: true },
      { name: "notes", label: "Payment terms / notes (optional)", type: "textarea" },
    ],
    lineItems: {
      name: "items",
      label: "Invoice items",
      columns: [
        { name: "description", label: "Description", type: "text" },
        { name: "quantity", label: "Qty", type: "number" },
        { name: "unitPrice", label: "Unit price", type: "number" },
      ],
    },
    schema: z.object({
      clientName: z.string().trim().min(2).max(300),
      clientAddress: z.string().trim().min(3).max(1000),
      currency: z.enum(CURRENCIES as [string, ...string[]]),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      notes: z.string().trim().max(2000).optional().or(z.literal("")),
      items: z
        .array(
          z.object({
            description: z.string().trim().min(1).max(300),
            quantity: z.coerce.number().positive().max(100000),
            unitPrice: money,
          }),
        )
        .min(1)
        .max(100),
    }),
  },
};

export function docTypeFromSlug(slug: string): DocType | null {
  const type = slug.replace(/-/g, "_");
  return (DOC_TYPES as readonly string[]).includes(type) ? (type as DocType) : null;
}

export function slugFromDocType(type: DocType): string {
  return type.replace(/_/g, "-");
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount);
}

export function documentTotal(docType: DocType, data: Record<string, unknown>): number | null {
  if (docType === "expense_form") {
    const items = data.items as Array<{ amount: number }>;
    return items.reduce((sum, item) => sum + item.amount, 0);
  }
  if (docType === "invoice") {
    const items = data.items as Array<{ quantity: number; unitPrice: number }>;
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }
  if (docType === "fund_request") return data.amount as number;
  return null;
}
