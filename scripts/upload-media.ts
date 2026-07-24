// Optimizes brand media (old-site photos + curated Unsplash imagery) and
// uploads everything to the Supabase public-media bucket as webp.
// Run with: npm run media:upload
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Supabase env vars missing");
  process.exit(1);
}
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const OLD_IMG = path.resolve("../prima-website/img");
const MEDIA_DIR = path.resolve("files/Media");

/** Old-site photos worth keeping (authentic PRIMA imagery). */
const LOCAL_SOURCES: Array<{ dir: string; slot: string; file: string }> = [
  { dir: OLD_IMG, slot: "site/office-sign", file: "about-img.jpg" },
  { dir: OLD_IMG, slot: "site/office-reception", file: "slider3.jpg" },
  { dir: OLD_IMG, slot: "site/training-session", file: "blog1.jpg" },
  { dir: OLD_IMG, slot: "site/seminar-audience", file: "blog3.jpg" },
  { dir: OLD_IMG, slot: "site/cyber-policy-handover", file: "blog2.jpg" },
  // Real PRIMA photos (in-repo), added for the practice-area galleries.
  { dir: MEDIA_DIR, slot: "site/field-forensic-1", file: "field_research_equipment.webp" },
  { dir: MEDIA_DIR, slot: "site/field-forensic-2", file: "field_research_team.webp" },
  { dir: MEDIA_DIR, slot: "site/prima-boardroom-1", file: "office_conference_room_1.webp" },
  { dir: MEDIA_DIR, slot: "site/prima-boardroom-2", file: "office_conference_room_2.webp" },
  { dir: MEDIA_DIR, slot: "site/prima-hallway", file: "office_hallway.webp" },
  { dir: MEDIA_DIR, slot: "site/prima-sign", file: "office_hallway_sign.webp" },
];

/**
 * Curated Unsplash slots (Unsplash License permits commercial use without
 * attribution). Candidates are tried in order until one downloads and
 * passes size validation; visual review happens after upload.
 */
const CDN_SOURCES: Array<{ slot: string; candidates: string[] }> = [
  {
    slot: "site/hero-corporate",
    candidates: [
      "photo-1486406146926-c627a92ad1ab",
      "photo-1431540015161-0bf868a2d407",
      "photo-1477959858617-67f85cf4f1df",
    ],
  },
  {
    slot: "site/analysts-working",
    candidates: [
      "photo-1573164713988-8665fc963095",
      "photo-1460925895917-afdab827c52f",
      "photo-1551288049-bebda4e38f71",
    ],
  },
  {
    slot: "site/boardroom-meeting",
    candidates: [
      "photo-1522071820081-009f0129c71c",
      "photo-1521737604893-d14cc237f11d",
      "photo-1556761175-5973dc0f32e7",
    ],
  },
  {
    slot: "site/corporate-building",
    candidates: [
      "photo-1431540015161-0bf868a2d407",
      "photo-1486406146926-c627a92ad1ab",
    ],
  },
  {
    slot: "site/city-skyline",
    candidates: [
      "photo-1449824913935-59a10b8d2000",
      "photo-1477959858617-67f85cf4f1df",
    ],
  },
  {
    slot: "site/documents-review",
    candidates: [
      "photo-1450101499163-c8848c66ca85",
      "photo-1454165804606-c3d57bc86b40",
    ],
  },
  {
    slot: "site/data-intelligence",
    candidates: [
      "photo-1551288049-bebda4e38f71",
      "photo-1460925895917-afdab827c52f",
    ],
  },
  {
    slot: "site/forensic-lab",
    candidates: [
      "photo-1532187863486-abf9dbad1b69",
      "photo-1582719471384-894fbb16e074",
      "photo-1576086213369-97a306d36557",
    ],
  },
  {
    slot: "site/insurance-claims",
    candidates: [
      "photo-1554224155-6726b3ff858f",
      "photo-1454165804606-c3d57bc86b40",
    ],
  },
  {
    slot: "site/partnership-handshake",
    candidates: [
      "photo-1521791136064-7986c2920216",
      "photo-1560264280-88b68371db39",
      "photo-1522071820081-009f0129c71c",
    ],
  },
  // Gallery gaps the existing bucket cannot cover. Insurance imagery centers on
  // inspection, not the incident (no burning buildings, accidents, or blood).
  {
    slot: "site/vehicle-inspection",
    candidates: [
      "photo-1625047509168-a7026f36de04",
      "photo-1486006920555-c77dcf18193c",
      "photo-1503376780353-7e6692767b70",
    ],
  },
  {
    slot: "site/cargo-inspection",
    candidates: [
      "photo-1494412574643-ff11b0a5c1c3",
      "photo-1578575437130-527eed3abbec",
      "photo-1605902711622-cfb43c4437b5",
    ],
  },
  {
    slot: "site/country-risk",
    candidates: [
      "photo-1526778548025-fa2f459cd5c1",
      "photo-1451187580459-43490279c0fa",
      "photo-1519389950473-47ba0277781c",
    ],
  },
];

async function optimize(input: Buffer, width: number): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: false })
    .webp({ quality: 80 })
    .toBuffer();
}

async function upload(slot: string, buffer: Buffer): Promise<void> {
  const storagePath = `${slot}.webp`;
  const { error } = await db.storage
    .from("public-media")
    .upload(storagePath, buffer, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`${storagePath}: ${error.message}`);
  const publicUrl = db.storage.from("public-media").getPublicUrl(storagePath)
    .data.publicUrl;
  const head = await fetch(publicUrl, { method: "HEAD" });
  console.log(`uploaded ${storagePath} (${Math.round(buffer.length / 1024)} KB, public ${head.status})`);
}

async function main() {
  for (const { dir, slot, file } of LOCAL_SOURCES) {
    const src = path.join(dir, file);
    if (!existsSync(src)) {
      console.warn(`skip ${slot}: missing ${src}`);
      continue;
    }
    await upload(slot, await optimize(readFileSync(src), 1600));
  }

  for (const { slot, candidates } of CDN_SOURCES) {
    let done = false;
    for (const id of candidates) {
      const src = `https://images.unsplash.com/${id}?w=1920&q=85&fm=jpg&fit=max`;
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = Buffer.from(await res.arrayBuffer());
        const meta = await sharp(raw).metadata();
        if ((meta.width ?? 0) < 1200) throw new Error("too small");
        await upload(slot, await optimize(raw, 1920));
        done = true;
        break;
      } catch (err) {
        console.warn(`  candidate ${id} failed: ${err instanceof Error ? err.message : err}`);
      }
    }
    if (!done) console.error(`NO CANDIDATE WORKED for ${slot}`);
  }
  console.log("media upload complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
