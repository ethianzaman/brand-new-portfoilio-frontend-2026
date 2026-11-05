import { API_AUTH_URL } from "@/lib/constants/auth";
import type {
  AuthResponse,
  AuthSession,
  LoginCredentials,
} from "@/lib/types/auth";

// ─────────────────────────────────────────────────────────────────
//  AUTH API — talks to the backend (Express)
//
//  Backend endpoints (see `Backend/src/routes/auth.routes.ts`):
//    POST {API_AUTH_URL}/login   → { success, user } + Set-Cookie: token=...
//    POST {API_AUTH_URL}/logout  → clears the backend cookie
//
//  Public registration (sign-up) is DISABLED on the backend. Accounts are
//  created by an Admin through the protected User Management API only.
//
//  NOTE: The backend returns the JWT via a `Set-Cookie` header on ITS own
//  host. That cookie is useless to a Next.js fetch (different host), so we
//  read the raw `Set-Cookie` header here and reuse the token for our own
//  httpOnly cookie.
// ─────────────────────────────────────────────────────────────────

// ── Internal: pull `token=<value>` out of a Set-Cookie header ──
function extractTokenFromCookie(setCookie: string | null): string | null {
  if (!setCookie) return null;

  const headers = setCookie.split(", ");

  for (const header of headers) {
    const match = header.match(/token=([^;]+)/i);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

// ── Internal: build the AuthSession from every possible shape ────
function buildSession(
  json: AuthResponse,
  fallbackToken: string | null,
  fallbackEmail: string,
): AuthSession {
  const token =
    json.token ??
    json.accessToken ??
    json.access_token ??
    json.data?.token ??
    fallbackToken;

  if (!token) {
    throw new Error(json.message ?? "Backend did not return a session token");
  }

  const user =
    json.user ??
    json.data?.user ??
    (typeof json.email === "string"
      ? { id: "", email: json.email, role: json.role }
      : { id: "", email: fallbackEmail });

  return { token, user };
}

// ── POST /auth/login ─────────────────────────────────────────────
export async function loginWithPassword(
  credentials: LoginCredentials,
  headers: Record<string, string> = {},
): Promise<AuthSession> {
  const res = await fetch(`${API_AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  const json: AuthResponse = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(json.message ?? `Login failed (${res.status})`), {
      status: res.status,
    });
  }

  const cookieToken = extractTokenFromCookie(res.headers.get("set-cookie"));

  return buildSession(json, cookieToken, credentials.email);
}

// ── POST /auth/change-password ──────────────────────
/** Returns the new session token; the backend revokes every older one. */
export async function changePassword(
  token: string,
  input: { currentPassword: unknown; newPassword: unknown },
  headers: Record<string, string> = {},
): Promise<string> {
  const res = await fetch(`${API_AUTH_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
      ...headers,
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const json: AuthResponse = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(
      new Error(json.message ?? `Could not change the password (${res.status})`),
      { status: res.status },
    );
  }

  const nextToken = extractTokenFromCookie(res.headers.get("set-cookie"));
  if (!nextToken) throw new Error("Backend did not return a session token");
  return nextToken;
}
