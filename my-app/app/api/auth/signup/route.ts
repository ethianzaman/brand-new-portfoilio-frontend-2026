import { NextResponse } from "next/server";

// POST /api/auth/signup — public registration is DISABLED.
//
// The route is kept only for compatibility so old clients get a clear
// message instead of a 404. Accounts are created exclusively by an Admin
// through the protected dashboard User Management API (POST /api/users).
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Public registration is disabled. Ask an administrator to create your account.",
    },
    { status: 403 },
  );
}
