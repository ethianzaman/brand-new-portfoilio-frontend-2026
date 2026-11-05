import type { LucideIcon } from "lucide-react";

import { chartColor } from "./chart-colors";
import { Expandable } from "./Expandable";
import { SectionCard } from "./SectionCard";

export interface BreakdownRow {
  label: string;
  count: number;
  /** Defaults to the next chart colour. */
  color?: string;
}

/** Ranked bars. A row's colour comes from its place in `rows`, not its rank. */
export function BarList({ rows }: { rows: BreakdownRow[] }) {
  const sorted = rows
    .map((row, index) => ({ ...row, color: row.color ?? chartColor(index) }))
    .sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...sorted.map((r) => r.count));
  const total = sorted.reduce((sum, r) => sum + r.count, 0);

  return (
    <Expandable collapsedHeight={196}>
      <ul className="flex flex-col gap-2.5">
        {sorted.map(({ label, count, color }) => (
          <li
            key={label}
            title={`${label}: ${count} of ${total}`}
            className="flex flex-col gap-1"
          >
            <span className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                {label}
              </span>
              <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                <strong className="font-semibold text-zinc-900 dark:text-white">
                  {count}
                </strong>{" "}
                · {Math.round((count / Math.max(1, total)) * 100)}%
              </span>
            </span>
            <span className="block h-1.5 rounded-r-[4px] bg-zinc-100 dark:bg-zinc-800">
              <span
                className="block h-full rounded-r-[4px]"
                style={{ width: `${(count / max) * 100}%`, backgroundColor: color }}
              />
            </span>
          </li>
        ))}
      </ul>
    </Expandable>
  );
}

export function BreakdownCard({
  icon,
  title,
  subtitle,
  rows,
  empty,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** `null` means the data could not be read. */
  rows: BreakdownRow[] | null;
  empty: string;
}) {
  return (
    <SectionCard icon={icon} title={title} subtitle={subtitle}>
      {rows === null ? (
        <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Could not load
        </p>
      ) : rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {empty}
        </p>
      ) : (
        <BarList rows={rows} />
      )}
    </SectionCard>
  );
}
