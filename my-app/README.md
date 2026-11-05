# Portfolio Site and Dashboard

A public portfolio site and the admin dashboard that manages it. Every section is edited in the dashboard and served from the API, and a saved change shows up on open public tabs without a redeploy.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, TanStack Query, Radix UI, Playwright.

**API:** the companion Express backend. Run it first.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

If the API is unreachable, public pages show their last good content, or the demo data in `lib/data/` when there is none. The site never renders blank, and a build works with no backend.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with reload |
| `npm run build` / `npm start` | Production build, then run it |
| `npm run lint` / `npm run typecheck` | Static checks |
| `npm run test:e2e` | Playwright on a production build, desktop and mobile. Run `npm run build` first |

## How the code is organised

```
app/
  (public)/            Public pages
    page.tsx           Landing page, built from the pages below
    hero/Hero.tsx      Landing hero. No page.tsx, so it has no URL of its own
    about/ blog/ contact/ projects/ services/ skills/
  components/
    hero/ about/ ...   Parts of one page, in a folder named after that page
    motion/ brand/ seo/ navbar/ footer/ background/
                       Shared by several pages
    dashboard/         Dashboard layout, permission checks, shared dialogs
  dashboard/
    page.tsx           Overview page
    _overview/         Its sections. The underscore keeps it out of the routes
    pages/<section>/   One route per section, with its own tables and forms
  api/                 Server routes: auth cookies, backend proxy, revalidation
  login/ og-image/ sitemap.ts robots.ts
components/ui/         Base UI primitives (shadcn/ui)
lib/
  api/                 Public reads, server only, cached by tag
  services/            Dashboard calls, used from the browser through the proxy
  types/ data/ seo/ auth/ constants/ hooks/
e2e/                   Playwright tests
proxy.ts               Sends signed-out visitors from /dashboard to /login
```

### Where a new file goes

1. **Used by one public page?** `app/components/<page>/`, imported by that page.
2. **Used by several pages?** A shared folder in `app/components/`.
3. **Used by one dashboard section?** Next to its route, in `app/dashboard/pages/<section>/`.
4. **Used across the dashboard?** `app/components/dashboard/`.
5. **A base control such as a button or input?** `components/ui/`.

### Naming

- Components are `PascalCase.tsx`, hooks are `useThing.ts`, and helpers are lower case.
- Dashboard API files are `lib/services/<resource>.service.ts`.

## How content stays fresh

1. Public pages read through `publicFetch` in `lib/api/core.ts`, cached with a tag such as `"hero"`.
2. A dashboard save reaches the backend, which calls this app's `/api/revalidate` with that tag.
3. The backend then notifies open tabs over SSE, and `LiveRefresh` refreshes them into the new data.

## Permissions

The API enforces every permission. The dashboard reads them with `useCurrentUser()` and `can("hero.edit")` only to hide what a person can't use. Hiding a button is never the protection.

## Deployment

Set the variables from `.env.example`, then `npm ci && npm run build && npm start`.

- Use the same `REVALIDATE_SECRET` as the backend.
- Set `SITE_URL` to the live origin, and check Site URL in the dashboard's SEO settings, which takes priority over it.
- Deploy together with the backend when the API changes.

## Using this as a starting point

Before reusing this project for another portfolio:

1. Copy both repositories and create a new database. Never point a copy at the old one.
2. Create new values for `JWT_SECRET` and `REVALIDATE_SECRET`, and use a new Cloudinary account or folder.
3. Set the first admin in the backend's `.env`, then enter all content in the dashboard.
4. Replace the demo content in `lib/data/` and the images in `public/`.
5. Change the look in `app/globals.css` and `app/components/`. Routes, API and permissions need no change.
