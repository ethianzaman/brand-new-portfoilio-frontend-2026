import { FileText, Star, Send, PenLine, Sparkles } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { BlogPost } from "@/lib/types/blog";

const CATEGORY_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#ef4444",
  "#84cc16",
];

type Props = {
  posts: BlogPost[];
};

export function BlogAnalytics({ posts }: Props) {
  const total = posts.length;
  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const featured = posts.filter((p) => p.featured).length;

  const categoryCounts: Record<string, number> = {};
  for (const p of posts) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }
  const categories = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const maxCategory = Math.max(1, ...categories.map(([, count]) => count));

  const stats = [
    {
      key: "published",
      label: "Published",
      value: published.length,
      icon: Send,
      tile: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "drafts",
      label: "Drafts",
      value: drafts.length,
      icon: PenLine,
      tile: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    },
    {
      key: "featured",
      label: "Featured",
      value: featured,
      icon: Star,
      tile: "bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <SectionCard
      icon={FileText}
      title="Blog Analytics"
      subtitle="Posts, drafts & categories"
      right={
        total > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            {total} total
          </span>
        )
      }
    >
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No blog posts yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Add posts to see blog analytics here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map(({ key, label, value, icon: Icon, tile }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-2.5 sm:p-3 text-center"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tile}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white leading-tight tabular-nums">
                    {value}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Category bars */}
          <div className="flex flex-col gap-3">
            {categories.map(([category, count], i) => (
              <div key={category} className="flex items-center gap-3">
                <span className="w-16 sm:w-20 shrink-0 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {category}
                </span>
                <div className="flex-1 min-w-0 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(count / maxCategory) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                  {count}
                </span>
                <span className="hidden sm:block w-10 shrink-0 text-right text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                  {Math.round((count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}