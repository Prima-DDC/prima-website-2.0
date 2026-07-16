// Seeds Supabase with the bundled trilingual content (idempotent upserts).
// Run with: npm run db:seed
import { createClient } from "@supabase/supabase-js";
import { CONTENT_BLOCKS } from "../src/features/content/fallback/blocks";
import { INDUSTRIES } from "../src/features/content/fallback/industries";
import { OFFICES } from "../src/features/content/fallback/offices";
import { PAGE_SEO } from "../src/features/content/fallback/seo";
import { SERVICES } from "../src/features/content/fallback/services";
import { SITE_SETTINGS } from "../src/features/content/fallback/settings";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

async function upsert(table: string, rows: object[], onConflict: string) {
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`seeded ${table} (${rows.length})`);
}

async function main() {
await upsert(
  "content_blocks",
  CONTENT_BLOCKS.map((b) => ({
    page: b.page,
    section: b.section,
    sort: b.sort,
    t: b.t,
  })),
  "page,section",
);

await upsert(
  "services",
  SERVICES.map((s) => ({
    slug: s.slug,
    sort: s.sort,
    icon: s.icon,
    image_path: s.imagePath,
    t: s.t,
  })),
  "slug",
);

await upsert(
  "industries",
  INDUSTRIES.map((i) => ({
    slug: i.slug,
    sort: i.sort,
    icon: i.icon,
    related_service_slugs: i.relatedServiceSlugs,
    t: i.t,
  })),
  "slug",
);

await upsert(
  "offices",
  OFFICES.map((o) => ({
    slug: o.slug,
    sort: o.sort,
    phone: o.phone,
    whatsapp: o.whatsapp,
    email: o.email,
    map_url: o.mapUrl,
    t: o.t,
  })),
  "slug",
);

await upsert(
  "page_seo",
  PAGE_SEO.map((p) => ({
    page: p.page,
    og_image_path: p.ogImagePath,
    t: p.t,
  })),
  "page",
);

await upsert(
  "site_settings",
  [{ key: "site", value: SITE_SETTINGS }],
  "key",
);

console.log("seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
