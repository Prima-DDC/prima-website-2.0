"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { contactSchema } from "./schema";

export interface ContactState {
  status: "idle" | "success" | "error";
  fieldErrors?: Partial<Record<"name" | "email" | "message", boolean>>;
}

export async function submitContactEnquiry(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: bots fill the hidden "website" field, humans never see it.
  if (formData.get("website")) return { status: "success" };

  // Time gate: reject submissions faster than 3 seconds after render.
  const renderedAt = Number(formData.get("renderedAt"));
  if (!renderedAt || Date.now() - renderedAt < 3000) {
    return { status: "error" };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    serviceInterest: formData.get("serviceInterest"),
    message: formData.get("message"),
    locale: formData.get("locale"),
  });

  if (!parsed.success) {
    const fields = new Set(parsed.error.issues.map((i) => String(i.path[0])));
    return {
      status: "error",
      fieldErrors: {
        name: fields.has("name"),
        email: fields.has("email"),
        message: fields.has("message"),
      },
    };
  }

  const db = createPublicClient();
  if (!db) return { status: "error" };

  // Inserted with the anon key on purpose: RLS allows public inserts only.
  const { error } = await db.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    service_interest: parsed.data.serviceInterest || null,
    message: parsed.data.message,
    locale: parsed.data.locale,
  });

  return error ? { status: "error" } : { status: "success" };
}
