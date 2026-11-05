"use client";

import { useState, type KeyboardEvent } from "react";
import { BarChart3 } from "lucide-react";

import type { Section } from "@/lib/services/dashboard-home.service";
import type { InboxStats } from "@/lib/types/message";
import { cn } from "@/lib/utils";
import { chartColor } from "./chart-colors";
import { SectionCard } from "./SectionCard";
import { useInboxStats } from "./useInboxStats";

const CHART_HEIGHT = 224;

/** `days` are calendar dates, so they are formatted without shifting zones. */
function formatDay(date: string, withWeekday = false): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(withWeekday ? { weekday: "short" } : {}),
  }).format(new Date(`${date}T00:00:00Z`));
}

const plural = (count: number) => `${count} ${count === 1 ? "message" : "messages"}`;

export function InboxTrend({ inbox }: { inbox: Section<InboxStats> }) {
  const { stats, daysReady, failed } = useInboxStats(inbox);
  const [active, setActive] = useState<number | null>(null);

  const days = daysReady && stats ? stats.days : [];
  const current = days.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...days.map((d) => d.count));
  const change = stats ? current - stats.previous30 : 0;
  const focused = active !== null ? days[active] : undefined;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    setActive((prev) =>
      Math.min(days.length - 1, Math.max(0, (prev ?? days.length) + step)),
    );
  }

  return (
    <SectionCard
      icon={BarChart3}
      title="Messages received"
      subtitle="Contact form, last 30 days"
    >
      {!stats || (failed && !daysReady) ? (
        <p className="flex flex-1 items-center justify-center py-10 text-sm text-zinc-500 dark:text-zinc-400">
          Could not load the message history.
        </p>
      ) : !daysReady ? (
        <div
          aria-label="Loading message history"
          className="flex-1 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
          style={{ minHeight: CHART_HEIGHT + 56 }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
              {current}
            </span>
            {current === 1 ? "message" : "messages"}
            <span className="text-xs">
              {change === 0
                ? "· same as the previous 30 days"
                : `· ${change > 0 ? "+" : ""}${change} vs the previous 30 days`}
            </span>
          </p>

          {current === 0 ? (
            <p className="flex items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No messages in the last 30 days
            </p>
          ) : (
            <div>
              <div className="relative">
                {/* The top line is the busiest day, so the bars have a scale. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                  <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  {max}
                </div>

                <div
                  role="img"
                  tabIndex={0}
                  aria-label={`${plural(current)} in the last 30 days. Use the left and right arrow keys to read each day.`}
                  onKeyDown={onKeyDown}
                  onBlur={() => setActive(null)}
                  onPointerLeave={() => setActive(null)}
                  className="flex items-end rounded-sm border-b border-zinc-200 pr-5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700"
                  style={{ height: CHART_HEIGHT }}
                >
                  {days.map((day, i) => (
                    <div
                      key={day.date}
                      data-count={day.count}
                      onPointerEnter={() => setActive(i)}
                      className="flex h-full min-w-0 flex-1 items-end justify-center px-px"
                    >
                      {day.count > 0 && (
                        <div
                          className={cn(
                            "w-full max-w-6 rounded-t-[4px] transition-opacity",
                            active !== null && active !== i && "opacity-40",
                          )}
                          style={{
                            backgroundColor: chartColor(i),
                            height: `${Math.max(4, (day.count / max) * (CHART_HEIGHT - 18))}px`,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-1.5 flex h-4 items-center justify-between pr-5 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                <span>{formatDay(days[0].date)}</span>
                <span>{formatDay(days[days.length - 1].date)}</span>
                {focused && (
                  <span
                    role="status"
                    className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-medium text-zinc-700 dark:text-zinc-200"
                  >
                    <strong className="font-bold">{focused.count}</strong>{" "}
                    {focused.count === 1 ? "message" : "messages"} · {formatDay(focused.date, true)}
                  </span>
                )}
              </div>

              <table className="sr-only">
                <caption>Messages received per day</caption>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day.date}>
                      <td>{formatDay(day.date)}</td>
                      <td>{day.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
