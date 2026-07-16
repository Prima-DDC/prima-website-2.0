"use client";

import { useState, type ReactNode } from "react";

const LOCALES = ["en", "fr", "es"] as const;

/** Tab switcher for per-locale editors; all panels stay mounted in the form. */
export function LocaleTabs({ panels }: { panels: Record<string, ReactNode> }) {
  const [active, setActive] = useState<string>("en");

  return (
    <div>
      <div className="flex gap-1 border-b border-line" role="tablist">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            role="tab"
            aria-selected={active === locale}
            onClick={() => setActive(locale)}
            className={`rounded-t-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              active === locale
                ? "border border-b-0 border-line bg-white text-brand"
                : "text-slate-body hover:text-navy"
            }`}
          >
            {locale}
          </button>
        ))}
      </div>
      {LOCALES.map((locale) => (
        <div
          key={locale}
          role="tabpanel"
          hidden={active !== locale}
          className="pt-4"
        >
          {panels[locale]}
        </div>
      ))}
    </div>
  );
}
