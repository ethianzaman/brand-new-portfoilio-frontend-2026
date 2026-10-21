/**
 * Single source of truth for every backend URL + secret in the app.
 *
 * There are deliberately NO hardcoded `http://localhost:5000` strings left in
 * the codebase. Everything resolves through these accessors.
 *
 * Env vars
 *  - API_URL              (server only) full base incl. `/api`, e.g. http://localhost:5000/api
 *  - NEXT_PUBLIC_API_URL  (browser)     full base incl. `/api`, same value
 *  - REVALIDATE_SECRET    shared secret used by the backend to call /api/revalidate
 */

const LOCAL_API_BASE = "http://localhost:5000/api";

function normalizeBase(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function inferBase(raw: string | undefined): string | null {
  const base = normalizeBase(raw);
  if (!base) return null;
  // Tolerate both ".../api" and a bare origin like "http://localhost:5000".
  return base.endsWith("/api") ? base : `${base}/api`;
}

/**
 * Base URL for server-side fetches. Falls back to the browser-visible var so
 * the app still boots without `API_URL`, then to a local dev default.
 */
export function apiUrl(): string {
  return (
    inferBase(process.env.API_URL) ??
    inferBase(process.env.NEXT_PUBLIC_API_URL) ??
    LOCAL_API_BASE
  );
}

/**
 * Base URL for browser-side fetches. `NEXT_PUBLIC_*` is inlined at build time,
 * so this must stay a static property access.
 */
export function publicApiUrl(): string {
  return inferBase(process.env.NEXT_PUBLIC_API_URL) ?? LOCAL_API_BASE;
}

export function authApiUrl(): string {
  return `${publicApiUrl()}/auth`;
}

/**
 * Base URL for dashboard fetches. In the browser these go through the
 * same-origin `/api/backend` proxy so the httpOnly session cookie stays on
 * this origin and the proxy attaches the backend JWT; on the server they hit
 * the backend directly.
 */
export function dashboardApiUrl(): string {
  return typeof window === "undefined" ? apiUrl() : "/api/backend";
}

export function revalidateSecret(): string {
  return process.env.REVALIDATE_SECRET?.trim() ?? "";
}

/** True while `next build` is prerendering. Used to pick fallbacks. */
export function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Hard cap on any public upstream request so a slow backend never hangs a page. */
export const PUBLIC_FETCH_TIMEOUT_MS = 5000;

/** Default ISR window for public pages; on-demand revalidate overrides it. */
export const PUBLIC_REVALIDATE_SECONDS = 60;
