import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { getBlock } from "@/features/content/queries";
import { pick, type TextBlock } from "@/features/content/types";
import { pageMetadata } from "@/features/seo/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return pageMetadata("data-protection-policy", locale, "/data-protection-policy");
}

export default async function DataProtectionPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const policy = await getBlock<TextBlock>("data-protection-policy", "policy");
  const content = pick(policy.t, locale);

  return (
    <>
      <PageHero kicker={content.kicker} title={content.title} />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
          {content.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="leading-relaxed text-slate-body">
              {p}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}
