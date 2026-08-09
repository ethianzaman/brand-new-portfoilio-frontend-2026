import { API_AUTH_URL } from "@/lib/constants/auth";
import type {
  AuthResponse,
  AuthSession,
  LoginCredentials,
  SignUpCredentials,
} from "@/lib/types/auth";

// ─────────────────────────────────────────────────────────────────
//  AUTH API — talks to the backend (Express)
//
//  Backend endpoints (see `Backend/src/routes/auth.routes.ts`):
//    POST {API_AUTH_URL}/login     → { success, token, user }   OR
//                                    { message, email } + Set-Cookie: token=...
//    POST {API_AUTH_URL}/sign-up  → { message, email }
//
//  NOTE: The backend (`auth.controller copy`) returns the JWT via a
//  `Set-Cookie` header on ITS own host. That cookie is useless to a
//  Next.js fetch (different host), so we read the raw `Set-Cookie`
//  header here and reuse the token for our own httpOnly cookie.
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
      ? { id: "", email: json.email }
      : { id: "", email: fallbackEmail });

  return { token, user };
}

// ── POST /auth/login ─────────────────────────────────────────────
export async function loginWithPassword(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const res = await fetch(`${API_AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  const json: AuthResponse = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message ?? `Login failed (${res.status})`);
  }

  const cookieToken = extractTokenFromCookie(res.headers.get("set-cookie"));

  return buildSession(json, cookieToken, credentials.email);
}

// ── POST /auth/sign-up ───────────────────────────────────────────
export async function signUpWithPassword(
  credentials: SignUpCredentials,
): Promise<void> {
  const res = await fetch(`${API_AUTH_URL}/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  const json: AuthResponse = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message ?? `Sign-up failed (${res.status})`);
  }
}