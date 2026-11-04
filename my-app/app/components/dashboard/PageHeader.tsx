import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

/**
 * Shared dashboard page header: icon tile + title + one-line description.
 *
 * Kept in one place so every CMS screen has identical spacing and colors.
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  className,
}: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  );
}
