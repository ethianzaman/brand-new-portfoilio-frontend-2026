"use client";

import { ArrowRight, CheckCircle2, ListChecks, TriangleAlert } from "lucide-react";

import type { Section } from "@/lib/services/dashboard-home.service";
import type { InboxStats } from "@/lib/types/message";
import { Expandable } from "./Expandable";
import type { AttentionItem } from "./health";
import { SectionCard } from "./SectionCard";
import { useInboxStats } from "./useInboxStats";

export function NeedsAttention({
  items,
  inbox,
}: {
  items: AttentionItem[];
  inbox: Section<InboxStats>;
}) {
  const { stats } = useInboxStats(inbox);
  const waiting = stats?.awaitingReply ?? 0;

  const all: AttentionItem[] = [
    ...(waiting > 0
      ? [
          {
            key: "awaiting-reply",
            label: `${waiting} ${waiting === 1 ? "message" : "messages"} awaiting reply`,
            detail: "Open inbox",
            to: "/dashboard/pages/messages",
          },
        ]
      : []),
    ...items,
  ];

  return (
    <SectionCard
      icon={ListChecks}
      title="Needs attention"
      subtitle="What to do next"
      right={
        all.length > 0 && (
          <span className="text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
            {all.length}
          </span>
        )
      }
    >
      {all.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Nothing needs you right now
          </p>
        </div>
      ) : (
        <Expandable collapsedHeight={268}>
          <ul className="flex flex-col gap-1">
            {all.map((item) => (
              <li key={item.key}>
                <a
                  href={item.to}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span className="min-w-0 flex-1 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {item.label}
                  </span>
                  <span className="hidden shrink-0 text-[11px] text-zinc-400 sm:inline dark:text-zinc-500">
                    {item.detail}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-500 dark:text-zinc-600" />
                </a>
              </li>
            ))}
          </ul>
        </Expandable>
      )}
    </SectionCard>
  );
}
