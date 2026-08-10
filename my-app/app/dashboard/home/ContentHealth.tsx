import {
  Home,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  MessageCircleQuestion,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { SectionCard } from "./SectionCard";

type Props = {
  hasHero: boolean;
  experiences: number;
  educations: number;
  values: number;
  faqs: number;
  posts: number;
};

export function ContentHealth({ hasHero, experiences, educations, values, faqs, posts }: Props) {
  const items = [
    { label: "Hero section", status: hasHero, icon: Home, to: "/dashboard/pages/about" },
    { label: "Experiences", count: experiences, icon: Briefcase, to: "/dashboard/pages/about" },
    { label: "Educations", count: educations, icon: GraduationCap, to: "/dashboard/pages/about" },
    { label: "Values", count: values, icon: HeartHandshake, to: "/dashboard/pages/about" },
    { label: "Blog posts", count: posts, icon: FileText, to: "/dashboard/pages/blog" },
    { label: "FAQs", count: faqs, icon: MessageCircleQuestion, to: "/dashboard/pages/contact" },
  ];

  return (
    <SectionCard
      icon={LayoutDashboard}
      title="Content Health"
      subtitle="Portfolio completion at a glance"
    >
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.to}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </div>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {item.label}
              </span>
              <span className="ml-auto">
                {"count" in item ? (
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {item.count}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.status
                        ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.status ? "Complete" : "Missing"}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}