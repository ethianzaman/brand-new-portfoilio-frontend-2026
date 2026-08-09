import { NextResponse } from "next/server";

import { destroySession } from "@/lib/session";

// POST /api/auth/logout — clear the session cookie
export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true, message: "Logged out" });
}

// GET /api/auth/logout — harmless fallback (e.g. link clicks)
export async function GET() {
  await destroySession();
  return NextResponse.json({ success: true, message: "Logged out" });
}