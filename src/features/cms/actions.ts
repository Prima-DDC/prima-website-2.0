"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const LOCALES = ["en", "fr", "es"] as const;

/** Every save invalidates all public pages; they re-render on next visit. */
function revalidatePublic() {
  revalidatePath("/[locale]", "layout");
}

/** Reassembles {en, fr, es} from the per-locale hidden inputs t_en/t_fr/t_es. */
function parseLocalizedJson(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      JSON.parse(z.string().parse(formData.get(`t_${locale}`))),
    ]),
  );
}

export interface CmsState {
  error: string | null;
  saved?: boolean;
}

export async function saveContentBlock(
  _prev: CmsState,
  formData: FormData,
): Promise<CmsState> {
  await requireRole("admin");
  try {
    const page = z.string().min(1).parse(formData.get("page"));
    const section = z.string().min(1).parse(formData.get("section"));
    const t = parseLocalizedJson(formData);

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("content_blocks")
      .update({ t, updated_at: new Date().toISOString() })
      .eq("page", page)
      .eq("section", section);
    if (error) return { error: error.message };

    revalidatePublic();
    revalidatePath(`/admin/content/${page}`);
    return { error: null, saved: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid content." };
  }
}

const ENTITY_TABLES = {
  services: "slug",
  industries: "slug",
  offices: "slug",
  page_seo: "page",
} as const;

type EntityTable = keyof typeof ENTITY_TABLES;

export async function saveEntity(
  _prev: CmsState,
  formData: FormData,
): Promise<CmsState> {
  await requireRole("admin");
  try {
    const table = z
      .enum(Object.keys(ENTITY_TABLES) as [EntityTable, ...EntityTable[]])
      .parse(formData.get("table"));
    const key = z.string().min(1).parse(formData.get("key"));
    const t = parseLocalizedJson(formData);

    const patch: Record<string, unknown> = {
      t,
      updated_at: new Date().toISOString(),
    };
    // Optional scalar columns editable alongside the localized payload.
    for (const col of ["icon", "phone", "whatsapp", "email", "map_url"]) {
      const value = formData.get(col);
      if (value !== null) patch[col] = String(value) || null;
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from(table)
      .update(patch)
      .eq(ENTITY_TABLES[table], key);
    if (error) return { error: error.message };

    revalidatePublic();
    return { error: null, saved: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid content." };
  }
}

export async function saveSiteSettings(
  _prev: CmsState,
  formData: FormData,
): Promise<CmsState> {
  await requireRole("admin");
  try {
    const value = JSON.parse(z.string().parse(formData.get("value")));
    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("site_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", "site");
    if (error) return { error: error.message };

    revalidatePublic();
    return { error: null, saved: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid settings." };
  }
}
