import {
  FolderKanban,
  BriefcaseBusiness,
  Briefcase,
  Star,
  GraduationCap,
  BadgeCheck,
  MessageCircleQuestion,
  FileText,
  LucideIcon,
} from "lucide-react";

type StatItem = {
  key: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  to?: string;
};

const COLOR_MAP: Record<string, string> = {
  indigo: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  violet: "bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
  sky: "bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400",
  pink: "bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400",
  cyan: "bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
  rose: "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400",
};

type Props = {
  projects: number;
  featured: number;
  skills: number;
  services: number;
  experiences: number;
  educations: number;
  faqs: number;
  posts: number;
};

export function OverviewStats({
  projects,
  featured,
  skills,
  services,
  experiences,
  educations,
  faqs,
  posts,
}: Props) {
  const stats: StatItem[] = [
    { key: "projects", label: "Total Projects", value: projects, icon: FolderKanban, color: "indigo", to: "/dashboard/pages/projects" },
    { key: "skills", label: "Total Skills", value: skills, icon: BadgeCheck, color: "green", to: "/dashboard/pages/skills" },
    { key: "services", label: "Services", value: services, icon: BriefcaseBusiness, color: "violet", to: "/dashboard/pages/services" },
    { key: "posts", label: "Blog Posts", value: posts, icon: FileText, color: "cyan", to: "/dashboard/pages/blog" },
    { key: "featured", label: "Featured Projects", value: featured, icon: Star, color: "amber", to: "/dashboard/pages/projects" },
    { key: "experiences", label: "Experiences", value: experiences, icon: Briefcase, color: "sky", to: "/dashboard/pages/about" },
    { key: "educations", label: "Educations", value: educations, icon: GraduationCap, color: "pink", to: "/dashboard/pages/about" },
    { key: "faqs", label: "FAQs", value: faqs, icon: MessageCircleQuestion, color: "rose", to: "/dashboard/pages/contact" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {stats.map(({ key, label, value, icon: Icon, color, to }) => (
        <a
          key={key}
          href={to}
          className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${COLOR_MAP[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {value}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {label}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}