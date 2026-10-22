import "server-only";

import { apiUrl } from "@/lib/api/config";
import { getToken } from "@/lib/session";
import {
  USER_ROLES,
  type CurrentUser,
  type UserRole,
} from "@/lib/types/user";

// ─────────────────────────────────────────────────────────────────
//  CURRENT USER (server-side)
//
//  GET /auth/me — the account behind the current session.
//
//  The backend re-reads the user from the database on every request, so the
//  role returned here is always the CURRENT one (never a stale JWT claim).
//  The JWT itself never reaches the browser.
//
//  Returns null when there is no session, the session is invalid or the
//  backend is unreachable — callers then fall back to a role-agnostic view.
// ─────────────────────────────────────────────────────────────────

interface MeBody {
  success?: boolean;
  user?: {
    id?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
  };
  message?: string;
}

/**
 * Outcome of an authoritative session check.
 *
 *  anonymous   — no session cookie at all
 *  invalid     — the token was rejected (expired, revoked, tampered with)
 *  forbidden   — the token was accepted but the account may not use the CMS
 *                (disabled, or no valid role). NOT the same as "logged out".
 *  unavailable — the backend could not be reached, so nothing was verified
 *  authenticated — the session is valid, `user` holds the current account
 */
export type SessionStatus =
  | "anonymous"
  | "invalid"
  | "forbidden"
  | "unavailable"
  | "authenticated";

export interface SessionVerification {
  status: SessionStatus;
  user: CurrentUser | null;
  message?: string;
}

function toUserRole(value: unknown): UserRole | null {
  return typeof value === "string" &&
    (USER_ROLES as string[]).includes(value)
    ? (value as UserRole)
    : null;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const result = await verifyCurrentUser();
  return result.user;
}

/**
 * Authoritative session check.
 *
 * The session cookie alone is never proof of authentication — it is only
 * checked against the backend, which verifies the JWT signature and re-reads
 * the account (role + active flag) from the database. The distinction between
 * the failure modes matters: an expired session must send the user back to
 * the login page, while a disabled account must NOT be mistaken for "logged
 * out".
 */
export async function verifyCurrentUser(): Promise<SessionVerification> {
  const token = await getToken();
  if (!token) return { status: "anonymous", user: null };

  let res: Response;
  try {
    res = await fetch(`${apiUrl()}/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });
  } catch {
    return {
      status: "unavailable",
      user: null,
      message: "Cannot reach the server.",
    };
  }

  if (res.status === 401) {
    return {
      status: "invalid",
      user: null,
      message: "Your session has expired. Please sign in again.",
    };
  }

  if (res.status === 403) {
    return {
      status: "forbidden",
      user: null,
      message:
        "Your account does not have permission to use the dashboard. Contact the administrator.",
    };
  }

  if (!res.ok) {
    return {
      status: "unavailable",
      user: null,
      message: "Could not verify your access. Please try again.",
    };
  }

  const body = (await res.json().catch(() => null)) as MeBody | null;
  const user = body?.user;
  if (!user) {
    return {
      status: "invalid",
      user: null,
      message: "Your session is no longer valid.",
    };
  }

  const role = toUserRole(user.role);
  if (!role) {
    return {
      status: "forbidden",
      user: null,
      message: "Your account does not have a valid role assigned.",
    };
  }

  return {
    status: "authenticated",
    user: {
      id: String(user.id ?? ""),
      email: String(user.email ?? ""),
      role,
      isActive: user.isActive !== false,
      createdAt: user.createdAt,
    },
  };
}
