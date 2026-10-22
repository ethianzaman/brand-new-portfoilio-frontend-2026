import { FolderKanban, Star, ArrowRight } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Project } from "@/lib/types/project";

export function RecentProjects({ projects }: { projects: Project[] }) {
  const recent = projects.slice(0, 5);

  return (
    <SectionCard
      icon={FolderKanban}
      title="Recent Projects"
      subtitle="Latest entries in your portfolio"
      right={
        <a
          href="/dashboard/pages/projects"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          View all <ArrowRight className="w-3 h-3" />
        </a>
      }
    >
      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No projects yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Create your first project to get started
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {recent.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 px-2.5 py-2 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800/60"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${p.color}1a` }}
              >
                <FolderKanban className="w-3.5 h-3.5" style={{ color: p.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                  {p.title}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate capitalize">
                  {p.category} {p.featured && "· Featured"}
                </p>
              </div>
              {p.featured && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  <Star className="w-2.5 h-2.5 fill-current" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}