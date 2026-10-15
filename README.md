# School Management client

Next.js 16 (App Router) frontend for the School Management SaaS: a multi-tenant admin dashboard, a
public school website per tenant (`/schools/[slug]`), and student/guardian portals. Talks to the
Express API in `../server`.

## Stack

- Next.js 16 App Router, React, TypeScript (strict)
- Redux Toolkit + RTK Query (`redux/api/*Api.ts`, one file per domain)
- Tailwind 4, shadcn-style primitives in `components/ui`
- `react-hook-form` + `zod` for every form
- Vitest + Testing Library + MSW for unit tests, Playwright for end-to-end (mobile + desktop projects)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in API_BASE_URL etc.
npm run dev                  # http://localhost:3000, proxies /api/v1 to the server
```

The server in `../server` must be running (see its own README) for anything beyond the marketing
pages to work, since `/api/v1/*` is rewritten to `API_BASE_URL` (see `next.config.ts`).

## Environment variables

See `.env.example`. In short:

| Variable | Used for |
| --- | --- |
| `API_BASE_URL` | Server-side only: where Next rewrites `/api/v1/*` to, and where public Server Components fetch directly for SEO (`lib/publicSite.ts`). |
| `NEXT_PUBLIC_BACKEND_API_URL` | Browser-side base path for RTK Query and the public forms (same origin through the rewrite, so normally just `/api/v1`). |
| `NEXT_PUBLIC_FEATURES` | Comma-separated feature flags (`portal`, `promotion`, `audit`, `pdf`, `customDomain`, `sms`). |
| `NEXT_PUBLIC_PLATFORM_NAME` / `NEXT_PUBLIC_PLATFORM_DOMAIN` | Branding for the marketing hub. |

## Project layout

- `app/` — routes. `app/dashboard/*` is the authenticated shell (role-gated by `AuthGuard` +
  `RoleGate`), `app/platform/*` is the platform owner's console, `app/schools/[slug]/(site)/*` is
  the public, unauthenticated school website (Server Components, fetched directly against the API
  for SEO — see `lib/publicSite.ts`), `app/schools/[slug]/{login,forgot-password,reset-password}`
  sit outside that group so they work even before a site is published.
- `components/` — one folder per domain (`fees`, `exams`, `website`, `students`, `attendance`,
  `portal`, …), plus `common/` for shared primitives (`DataTable`, `FormField`, `MoneyInput`,
  `EmptyState`, `ErrorState`, …) and `ui/` for the styled HTML primitives.
- `redux/api/*Api.ts` — one RTK Query slice per domain, injected into `baseApi`. Tag names live in
  `redux/tag-types.ts`.
- `lib/i18n/` — the dictionary. Every string has an English key in `lib/i18n/en/<ns>.ts`; the
  matching `lib/i18n/bn/<ns>.ts` is typed as `Record<keyof typeof en, string>`, so a missing Bangla
  string is a compile error. `lib/permissions.ts` + `components/auth/RoleGate.tsx` hide UI the
  signed-in role cannot use (the server is the real authority; this is a convenience only).
- `utils/schemas/` — zod schemas for forms, one file per domain.

## Testing

```bash
npm run typecheck
npm run lint
npm test              # vitest, tests/*.test.tsx
npm run e2e           # playwright, e2e/*.spec.ts — runs the Next dev server itself
```

Playwright specs mock the API with `page.route()` (see `e2e/helpers/auth.ts`), except the public
school pages under `app/schools/[slug]/(site)`, which fetch server-side and so need a real API
running to exercise beyond the 404/unreachable path (`e2e/public-site.spec.ts` documents this).

## Build and deploy

`npm run build` produces a standard Next.js build. Deployment (Vercel) is handled separately; the
only things it needs are the environment variables above and the API reachable at `API_BASE_URL`.
