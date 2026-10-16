# School Management client

Next.js 16 (App Router) frontend for the School Management SaaS. One codebase serves:

- a multi-tenant **dashboard** for admin, teacher, accountant, student and guardian roles,
- a **platform console** for the SaaS owner (`/platform`),
- a public, SEO-friendly **school website** per tenant (`/schools/[slug]`),
- a Bangla/English UI (`bn` default) with optional Bangla digits.

It talks to the Express API in `../server` through a same-origin `/api/v1` proxy.

## What is this?

A multi-tenant **School Management SaaS** for Bangladeshi schools, madrasas and coaching centres.
An institution signs up in minutes, gets its own address (`/schools/<name>`), and runs everything
from one place: admission, attendance, fees, exams and results, notices, and a public website.
Parents and students follow along from their phones.

**Built for the field:** phone first (mid-range Android on slow 4G), Bangla by default with an
English switch and optional Bangla digits, money kept as whole poisha (no rounding errors), and
every sensitive action behind a role check and written to an audit log.

## Who uses it

| Role | What they get |
| --- | --- |
| **Platform owner** | A console to run the SaaS: tenants, plans, subscriptions. |
| **Admin** (principal / office) | Full control of one institution. |
| **Teacher** | Their own classes: attendance, marks, notices. Read-only elsewhere. |
| **Accountant** | The cash desk: collect fees, dues, payments, fee setup. |
| **Student / Guardian** | A phone portal: attendance, fees and receipts, results, notices. A guardian switches between children. |
| **Public visitor** | The school website, admission inquiry form, and result lookup. No sign-in. |

## Features

### Getting started
- **Self-service signup** in three steps with a live, normalised site address check (alternatives offered when taken) and automatic sign-in.
- **Find my school / school login**, forced password change on first login, forgot and reset password, lockout and rate-limit messages with the retry time.
- **Onboarding checklist** on the admin home that follows real progress (session, classes, subjects, students, staff, first notice).
- **Public demo school** card on the home page and on "Find your school".

### Academic setup (admin)
- **Sessions** with a current-session switch, **classes and sections** (reorder, edit, delete guards), and a **quick-create wizard** (Class 1 to 10 with sections).
- **Subjects** with mark components (written, practical, ...) and a live total, and a **class-subject matrix** with kind (compulsory / optional / fourth), full and pass marks, and the teacher.
- Class, section, roll and student labels are **renamable per institution** (terminology), for example batch and group for coaching centres.

### Staff
- Staff list and filters, create staff with a **temporary password shown once**, change role, deactivate (with a last-admin guard), reset password.

### Students
- Searchable, filterable list (class, section, status) with a **phone card layout**; create and edit with a **plan student-cap warning**, photo upload and guardian match.
- Student profile tabs: profile, enrolment history, attendance, fees ledger, results.
- **CSV import wizard** (template, dry-run report with row errors, commit), **CSV export**, and **year-end promotion** with repeaters and a plan preview.
- Status changes with confirmation, create **student and guardian logins**, safe delete with a typed ID.

### Attendance
- **Take attendance** in a few taps: roster, one-tap status cycle, live counters, sticky submit, blocked weekends, a local **draft kept if the network drops**, and retry.
- An **edit window** that closes after a configurable time (admin can always edit), with a clear explanation when closed.
- **Reports:** day-by-day section matrix with percentages, and a per-student summary.

### Notices
- Rich-text notices (sanitised), **audience targeting** (everyone, staff, students and guardians, a class, a section), schedule and expiry, a **public toggle** for the website, and **PDF attachments**.
- Teachers can post only to their own classes.

### Fees and accounts
- **Fee heads** and **fee structures** per class and session (monthly / term / yearly / one-time, due day, live monthly total).
- **Waivers and scholarships** (percent or fixed, per head or all, with a reason and validity). They are ended, not deleted, so history stays explainable.
- **Generate invoices** by class or section and period, with a **dry-run preview** and an idempotent confirm (no duplicates on retry).
- **Invoices** list and detail with a ledger, and **void** with a reason.
- **Collect fee:** search by name, ID, roll or guardian phone; tick outstanding invoices (oldest first); partial payments; cash, bank, cheque, bKash, Nagad or Rocket (reference required for digital methods); safe against double clicks.
- **PDF receipts** with print and download, and a **payments list** with **reversal** (reason required, admin only; reversed payments stay visible).
- **Dues** with filters and CSV, and **collection reports** by day, method, class or fee head with a chart and CSV.
- The accountant home shows **today's collection and the total due**.

### Exams and results
- **Grading scales:** bands editor, pass percent, rules (fail on any compulsory subject, fourth-subject bonus, grace marks, merit tie-break) and presets (Bangladesh GPA 5.00, percentage, division).
- **Exams** across classes with a status flow: draft, marks open, marks closed, published.
- **Marks entry grid:** keyboard friendly (Tab and Enter), values above full marks flagged, absent flag, **autosave per row**, submit (locks the sheet) and admin unlock. Teachers see only their own subjects.
- **Progress** by subject; **results** (calculate, pass rate, positions, filters); **publish** behind a checklist and a typed confirmation, after which the exam is locked.
- **Correct a published result** with a mandatory reason and a version badge; **marksheet PDF** preview and **merit list CSV**.

### Public school website
- A per-school site with **theme colour** (with a contrast checker) and template, hero, about, mission, head's message, contact, social links, SEO title and description, and **section on/off switches**.
- A **publish toggle** with a readiness checklist and preview; unpublished sites return 404.
- Pages: home, notices, teachers, gallery, admission with an **inquiry form** (honeypot and rate limit), and **result lookup** (roll + date of birth, roll only, or student ID + date of birth; generic failure message; marksheet download).
- Admin tools: **staff profiles**, a **gallery** with reorder and captions, and an **inquiries inbox** with a new-count badge.
- Per-school SEO: titles, Open Graph, canonical URL, JSON-LD, and `robots.txt`.

### Settings, plan and audit
- School profile and **logo**, preferences (weekend days, attendance edit window, default fee cycle, public result lookup mode), read-only terminology, and **plan and usage** with a suspended-account banner.
- **Audit log:** a filterable table of sensitive changes with an expandable before and after.

### Platform console (owner)
- Overview (tenants by status, weekly signups chart, trials ending soon), tenant list with search and filters, tenant detail (usage, suspend, reactivate, cancel with a reason, change plan, student cap, extend trial, change address, record a subscription payment), and plan management.

### Student and guardian portal
- Home with notices, a **month attendance calendar** with percentage, **fees** (dues and receipts with PDF), **published results** with marksheet download, and a **child switcher kept in the URL** for guardians.

### Quality and platform
- Role-based UI plus server-side enforcement; the sidebar collapses to icons, and phones get a bottom bar and drawer.
- Consistent loading, empty and error states, and an **offline / server-down screen** instead of a false sign-out.
- Accessibility: keyboard paths for attendance and marks, labelled controls, axe checks.
- 42 unit tests, plus Playwright specs per role on mobile and desktop.

## Typical workflow

1. **Sign up** and finish the onboarding checklist: session, classes, subjects, class-subject mapping.
2. **Add staff and students** (one by one or by CSV). Create logins for teachers, students and guardians.
3. **Every day:** teachers take attendance; the accountant collects fees and hands out receipts.
4. **Every month:** generate invoices, send notices, review dues and collection reports.
5. **Exam time:** create the exam, open marks entry, teachers enter marks, the admin checks progress, calculates and publishes. Parents see results in the portal and on the public site.
6. **Year end:** promote students and start the next session.

## Status

| Area | State |
| --- | --- |
| Platform owner (R1), Admin (R2), Teacher (R3), Accountant (R4) | Done |
| Public school site (R5), Student portal (R6), Guardian portal (R7) | Done |
| Hardening (Z): lazy charts, axe checks, README, demo profiles | Done |
| Vercel deploy (Z.7) | Open (owner action) |

Admin flow is tested end to end by hand against the demo school below. Typecheck, lint, Vitest (42
tests) and the production build are all green.

## Stack

- Next.js 16 App Router, React, TypeScript (strict)
- Redux Toolkit + RTK Query (`redux/api/*Api.ts`, one slice per domain)
- Tailwind 4 with hand-written shadcn-style primitives in `components/ui`
- `react-hook-form` + `zod` for every form; money is integer poisha end to end
- Vitest + Testing Library + MSW for unit tests, Playwright (mobile + desktop projects) for e2e

## Prerequisites

- Node 20+ and npm
- The API in `../server` running (default `http://localhost:5000`) with MongoDB reachable
- Cloudinary account for image uploads (see below)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `test` (Vitest), `e2e` (Playwright).

## Demo accounts (local and dev only)

School address: **`demo-school`** (login at `/find-school`, or `/schools/demo-school/login`).

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.school` | `Demo@1234` |
| Teacher | `kamal@demo.school` | `Demo@123` |
| Teacher | `rekha@demo.school` | `Demo@123` |
| Accountant | `salim@demo.school` | `Demo@123` |

These exist only in the seeded development database. Never create them in production, and change
or delete them before any public deployment.

## Environment variables

See `.env.example`.

| Variable | Used for |
| --- | --- |
| `API_BASE_URL` | Server side only. Where Next rewrites `/api/v1/*` to, and where public Server Components fetch for SEO (`lib/publicSite.ts`). |
| `NEXT_PUBLIC_BACKEND_API_URL` | Browser base path for RTK Query and public forms. Normally `/api/v1` (same origin through the rewrite, so the httpOnly refresh cookie stays first party). |
| `NEXT_PUBLIC_FEATURES` | Comma separated flags: `portal`, `promotion`, `audit`, `pdf`, `customDomain`, `sms`. |
| `NEXT_PUBLIC_PLATFORM_NAME`, `NEXT_PUBLIC_PLATFORM_DOMAIN` | Marketing hub branding. |

### Image uploads (Cloudinary)

The browser uploads straight to Cloudinary. The API only signs the request, so the API secret never
reaches the client. Put these in **`server/.env`** (git ignored), not here:

```
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

The API key needs a role that can upload (for example Administrator). A key with only the
"Media Library User" role is rejected by Cloudinary with `403 Forbidden`. Restart the API after
changing these values.

## How it works

**Auth.** The access token lives in memory only (`lib/tokenStore.ts`). A silent refresh from the
httpOnly cookie restores the session on page load (`AuthBootstrap`, single flight, shared with the
"try again" button when the API is down). A 401 on any call except login/refresh/logout refreshes
once and retries. `AuthGuard` gates route groups; `RoleGate` and `lib/permissions.ts` hide UI the
role cannot use. The server is the real authority; a 403 renders as a forbidden state.

**Data.** Every API call is an RTK Query endpoint injected into `baseApi`. Paginated lists use
`withMeta`. Filters live in the URL (`useUrlState`), so list pages must render inside `<Suspense>`.

**i18n.** English keys in `lib/i18n/en/<ns>.ts`; the Bangla file is typed
`Record<keyof typeof en, string>`, so a missing translation fails the build.

**Public site.** `app/schools/[slug]/(site)/*` are Server Components that fetch the API directly
for SEO. The login, forgot and reset pages sit outside that group so they work before a school
publishes its site. An unpublished or unreachable school renders a clean 404.

## Project layout

```
app/                 routes (dashboard, platform, schools/[slug], marketing)
components/          one folder per domain, plus common/ (DataTable, FormField, MoneyInput, ...) and ui/
redux/api/           RTK Query slices; redux/tag-types.ts for cache tags
lib/                 i18n, permissions, formatting, download helpers, token store
utils/schemas/       zod form schemas
types/               shared TypeScript types
tests/, e2e/         Vitest and Playwright
```

## Testing

```bash
npm run typecheck && npm run lint
npm test            # Vitest
npm run e2e         # Playwright, starts the dev server itself
```

Playwright specs mock the API with `page.route()` (`e2e/helpers/auth.ts`). The public school pages
fetch server side, so beyond the 404 path they need a real API (`e2e/public-site.spec.ts`).
`e2e/accessibility.spec.ts` runs axe on sign-in and take-attendance.

## Known gaps

- No per-school `sitemap.xml` (only `robots.txt`).
- The marks grid is not virtualized (fine for typical class sizes).
- `npm audit` reports advisories in the dependency tree; review before production.

## Deploy

`npm run build` is a standard Next.js build. The target (Vercel) needs the environment variables
above and the API reachable at `API_BASE_URL`.
