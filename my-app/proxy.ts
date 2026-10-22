import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { safeReturnUrl } from "@/lib/auth/return-url";
import { PATHNAME_HEADER, SESSION_COOKIE } from "@/lib/constants/auth";

// ─────────────────────────────────────────────────────────────────────────
//  PROXY — optimistic route guard (runs before every route)
//
//  /dashboard/*  → requires a session cookie, otherwise redirect to
//                  /login?returnUrl=<the path that was requested>
//  /login        → always public
//
//  IMPORTANT: this is an OPTIMISTIC check only. The presence of the session
//  cookie is NOT proof of authentication — it is an httpOnly bearer token
//  that says nothing about whether it is still valid. The cookie check here
//  merely bounces anonymous visitors before a page is rendered.
//
//  The authoritative check happens on the server, in the dashboard layout
//  (`lib/auth/dal.ts`), which verifies the session against the backend
//  (JWT signature + a fresh read of the account from the database) and
//  redirects to /login when it does not hold up.
//
//  The requested path is handed to the server component through the
//  `x-portfolio-pathname` request header so the login page can send the user
//  back to where they were headed.
//
//  The previous behaviour of bouncing logged-in users away from /login was
//  removed on purpose: a cookie-presence check cannot tell a valid session
//  from an expired one, and redirecting on that basis produced a
//  /login → /dashboard → /login loop for expired sessions. The login page
//  now verifies the session authoritatively before redirecting.
// ─────────────────────────────────────────────────────────────────────────

function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isDashboardPath(pathname)) {
    return NextResponse.next();
  }

  // Hand the originally requested path to the server component.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PATHNAME_HEADER, `${pathname}${search}`);

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession) {
    // No session at all — send the visitor to the login page and remember
    // where they wanted to go. The target is validated, so a crafted query
    // string can never turn this into an open redirect.
    const safe = safeReturnUrl(`${pathname}${search}`);

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (safe) url.searchParams.set("returnUrl", safe);

    return NextResponse.redirect(url);
  }

  // A session cookie exists but may be expired or revoked — the dashboard
  // layout performs the authoritative check and redirects if it fails.
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
