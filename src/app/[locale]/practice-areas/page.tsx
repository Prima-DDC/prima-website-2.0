import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/features/content/components/ServiceCard";
import { getBlock, getServices } from "@/features/content/queries";
import {
  pick,
  type CtaBlock,
  type TextBlock,
} from "@/features/content/types";
import { pageMetadata } from "@/features/seo/metadata";
import { JsonLd } from "@/features/seo/JsonLd";
import { breadcrumbSchema } from "@/features/seo/schemas";
import { CtaBand } from "@/features/site-layout/CtaBand";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("practice-areas", locale, "/practice-areas");
}

export default async function PracticeAreasPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intro, cta, services, tCommon] = await Promise.all([
    getBlock<TextBlock>("practice-areas", "intro"),
    getBlock<CtaBlock>("home", "cta"),
    getServices(),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const introContent = pick(intro, locale);
  const ctaContent = pick(cta, locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: "PRIMA", path: "" },
          { name: introContent.kicker ?? introContent.title, path: "/practice-areas" },
        ])}
      />
      <PageHero
        kicker={introContent.kicker}
        title={introContent.title}
        intro={introContent.paragraphs[0]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const s = pick(service.t, locale);
              return (
                <Reveal key={service.slug} delay={(i % 3) * 120}>
                  <ServiceCard
                    slug={service.slug}
                    icon={service.icon}
                    index={i + 1}
                    title={s.title}
                    tagline={s.tagline}
                    cta={tCommon("learnMore")}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand
        title={ctaContent.title}
        body={ctaContent.body}
        cta={tCommon("speakToOurTeam")}
      />
    </>
  );
}
