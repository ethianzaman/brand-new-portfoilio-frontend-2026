import { NextResponse } from "next/server";

import { loginWithPassword } from "@/lib/services/auth.service";
import { createSession } from "@/lib/session";

// POST /api/auth/login — exchange credentials for a session cookie
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const session = await loginWithPassword({ email, password });
    await createSession(session);

    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Cannot reach the server. Make sure the backend is running."
        : error instanceof Error
          ? error.message
          : "Something went wrong";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
