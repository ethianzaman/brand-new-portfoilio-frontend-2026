"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Public-route error boundary.
 *
 * `publicFetch` only throws when there is no cached payload at all AND we are
 * not building. In that case Next.js usually serves the previous ISR copy, so
 * this boundary is the last resort — never a blank page.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] route error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
          <TriangleAlert className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            We couldn&apos;t load this page
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The content service didn&apos;t respond in time. Please try again.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">Go home</Link>
          </Button>
        </div>

        {error.digest ? (
          <p className="text-[11px] text-zinc-300 dark:text-zinc-700">
            ref: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
