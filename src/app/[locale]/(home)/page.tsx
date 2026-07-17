import { ArrowRight, ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MediaImage } from "@/components/MediaImage";
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

  const who = pick(whoWeAre.t, locale);
  const regional = pick(regionalTeaser.t, locale);
  const standards = pick(standardsExcerpt.t, locale);
  const statItems = pick(statBar.t, locale).items;
  const ctaContent = pick(cta.t, locale);

  return (
    <>
      <Hero block={pick(hero.t, locale)} imagePath={hero.imagePath} />
      <StatBar items={statItems} />

      {/* Who we are excerpt with authentic office imagery */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading kicker={who.kicker} title={who.title} />
              <div className="mt-6 space-y-5 border-l-2 border-brand pl-6">
                {who.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="leading-relaxed text-slate-body">
                    {p}
                  </p>
                ))}
              </div>
              <Link
                href="/who-we-are"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                {tCommon("learnMore")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
            {whoWeAre.imagePath ? (
              <Reveal delay={150}>
                <div className="group relative">
                  <div
                    aria-hidden
                    className="absolute -left-4 -top-4 h-full w-full rounded-lg border-2 border-brand/30 transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1"
                  />
                  <MediaImage
                    path={whoWeAre.imagePath}
                    alt={who.title}
                    width={960}
                    height={640}
                    hoverZoom
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="aspect-[3/2] rounded-lg shadow-2xl shadow-navy/20"
                  />
                  <div className="glass-dark absolute -bottom-6 left-6 flex items-center gap-3 rounded-xl px-5 py-4 shadow-xl">
                    <ShieldCheck className="h-8 w-8 text-brand-bright" aria-hidden />
                    <div>
                      <p className="font-serif text-2xl font-bold leading-none text-white">
                        {statItems[0]?.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-white/80">
                        {statItems[0]?.label}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      <CredentialClusters block={pick(credentials.t, locale)} />
      <CertificationsStrip
        block={pick(certifications.t, locale)}
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
                    imagePath={service.imagePath}
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
            <SectionHeading
              kicker={tNav("industries")}
              title={pick(getIndustriesHeading(), locale)}
            />
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

      {/* Regional coverage teaser over African skyline */}
      <section className="relative overflow-hidden bg-navy">
        {regionalTeaser.imagePath ? (
          <>
            <MediaImage
              path={regionalTeaser.imagePath}
              alt={regional.title}
              fill
              kenburns
              sizes="100vw"
              className="absolute inset-0"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/50"
            />
          </>
        ) : (
          <div className="bg-live-grid-dark absolute inset-0" aria-hidden />
        )}
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

      <ClientsStats block={pick(clientsStats.t, locale)} />

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
