import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/SocialIcons";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getOffices,
  getServices,
  getSiteSettings,
} from "@/features/content/queries";
import { pick } from "@/features/content/types";

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const [tNav, tFooter] = await Promise.all([
    getTranslations("nav"),
    getTranslations("footer"),
  ]);
  const [services, offices, settings] = await Promise.all([
    getServices(),
    getOffices(),
    getSiteSettings(),
  ]);

  const companyLinks = [
    { href: "/who-we-are", label: tNav("whoWeAre") },
    { href: "/industries", label: tNav("industries") },
    { href: "/regional-coverage", label: tNav("regionalCoverage") },
    { href: "/our-standards", label: tNav("ourStandards") },
    { href: "/training", label: tNav("training") },
    { href: "/contact", label: tNav("contact") },
  ];

  const socials = [
    { href: settings.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: settings.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.socials.instagram, label: "Instagram", Icon: InstagramIcon },
  ];

  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-4">
          <div>
            <div className="inline-block rounded bg-white p-2">
              <Image
                src="/logo.png"
                alt={settings.orgName}
                width={130}
                height={52}
                className="h-12 w-auto"
              />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {pick(settings.tagline, locale)}
            </p>
            <div className="mt-6 flex gap-3" aria-label={tFooter("followUs")}>
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-full border border-white/20 p-2 text-white/70 transition-colors hover:border-brand-bright hover:text-brand-bright"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              {tFooter("practiceAreas")}
            </h3>
            <ul className="mt-4 space-y-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/practice-areas/${s.slug}`}
                    className="text-sm text-white/80 hover:text-brand-bright"
                  >
                    {pick(s.t, locale).title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              {tFooter("company")}
            </h3>
            <ul className="mt-4 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 hover:text-brand-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              {tFooter("offices")}
            </h3>
            <ul className="mt-4 space-y-5">
              {offices.map((office) => {
                const o = pick(office.t, locale);
                return (
                  <li key={office.slug} className="text-sm">
                    <p className="font-semibold text-white">{o.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-white/70">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="hover:text-brand-bright">
                        {office.phone}
                      </a>
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-white/70">
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                      <a href={`mailto:${office.email}`} className="hover:text-brand-bright">
                        {office.email}
                      </a>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row sm:items-center">
          <p>
            (c) {new Date().getFullYear()} {settings.orgName}. {tFooter("allRightsReserved")}
          </p>
          <Link href="/data-protection-policy" className="hover:text-brand-bright">
            {tFooter("dataProtection")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
