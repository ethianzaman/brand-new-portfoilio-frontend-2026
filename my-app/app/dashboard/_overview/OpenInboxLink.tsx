"use client";

import { Inbox } from "lucide-react";

import type { Section } from "@/lib/services/dashboard-home.service";
import type { InboxStats } from "@/lib/types/message";
import { useInboxStats } from "./useInboxStats";

export function OpenInboxLink({ inbox }: { inbox: Section<InboxStats> }) {
  const { stats } = useInboxStats(inbox);
  const unread = stats?.unread ?? 0;

  return (
    <a
      href="/dashboard/pages/messages"
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
    >
      <Inbox className="h-4 w-4" />
      <span className="hidden sm:inline">Open Inbox</span>
      {unread > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold text-white">
          {unread}
        </span>
      )}
    </a>
  );
}
