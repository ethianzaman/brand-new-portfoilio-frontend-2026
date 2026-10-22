import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/api/config";
import { destroySession, readSessionToken } from "@/lib/session";

// POST /api/auth/logout — end the session.
//
// The local httpOnly session cookie is always cleared. The backend's own
// `token` cookie is cleared as well (best effort) so no copy of the JWT is
// left behind on the backend origin.
//
// NOTE: the JWT itself is stateless, so it stays technically valid until it
// expires. It is useless on its own, though: it only works when presented
// with the session cookie, and that cookie is gone. Disabling or deleting
// the account revokes access immediately.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function endSession(): Promise<NextResponse> {
  const token = await readSessionToken();

  if (token) {
    try {
      await fetch(`${apiUrl()}/auth/logout`, {
        method: "POST",
        headers: { Cookie: `token=${token}` },
        cache: "no-store",
      });
    } catch {
      // Backend unreachable — the local session is still cleared below, so
      // the user is logged out of this app either way.
    }
  }

  await destroySession();

  return NextResponse.json(
    { success: true, message: "Logged out" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST() {
  return endSession();
}

// GET /api/auth/logout — harmless fallback (e.g. link clicks)
export async function GET() {
  return endSession();
}
