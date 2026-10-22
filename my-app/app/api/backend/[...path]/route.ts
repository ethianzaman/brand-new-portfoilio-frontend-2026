import type { NextRequest } from "next/server";

import { isSameOriginRequest } from "@/lib/auth/origin";
import { apiUrl } from "@/lib/api/config";
import { getSession } from "@/lib/session";

// Same-origin proxy for every dashboard API call.
//
// The browser never holds the backend JWT (it lives in this app's httpOnly
// session cookie), so dashboard fetches cannot talk to the backend directly
// without tripping its `protect` middleware. Instead the client calls
// `/api/backend/<path>`; this handler reads the session, attaches
// `Cookie: token=<jwt>`, and forwards to the real backend. Requests without
// a session are forwarded anonymously so public endpoints keep working.
//
// Set-Cookie from the backend is intentionally NOT forwarded: the session
// cookie is owned by the /api/auth/* handlers only.
//
// State-changing requests must originate from this app (defence in depth
// against CSRF, on top of the httpOnly + SameSite=Lax session cookie).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProxyContext = { params: Promise<{ path: string[] }> };

async function forward(
  request: NextRequest,
  method: string,
  { params }: ProxyContext,
): Promise<Response> {
  const { path } = await params;

  if (!path?.length) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  // Reject cross-origin state changes before anything is forwarded.
  if (!isSameOriginRequest(request)) {
    return Response.json(
      { message: "Cross-origin request rejected." },
      { status: 403 },
    );
  }

  const target = new URL(
    `${apiUrl()}/${path.map(encodeURIComponent).join("/")}`,
  );
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  const session = await getSession();

  const headers = new Headers();
  // Forward the incoming content-type (including the multipart boundary for
  // FormData uploads) so the backend can parse the body we relay verbatim.
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (session) headers.set("Cookie", `token=${session.token}`);

  const body = await request.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: body.byteLength ? body : undefined,
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { message: "Cannot reach the backend server." },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) responseHeaders.set("Content-Type", upstreamType);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export function GET(request: NextRequest, context: ProxyContext) {
  return forward(request, "GET", context);
}

export function POST(request: NextRequest, context: ProxyContext) {
  return forward(request, "POST", context);
}

export function PUT(request: NextRequest, context: ProxyContext) {
  return forward(request, "PUT", context);
}

export function PATCH(request: NextRequest, context: ProxyContext) {
  return forward(request, "PATCH", context);
}

export function DELETE(request: NextRequest, context: ProxyContext) {
  return forward(request, "DELETE", context);
}
