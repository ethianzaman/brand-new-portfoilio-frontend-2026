"use client";

import { useQuery } from "@tanstack/react-query";

import { MESSAGES_QUERY_KEY } from "@/app/components/dashboard/useMessageNotifications";
import { dashboardGetInboxStats } from "@/lib/services/message.service";
import type { InboxStats } from "@/lib/types/message";

/**
 * Live inbox numbers. The key sits under "messages", so the same stream that
 * updates the bell refreshes these too. Days are counted in the visitor's own
 * time zone, which the server render does not know: its numbers stand in until
 * the browser's answer arrives, and only `days` depends on that answer.
 */
export function useInboxStats(initial: InboxStats | null | undefined) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const query = useQuery({
    queryKey: [...MESSAGES_QUERY_KEY, "stats", timeZone],
    queryFn: () => dashboardGetInboxStats(timeZone),
    placeholderData: initial ?? undefined,
    enabled: initial !== undefined,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });

  return {
    stats: query.data ?? null,
    daysReady: Boolean(query.data) && !query.isPlaceholderData,
    failed: query.isError,
  };
}
