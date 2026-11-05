import { NextResponse, type NextRequest } from "next/server";

import { clientHeaders, upstreamStatus } from "@/lib/api/internal";
import { isSameOriginRequest } from "@/lib/auth/origin";
import { loginWithPassword } from "@/lib/services/auth.service";
import { createSession } from "@/lib/session";

// POST /api/auth/login — exchange credentials for a session cookie
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: "Cross-origin request rejected." },
      { status: 403 },
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const session = await loginWithPassword(
      { email, password },
      clientHeaders(request),
    );
    await createSession(session);

    return NextResponse.json({ success: true, message: "Login successful" });
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
