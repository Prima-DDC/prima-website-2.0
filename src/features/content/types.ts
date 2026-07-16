import type { Locale } from "@/i18n/routing";

/** Trilingual content payload, stored as the `t` jsonb column in Supabase. */
export type Localized<T> = Record<Locale, T>;

export function pick<T>(t: Localized<T>, locale: Locale): T {
  return t[locale] ?? t.en;
}

export interface StatItem {
  value: string;
  label: string;
}

/** Kroll-style client stat: big numeral + connector + emphasized description. */
export interface ClientStat {
  value: string;
  connector: string;
  description: string;
}

export interface CredentialCluster {
  title: string;
  credentials: string;
  powers: string;
}

export interface Certification {
  title: string;
  description: string;
}

export interface LinkedItem {
  title: string;
  body: string;
}

export interface HeroBlock {
  kicker: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface TextBlock {
  kicker?: string;
  title: string;
  paragraphs: string[];
}

export interface StatBarBlock {
  items: StatItem[];
}

export interface CredentialsBlock {
  kicker: string;
  title: string;
  framing: string;
  clusters: CredentialCluster[];
}

export interface CertificationsBlock {
  kicker: string;
  title: string;
  intro: string;
  items: Certification[];
}

export interface ClientsStatsBlock {
  kicker: string;
  title: string;
  intro: string;
  items: ClientStat[];
}

export interface ItemListBlock {
  kicker?: string;
  title: string;
  intro?: string;
  items: LinkedItem[];
}

export interface CtaBlock {
  title: string;
  body: string;
}

export interface FaqBlock {
  title: string;
  items: Array<{ question: string; answer: string }>;
}

export interface ServiceGroup {
  heading: string;
  summary?: string;
  items: string[];
}

export interface ServiceContent {
  title: string;
  shortTitle: string;
  tagline: string;
  opening: string[];
  groups: ServiceGroup[];
  seoTitle: string;
  seoDescription: string;
}

export interface Service {
  slug: string;
  sort: number;
  icon: string;
  imagePath: string | null;
  t: Localized<ServiceContent>;
}

export interface IndustryContent {
  title: string;
  description: string;
}

export interface Industry {
  slug: string;
  sort: number;
  icon: string;
  relatedServiceSlugs: string[];
  t: Localized<IndustryContent>;
}

export interface OfficeContent {
  name: string;
  addressLines: string[];
}

export interface Office {
  slug: string;
  sort: number;
  phone: string;
  whatsapp: string | null;
  email: string;
  mapUrl: string | null;
  t: Localized<OfficeContent>;
}

export interface PageSeoContent {
  title: string;
  description: string;
}

export interface PageSeo {
  page: string;
  ogImagePath: string | null;
  t: Localized<PageSeoContent>;
}

export interface SiteSettings {
  orgName: string;
  legalName: string;
  tagline: Localized<string>;
  siteUrl: string;
  socials: { linkedin: string; facebook: string; instagram: string };
  certifications: Localized<Certification[]>;
}

export interface ContentBlockRow {
  page: string;
  section: string;
  sort: number;
  t: Localized<unknown>;
}
