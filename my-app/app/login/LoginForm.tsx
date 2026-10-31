"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_DASHBOARD_PATH, safeReturnUrl } from "@/lib/auth/return-url";
import { cn } from "@/lib/utils";

// NOTE: Public registration has been disabled. Accounts are created by an
// administrator through the dashboard's User Management section.

type Errors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): Errors {
  const errors: Errors = {};

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Validated again on the client — the server already did it, but the
  // redirect target is never trusted from a single place.
  const target = safeReturnUrl(redirectTo) ?? DEFAULT_DASHBOARD_PATH;

  // An already-authenticated visitor has no business on the login page.
  // The session is verified against the backend (GET /api/auth/me), NOT
  // inferred from the presence of a cookie, so an expired session keeps the
  // visitor here instead of bouncing them into a redirect loop.
  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (active && res.ok) router.replace(target);
      })
      .catch(() => {
        // Backend unreachable — stay on the login page.
      });

    return () => {
      active = false;
    };
  }, [router, target]);

  function clearError(field: keyof Errors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleBlur(field: "email" | "password") {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(email, password));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(nextErrors).length > 0) {
      toast.error(nextErrors.email ?? nextErrors.password ?? "Please fix the errors");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json.message ?? "Something went wrong");
        return;
      }

      toast.success("Welcome back!");
      // Go to the page the visitor originally asked for — replace() so the
      // browser Back button doesn't land on the login page again.
      router.replace(target);
    } catch {
      toast.error("Network error — is the backend running?");
    } finally {
      setPending(false);
    }
  }

  const emailInvalid = Boolean(errors.email) && touched.email;
  const passwordInvalid = Boolean(errors.password) && touched.password;

  return (
    <>
      <Toaster position="top-center" />

      {/* ── Card ──
          The page behind the card is always the deep brand palette, so the
          card carries its OWN surface colour: light and frosted-white in
          the light theme, deep zinc in the dark one. */}
      <div className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl sm:p-8 dark:border-zinc-700/70 dark:bg-zinc-900/90 dark:shadow-black/40">
        {/* Header */}
        <div className="mb-7 text-center">
          <span className="inline-flex items-center justify-center size-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/25">
            <LogIn className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Login to manage your portfolio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className={cn(
                  "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 transition-colors",
                  emailInvalid ? "text-destructive" : "text-zinc-400",
                )}
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                className={cn(
                  "h-12 rounded-xl bg-zinc-50 pl-11 text-sm dark:bg-zinc-800/60",
                  emailInvalid && "ring-destructive/20",
                )}
                aria-invalid={emailInvalid || undefined}
                aria-describedby={emailInvalid ? "email-error" : undefined}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                onBlur={() => handleBlur("email")}
              />
            </div>
            {emailInvalid && (
              <p id="email-error" className="text-xs font-medium text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className={cn(
                  "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 transition-colors",
                  passwordInvalid ? "text-destructive" : "text-zinc-400",
                )}
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  "h-12 rounded-xl bg-zinc-50 pl-11 pr-11 text-sm dark:bg-zinc-800/60",
                  passwordInvalid && "ring-destructive/20",
                )}
                aria-invalid={passwordInvalid || undefined}
                aria-describedby={passwordInvalid ? "password-error" : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                onBlur={() => handleBlur("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {passwordInvalid && (
              <p id="password-error" className="text-xs font-medium text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="mt-1 h-12 w-full gap-2 rounded-xl bg-linear-to-r from-indigo-600 via-indigo-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl hover:shadow-indigo-600/40"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            {pending ? "Logging you in…" : "Login to dashboard"}
          </Button>
        </form>

        {/* ── Divider ── */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Secure access
          </span>
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* ── Notes ── */}
        <div className="space-y-3">
          <p className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            Your session is stored in an httpOnly cookie and never exposed to
            the browser.
          </p>
          <p className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            <UserPlus className="mt-0.5 size-4 shrink-0 text-indigo-500" />
            Accounts are created by an administrator from the User Management
            section.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm text-indigo-100/70">
        <ArrowLeft className="size-3.5" />
        <Link
          href="/"
          className="font-medium text-indigo-100/90 transition-colors hover:text-white hover:underline"
        >
          Back to portfolio
        </Link>
      </p>
    </>
  );
}
