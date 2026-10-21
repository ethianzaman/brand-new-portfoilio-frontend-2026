import { BarChart3 } from "lucide-react";
import { SectionCard } from "./SectionCard";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  fullstack: { label: "Full-Stack", color: "#6366f1" },
  frontend: { label: "Frontend", color: "#f59e0b" },
  backend: { label: "Backend", color: "#ef4444" },
  mobile: { label: "Mobile", color: "#ec4899" },
  devops: { label: "DevOps", color: "#06b6d4" },
  ai: { label: "AI", color: "#10b981" },
};

type Props = {
  counts: Record<string, number>;
  total: number;
};

export function ProjectsChart({ counts, total }: Props) {
  const series = Object.entries(CATEGORY_META)
    .map(([key, meta]) => ({
      key,
      ...meta,
      count: counts[key] ?? 0,
    }))
    .filter((d) => d.count > 0);

  const max = Math.max(1, ...series.map((d) => d.count));

  return (
    <SectionCard
      icon={BarChart3}
      title="Projects by Category"
      subtitle="Distribution of your portfolio projects"
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
            No projects yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Add projects to see category analytics here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {series.map(({ key, label, color, count }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 px-3 py-2 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800/60"
            >
              <span className="w-14 sm:w-20 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {label}
              </span>
              <div className="flex-1 min-w-0 h-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-700/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(count / max) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className="w-7 shrink-0 text-right text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                {count}
              </span>
              <span className="hidden sm:block w-9 shrink-0 text-right text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                {Math.round((count / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}