"use client";

import { useState } from "react";
import { Check, Copy, Loader2, ShieldCheck, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { dashboardCreateUser } from "@/lib/services/user.services";
import {
  ROLE_LABELS,
  USER_ROLES,
  type CreateUserInput,
  type ManagedUser,
  type UserRole,
} from "@/lib/types/user";
import { cn } from "@/lib/utils";

interface Props {
  onCancel: () => void;
  onCreated: (user: ManagedUser) => void;
}

type Errors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_HELP: Record<UserRole, string> = {
  admin: "Full access, including user management and all content.",
  manager: "Can create, edit and delete content. No user management.",
  editor: "Can create and edit content. Cannot delete.",
};

export function UserFormModal({ onCancel, onCreated }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

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

  async function copyPassword() {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the password manually.");
    }
  }

  // ── Success state: temporary password shown exactly once ──────
  if (temporaryPassword) {
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
          <div className="p-6">
            <div
              className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950
                          flex items-center justify-center mb-4"
            >
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Account created
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              A temporary password was generated for{" "}
              <span className="font-semibold text-zinc-900 dark:text-white">
                {email.trim().toLowerCase()}
              </span>
              . Share it securely — it is shown only once.
            </p>

            <div
              className="mt-4 flex items-center gap-2 rounded-xl border
                          border-zinc-200 dark:border-zinc-700
                          bg-zinc-50 dark:bg-zinc-950 p-3"
            >
              <code className="flex-1 font-mono text-sm text-zinc-900 dark:text-white break-all">
                {temporaryPassword}
              </code>
              <button
                type="button"
                onClick={copyPassword}
                aria-label="Copy temporary password"
                className="p-2 rounded-lg text-zinc-500 hover:text-indigo-600
                           hover:bg-indigo-50 dark:hover:bg-indigo-950
                           transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              onClick={onCancel}
              className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium
                         bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
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
              <select
                id="new-user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="h-9 w-full rounded-xl border border-zinc-200 dark:border-zinc-700
                           bg-white dark:bg-zinc-950 px-3 text-sm
                           text-zinc-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           transition-colors"
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {ROLE_HELP[role]}
              </p>
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
