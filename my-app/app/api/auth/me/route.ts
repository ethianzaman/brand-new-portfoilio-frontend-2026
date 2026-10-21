import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/api/config";
import { getSession } from "@/lib/session";

// GET /api/auth/me — current authenticated user.
//
// The role is read from the backend on EVERY call (the backend `protect`
// middleware loads the user fresh from the database), so role changes and
// account disabling are reflected immediately — never from a stale cookie
// or the JWT payload. The JWT itself never reaches the browser.

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

  const body = await upstream.json().catch(() => ({}));
  return NextResponse.json(body, { status: upstream.status });
}
