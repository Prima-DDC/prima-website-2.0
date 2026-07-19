import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MediaImage } from "@/components/MediaImage";
import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getBlock, getIndustries, getService, getServices } from "@/features/content/queries";
import { pick, type CtaBlock } from "@/features/content/types";
import { entityMetadata } from "@/features/seo/metadata";
import { JsonLd } from "@/features/seo/JsonLd";
import { breadcrumbSchema, serviceSchema } from "@/features/seo/schemas";
import { CtaBand } from "@/features/site-layout/CtaBand";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SERVICES } from "@/features/content/fallback/services";

// Only the known practice areas exist; anything else is a hard 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICES.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  const s = pick(service.t, locale);
  return entityMetadata({
    title: s.seoTitle,
    description: s.seoDescription,
    locale,
    path: `/practice-areas/${slug}`,
  });
}

export default async function PracticeAreaPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [service, services, industries, cta, tCommon, tNav, tService] =
    await Promise.all([
      getService(slug),
      getServices(),
      getIndustries(),
      getBlock<CtaBlock>("home", "cta"),
      getTranslations({ locale, namespace: "common" }),
      getTranslations({ locale, namespace: "nav" }),
      getTranslations({ locale, namespace: "service" }),
    ]);
  if (!service) notFound();

  const s = pick(service.t, locale);
  const ctaContent = pick(cta.t, locale);
  const related = industries.filter((i) =>
    i.relatedServiceSlugs.includes(service.slug),
  );
  const otherServices = services.filter((o) => o.slug !== service.slug);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: s.title,
            description: s.seoDescription,
            locale,
            path: `/practice-areas/${service.slug}`,
          }),
          breadcrumbSchema(locale, [
            { name: "PRIMA", path: "" },
            { name: tNav("practiceAreas"), path: "/practice-areas" },
            { name: s.title, path: `/practice-areas/${service.slug}` },
          ]),
        ]}
      />
      <section
        className={`relative overflow-hidden border-b border-line ${
          service.imagePath ? "bg-navy-deep" : "bg-mist/50"
        }`}
      >
        {service.imagePath ? (
          <>
            <MediaImage
              path={service.imagePath}
              alt={s.title}
              fill
              priority
              kenburns
              sizes="100vw"
              className="absolute inset-0"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/40"
            />
          </>
        ) : (
          <AnimatedBackground />
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div
            className="animate-fade-up flex h-14 w-14 items-center justify-center rounded-lg bg-brand text-white shadow-lg shadow-brand/25"
            style={{ animationDelay: "0.05s" }}
          >
            <ServiceIcon name={service.icon} className="h-7 w-7" />
          </div>
          <h1
            className={`animate-fade-up mt-6 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl ${
              service.imagePath ? "text-white" : "text-navy"
            }`}
            style={{ animationDelay: "0.15s" }}
          >
            {s.title}
          </h1>
          <p
            className={`animate-fade-up mt-4 max-w-3xl text-xl font-medium ${
              service.imagePath ? "text-brand-bright" : "text-brand-dark"
            }`}
            style={{ animationDelay: "0.25s" }}
          >
            {s.tagline}
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="max-w-3xl space-y-5 border-l-2 border-brand pl-6">
              {s.opening.map((p) => (
                <p key={p.slice(0, 40)} className="text-lg leading-relaxed text-slate-body">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          {s.challenges?.length ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-bold text-navy">{tService("challenges")}</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {s.challenges.map((challenge) => (
                  <li
                    key={challenge}
                    className="rounded-lg border border-line bg-mist/40 p-5 text-sm leading-relaxed text-slate-body transition-colors hover:border-brand/40"
                  >
                    {challenge}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {s.whoWeServe?.length ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-bold text-navy">{tService("whoWeServe")}</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {s.whoWeServe.map((client) => (
                  <span
                    key={client}
                    className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-navy"
                  >
                    {client}
                  </span>
                ))}
              </div>
            </Reveal>
          ) : null}

          <Reveal className="mt-16">
            <h2 className="text-2xl font-bold text-navy">{tService("services")}</h2>
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {s.groups.map((group, i) => (
              <Reveal key={group.heading} delay={(i % 2) * 120}>
                <div className="h-full rounded-lg border border-line bg-white p-7 transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10">
                  <h3 className="text-xl font-bold text-navy">{group.heading}</h3>
                  {group.summary ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-body">
                      {group.summary}
                    </p>
                  ) : null}
                  <ul className="mt-5 space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-body">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          {s.methodology?.length ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-bold text-navy">{tService("methodology")}</h2>
              <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {s.methodology.map((step, i) => (
                  <li
                    key={step}
                    className="flex items-start gap-4 rounded-lg border border-line bg-white p-5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-body">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-slate-body">
                {tService("methodologyNote")}{" "}
                <Link
                  href="/our-standards"
                  className="font-semibold text-brand hover:text-brand-dark"
                >
                  {tNav("ourStandards")}
                </Link>
              </p>
            </Reveal>
          ) : null}

          {s.deliverables?.length ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-bold text-navy">{tService("deliverables")}</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-body">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {s.caseExperience?.length ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-bold text-navy">{tService("caseExperience")}</h2>
              <ul className="mt-6 grid gap-4 lg:grid-cols-3">
                {s.caseExperience.map((example) => (
                  <li
                    key={example}
                    className="rounded-lg border-l-2 border-brand bg-mist/40 p-5 text-sm leading-relaxed text-slate-body"
                  >
                    {example}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-body/80">{tService("caseExperienceNote")}</p>
            </Reveal>
          ) : null}

          {s.whyPrima?.length ? (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-bold text-navy">{tService("whyPrima")}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {s.whyPrima.map((reason) => (
                  <div key={reason.title} className="rounded-lg border border-line bg-white p-6">
                    <h3 className="font-bold text-navy">{reason.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-body">{reason.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ) : null}

          {related.length > 0 ? (
            <Reveal className="mt-14">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                {tNav("industries")}
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {related.map((industry) => (
                  <Link
                    key={industry.slug}
                    href={`/industries#${industry.slug}`}
                    className="rounded-full border border-line bg-mist/60 px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-brand hover:bg-brand hover:text-white"
                  >
                    {pick(industry.t, locale).title}
                  </Link>
                ))}
              </div>
            </Reveal>
          ) : null}

          {otherServices.length > 0 ? (
            <Reveal className="mt-14">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                {tCommon("relatedServices")}
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {otherServices.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/practice-areas/${other.slug}`}
                    className="rounded-full border border-line bg-mist/60 px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-brand hover:bg-brand hover:text-white"
                  >
                    {pick(other.t, locale).shortTitle}
                  </Link>
                ))}
              </div>
            </Reveal>
          ) : null}
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
