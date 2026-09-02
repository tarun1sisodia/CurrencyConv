# CurrencyConv

Production-ready currency converter built with Next.js (App Router), TypeScript, Tailwind CSS, ShadCN-style UI, Zustand, TanStack Query, and next-intl.

Convert 160+ currencies with live mid-market rates, 7-day history, favorites, rate alerts, an embeddable widget, and a PWA offline shell.

## Features

- Live converter with searchable currency comboboxes, swap animation, and 4-decimal results
- Server-side FX proxy (API key never shipped to the browser)
- Fallback chain: ExchangeRate-API → Frankfurter (ECB) → last-known cache
- English / Spanish locale routing (`/en`, `/es`) with cookie-persisted language
- PWA (manifest + service worker) and offline banner
- Rate alerts, favorites watchlist, embeddable iframe widget
- SEO pair pages (`/en/usd-to-eur`), sitemap, robots, JSON-LD
- Vitest unit tests, Playwright E2E, axe-core accessibility scans
- GitHub Actions CI (lint → typecheck → test → e2e → build → bundle budget). Workflow source: `ci/github-actions.yml` (copy to `.github/workflows/ci.yml` to enable Actions)

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Middleware redirects `/` to `/en`.

### API key

1. Create a free key at [ExchangeRate-API](https://www.exchangerate-api.com/).
2. Set `EXCHANGERATE_API_KEY` in `.env.local`.
3. If the key is omitted, the open endpoint (`open.er-api.com`) is used, then Frankfurter.

Never put the key in client code. Only `src/app/api/rates/route.ts` reads it.

### Internationalization

- Messages live in `src/messages/en.json` and `src/messages/es.json`.
- Add a locale by extending `src/i18n/routing.ts` and adding a messages file.
- The language switcher writes a `NEXT_LOCALE` cookie so SSR matches on first paint.

### Environment variables

See `.env.example` for:

| Variable                                | Purpose                                           |
| --------------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                  | Canonical origin for sitemap, OG, widget snippets |
| `EXCHANGERATE_API_KEY`                  | Server-only FX provider key                       |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Optional error monitoring                         |
| `CRON_SECRET`                           | Authorizes `GET /api/alerts?cron=1` (Vercel Cron) |

## Scripts

| Command                      | Description                               |
| ---------------------------- | ----------------------------------------- |
| `npm run dev`                | Dev server on `0.0.0.0:3000`              |
| `npm run build`              | Production build                          |
| `npm run lint`               | ESLint (zero warnings)                    |
| `npm run typecheck`          | `tsc --noEmit`                            |
| `npm run test`               | Vitest                                    |
| `npm run test:e2e`           | Playwright                                |
| `npm run check:bundle`       | Fails if first-load JS &gt; 150KB gzipped |
| `ANALYZE=true npm run build` | Bundle analyzer                           |

Pre-commit (Husky + lint-staged) runs ESLint and Prettier on staged files.

SEO pair URLs are `/en/usd-to-eur`. Next.js 16 cannot parse a `[from]-to-[to]` directory (runtime `InvariantError`), so those pages live at `src/app/[locale]/[pair]/page.tsx` while keeping the public slug.

Playwright E2E tests live in `src/e2e/`. Install browsers with `npx playwright install --with-deps chromium` before `npm run test:e2e`.

## Deployment (Vercel)

1. Import the Git repository into Vercel (edge / Node runtimes as detected).
2. Set environment variables from `.env.example`.
3. `vercel.json` registers an hourly cron against `/api/alerts?cron=1`. Set `CRON_SECRET` and send `Authorization: Bearer $CRON_SECRET`.
4. Production deploys on `main`; pull requests get preview URLs via the Vercel Git integration.

Security headers (CSP, `X-Frame-Options: DENY`, `nosniff`) are set in `next.config.ts`. `/api/widget` uses `frame-ancestors *` so embedding works.

## Legal

Rates are **indicative** mid-market references, not trading quotes. Data: ExchangeRate-API and Frankfurter (ECB). See `/privacy` and `/terms`.
