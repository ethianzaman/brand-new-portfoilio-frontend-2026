"use client";

import { useQuery } from "@tanstack/react-query";

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

async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  const body = (await res.json().catch(() => null)) as MeResponse | null;

  if (!res.ok || !body?.user) {
    // Session invalid or account disabled — surface a typed error so the
    // UI can show a clear message instead of stale data.
    throw new Error(body?.message ?? "Your session is no longer valid.");
  }

  return body.user;
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    // Identity should never be cached for long — role changes must show up
    // on the next navigation/refresh.
    staleTime: 15_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const user = query.data ?? null;

  return {
    user,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error instanceof Error ? query.error.message : null,
    /** Admin-only: user management, and everything managers can do. */
    isAdmin: user?.role === "admin",
    /** Delete is allowed for admin + manager (never for editor). */
    canDelete: user?.role === "admin" || user?.role === "manager",
    /** Every authenticated role may create/edit content. */
    canEdit: Boolean(user),
    isReady: query.isSuccess,
  };
}
