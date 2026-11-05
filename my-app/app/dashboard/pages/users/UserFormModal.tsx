"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { dashboardCreateUser } from "@/lib/services/user.service";
import {
  CONFIGURABLE_ROLES,
  USER_ROLES,
  type CreateUserInput,
  type ManagedUser,
  type UserRole,
} from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { RoleSelect } from "./RoleSelect";
import { TemporaryPasswordModal } from "./TemporaryPasswordModal";

interface Props {
  onCancel: () => void;
  onCreated: (user: ManagedUser) => void;
}

type Errors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserFormModal({ onCancel, onCreated }: Props) {
  const [email, setEmail] = useState("");
  const { isSuperAdmin } = useCurrentUser();
  const [role, setRole] = useState<UserRole>("editor");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );

  function validate(): Errors {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (password && password.length < 8)
      next.password = "Password must be at least 8 characters.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error(next.email ?? next.password ?? "Please fix the errors.");
      return;
    }

    setPending(true);
    try {
      const input: CreateUserInput = {
        email: email.trim().toLowerCase(),
        role,
        ...(password ? { password } : {}),
      };
      const { user, temporaryPassword: temp } = await dashboardCreateUser(input);
      onCreated(user);
      if (temp) setTemporaryPassword(temp);
      else toast.success(`${user.email} created`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create user.",
      );
    } finally {
      setPending(false);
    }
  }

  // ── Success state: temporary password shown exactly once ──────
  if (temporaryPassword) {
    return (
      <TemporaryPasswordModal
        title="Account created"
        email={email.trim().toLowerCase()}
        password={temporaryPassword}
        onClose={onCancel}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                  bg-zinc-950/60 backdrop-blur-sm overflow-y-auto"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md my-4 bg-white dark:bg-zinc-900
                    rounded-2xl border border-zinc-200 dark:border-zinc-800
                    shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div
            className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950
                        flex items-center justify-center"
          >
            <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900
                       hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white
                       dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Create user
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            New accounts can only be created by an administrator.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-user-email"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email
              </label>
              <input
                id="new-user-email"
                type="email"
                autoComplete="off"
                placeholder="person@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={cn(
                  "h-9 w-full rounded-xl border bg-white dark:bg-zinc-950 px-3 text-sm",
                  "text-zinc-900 dark:text-white placeholder:text-zinc-400",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                  errors.email
                    ? "border-red-400 dark:border-red-600"
                    : "border-zinc-200 dark:border-zinc-700",
                )}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-user-role"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Role
              </label>
              <RoleSelect
                id="new-user-role"
                label="Role"
                value={role}
                roles={isSuperAdmin ? USER_ROLES : CONFIGURABLE_ROLES}
                onChange={setRole}
                className="h-10 w-full rounded-xl text-sm"
              />
            </div>

            {/* Password (optional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-user-password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                id="new-user-password"
                type="text"
                autoComplete="new-password"
                placeholder="Leave blank to generate one"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={cn(
                  "h-9 w-full rounded-xl border bg-white dark:bg-zinc-950 px-3 text-sm",
                  "text-zinc-900 dark:text-white placeholder:text-zinc-400",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                  errors.password
                    ? "border-red-400 dark:border-red-600"
                    : "border-zinc-200 dark:border-zinc-700",
                )}
              />
              {errors.password ? (
                <p className="text-xs font-medium text-red-500">{errors.password}</p>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Minimum 8 characters. If left blank, a temporary password is
                  generated and shown once.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                           border border-zinc-200 dark:border-zinc-700
                           text-zinc-700 dark:text-zinc-300
                           hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 flex items-center justify-center gap-2
                           py-2.5 rounded-xl text-sm font-medium text-white
                           bg-indigo-600 hover:bg-indigo-700
                           disabled:opacity-60 transition-colors"
              >
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Create user
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
