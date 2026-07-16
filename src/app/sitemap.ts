import type { MetadataRoute } from "next";
import { getServices } from "@/features/content/queries";
import { SITE_URL } from "@/features/seo/metadata";
import { routing } from "@/i18n/routing";

const STATIC_PATHS = [
  { path: "", priority: 1.0 },
  { path: "/who-we-are", priority: 0.9 },
  { path: "/practice-areas", priority: 0.9 },
  { path: "/industries", priority: 0.8 },
  { path: "/regional-coverage", priority: 0.8 },
  { path: "/our-standards", priority: 0.7 },
  { path: "/training", priority: 0.8 },
  { path: "/contact", priority: 0.9 },
  { path: "/data-protection-policy", priority: 0.3 },
];

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/en${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  return [
    ...STATIC_PATHS.map((p) => entry(p.path, p.priority)),
    ...services.map((s) => entry(`/practice-areas/${s.slug}`, 0.8)),
  ];
}
