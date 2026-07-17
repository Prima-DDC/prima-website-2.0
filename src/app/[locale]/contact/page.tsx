import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { OfficeCard } from "@/features/content/components/OfficeCard";
import { getBlock, getOffices, getServices } from "@/features/content/queries";
import { pick, type TextBlock } from "@/features/content/types";
import { ContactForm } from "@/features/contact/ContactForm";
import { pageMetadata } from "@/features/seo/metadata";
import { JsonLd } from "@/features/seo/JsonLd";
import { breadcrumbSchema, localBusinessSchemas } from "@/features/seo/schemas";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("contact", locale, "/contact");
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intro, offices, services] = await Promise.all([
    getBlock<TextBlock>("contact", "intro"),
    getOffices(),
    getServices(),
  ]);

  const introContent = pick(intro.t, locale);
  const serviceOptions = services.map((s) => ({
    slug: s.slug,
    title: pick(s.t, locale).title,
  }));

  return (
    <>
      <JsonLd
        data={[
          ...localBusinessSchemas(offices, locale),
          breadcrumbSchema(locale, [
            { name: "PRIMA", path: "" },
            { name: introContent.kicker ?? introContent.title, path: "/contact" },
          ]),
        ]}
      />
      <PageHero
        kicker={introContent.kicker}
        title={introContent.title}
        intro={introContent.paragraphs[0]}
        imagePath={intro.imagePath}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Reveal>
                <ContactForm locale={locale} services={serviceOptions} />
              </Reveal>
            </div>
            <div className="space-y-6 lg:col-span-2">
              {offices.map((office, i) => (
                <Reveal key={office.slug} delay={i * 120}>
                  <OfficeCard office={office} content={pick(office.t, locale)} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
