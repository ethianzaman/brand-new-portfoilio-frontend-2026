import { NextResponse } from "next/server";

import { submitContactMessage } from "@/lib/services/message.services";

/**
 * POST /api/contact — public contact-form submission.
 *
 * Same-origin proxy to the backend inbox endpoint. Keeps the backend base URL
 * and Resend dispatch server-side (never in the browser bundle) while giving
 * the contact form a simple, CORS-free target.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Name is required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "A valid email is required." },
      { status: 400 },
    );
  }
  if (!message) {
    return NextResponse.json(
      { success: false, message: "Message is required." },
      { status: 400 },
    );
  }

  try {
    const created = await submitContactMessage({
      name,
      email,
      subject: typeof payload.subject === "string" ? payload.subject : "",
      budget: typeof payload.budget === "string" ? payload.budget : "",
      message,
    });

    return NextResponse.json({ success: true, message: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "Cannot reach the server. Please try again in a moment."
        : error instanceof Error
          ? error.message
          : "Something went wrong.";

    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
