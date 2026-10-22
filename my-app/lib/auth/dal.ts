import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildLoginUrl } from "@/lib/auth/return-url";
import { PATHNAME_HEADER } from "@/lib/constants/auth";
import { readSessionToken } from "@/lib/session";
import { verifyCurrentUser } from "@/lib/services/current-user.service";
import type { CurrentUser } from "@/lib/types/user";

// ─────────────────────────────────────────────────────────────────────────
//  SESSION DATA ACCESS LAYER (server only)
//
//  Single place that decides whether the current request may see protected
//  content.
//
//  The session cookie is NEVER proof of authentication on its own — it is an
//  httpOnly bearer token, and its mere presence says nothing about whether
//  it is still valid. Every check therefore ends in a round trip to the
//  backend, which verifies the JWT signature and re-reads the account
//  (role + active flag) from the database. A role change or a disabled
//  account therefore takes effect immediately instead of waiting for the
//  token to expire.
//
//  proxy.ts only performs an OPTIMISTIC check (does a session cookie exist?)
//  so anonymous visitors are bounced before a page is rendered. The
//  authoritative decision happens here, in the dashboard layout, right next
//  to the data it protects.
// ─────────────────────────────────────────────────────────────────────────

/**
 * The path the visitor originally asked for. `proxy.ts` injects it; when it
 * is missing we simply fall back to the default dashboard route.
 */
export async function readRequestedPath(): Promise<string> {
  const store = await headers();
  return store.get(PATHNAME_HEADER) ?? "";
}

/**
 * Guard for the dashboard route group.
 *
 * - no session            → redirect to /login (destination preserved)
 * - expired / revoked     → redirect to /login (destination preserved)
 * - disabled / no role    → error, the user is NOT treated as logged out
 * - backend unreachable    → error, never a silent grant
 *
 * @returns the authenticated account.
 */
export async function requireSession(): Promise<CurrentUser> {
  const returnTo = await readRequestedPath();

  const token = await readSessionToken();
  if (!token) redirect(buildLoginUrl(returnTo));

  const result = await verifyCurrentUser();

  if (result.status === "authenticated" && result.user) {
    return result.user;
  }

  if (result.status === "forbidden") {
    // Authenticated, but not allowed in the CMS. Throwing keeps the
    // distinction between "you may not do this" and "you are logged out" —
    // the session cookie is left untouched.
    throw new Error(
      result.message ??
        "Your account does not have permission to use the dashboard.",
    );
  }

  if (result.status === "unavailable") {
    throw new Error(
      result.message ?? "Cannot reach the server. Please try again shortly.",
    );
  }

  // anonymous | invalid → back to the login page, remembering the
  // destination so the user lands where they wanted to go.
  redirect(buildLoginUrl(returnTo));
}
