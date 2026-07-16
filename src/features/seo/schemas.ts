import type { FaqBlock, Office, SiteSettings } from "@/features/content/types";
import type { Locale } from "@/i18n/routing";
import { SITE_URL } from "./metadata";

export function organizationSchema(settings: SiteSettings, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: settings.orgName,
    legalName: settings.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    slogan: settings.tagline[locale],
    sameAs: [
      settings.socials.linkedin,
      settings.socials.facebook,
      settings.socials.instagram,
    ],
  };
}

export function localBusinessSchemas(offices: Office[], locale: Locale) {
  return offices.map((office) => {
    const content = office.t[locale] ?? office.t.en;
    return {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#office-${office.slug}`,
      name: `PRIMA Due Diligence Consult, ${content.name}`,
      telephone: office.phone,
      email: office.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: content.addressLines[0],
        addressCountry: office.slug.startsWith("rwanda") ? "RW" : "GH",
      },
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    };
  });
}

export function serviceSchema({
  name,
  description,
  locale,
  path,
}: {
  name: string;
  description: string;
  locale: Locale;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}/${locale}${path}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "Africa",
  };
}

export function breadcrumbSchema(
  locale: Locale,
  crumbs: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}/${locale}${crumb.path}`,
    })),
  };
}

export function faqSchema(faq: FaqBlock) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
