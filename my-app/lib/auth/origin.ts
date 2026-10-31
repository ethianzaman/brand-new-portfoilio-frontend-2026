import type { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────
//  SAME-ORIGIN CHECK (CSRF defence in depth)
//
//  The session cookie is httpOnly + SameSite=Lax, which already blocks the
//  classic cross-site form POST. But SameSite=Lax still allows a top-level
//  GET navigation to carry the cookie, and cookie-scoped state-changing
//  routes should not rely on a single browser behaviour.
//
//  Every state-changing request is therefore checked to make sure it came
//  from this origin:
//
//    1. `Origin` (sent by the browser on every non-GET request) must match
//       the `Host` header the request arrived on.
//    2. When `Origin` is absent (non-browser clients, server-to-server calls)
//       the Fetch Metadata header `Sec-Fetch-Site` is used as a fallback.
//
//  Safe methods are exempt: they must not change state.
// ─────────────────────────────────────────────────────────────────────────

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isSameOriginRequest(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin) {
    // "null" (sandboxed iframe, some privacy modes) is never a match.
    if (origin === "null" || !host) return false;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  // No Origin header — fall back to Fetch Metadata when the browser sent it.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;

  return true;
}
