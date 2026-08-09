import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

// GET /api/auth/me — current session info (used by the client)

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true, user: session.user });
}