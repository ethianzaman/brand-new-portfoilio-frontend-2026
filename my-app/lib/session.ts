import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants/auth";
import type { AuthSession, AuthUser } from "@/lib/types/auth";

// ─────────────────────────────────────────────────────────────────
//  SESSION — httpOnly cookie helpers (server only)
//  Token from the backend is stored in a cookie so the browser
//  never sees it. The dashboard CRUD calls and proxy guard can
//  read it back with `getSession()`.
// ─────────────────────────────────────────────────────────────────

const USER_COOKIE = `${SESSION_COOKIE}_user`;

function cookieBase() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function createSession(session: AuthSession): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIE, session.token, cookieBase());
  store.set(USER_COOKIE, JSON.stringify(session.user), cookieBase());
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(USER_COOKIE);
}

export async function getSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const rawUser = store.get(USER_COOKIE)?.value;
  const user: AuthUser | null = rawUser ? safeParseUser(rawUser) : null;

  if (!user) {
    // Only safe inside a Route Handler / Server Action — Server Components
    // may not mutate cookies. `readSession()` is the non-mutating variant.
    await destroySession();
    return null;
  }

  return { token, user };
}

/**
 * Read the session WITHOUT touching cookies.
 *
 * `getSession()` cleans up a half-written session by deleting the cookies,
 * which throws inside a Server Component. This variant only reads, so it is
 * safe to call from a page, a layout or a data access layer.
 */
export async function readSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const rawUser = store.get(USER_COOKIE)?.value;
  const user: AuthUser | null = rawUser ? safeParseUser(rawUser) : null;

  if (!user) return null;

  return { token, user };
}

export async function getToken(): Promise<string | null> {
  const session = await readSession();
  return session?.token ?? null;
}

/**
 * The raw session token, or null when there is no session cookie.
 *
 * Unlike `readSession()` this ignores the companion user cookie, so it also
 * returns a token for a half-written or corrupt session — useful when the
 * session has to be forwarded to the backend for cleanup.
 */
export async function readSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

function safeParseUser(raw: string): AuthUser | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof parsed.email !== "string") return null;
    return { id: String(parsed.id ?? ""), email: parsed.email };
  } catch {
    return null;
  }
}