import type { MetadataRoute } from "next";
import { SITE_URL } from "@/features/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/login", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
