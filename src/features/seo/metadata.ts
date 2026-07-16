import type { Metadata } from "next";
import { getPageSeo } from "@/features/content/queries";
import { pick } from "@/features/content/types";
import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.primaddc.com";

const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
};

/** Canonical + hreflang alternates for a localized path ("" for home). */
export function localeAlternates(locale: Locale, path: string) {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
  );
  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages: { ...languages, "x-default": `${SITE_URL}/en${path}` },
  };
}

export function entityMetadata({
  title,
  description,
  locale,
  path,
}: {
  title: string;
  description: string;
  locale: Locale;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${path}`,
      siteName: "PRIMA Due Diligence Consult",
      locale: OG_LOCALES[locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Metadata for a CMS-managed static page, driven by the page_seo table. */
export async function pageMetadata(
  page: string,
  locale: Locale,
  path: string,
): Promise<Metadata> {
  const seo = await getPageSeo(page);
  const { title, description } = pick(seo.t, locale);
  return entityMetadata({ title, description, locale, path });
}
