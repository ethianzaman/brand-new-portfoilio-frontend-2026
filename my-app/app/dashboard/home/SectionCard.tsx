import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionCard({ icon: Icon, title, subtitle, right, children }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="ml-auto shrink-0">{right}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}