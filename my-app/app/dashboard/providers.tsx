"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

/**
 * Dashboard data layer.
 *
 * Dashboard reads are always `cache: "no-store"` on the wire (they bypass the
 * public ISR cache), so TanStack Query owns caching, retry and staleness here.
 */
const queryDefaults: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    // Exponential backoff: 1s, 2s, 4s (capped) — never give up instantly on a
    // flaky backend restart.
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  },
  mutations: {
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  },
};

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  // One client per browser session, created lazily in useState so React Strict
  // Mode double-render doesn't discard the cache.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: queryDefaults }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
