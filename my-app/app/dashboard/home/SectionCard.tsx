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
    <div className="h-full flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate leading-tight">
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="ml-auto shrink-0">{right}</div>}
      </div>
      <div className="p-4 flex-1 flex flex-col">{children}</div>
    </div>
  );
}
