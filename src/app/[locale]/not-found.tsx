"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-serif text-8xl font-bold text-brand">404</p>
      <h1 className="mt-4 text-3xl font-bold text-navy">{t("title")}</h1>
      <p className="mt-3 text-lg text-slate-body">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
