import type { Metadata } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteSettings } from "@/features/content/queries";
import { JsonLd } from "@/features/seo/JsonLd";
import { organizationSchema } from "@/features/seo/schemas";
import { Footer } from "@/features/site-layout/Footer";
import { Header } from "@/features/site-layout/Header";
import { Preloader } from "@/features/site-layout/Preloader";
import "../globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin", "latin-ext"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
});

// Public pages are static and refreshed in the background (ISR) so CMS
// edits go live without a redeploy.
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.primaddc.com",
  ),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "loading" }),
    getSiteSettings(),
  ]);

  return (
    <html
      lang={locale}
      className={`${publicSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationSchema(settings, locale as Locale)} />
        <NextIntlClientProvider>
          <Preloader note={t("preloader")} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
