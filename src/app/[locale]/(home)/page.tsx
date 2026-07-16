import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CertificationsStrip } from "@/features/content/components/CertificationsStrip";
import { ClientsStats } from "@/features/content/components/ClientsStats";
import { CredentialClusters } from "@/features/content/components/CredentialClusters";
import { Hero } from "@/features/content/components/Hero";
import { IndustriesStrip } from "@/features/content/components/IndustriesStrip";
import { LinkedItemGrid } from "@/features/content/components/LinkedItemGrid";
import { ServiceCard } from "@/features/content/components/ServiceCard";
import { StatBar } from "@/features/content/components/StatBar";
import {
  getBlock,
  getIndustries,
  getServices,
  getSiteSettings,
} from "@/features/content/queries";
import {
  pick,
  type ClientsStatsBlock,
  type CertificationsBlock,
  type CredentialsBlock,
  type CtaBlock,
  type HeroBlock,
  type ItemListBlock,
  type StatBarBlock,
  type TextBlock,
} from "@/features/content/types";
import { pageMetadata } from "@/features/seo/metadata";
import { CtaBand } from "@/features/site-layout/CtaBand";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("home", locale, "");
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    hero,
    whoWeAre,
    statBar,
    credentials,
    certifications,
    clientsStats,
    regionalTeaser,
    standardsExcerpt,
    cta,
    services,
    industries,
    settings,
    tCommon,
    tNav,
  ] = await Promise.all([
    getBlock<HeroBlock>("home", "hero"),
    getBlock<TextBlock>("home", "who-we-are"),
    getBlock<StatBarBlock>("home", "stat-bar"),
    getBlock<CredentialsBlock>("home", "credentials"),
    getBlock<CertificationsBlock>("home", "certifications"),
    getBlock<ClientsStatsBlock>("home", "clients-stats"),
    getBlock<TextBlock>("home", "regional-teaser"),
    getBlock<ItemListBlock>("home", "standards-excerpt"),
    getBlock<CtaBlock>("home", "cta"),
    getServices(),
    getIndustries(),
    getSiteSettings(),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const who = pick(whoWeAre, locale);
  const regional = pick(regionalTeaser, locale);
  const standards = pick(standardsExcerpt, locale);
  const ctaContent = pick(cta, locale);

  return (
    <>
      <Hero block={pick(hero, locale)} />
      <StatBar items={pick(statBar, locale).items} />

      {/* Who we are excerpt */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading kicker={who.kicker} title={who.title} />
              <Link
                href="/who-we-are"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                {tCommon("learnMore")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
            <Reveal delay={150}>
              <div className="space-y-5 border-l-2 border-brand pl-6">
                {who.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="leading-relaxed text-slate-body">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CredentialClusters block={pick(credentials, locale)} />
      <CertificationsStrip
        block={pick(certifications, locale)}
        certifications={pick(settings.certifications, locale)}
      />

      {/* Practice areas */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                kicker={tNav("practiceAreas")}
                title={pick(getPracticeAreasHeading(), locale)}
              />
              <Link
                href="/practice-areas"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                {tCommon("viewAll")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Industries strip */}
      <section className="bg-mist/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading kicker={tNav("industries")} title={pick(getIndustriesHeading(), locale)} />
          </Reveal>
          <div className="mt-10">
            <IndustriesStrip
              items={industries.map((industry) => ({
                slug: industry.slug,
                icon: industry.icon,
                title: pick(industry.t, locale).title,
              }))}
            />
          </div>
        </div>
      </section>

      {/* Regional coverage teaser (dark) */}
      <section className="relative overflow-hidden bg-navy">
        <div className="bg-live-grid-dark absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              kicker={regional.kicker}
              title={regional.title}
              intro={regional.paragraphs[0]}
              light
            />
            <Link
              href="/regional-coverage"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-bright hover:text-white"
            >
              {tCommon("learnMore")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <ClientsStats block={pick(clientsStats, locale)} />

      {/* Standards excerpt */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              kicker={standards.kicker}
              title={standards.title}
              intro={standards.intro}
            />
          </Reveal>
          <div className="mt-12">
            <LinkedItemGrid items={standards.items} />
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

// Small trilingual headings owned by the home composition (not CMS-worthy).
function getPracticeAreasHeading() {
  return {
    en: "What we do, when the stakes are highest",
    fr: "Ce que nous faisons quand les enjeux sont les plus élevés",
    es: "Lo que hacemos cuando hay más en juego",
  };
}

function getIndustriesHeading() {
  return {
    en: "Sector fluency across the markets we serve",
    fr: "Une maîtrise sectorielle sur les marchés que nous servons",
    es: "Fluidez sectorial en los mercados que servimos",
  };
}
