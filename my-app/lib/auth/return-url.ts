// ─────────────────────────────────────────────────────────────────────────
//  RETURN URL — safe internal redirect targets.
//
//  After a successful login the visitor is sent back to the page they
//  originally asked for. That value arrives in the query string, so it is
//  UNTRUSTED input: without validation it is a textbook open redirect
//  (`/login?returnUrl=https://evil.example`).
//
//  `safeReturnUrl()` only ever returns a path that
//    • starts with exactly one "/" (never "//host" or "/\host")
//    • carries no scheme and no control characters
//    • survives URL-decoding (double-encoded payloads are decoded twice)
//    • has its "." / ".." segments resolved, so it cannot escape the
//      allow-list through path traversal
//    • points at an APPROVED internal area (the dashboard)
//
//  Everything else returns null and the caller falls back to the default
//  dashboard route. Safe to import from both server and client code.
// ─────────────────────────────────────────────────────────────────────────

/** Where a successful login lands when no (valid) return URL was given. */
export const DEFAULT_DASHBOARD_PATH = "/dashboard";

/** The login page itself. */
export const LOGIN_PATH = "/login";

/**
 * Internal areas a return URL is allowed to point at. Anything outside this
 * list is rejected, so a crafted query string can never send the user to an
 * unexpected part of the site.
 */
const ALLOWED_RETURN_PREFIXES = ["/dashboard"] as const;

/** Control characters (tab/CR/LF/…) can be used to smuggle a second header. */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

/** Any `scheme:` prefix — javascript:, data:, https:, … */
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Decode repeatedly so a double-encoded payload (`%252F%252Fevil.com`)
 * cannot slip past the checks.
 */
function decodeDeep(value: string): string | null {
  let current = value;

  for (let i = 0; i < 3; i += 1) {
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return null; // malformed percent-encoding
    }
    if (next === current) break;
    current = next;
  }

  return current;
}

/** A single leading slash, no scheme, no control characters. */
function isSafeInternalPath(value: string): boolean {
  if (!value.startsWith("/")) return false;
  // "//evil.com" and "/\evil.com" are protocol-relative URLs.
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  if (CONTROL_CHARS.test(value)) return false;
  if (SCHEME.test(value)) return false;
  return true;
}

/** Resolve "." and ".." segments so the path cannot climb out of its area. */
function normalizePathname(pathname: string): string {
  const out: string[] = [];

  for (const segment of pathname.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      out.pop();
      continue;
    }
    out.push(segment);
  }

  return out.length ? `/${out.join("/")}` : "/";
}

/**
 * Validate an untrusted return URL.
 *
 * @returns the safe internal path, or `null` when the value is missing or
 *          not an approved internal path.
 */
export function safeReturnUrl(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  const decoded = decodeDeep(trimmed);
  if (decoded === null) return null;

  // The browser navigates to the RAW value, so it must be safe on its own.
  // The decoded value must be safe too, otherwise a double-decode would
  // turn a harmless-looking path into an external one.
  if (!isSafeInternalPath(trimmed) || !isSafeInternalPath(decoded)) return null;

  // Split off the query string — the fragment is dropped, it never reaches
  // the server anyway.
  const breakAt = decoded.search(/[?#]/);
  const pathname = breakAt === -1 ? decoded : decoded.slice(0, breakAt);
  const suffix = breakAt === -1 ? "" : decoded.slice(breakAt).split("#")[0];

  const normalized = normalizePathname(pathname);

  const allowed = ALLOWED_RETURN_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
  if (!allowed) return null;

  return `${normalized}${suffix}`;
}

/**
 * Build the login URL, preserving the intended destination when it is safe.
 *
 *   buildLoginUrl("/dashboard/pages/projects")
 *     → "/login?returnUrl=%2Fdashboard%2Fpages%2Fprojects"
 */
export function buildLoginUrl(returnTo?: string | null): string {
  const safe = safeReturnUrl(returnTo);

  return safe
    ? `${LOGIN_PATH}?returnUrl=${encodeURIComponent(safe)}`
    : LOGIN_PATH;
}
