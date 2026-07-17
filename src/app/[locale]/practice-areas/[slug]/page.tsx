import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MediaImage } from "@/components/MediaImage";
import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getBlock, getIndustries, getService } from "@/features/content/queries";
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

  const [service, industries, cta, tCommon, tNav] = await Promise.all([
    getService(slug),
    getIndustries(),
    getBlock<CtaBlock>("home", "cta"),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  if (!service) notFound();

  const s = pick(service.t, locale);
  const ctaContent = pick(cta.t, locale);
  const related = industries.filter((i) =>
    i.relatedServiceSlugs.includes(service.slug),
  );

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

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {s.groups.map((group, i) => (
              <Reveal key={group.heading} delay={(i % 2) * 120}>
                <div className="h-full rounded-lg border border-line bg-white p-7 transition-all duration-300 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10">
                  <h2 className="text-xl font-bold text-navy">{group.heading}</h2>
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
