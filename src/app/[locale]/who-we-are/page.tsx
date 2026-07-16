import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CertificationsStrip } from "@/features/content/components/CertificationsStrip";
import { CredentialClusters } from "@/features/content/components/CredentialClusters";
import { FaqAccordion } from "@/features/content/components/FaqAccordion";
import { StatBar } from "@/features/content/components/StatBar";
import { getBlock, getSiteSettings } from "@/features/content/queries";
import {
  pick,
  type CertificationsBlock,
  type CredentialsBlock,
  type CtaBlock,
  type FaqBlock,
  type ItemListBlock,
  type StatBarBlock,
  type TextBlock,
} from "@/features/content/types";
import { pageMetadata } from "@/features/seo/metadata";
import { JsonLd } from "@/features/seo/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/features/seo/schemas";
import { CtaBand } from "@/features/site-layout/CtaBand";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("who-we-are", locale, "/who-we-are");
}

export default async function WhoWeArePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intro, missionVision, faq, statBar, credentials, certifications, cta, settings, tCommon] =
    await Promise.all([
      getBlock<TextBlock>("who-we-are", "intro"),
      getBlock<ItemListBlock>("who-we-are", "mission-vision"),
      getBlock<FaqBlock>("who-we-are", "faq"),
      getBlock<StatBarBlock>("home", "stat-bar"),
      getBlock<CredentialsBlock>("home", "credentials"),
      getBlock<CertificationsBlock>("home", "certifications"),
      getBlock<CtaBlock>("home", "cta"),
      getSiteSettings(),
      getTranslations({ locale, namespace: "common" }),
    ]);

  const introContent = pick(intro, locale);
  const mv = pick(missionVision, locale);
  const faqContent = pick(faq, locale);
  const ctaContent = pick(cta, locale);

  return (
    <>
      <JsonLd
        data={[
          faqSchema(faqContent),
          breadcrumbSchema(locale, [
            { name: "PRIMA", path: "" },
            { name: introContent.kicker ?? introContent.title, path: "/who-we-are" },
          ]),
        ]}
      />
      <PageHero
        kicker={introContent.kicker}
        title={introContent.title}
        intro={introContent.paragraphs[0]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="space-y-5 border-l-2 border-brand pl-6">
                {introContent.paragraphs.slice(1).map((p) => (
                  <p key={p.slice(0, 40)} className="text-lg leading-relaxed text-slate-body">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="grid gap-6">
                {mv.items.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-line bg-mist/50 p-7 transition-all duration-300 hover:border-brand/40"
                  >
                    <h2 className="text-lg font-bold text-navy">{item.title}</h2>
                    <p className="mt-2 leading-relaxed text-slate-body">{item.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <StatBar items={pick(statBar, locale).items} />
      <CredentialClusters block={pick(credentials, locale)} />
      <CertificationsStrip
        block={pick(certifications, locale)}
        certifications={pick(settings.certifications, locale)}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">
          <FaqAccordion block={faqContent} />
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
