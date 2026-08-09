import { NextResponse } from "next/server";

import { signUpWithPassword } from "@/lib/services/auth.service";

// POST /api/auth/signup — create a new admin account on the backend
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    await signUpWithPassword({ email, password });

    return NextResponse.json(
      { success: true, message: "Account created — you can now log in" },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Cannot reach the server. Make sure the backend is running."
        : error instanceof Error
          ? error.message
          : "Something went wrong";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
