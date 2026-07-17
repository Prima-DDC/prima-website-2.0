# PRIMA Due Diligence Consult - Website 2.0

Full-stack web application for [primaddc.com](https://www.primaddc.com): a trilingual (EN/FR/ES) corporate intelligence and risk advisory website with an admin CMS, a contact pipeline, and a digitized internal operations portal (honour certificates, fund requests, expense forms, leave forms, invoices) with an approval workflow and branded PDF generation.

Tagline: **Trusted Intelligence for Critical Decisions**

## Stack

- **Next.js 16** (App Router, Turbopack, React 19, TypeScript strict)
- **Tailwind CSS v4** with PRIMA brand tokens (logo green `#018F55`, navy `#1E2A54`)
- **next-intl v4** for locale routing (`/en`, `/fr`, `/es`)
- **Supabase**: Postgres (RLS everywhere), Auth (roles: admin / employee / client), Storage (`public-media` public bucket, `ops-pdfs` private bucket)
- **@react-pdf/renderer** for serverless branded PDFs
- **zod** for validation at every boundary

## Architecture

Feature-based clean architecture:

```text
src/
  app/                Routes only (thin composition)
    [locale]/         Public site (SSG + 5 min ISR), one loading.tsx per page
    (internal)/       login, /admin (CMS, inbox, approvals, users), /portal (employee ops)
  features/
    content/          Public content model, Supabase queries + bundled fallbacks
    cms/              Generic per-locale JSON editors + save actions
    contact/          Public form, anti-spam, admin inbox actions
    auth/             SSR auth helpers, login/logout/set-password
    users/            Role management + email invitations
    media/            Supabase Storage media library
    ops/              5 document types, approval workflow, PDF templates
    seo/              Metadata, hreflang, JSON-LD schemas
    site-layout/      Header (liquid glass), footer, preloader, CTA band
    internal/         Workspace shell (sidebar + mobile bottom navbar)
  lib/supabase/       public (anon), server (SSR cookies), admin (service role)
  i18n/               next-intl routing/request config
  proxy.ts            Next 16 proxy: Supabase session refresh + auth gates + intl routing
supabase/migrations/  Plain SQL migrations (applied by scripts/db-migrate.mjs)
scripts/              db-migrate, seed, create-admin
messages/             UI chrome translations (page content lives in the DB)
```

Content model: every localized payload is a `t jsonb` column shaped `{ "en": {...}, "fr": {...}, "es": {...} }`. Public pages are statically generated and revalidate every 5 minutes; every CMS save also triggers an immediate revalidation. If the database is unreachable the site falls back to bundled content (`src/features/content/fallback/`).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase values.
3. Apply migrations and seed content:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Create the first admin:

   ```bash
   npm run create-admin -- you@example.com "YourStrongPassword" Your Name
   ```

5. `npm run dev` and open <http://localhost:3000>

Environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (SEO, sitemap, invite links) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; user management + PDF uploads |
| `SUPABASE_DB_URL` | Direct Postgres URL; only used by `scripts/db-migrate.mjs` |

## Key flows

- **Public site**: home, who-we-are (+FAQ), practice areas (6), industries, regional coverage, our standards, training, contact, data protection policy; all in EN/FR/ES with hreflang, JSON-LD (Organization, ProfessionalService, Service, BreadcrumbList, FAQPage), sitemap.xml, robots.txt, per-locale OG images, and 301 redirects from the old .html URLs.
- **Contact**: public form (honeypot + time gate + zod) inserts into `contact_submissions` under an anon-insert-only RLS policy; admins triage in `/admin/inbox`.
- **CMS** (`/admin`): every content block, practice area, industry, office, SEO record, and site setting is editable per locale; media library backed by Supabase Storage.
- **Ops portal** (`/portal`): employees submit the 5 document types (auto numbered `PRIMA-HC-2026-0001` style); admins approve/reject with comments in `/admin/ops`; approval renders a branded PDF into the private `ops-pdfs` bucket, downloadable via 60-second signed URLs. Full audit trail in `ops_events`.
- **Roles**: proxy gates authentication; layouts enforce roles server-side; RLS enforces them at the database. Admins land on `/admin`, everyone else on `/portal`.
- **Media**: all imagery lives in Supabase Storage (`public-media`), optimized to webp, rendered via next/image with shimmer skeletons, blur-in reveals, ken burns banners, and hover zoom. Every block and practice-area image is editable in the CMS. A service worker makes the public site offline-first (cache-first assets/media, stale-while-revalidate pages) with a PWA manifest.

## Deployment (Vercel)

1. Push this repository to GitHub and import it in Vercel.
2. Set the environment variables above for Production (and Preview). Use the production domain for `NEXT_PUBLIC_SITE_URL` (`https://www.primaddc.com`).
3. In Supabase Dashboard > Authentication > URL Configuration:
   - Site URL: `https://www.primaddc.com`
   - Add redirect URL: `https://www.primaddc.com/auth/confirm` (required for user invitations and password recovery).
4. Deploy, then point the `primaddc.com` DNS at Vercel (keep the existing MX records for mail; only move the A/CNAME records for the web host).
5. After the first deploy, submit `https://www.primaddc.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Standard Next.js |
| `npm run db:migrate` | Apply `supabase/migrations/*.sql` (tracked in `public._migrations`) |
| `npm run db:seed` | Idempotent content seed from `src/features/content/fallback/` |
| `npm run create-admin -- <email> <password> [name]` | Bootstrap or repair an admin account |
| `npm run media:upload` | Optimize (sharp, webp) and upload site imagery to Supabase Storage |

## Content notes

- Public copy avoids private-investigator language and positions PRIMA as a corporate intelligence and risk advisory firm.
- Certifications (Our Standards / Who We Are) include the Cyber Security License.
- Stats shown on the site are seeded from defensible figures; update them in `/admin/content/home` (stat-bar and clients-stats blocks).
