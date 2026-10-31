"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

import { buildLoginUrl } from "@/lib/auth/return-url";
import type { CurrentUser } from "@/lib/types/user";

// ─────────────────────────────────────────────────────────────────
//  useCurrentUser — single source of truth for identity/permissions
//  in the dashboard.
//
//  Data comes from GET /api/auth/me, which proxies to the backend's
//  protected /auth/me endpoint. The backend re-reads the user from the
//  database on every request, so a role change or a disabled account
//  is reflected immediately (the JWT payload never leaves the server).
// ─────────────────────────────────────────────────────────────────

export type { CurrentUser };

interface MeResponse {
  success?: boolean;
  user?: CurrentUser;
  message?: string;
}

/**
 * Carries the HTTP status so the UI can tell "your session ended" (401)
 * apart from "your account may not do this" (403).
 */
class SessionError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SessionError";
    this.status = status;
  }
}

async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  const body = (await res.json().catch(() => null)) as MeResponse | null;

  if (!res.ok || !body?.user) {
    // Session invalid or account disabled — surface a typed error so the
    // UI can show a clear message instead of stale data.
    throw new SessionError(
      res.status,
      body?.message ?? "Your session is no longer valid.",
    );
  }

  return body.user;
}

export function useCurrentUser() {
  const router = useRouter();
  const pathname = usePathname();

  const query = useQuery({
    // The path is part of the key, so the session is re-verified on every
    // dashboard navigation. A layout does not re-render on client-side
    // transitions, so this is what notices a session that expired while
    // the user was inside the dashboard. Every component using this hook
    // shares the same key, so it still results in a single request.
    queryKey: ["me", pathname],
    queryFn: fetchCurrentUser,
    // Identity should never be cached for long — role changes must show up
    // on the next navigation/refresh.
    staleTime: 15_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const user = query.data ?? null;
  const error = query.error;

  // 401 → the session is gone: send the user back to the login page and
  // remember where they were. A 403 is deliberately NOT handled that way —
  // the user is still signed in, their account simply may not use the CMS.
  useEffect(() => {
    if (!(error instanceof SessionError) || error.status !== 401) return;
    router.replace(buildLoginUrl(pathname));
  }, [error, router, pathname]);

  return {
    user,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: error instanceof Error ? error.message : null,
    /** Admin-only: user management, and everything managers can do. */
    isAdmin: user?.role === "admin",
    /** Delete is allowed for admin + manager (never for editor). */
    canDelete: user?.role === "admin" || user?.role === "manager",
    /** Every authenticated role may create/edit content. */
    canEdit: Boolean(user),
    isReady: query.isSuccess,
  };
}
