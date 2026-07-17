import { ArrowRight, Lock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaImage } from "@/components/MediaImage";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { LinkedItemGrid } from "@/features/content/components/LinkedItemGrid";
import { getBlock } from "@/features/content/queries";
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
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("our-standards", locale, "/our-standards");
}

export default async function OurStandardsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intro, standards, dataProtection, cta, tCommon] = await Promise.all([
    getBlock<TextBlock>("our-standards", "intro"),
    getBlock<ItemListBlock>("our-standards", "standards"),
    getBlock<TextBlock>("our-standards", "data-protection"),
    getBlock<CtaBlock>("home", "cta"),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const introContent = pick(intro.t, locale);
  const standardsContent = pick(standards.t, locale);
  const dp = pick(dataProtection.t, locale);
  const ctaContent = pick(cta.t, locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: "PRIMA", path: "" },
          { name: introContent.kicker ?? introContent.title, path: "/our-standards" },
        ])}
      />
      <PageHero
        kicker={introContent.kicker}
        title={introContent.title}
        intro={introContent.paragraphs[0]}
        imagePath={intro.imagePath}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <h2 className="text-3xl font-bold text-navy">{standardsContent.title}</h2>
          </Reveal>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <LinkedItemGrid items={standardsContent.items} columns={2} />
            </div>
            {standards.imagePath ? (
              <Reveal delay={150} className="lg:col-span-2">
                <div className="group">
                  <MediaImage
                    path={standards.imagePath}
                    alt={standardsContent.title}
                    width={800}
                    height={600}
                    hoverZoom
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="aspect-[4/3] rounded-lg shadow-xl shadow-navy/15"
                  />
                </div>
              </Reveal>
            ) : null}
          </div>

          <Reveal className="mt-16">
            <div className="rounded-lg border border-line bg-mist/50 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand text-white">
                  <Lock className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy">{dp.title}</h2>
                  <p className="mt-2 leading-relaxed text-slate-body">
                    {dp.paragraphs[0]}
                  </p>
                  <Link
                    href="/data-protection-policy"
                    className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    {tCommon("readFullPolicy")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
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
