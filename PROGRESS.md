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

## Phase 2 (2026-07-17): User CRUD, media enrichment, offline-first (DONE)

### Slice A: User management CRUD

- Admin can now, per user row in /admin/users: change role (existing), send a password reset email (branded recovery template via custom SMTP), and delete the user (confirm dialog warns that their documents go too; self-deletion blocked server-side, matching the existing self-demotion guard).
- Verified end-to-end through the real UI form actions: reset accepted with success message; deleted user removed from the list and from Supabase Auth.

### Slice B: Media pipeline to Supabase Storage

- Migration `0003_media.sql`: `content_blocks.image_path`.
- `scripts/upload-media.ts` (`npm run media:upload`): optimizes with sharp (resize, webp q80) and uploads 15 curated assets to `public-media/site/`:
  - 5 authentic old-site photos (office sign, reception, PRIMA training session, seminar audience, GDCA cyber policy handover); the old binoculars/magnifying-glass shots were excluded per the brand direction.
  - 10 curated Unsplash images (corporate towers, analysts, formal boardroom, Johannesburg skyline, document review, data intelligence, forensic lab, insurance claims, handshake), each candidate-chained, size-validated, and visually reviewed via contact sheets before acceptance.
- `src/lib/media.ts` (path or URL passthrough) + `MediaImage` component.

### Slices C + D: Media-rich site, loading effects, offline-first

- `getBlock` now returns `{ t, imagePath }`; every page passes images through. Seeded assignments: home hero (corporate towers, ken burns + navy gradient), home who-we-are (office sign with floating stat badge), regional teaser (African skyline), page banners for who-we-are/practice-areas/industries/regional/standards/training/contact, per-service images on cards and detail heros, standards side image (cyber policy handover), regional side image (seminar audience).
- `MediaImage`: shimmer skeleton while loading, blur + scale + fade reveal on load, optional slow ken burns for banners and hover zoom on cards; reduced motion respected. All images served from Supabase Storage through next/image optimization (verified 200 via /_next/image).
- CMS: every block editor and the service editor expose the image field (media library path or URL); save revalidates instantly. Verified end-to-end by swapping the home hero image through the real admin form and reverting.
- Offline-first: `public/sw.js` (cache-first for /_next/static, /_next/image, Supabase media, fonts; stale-while-revalidate for public pages; /admin, /portal, /login, /auth, /api never cached), registered in both layouts (production only), plus a PWA manifest (`/manifest.webmanifest`) with brand colors.

Verified: build + ESLint clean, em-dash gate 0 in repo and DB, all pages render Supabase-hosted media in all locales, optimized image endpoint 200, sw.js + manifest served, user CRUD and CMS image editing tested through real form actions.

## Phase 3 (2026-07-17): Animated confirmation dialogs (DONE)

- `src/components/ConfirmDialog.tsx`: promise-based `ConfirmProvider` + `useConfirm()` with an animated glass panel (blurred navy backdrop, spring entrance, tone-colored accent bar, pulsing icon ring, hover-lift buttons), danger and brand tones, ESC/backdrop dismissal, focus on the confirm button; exit animation on close.
- `ConfirmButton`: drop-in submit button for server-action forms; on confirm it re-submits the form with itself as submitter so name/value pairs (e.g. decision=approved) are preserved. Without JavaScript the form still submits natively.
- Wired everywhere a decision deserves a pause: delete user, send password reset, change role, delete media file, archive enquiry, and ops approve (PDF generation is final) / reject (comment surfaced to submitter). Provider mounted in the internal layout.

Verified: build + ESLint clean; user reset/delete e2e re-run green against the new markup; all admin pages 200.

## Phase 4 (2026-07-17): Auth link flow fix, profile page, TOTP MFA (DONE)

- Email links fixed end-to-end: all templates now link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=...` so verification happens server-side and the session lands in cookies (no more tokens stranded in the URL hash). The confirm route honors a sanitized `next` path and sends invite/recovery users to `/portal/profile`. A client-side `AuthHashHandler` also adopts legacy hash-token links as a safety net, and expired/invalid links land on `/login` with a friendly message.
- `/portal/profile` (linked from both portal and admin navs): edit full name (synced to auth metadata + profiles), change email (confirmation sent to the new inbox via the email-change template), change password, and manage TOTP two-factor authentication (QR + manual key enrollment, code verification, animated-dialog-confirmed disable).
- MFA enforced, not decorative: login detours to `/login/mfa` when a verified authenticator exists, `requireRole` blocks AAL1 sessions from the entire workspace, and the challenge page verifies codes server-side.

Verified end-to-end with a scripted authenticator (RFC 6238 TOTP in the test): invite token_hash link -> session -> profile 200; password set + profile update through the real forms (DB checked); factor enrolled and verified with computed codes; login redirected to the MFA page; /portal blocked at AAL1; code verify -> AAL2 -> portal 200; bogus link -> friendly expired message. Build + ESLint clean.

## Phase 5 (2026-07-17): Approval chain, admin CRUD, staff profiles, support, notifications (DONE)

### Sequential approval workflow (HR -> Manager -> CEO)

- New roles hr, manager, and ceo (invitable and assignable). Every document now requires all three sign-offs in order; any rejection is final and carries a mandatory comment. `ops_approvals` stores the formal trail (unique per stage), `ops_events` the chronology.
- Approvers get a dedicated Approvals area in the portal (queue with "Your turn" badges + detail with a three-step animated trail); admins see the same trail, stage progress in the queue, and can cover any stage. Stage gating is enforced server-side (verified by replaying another stage's form).
- The final CEO sign-off generates the official PDF listing all three signatories with dates (visually verified).

### Admin document CRUD

- Create (via portal forms), Read (queue/detail), Update (edit page reusing the config-driven form, only while in review, logged as "edited" in history, submitter notified), Delete (confirm dialog, removes PDF from storage, submitter notified).

### Staff profiles

- Identity information (admin-only): first/last name, job title, division, start of employment, contract/temporary flag, business line, plus workspace role; edited in a full staff record editor at /admin/users/[id] (self role-change blocked).
- Contact information (self-service): professional photo (JPG/PNG/WEBP max 8 MB, normalized to 512px webp in the private avatars pipeline), direct line, WhatsApp, alternative email, and the sign-in email (verified change). Locked identity fields are shown read-only with a pointer to support.
- Avatars render in the workspace shell, users list, user editor, and ticket threads.

### Support ticketing

- Tickets (PRIMA-TK-YYYY-NNNN) with categories (profile change, IT support, access request, other), threaded replies with avatars, and admin status management (open, in progress on first admin reply, resolved, closed). RLS: owners and admins only (verified).

### Notifications (in-app + email)

- `notifications` table + animated bell with unread badge in the workspace shell (60s polling, mark-read, deep links). Branded HTML emails sent best-effort via SMTP (env-configured; a mail outage never breaks an action).
- Wired everywhere: submission (HR + admins), each stage sign-off (submitter + next stage), final approval/rejection (submitter), admin edit/delete (submitter), role and staff record changes (user), ticket lifecycle (both sides), and public contact enquiries (admins).

Verified: 24-check e2e suite passed against the production build (full chain incl. PDF signatories, gating, rejection, CRUD, staff record, photo upload served from storage, ticket lifecycle, notification delivery, RLS). Build + ESLint clean; em-dash gate 0; test data cleaned up afterwards.

## Phase 6 (2026-07-17): Dynamic roles, configurable approval chain, Supabase SMTP sender (DONE)

- Notification emails now send through the same SMTP account configured in Supabase (noreply@primaddc.com); set SMTP_PASS in the environment to the password used in the Supabase dashboard. In-app notifications are unaffected either way.
- Roles are database-driven (`roles` table, FK from profiles): admins create, rename, and delete roles at /admin/roles (built-in admin/employee/client protected; deletion blocked while members hold the role). Every role dropdown (invite, quick change, staff editor) is fed from the table, with server-side validation.
- The sequential approval chain is admin-configurable on the same page: choose which roles must sign off and in what order (add, remove with a minimum of one stage, move up/down). The whole flow (queues, trails, gating, notifications, PDF signatories, is_approver RLS) follows the configured chain; historical sign-offs remain visible even after a stage is removed.

Verified end-to-end: created a Finance role via the UI, inserted it after HR (hr, finance, manager, ceo), walked a document through all four stages through the real forms (PDF issued with four signatories), confirmed delete-guard and rename, then restored the canonical chain. Build + ESLint clean.

## Phase 6b (2026-07-17): Notification emails via Supabase Edge Function (DONE)

- New `supabase/functions/send-email` Edge Function performs the SMTP send from Supabase infrastructure (denomailer), gated by the service role key; `notify()` now delivers by HTTPS call to it, keeping all SMTP off Vercel. Direct SMTP remains only as a local-dev fallback, and a mail failure never breaks an action.
- Verified: build/lint clean; a real contact submission logged the expected function 404 (not yet deployed), still returned success, and created the in-app notification. Deploy + secrets commands documented in README (needs the account owner's Supabase access token).

## Phase 6c (2026-07-17): Notification bell UX fix (DONE)

- Desktop: the bell moved from the bottom of the sidebar (where its dropdown opened off-screen) to an always-visible floating glass pill at the top right; the panel opens downward and fully on-screen.
- Mobile/tablet: the panel is now a fixed sheet under the top bar (no more clipping on narrow viewports), with viewport-aware height, larger touch target, ESC to close, and aria-expanded state.

## Phase 7 (2026-07-17): Configurable request submission permissions (DONE)

- `roles.can_submit` controls which roles may create requests/documents: every role except admin by default, and newly created roles are allowed automatically. Admins toggle it per role on /admin/roles (Allow/Revoke submission with status badge).
- Enforced at three levels: UI (New Request nav, buttons, and /portal/new pages hide or redirect), server action (clear error), and database RLS (inserts from revoked roles are refused outright).

Verified by a 10-check e2e suite through the real UI: defaults correct (admin excluded), employee submitted, admin revoked via the dashboard toggle, UI gates engaged, direct database insert blocked by RLS, re-allow restored submission, and a newly created role defaulted to allowed. Build + ESLint clean.

## Remaining manual steps (need account access)

1. Push to GitHub and import into Vercel; set env vars (see README) and deploy.
2. Supabase Dashboard > Auth > URL Configuration: set Site URL and add `https://www.primaddc.com/auth/confirm` to redirect URLs (invites/recovery emails).
3. Point primaddc.com DNS at Vercel (keep MX records on the current host).
4. Change the bootstrap admin password at /portal/password, then invite staff from /admin/users.
5. Submit the sitemap in Google Search Console / Bing Webmaster Tools.
