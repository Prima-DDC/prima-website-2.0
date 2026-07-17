import { Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { getBlock, getService } from "@/features/content/queries";
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

const TRAINING_SLUG = "training-professional-development";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("training", locale, "/training");
}

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [intro, service, cta, tCommon] = await Promise.all([
    getBlock<TextBlock>("training", "intro"),
    getService(TRAINING_SLUG),
    getBlock<CtaBlock>("home", "cta"),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const introContent = pick(intro.t, locale);
  const ctaContent = pick(cta.t, locale);
  const s = service ? pick(service.t, locale) : null;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: "PRIMA", path: "" },
          { name: introContent.kicker ?? introContent.title, path: "/training" },
        ])}
      />
      <PageHero
        kicker={introContent.kicker}
        title={introContent.title}
        intro={introContent.paragraphs[0]}
        imagePath={intro.imagePath}
      />

      {s ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="max-w-3xl space-y-5 border-l-2 border-brand pl-6">
                {s.opening.map((p) => (
                  <p key={p.slice(0, 40)} className="text-lg leading-relaxed text-slate-body">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
            {s.groups.map((group) => (
              <Reveal key={group.heading} className="mt-14">
                <h2 className="text-3xl font-bold text-navy">{group.heading}</h2>
                <ul className="mt-8 grid gap-4 lg:grid-cols-2">
                  {group.items.map((item, i) => (
                    <li key={item}>
                      <Reveal delay={(i % 2) * 100}>
                        <div className="flex h-full items-start gap-3 rounded-lg border border-line bg-mist/40 p-5 transition-colors hover:border-brand/40">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                          <span className="leading-relaxed text-slate-body">{item}</span>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand
        title={ctaContent.title}
        body={ctaContent.body}
        cta={tCommon("speakToOurTeam")}
      />
    </>
  );
}
