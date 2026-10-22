import {
  FolderKanban,
  BriefcaseBusiness,
  Briefcase,
  Star,
  GraduationCap,
  BadgeCheck,
  MessageCircleQuestion,
  FileText,
  Inbox,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";

type StatItem = {
  key: string;
  label: string;
  value: number | string;
  context: React.ReactNode;
  icon: LucideIcon;
  color: string;
  to: string;
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
  orange: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
};

type Props = {
  projects: number;
  featured: number;
  skills: number;
  skillGroups: number;
  services: number;
  experiences: number;
  educations: number;
  faqs: number;
  posts: number;
  publishedPosts: number;
  messages: number;
  unread: number;
};

export function OverviewStats({
  projects,
  featured,
  skills,
  skillGroups,
  services,
  experiences,
  educations,
  faqs,
  posts,
  publishedPosts,
  messages,
  unread,
}: Props) {
  const stats: StatItem[] = [
    {
      key: "projects",
      label: "Total Projects",
      value: projects,
      context: `${featured} featured`,
      icon: FolderKanban,
      color: "indigo",
      to: "/dashboard/pages/projects",
    },
    {
      key: "skills",
      label: "Total Skills",
      value: skills,
      context: `${skillGroups} categories`,
      icon: BadgeCheck,
      color: "green",
      to: "/dashboard/pages/skills",
    },
    {
      key: "services",
      label: "Services",
      value: services,
      context: "Offered on your site",
      icon: BriefcaseBusiness,
      color: "violet",
      to: "/dashboard/pages/services",
    },
    {
      key: "posts",
      label: "Blog Posts",
      value: posts,
      context: `${publishedPosts} published`,
      icon: FileText,
      color: "cyan",
      to: "/dashboard/pages/blog",
    },
    {
      key: "messages",
      label: "Messages",
      value: messages,
      context:
        unread > 0 ? (
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {unread} unread
          </span>
        ) : (
          "All caught up"
        ),
      icon: Inbox,
      color: "rose",
      to: "/dashboard/pages/messages",
    },
    {
      key: "featured",
      label: "Featured Projects",
      value: featured,
      context: "Homepage spotlight",
      icon: Star,
      color: "amber",
      to: "/dashboard/pages/projects",
    },
    {
      key: "experiences",
      label: "Experiences",
      value: experiences,
      context: "Work history",
      icon: Briefcase,
      color: "sky",
      to: "/dashboard/pages/about",
    },
    {
      key: "educations",
      label: "Educations",
      value: educations,
      context: "Academic background",
      icon: GraduationCap,
      color: "pink",
      to: "/dashboard/pages/about",
    },
    {
      key: "faqs",
      label: "FAQs",
      value: faqs,
      context: "Answered on contact page",
      icon: MessageCircleQuestion,
      color: "orange",
      to: "/dashboard/pages/contact",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
      {stats.map(({ key, label, value, context, icon: Icon, color, to }) => (
        <a
          key={key}
          href={to}
          className="group flex flex-col gap-2.5 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-[0_2px_14px_rgba(99,102,241,0.08)]"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${COLOR_MAP[color]}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
              {label}
            </span>
            <ArrowUpRight className="ml-auto w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-700 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold leading-none text-zinc-900 dark:text-white tabular-nums">
              {value}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
              {context}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
