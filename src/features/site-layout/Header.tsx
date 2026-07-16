import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getServices } from "@/features/content/queries";
import { pick } from "@/features/content/types";
import { HeaderChrome } from "./HeaderChrome";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav, type NavItem } from "./MobileNav";

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("nav");
  const services = await getServices();

  const navItems: NavItem[] = [
    { href: "/who-we-are", label: t("whoWeAre") },
    { href: "/practice-areas", label: t("practiceAreas") },
    { href: "/industries", label: t("industries") },
    { href: "/regional-coverage", label: t("regionalCoverage") },
    { href: "/our-standards", label: t("ourStandards") },
    { href: "/training", label: t("training") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <HeaderChrome>
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="PRIMA Due Diligence Consult">
          <Image
            src="/logo.png"
            alt="PRIMA Due Diligence Consult"
            width={150}
            height={60}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navItems.map((item) =>
            item.href === "/practice-areas" ? (
              <div key={item.href} className="group relative">
                <Link
                  href="/practice-areas"
                  className="flex items-center gap-1 rounded px-3 py-2 text-sm font-medium text-navy hover:bg-mist"
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4 text-slate-body transition-transform group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full w-80 rounded-b-md border border-line bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {services.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/practice-areas/${s.slug}`}
                      className="block border-b border-line px-4 py-3 text-sm text-navy last:border-0 hover:bg-mist"
                    >
                      {pick(s.t, locale).title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 text-sm font-medium text-navy hover:bg-mist"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/contact"
            className="hidden rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:block"
          >
            {t("contact")}
          </Link>
          <MobileNav items={navItems} />
        </div>
      </div>
    </HeaderChrome>
  );
}
