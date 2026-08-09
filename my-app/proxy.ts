import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/constants/auth";

// Optimistic auth check:
//  - /dashboard/*  → requires session cookie, otherwise redirect to /login
//  - /login        → logged-in users are sent to /dashboard
//
// This is a lightweight guard only. The session cookie is httpOnly
// and can only be created/removed by the /api/auth/* route handlers.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/login" || pathname.startsWith("/login");

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isLogin && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};