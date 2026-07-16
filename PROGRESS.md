# PRIMA Website 2.0 - Build Progress

Stack: Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + next-intl v4 + Supabase (Postgres, Auth, Storage) + @react-pdf/renderer. Feature-based clean architecture: thin routes in `src/app/`, feature modules in `src/features/`, shared infrastructure in `src/lib/`, shared UI in `src/components/`. See README.md for setup and deployment.

## Slice 1: Scaffold + branded public shell + home page (DONE)

- Scaffolded with create-next-app (TS, Tailwind v4, ESLint, src dir). Deps: next-intl, @supabase/supabase-js, @supabase/ssr, @react-pdf/renderer, zod, lucide-react (pg + tsx as dev deps).
- Brand theme in `src/app/globals.css` from the PRIMA logo: green #018F55, dark green #00492B, bright green #5CB531, navy #1E2A54. Fonts: Public Sans + Source Serif 4 (stat numerals), latin-ext for FR/ES.
- i18n: en/fr/es with `localePrefix: always`, UI chrome in `messages/*.json`, Next 16 `src/proxy.ts` (middleware renamed to proxy in Next 16).
- Motion/UX layer: branded session preloader, per-page loaders with localized notes, liquid-glass header with scroll progress, scroll reveals, animated counters, living aurora/grid backgrounds; `prefers-reduced-motion` respected.
- Home page: hero, stat bar, who-we-are excerpt, credential clusters, certifications strip (incl. Cyber Security License), practice areas grid, industries strip, regional teaser, Kroll-style clients stats grid, standards excerpt, CTA band.

Verified: build clean; /en /fr /es serve localized content; unknown paths return real HTTP 404 (fixed a soft-404 caused by a locale-level loading boundary; per-page loading files are used instead).

## Slice 2: Supabase schema + all public pages from DB (DONE)

- Migration `0001_init.sql`: profiles (+ auth trigger, SECURITY DEFINER `is_admin()`), content_blocks, services, industries, offices, page_seo, site_settings, contact_submissions, RLS on everything, `public-media` bucket with admin-only writes.
- `scripts/db-migrate.mjs` (plain SQL runner over the Supabase Postgres pooler, tracked in `_migrations`) and `scripts/seed.ts` (idempotent upserts from the bundled trilingual content).
- All public pages built: who-we-are (+mission/vision+FAQ), practice-areas index + 6 detail pages (SSG, `dynamicParams=false`), industries (anchored sections + cross-links), regional-coverage, our-standards, training, contact, data-protection-policy.

Verified: 22 blocks + 6 services + 6 industries + 3 offices + 9 SEO rows seeded; anon can read content but inserts are denied by RLS; all routes serve 200 in all 3 locales.

## Slice 3: SEO layer (DONE)

- Per-page `generateMetadata` from the CMS (`page_seo` / service `t`): titles, descriptions, canonical, hreflang alternates (en/fr/es + x-default), OG/Twitter cards.
- JSON-LD: Organization (site-wide), ProfessionalService x3 offices (contact), Service + BreadcrumbList (practice areas), FAQPage (who-we-are).
- Hand-built `sitemap.ts` with per-locale alternates, `robots.ts` (disallow /admin /portal /login /api), per-locale branded OG image via ImageResponse, 301 redirects from all old .html URLs.

Verified via curl: canonical/hreflang/OG tags present per locale; JSON-LD types render; sitemap + robots correct.

## Slice 4: Contact form (DONE)

- `features/contact`: zod schema, server action (honeypot + 3s time gate + anon-key insert so RLS applies), localized client form with per-field errors and success state.

Verified end-to-end: real form POST through the server action landed in `contact_submissions`; anon key cannot read submissions back.

## Slice 5: Auth + roles + admin shell (DONE)

- `lib/supabase`: public/server/admin clients. `src/proxy.ts` refreshes the Supabase session and gates /admin + /portal (redirect to /login), while next-intl handles public routes.
- `features/auth`: `requireRole()` server gate, login/logout/set-password actions, login page; `/auth/confirm` route for invite/recovery links.
- Workspace shell with desktop sidebar and a mobile/tablet bottom button navbar (glass style). Admin dashboard with live counts; `/admin/users` with role management (self-demotion blocked) and email invitations.
- `scripts/create-admin.ts` bootstraps the first admin (`asuleiman2810@gmail.com` created, initial password set, should be changed at `/portal/password`).

Verified: unauthenticated /admin and /portal redirect to /login; admin login lands on /admin; employee login lands on /portal and is bounced from /admin.

## Slice 6: Admin CMS + media + inbox (DONE)

- `features/cms`: generic recursive JSON editor (strings, arrays, nested objects, add/remove list items; shape cannot be broken), per-locale EN/FR/ES tabs, save actions with `revalidatePath` so edits go live immediately.
- Editors for page content blocks, practice areas, industries, offices (incl. phones/emails), page SEO, and site settings.
- Media library on Supabase Storage (upload with type/size validation, delete, copy public URL) and the enquiry inbox (read/archive, reply-by-email).

Verified end-to-end: edited the home hero through the real admin form action, saw it live on /en within seconds, FR content untouched, then reverted. Media bucket upload + public URL confirmed.

## Slices 7 + 8: Ops portal, approvals, PDFs (DONE)

- Migration `0002_ops.sql`: ops_documents (5 types, jsonb payload), ops_events audit trail, per-type-per-year doc numbering (`PRIMA-HC-2026-0001`) via SECURITY DEFINER function + trigger, owner/admin RLS, private `ops-pdfs` bucket.
- `features/ops`: config-driven forms (fields + dynamic line items with live totals) validated by per-type zod schemas; portal list/detail with status timeline; admin queue with status tabs and approve/reject (comment required on reject).
- Approval renders a branded PDF (@react-pdf/renderer, Node runtime): portrait templates with logo header, navy item tables, computed totals, approval box; landscape bordered certificate for honours. Stored privately, downloaded via 60-second signed URLs with owner/admin checks.

Verified end-to-end: all 5 document types submitted through the real forms as an employee; admin approved 4 and rejected 1 with a comment; statuses, doc numbers, and the full event trail correct; PDFs opened and visually checked (invoice totals correct: USD 2,300.00); direct public URL to the bucket fails (400) while signed URLs work; anon key sees zero ops rows. Test data cleaned up afterwards.

## Slice 9: Polish + release readiness (DONE)

- ESLint clean with `--max-warnings=0` (fixed unused imports, set-state-in-effect patterns, impure render call, PDF alt-text false positive).
- Em-dash release gate: zero occurrences in the repo and in all DB content.
- PDF logo sizing fixed (square logo rendered properly in header and certificate).
- README.md with architecture, setup, scripts, and the exact Vercel + Supabase auth deployment steps.
- `.gitattributes` (LF), `.env.example`, test artifacts removed from the database (only the admin profile remains).

## Remaining manual steps (need account access)

1. Push to GitHub and import into Vercel; set env vars (see README) and deploy.
2. Supabase Dashboard > Auth > URL Configuration: set Site URL and add `https://www.primaddc.com/auth/confirm` to redirect URLs (invites/recovery emails).
3. Point primaddc.com DNS at Vercel (keep MX records on the current host).
4. Change the bootstrap admin password at /portal/password, then invite staff from /admin/users.
5. Submit the sitemap in Google Search Console / Bing Webmaster Tools.
