import { PieChart } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Expandable } from "./Expandable";
import { SkillCategory } from "@/lib/types/skill";

const DONUT_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#ef4444",
  "#84cc16",
];

type Slice = {
  label: string;
  count: number;
  color: string;
};

export function SkillsDonut({ categories }: { categories: SkillCategory[] }) {
  const total = categories.reduce((sum, c) => sum + c.skills.length, 0);

  const slices: Slice[] = categories
    .map((c, i) => ({
      label: c.label,
      count: c.skills.length,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }))
    .filter((s) => s.count > 0);

  const R = 54;
  const CIRC = 2 * Math.PI * R;

  const segments = slices.reduce<
    Array<Slice & { dash: number; offset: number }>
  >((acc, s) => {
    const frac = s.count / Math.max(1, total);
    const offset =
      acc.length === 0 ? 0 : acc[acc.length - 1].offset + acc[acc.length - 1].dash;
    acc.push({ ...s, dash: frac * CIRC, offset });
    return acc;
  }, []);

  const top = [...slices].sort((a, b) => b.count - a.count)[0];

  return (
    <SectionCard
      icon={PieChart}
      title="Skills Distribution"
      subtitle="Breakdown by skill category"
      right={
        total > 0 && (
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {total} total
          </span>
        )
      }
    >
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No skills yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Add skills to see distribution analytics here
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Donut */}
          <div className="relative w-32 h-32 shrink-0">
            <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={R}
                fill="none"
                strokeWidth="13"
                className="stroke-zinc-100 dark:stroke-zinc-800"
              />
              {segments.map((s, i) => (
                <circle
                  key={i}
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  strokeWidth="13"
                  stroke={s.color}
                  strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
                  strokeDashoffset={-s.offset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                {total}
              </span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                Skills
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full min-w-0">
            <Expandable collapsedHeight={152}>
              <div className="flex flex-col gap-1.5">
                {slices.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 px-2.5 py-1.5"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                      {s.label}
                    </span>
                    <span className="ml-auto text-xs font-semibold text-zinc-900 dark:text-white tabular-nums">
                      {s.count}
                    </span>
                    <span className="w-8 text-right text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                      {Math.round((s.count / total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </Expandable>
            {top && (
              <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                Most skills in{" "}
                <span className="font-medium text-zinc-600 dark:text-zinc-300">
                  {top.label}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}