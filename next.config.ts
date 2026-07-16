import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Media library uploads (images) go through a server action.
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iccbchzopnomagcqbhqe.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    // Preserve SEO equity from the old static site URLs.
    const oldPages: Array<[string, string]> = [
      ["/about.html", "/en/who-we-are"],
      ["/due-diligence.html", "/en/practice-areas/corporate-intelligence-due-diligence"],
      ["/searches.html", "/en/practice-areas/corporate-intelligence-due-diligence"],
      ["/services-rwanda.html", "/en/practice-areas"],
      ["/special-investigations-unit-insurance-services.html", "/en/practice-areas/insurance-sector-solutions"],
      ["/blog-single.html", "/en"],
      ["/portfolio-details.html", "/en"],
      ["/faq.html", "/en/who-we-are"],
      ["/contact.html", "/en/contact"],
      ["/contact-rwanda.html", "/en/contact"],
      ["/mail-success.html", "/en/contact"],
      ["/index.html", "/en"],
    ];
    return oldPages.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
