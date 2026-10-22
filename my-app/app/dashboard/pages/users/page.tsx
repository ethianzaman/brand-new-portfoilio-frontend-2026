import { redirect } from "next/navigation";
import { AlertTriangle, UserCog } from "lucide-react";

import { apiUrl } from "@/lib/api/config";
import { getToken } from "@/lib/session";
import type { ManagedUser, UserRole } from "@/lib/types/user";
import { UsersTable } from "./UsersTable";

// ─────────────────────────────────────────────────────────────────
//  User Management — ADMIN ONLY.
//
//  Access is enforced three times over:
//   1. proxy.ts — any /dashboard route needs a session cookie
//   2. this page — the role is read from the DB via GET /auth/me and
//      non-admins are redirected before anything renders (covers
//      direct URL access by managers/editors)
//   3. the backend — every /api/users call re-checks the role
// ─────────────────────────────────────────────────────────────────

interface MeBody {
  user?: { id: string; role: UserRole };
}

interface UsersBody {
  users?: ManagedUser[];
  message?: string;
}

async function backendFetch(path: string, token: string) {
  try {
    return await fetch(`${apiUrl()}${path}`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export default async function UsersPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  // ── Verify identity + role (fresh from the database) ──────────
  const meRes = await backendFetch("/auth/me", token);

  if (!meRes) {
    return <LoadError message="Cannot reach the backend server. Make sure it is running." />;
  }
  if (meRes.status === 401 || meRes.status === 403) {
    // Token expired or account gone — send back to the dashboard where
    // the profile card surfaces the expired-session state.
    redirect("/dashboard");
  }
  if (!meRes.ok) {
    return <LoadError message="Could not verify your access. Please try again." />;
  }

  const me = (await meRes.json().catch(() => ({}))) as MeBody;
  if (me.user?.role !== "admin") {
    redirect("/dashboard");
  }

  // ── Load users ────────────────────────────────────────────────
  const usersRes = await backendFetch("/users", token);

  let users: ManagedUser[] = [];
  let loadError: string | null = null;

  if (!usersRes) {
    loadError = "Cannot reach the backend server. Make sure it is running.";
  } else if (!usersRes.ok) {
    const body = (await usersRes.json().catch(() => ({}))) as UsersBody;
    loadError = body.message ?? "Failed to load users.";
  } else {
    const body = (await usersRes.json().catch(() => ({}))) as UsersBody;
    users = body.users ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                      flex items-center justify-center"
        >
          <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create accounts and assign roles — admin, manager or editor
          </p>
        </div>
      </div>

      {loadError ? (
        <LoadError message={loadError} />
      ) : (
        <UsersTable initial={users} currentUserId={me.user!.id} />
      )}
    </div>
  );
}

function LoadError({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border border-amber-200
                 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 p-5"
    >
      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Could not load user management
        </p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{message}</p>
      </div>
    </div>
  );
}
