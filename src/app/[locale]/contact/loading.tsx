"use client";

import { useTranslations } from "next-intl";
import { PageLoader } from "@/components/PageLoader";

export default function Loading() {
  const t = useTranslations("loading");
  return <PageLoader note={t("contact")} />;
}
