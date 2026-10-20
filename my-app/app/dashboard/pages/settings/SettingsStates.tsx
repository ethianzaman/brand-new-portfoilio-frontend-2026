"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared loading state for the Global Settings cards. */
export function SettingsSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading settings"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-[70px] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-[70px] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="h-[120px] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-10 w-40 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

/** Shared error state for the Global Settings cards. */
export function SettingsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
        <AlertCircle className="h-4 w-4" />
        Could not load settings
      </div>
      <p className="text-xs text-red-600/80 dark:text-red-400/80">
        {message || "The settings API is unavailable right now."}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}
