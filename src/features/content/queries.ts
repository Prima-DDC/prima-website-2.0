import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import { CONTENT_BLOCKS } from "./fallback/blocks";
import { INDUSTRIES } from "./fallback/industries";
import { OFFICES } from "./fallback/offices";
import { SERVICES } from "./fallback/services";
import { PAGE_SEO } from "./fallback/seo";
import { SITE_SETTINGS } from "./fallback/settings";
import type {
  Industry,
  Localized,
  Office,
  PageSeo,
  Service,
  SiteSettings,
} from "./types";

/**
 * Every fetcher tries Supabase first and falls back to the bundled content
 * so the public site keeps rendering even if the database is unreachable.
 */
async function fromDb<T>(
  query: (db: SupabaseClient) => Promise<T | null>,
): Promise<T | null> {
  const db = createPublicClient();
  if (!db) return null;
  try {
    return await query(db);
  } catch {
    return null;
  }
}

export async function getBlock<T>(
  page: string,
  section: string,
): Promise<Localized<T>> {
  const t = await fromDb(async (db) => {
    const { data } = await db
      .from("content_blocks")
      .select("t")
      .eq("page", page)
      .eq("section", section)
      .maybeSingle();
    return (data?.t as Localized<T> | undefined) ?? null;
  });
  if (t) return t;

  const fallback = CONTENT_BLOCKS.find(
    (b) => b.page === page && b.section === section,
  );
  if (!fallback) throw new Error(`Missing content block: ${page}/${section}`);
  return fallback.t as Localized<T>;
}

type ServiceRow = {
  slug: string;
  sort: number;
  icon: string;
  image_path: string | null;
  t: Service["t"];
};

export async function getServices(): Promise<Service[]> {
  const rows = await fromDb(async (db) => {
    const { data } = await db
      .from("services")
      .select("slug, sort, icon, image_path, t")
      .order("sort");
    return data && data.length > 0 ? (data as ServiceRow[]) : null;
  });
  if (rows) {
    return rows.map((r) => ({
      slug: r.slug,
      sort: r.sort,
      icon: r.icon,
      imagePath: r.image_path,
      t: r.t,
    }));
  }
  return SERVICES;
}

export async function getService(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
}

type IndustryRow = {
  slug: string;
  sort: number;
  icon: string;
  related_service_slugs: string[];
  t: Industry["t"];
};

export async function getIndustries(): Promise<Industry[]> {
  const rows = await fromDb(async (db) => {
    const { data } = await db
      .from("industries")
      .select("slug, sort, icon, related_service_slugs, t")
      .order("sort");
    return data && data.length > 0 ? (data as IndustryRow[]) : null;
  });
  if (rows) {
    return rows.map((r) => ({
      slug: r.slug,
      sort: r.sort,
      icon: r.icon,
      relatedServiceSlugs: r.related_service_slugs,
      t: r.t,
    }));
  }
  return INDUSTRIES;
}

type OfficeRow = {
  slug: string;
  sort: number;
  phone: string;
  whatsapp: string | null;
  email: string;
  map_url: string | null;
  t: Office["t"];
};

export async function getOffices(): Promise<Office[]> {
  const rows = await fromDb(async (db) => {
    const { data } = await db
      .from("offices")
      .select("slug, sort, phone, whatsapp, email, map_url, t")
      .order("sort");
    return data && data.length > 0 ? (data as OfficeRow[]) : null;
  });
  if (rows) {
    return rows.map((r) => ({
      slug: r.slug,
      sort: r.sort,
      phone: r.phone,
      whatsapp: r.whatsapp,
      email: r.email,
      mapUrl: r.map_url,
      t: r.t,
    }));
  }
  return OFFICES;
}

type PageSeoRow = { page: string; og_image_path: string | null; t: PageSeo["t"] };

export async function getPageSeo(page: string): Promise<PageSeo> {
  const row = await fromDb(async (db) => {
    const { data } = await db
      .from("page_seo")
      .select("page, og_image_path, t")
      .eq("page", page)
      .maybeSingle();
    return (data as PageSeoRow | null) ?? null;
  });
  if (row) {
    return { page: row.page, ogImagePath: row.og_image_path, t: row.t };
  }
  const fallback = PAGE_SEO.find((p) => p.page === page);
  if (!fallback) throw new Error(`Missing page SEO: ${page}`);
  return fallback;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const value = await fromDb(async (db) => {
    const { data } = await db
      .from("site_settings")
      .select("value")
      .eq("key", "site")
      .maybeSingle();
    return (data?.value as SiteSettings | undefined) ?? null;
  });
  return value ?? SITE_SETTINGS;
}
