import { NextResponse, type NextRequest } from "next/server";

import { clientHeaders, upstreamStatus } from "@/lib/api/internal";
import { isSameOriginRequest } from "@/lib/auth/origin";
import { changePassword } from "@/lib/services/auth.service";
import { createSession, getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/auth/password — change the signed-in user's own password.
//
// This has its own route because the /api/backend proxy never forwards
// Set-Cookie: changing a password replaces the session token, and this app's
// session cookie has to move to the new one or the user would be signed out.
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Cross-origin request rejected." },
      { status: 403 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Your session has ended. Please sign in again." },
      { status: 401 },
    );
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    const token = await changePassword(
      session.token,
      { currentPassword, newPassword },
      clientHeaders(request),
    );
    await createSession({ token, user: session.user });

    return NextResponse.json(
      { success: true, message: "Password changed." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Cannot reach the server. Make sure the backend is running."
        : error instanceof Error
          ? error.message
          : "Something went wrong";
    return NextResponse.json(
      { success: false, message },
      { status: upstreamStatus(error) },
    );
  }
}
