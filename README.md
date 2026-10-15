# School Management client

Next.js 16 (App Router) frontend for the School Management SaaS. One codebase serves:

- a multi-tenant **dashboard** for admin, teacher, accountant, student and guardian roles,
- a **platform console** for the SaaS owner (`/platform`),
- a public, SEO-friendly **school website** per tenant (`/schools/[slug]`),
- a Bangla/English UI (`bn` default) with optional Bangla digits.

It talks to the Express API in `../server` through a same-origin `/api/v1` proxy.

## Status

| Area | State |
| --- | --- |
| Platform owner (R1), Admin (R2), Teacher (R3), Accountant (R4) | Done |
| Public school site (R5), Student portal (R6), Guardian portal (R7) | Done |
| Hardening (Z): lazy charts, axe checks, README | Done |
| Demo profile helper (Z.6), Vercel deploy (Z.7) | Open (needs a server phase / owner action) |

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
- Demo profile helper (Z.6) needs a server phase.
- `npm audit` reports advisories in the dependency tree; review before production.

## Deploy

`npm run build` is a standard Next.js build. The target (Vercel) needs the environment variables
above and the API reachable at `API_BASE_URL`.
