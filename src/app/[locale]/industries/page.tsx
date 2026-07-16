import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getBlock, getIndustries, getServices } from "@/features/content/queries";
import {
  pick,
  type CtaBlock,
  type TextBlock,
} from "@/features/content/types";
import { pageMetadata } from "@/features/seo/metadata";
import { JsonLd } from "@/features/seo/JsonLd";
import { breadcrumbSchema } from "@/features/seo/schemas";
import { CtaBand } from "@/features/site-layout/CtaBand";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("industries", locale, "/industries");
}

export default async function IndustriesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intro, cta, industries, services, tCommon] = await Promise.all([
    getBlock<TextBlock>("industries", "intro"),
    getBlock<CtaBlock>("home", "cta"),
    getIndustries(),
    getServices(),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const introContent = pick(intro, locale);
  const ctaContent = pick(cta, locale);
  const serviceTitle = (slug: string) => {
    const service = services.find((s) => s.slug === slug);
    return service ? pick(service.t, locale).shortTitle : slug;
  };

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: "PRIMA", path: "" },
          { name: introContent.kicker ?? introContent.title, path: "/industries" },
        ])}
      />
      <PageHero
        kicker={introContent.kicker}
        title={introContent.title}
        intro={introContent.paragraphs[0]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-6 lg:grid-cols-2">
            {industries.map((industry, i) => {
              const content = pick(industry.t, locale);
              return (
                <Reveal key={industry.slug} delay={(i % 2) * 120}>
                  <article
                    id={industry.slug}
                    className="h-full scroll-mt-28 rounded-lg border border-line bg-white p-8 transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-mist text-brand">
                      <ServiceIcon name={industry.icon} className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-xl font-bold text-navy">
                      {content.title}
                    </h2>
                    <p className="mt-3 leading-relaxed text-slate-body">
                      {content.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {industry.relatedServiceSlugs.map((slug) => (
                        <Link
                          key={slug}
                          href={`/practice-areas/${slug}`}
                          className="group inline-flex items-center gap-1 rounded-full border border-line bg-mist/60 px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:bg-brand hover:text-white"
                        >
                          {serviceTitle(slug)}
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  </article>
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
