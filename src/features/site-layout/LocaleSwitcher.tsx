"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            l === locale
              ? "bg-brand text-white"
              : "text-slate-body hover:bg-mist hover:text-navy"
          }`}
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}
