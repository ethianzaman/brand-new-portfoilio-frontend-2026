import { NextResponse, type NextRequest } from "next/server";

import { isSameOriginRequest } from "@/lib/auth/origin";

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  // A GET handler or a cross-site POST would let any page log the admin out.
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Cross-origin request rejected." },
      { status: 403 },
    );
  }

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
