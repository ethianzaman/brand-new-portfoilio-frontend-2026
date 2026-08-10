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
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No projects yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Create your first project to get started
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${p.color}1a` }}
              >
                <FolderKanban className="w-4 h-4" style={{ color: p.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                  {p.title}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate capitalize">
                  {p.category} {p.featured && "· Featured"}
                </p>
              </div>
              {p.featured && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}