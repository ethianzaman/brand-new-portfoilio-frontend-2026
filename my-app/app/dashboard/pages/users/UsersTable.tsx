"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Search, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";

import {
  dashboardDeleteUser,
  dashboardUpdateUserRole,
  dashboardUpdateUserStatus,
} from "@/lib/services/user.services";
import {
  ROLE_LABELS,
  USER_ROLES,
  type ManagedUser,
  type UserRole,
} from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { UserFormModal } from "./UserFormModal";
import { UserDeleteModal } from "./UserDeleteModal";

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
  manager:
    "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  editor:
    "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UsersTable({
  initial,
  currentUserId,
}: {
  initial: ManagedUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<ManagedUser[]>(initial);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, search]);

  function upsert(user: ManagedUser) {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists
        ? prev.map((u) => (u.id === user.id ? user : u))
        : [user, ...prev];
    });
  }

  async function changeRole(user: ManagedUser, role: UserRole) {
    if (role === user.role) return;
    setBusyId(user.id);
    try {
      const updated = await dashboardUpdateUserRole(user.id, role);
      upsert(updated);
      toast.success(`${user.email} is now ${ROLE_LABELS[role]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleStatus(user: ManagedUser) {
    setBusyId(user.id);
    try {
      const updated = await dashboardUpdateUserStatus(user.id, !user.isActive);
      upsert(updated);
      toast.success(
        updated.isActive ? `${updated.email} enabled` : `${updated.email} disabled`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update account status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyId(target.id);
    try {
      await dashboardDeleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      toast.success(`${target.email} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2
                       w-4 h-4 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       text-zinc-900 dark:text-white
                       placeholder:text-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       transition-colors"
          />
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5
                     rounded-xl text-sm font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700 transition-colors
                     shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add user
        </button>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl border border-zinc-200 dark:border-zinc-800
                    bg-white dark:bg-zinc-900 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b border-zinc-200 dark:border-zinc-800
                           bg-zinc-50 dark:bg-zinc-900/60 text-left
                           text-[11px] uppercase tracking-wider text-zinc-500"
              >
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    <UserCog className="w-5 h-5 mx-auto mb-2 opacity-60" />
                    {users.length === 0
                      ? "No users yet — create the first account."
                      : "No users match your search."}
                  </td>
                </tr>
              )}

              {filtered.map((user) => {
                const isSelf = user.id === currentUserId;
                const busy = busyId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/60
                               last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40
                               transition-colors"
                  >
                    {/* Email */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {user.email}
                      </span>
                      {isSelf && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                          (you)
                        </span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                            ROLE_STYLES[user.role],
                          )}
                        >
                          {ROLE_LABELS[user.role]}
                        </span>
                        <select
                          value={user.role}
                          disabled={busy}
                          onChange={(e) =>
                            changeRole(user, e.target.value as UserRole)
                          }
                          aria-label={`Change role for ${user.email}`}
                          className="h-7 rounded-lg border border-zinc-200 dark:border-zinc-700
                                     bg-white dark:bg-zinc-950 px-1.5 text-xs
                                     text-zinc-600 dark:text-zinc-300
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                                     disabled:opacity-50 transition-colors"
                        >
                          {USER_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                        {busy && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                            user.isActive
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              user.isActive ? "bg-emerald-500" : "bg-zinc-400",
                            )}
                          />
                          {user.isActive ? "Active" : "Disabled"}
                        </span>

                        <button
                          onClick={() => toggleStatus(user)}
                          disabled={busy || (isSelf && user.isActive)}
                          title={
                            isSelf && user.isActive
                              ? "You cannot disable your own account."
                              : undefined
                          }
                          className="text-[11px] font-medium text-zinc-500
                                     hover:text-indigo-600 dark:text-zinc-400
                                     dark:hover:text-indigo-400 underline-offset-2
                                     hover:underline disabled:opacity-40
                                     disabled:no-underline disabled:hover:text-zinc-500
                                     transition-colors"
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!isSelf && (
                          <button
                            onClick={() => setDeleteTarget(user)}
                            disabled={busy}
                            aria-label={`Delete ${user.email}`}
                            className="p-2 rounded-lg text-zinc-400
                                       hover:text-red-600 hover:bg-red-50
                                       dark:hover:text-red-400 dark:hover:bg-red-950/50
                                       disabled:opacity-40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <UserFormModal
          onCancel={() => setShowForm(false)}
          onCreated={(user) => upsert(user)}
        />
      )}

      {deleteTarget && (
        <UserDeleteModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
