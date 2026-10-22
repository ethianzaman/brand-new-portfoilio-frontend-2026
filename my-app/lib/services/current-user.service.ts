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

function toUserRole(value: unknown): UserRole | null {
  return typeof value === "string" &&
    (USER_ROLES as string[]).includes(value)
    ? (value as UserRole)
    : null;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(`${apiUrl()}/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const body = (await res.json().catch(() => null)) as MeBody | null;
    const user = body?.user;
    if (!user) return null;

    const role = toUserRole(user.role);
    if (!role) return null;

    return {
      id: String(user.id ?? ""),
      email: String(user.email ?? ""),
      role,
      isActive: user.isActive !== false,
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}
