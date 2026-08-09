"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, LogIn, Mail, Sparkles, UserPlus } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

type Errors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode: Mode, email: string, password: string): Errors {
  const errors: Errors = {};

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (mode === "signup" && password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [pending, setPending] = useState(false);
  const router = useRouter();

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
    setErrors(validate(mode, email, password));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate(mode, email, password);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(nextErrors).length > 0) {
      toast.error(nextErrors.email ?? nextErrors.password ?? "Please fix the errors");
      return;
    }

    setPending(true);

    try {
      const res = await fetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        },
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json.message ?? "Something went wrong");
        return;
      }

      if (mode === "signup") {
        toast.success("Account created — you can now log in");
        setMode("login");
        setPassword("");
        setErrors({});
        setTouched({});
        return;
      }

      toast.success("Welcome back!");
      // Go to dashboard — replace() so the browser Back button
      // doesn't land on the login page again.
      router.replace("/dashboard");
    } catch {
      toast.error("Network error — is the backend running?");
    } finally {
      setPending(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setTouched({});
  }

  const emailInvalid = Boolean(errors.email) && touched.email;
  const passwordInvalid = Boolean(errors.password) && touched.password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <Toaster position="top-center" />

      <div className="w-full max-w-md">
        {/* ── Card ── */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <span className="inline-flex items-center justify-center size-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Lock className="size-6" />
            </span>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {mode === "login"
                ? "Sign in to manage your portfolio"
                : "Register to manage your portfolio"}
            </p>
          </div>

          {/* Mode switch */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            {(
              [
                { key: "login", label: "Login", Icon: LogIn },
                { key: "signup", label: "Sign up", Icon: UserPlus },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchMode(key)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  mode === key
                    ? " bg-blue-600 text-white shadow-sm dark:bg-zinc-900 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
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
                    "absolute left-2.5 top-1/2 -translate-y-1/2 size-4",
                    emailInvalid ? "text-destructive" : "text-zinc-400",
                  )}
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className={cn("h-9 pl-9", emailInvalid && "ring-destructive/20")}
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
                    "absolute left-2.5 top-1/2 -translate-y-1/2 size-4",
                    passwordInvalid ? "text-destructive" : "text-zinc-400",
                  )}
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className={cn("h-9 pl-9", passwordInvalid && "ring-destructive/20")}
                  aria-invalid={passwordInvalid || undefined}
                  aria-describedby={passwordInvalid ? "password-error" : undefined}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  onBlur={() => handleBlur("password")}
                />
              </div>
              {passwordInvalid && (
                <p id="password-error" className="text-xs font-medium text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" disabled={pending} className="mt-2 h-9 gap-2">
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn  className="size-4" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {pending
                ? "Please wait…"
                : mode === "login"
                  ? "Log in"
                  : "Sign up"}
            </Button>
          </form>
        </div>

        {/* ── Footer ── */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Sparkles className="size-3.5" />
          <Link
            href="/"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Back to portfolio
          </Link>
        </p>
      </div>
    </div>
  );
}