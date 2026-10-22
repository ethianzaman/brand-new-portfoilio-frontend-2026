"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

// Error boundary for the dashboard route group.
//
// `requireSession()` throws when the session is valid but the account is not
// allowed in the CMS (disabled / no role), or when the backend cannot be
// reached. Those are not "logged out" situations, so the user stays signed
// in and gets a clear explanation plus a retry button.
//
// A missing/expired session never reaches this boundary — it is redirected to
// /login by the guard.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertTriangle className="size-6" />
        </span>

        <h1 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {error.message ||
            "The dashboard could not be loaded. Please try again."}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="size-4" />
            Try again
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">Back to site</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
