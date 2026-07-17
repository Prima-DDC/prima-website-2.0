import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaImage } from "@/components/MediaImage";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { LinkedItemGrid } from "@/features/content/components/LinkedItemGrid";
import { OfficeCard } from "@/features/content/components/OfficeCard";
import { getBlock, getOffices } from "@/features/content/queries";
import {
  pick,
  type CtaBlock,
  type ItemListBlock,
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
  return pageMetadata("regional-coverage", locale, "/regional-coverage");
}

export default async function RegionalCoveragePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intro, pillars, cta, offices, tCommon, tFooter] = await Promise.all([
    getBlock<TextBlock>("regional-coverage", "intro"),
    getBlock<ItemListBlock>("regional-coverage", "pillars"),
    getBlock<CtaBlock>("home", "cta"),
    getOffices(),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "footer" }),
  ]);

  const introContent = pick(intro.t, locale);
  const pillarsContent = pick(pillars.t, locale);
  const ctaContent = pick(cta.t, locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: "PRIMA", path: "" },
          { name: introContent.kicker ?? introContent.title, path: "/regional-coverage" },
        ])}
      />
      <PageHero
        kicker={introContent.kicker}
        title={introContent.title}
        intro={introContent.paragraphs[0]}
        imagePath={intro.imagePath}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="border-l-2 border-brand pl-6 text-lg leading-relaxed text-slate-body">
                {introContent.paragraphs[1]}
              </p>
            </Reveal>
            {pillars.imagePath ? (
              <Reveal delay={150}>
                <div className="group">
                  <MediaImage
                    path={pillars.imagePath}
                    alt={pillarsContent.title}
                    width={960}
                    height={640}
                    hoverZoom
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="aspect-[3/2] rounded-lg shadow-xl shadow-navy/15"
                  />
                </div>
              </Reveal>
            ) : null}
          </div>
          <Reveal className="mt-14">
            <h2 className="text-3xl font-bold text-navy">{pillarsContent.title}</h2>
          </Reveal>
          <div className="mt-10">
            <LinkedItemGrid items={pillarsContent.items} />
          </div>
        </div>
      </section>

      <section className="bg-mist/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-bold text-navy">{tFooter("offices")}</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offices.map((office, i) => (
              <Reveal key={office.slug} delay={i * 120}>
                <OfficeCard office={office} content={pick(office.t, locale)} />
              </Reveal>
            ))}
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
