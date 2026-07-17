// Optimizes brand media (old-site photos + curated Unsplash imagery) and
// uploads everything to the Supabase public-media bucket as webp.
// Run with: npm run media:upload
import { readFileSync } from "node:fs";
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

/** Old-site photos worth keeping (authentic PRIMA imagery). */
const LOCAL_SOURCES: Array<{ slot: string; file: string }> = [
  { slot: "site/office-sign", file: "about-img.jpg" },
  { slot: "site/office-reception", file: "slider3.jpg" },
  { slot: "site/training-session", file: "blog1.jpg" },
  { slot: "site/seminar-audience", file: "blog3.jpg" },
  { slot: "site/cyber-policy-handover", file: "blog2.jpg" },
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
  for (const { slot, file } of LOCAL_SOURCES) {
    const input = readFileSync(path.join(OLD_IMG, file));
    await upload(slot, await optimize(input, 1600));
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
