import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/api/config";
import { destroySession, getSession } from "@/lib/session";

// GET /api/auth/me — current authenticated user.
//
// The role is read from the backend on EVERY call (the backend `protect`
// middleware loads the user fresh from the database), so role changes and
// account disabling are reflected immediately — never from a stale cookie
// or the JWT payload. The JWT itself never reaches the browser.
//
// A 401 from the backend means the token was rejected (expired, revoked or
// tampered with). The session cookie is dropped in that case, so a stale
// cookie can never keep the user in an authentication loop.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl()}/auth/me`, {
      headers: { Cookie: `token=${session.token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Cannot reach the server." },
      { status: 502 },
    );
  }

  if (upstream.status === 401) {
    // Expired / revoked / invalid token — drop the local session too.
    await destroySession();
  }

  const body = await upstream.json().catch(() => ({}));
  return NextResponse.json(body, { status: upstream.status });
}
