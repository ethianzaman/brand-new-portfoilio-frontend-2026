"use client";

import type { ElementType, ReactNode } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { cn } from "@/lib/utils";

interface Column {
  label: string;
  /** Tailwind grid span. Kept whole so the class stays visible to Tailwind. */
  span: string;
}

interface Props {
  icon: ElementType;
  title: string;
  color: string;
  addLabel: string;
  onAdd: () => void;
  searchPlaceholder: string;
  search: string;
  onSearch: (value: string) => void;
  columns: Column[];
  emptyLabel: string;
  total: number;
  shown: number;
  children: ReactNode;
}

/** The card, search box and table frame shared by the lists on the About page. */
export function AboutSection({
  icon: Icon,
  title,
  color,
  addLabel,
  onAdd,
  searchPlaceholder,
  search,
  onSearch,
  columns,
  emptyLabel,
  total,
  shown,
  children,
}: Props) {
  const { can } = useCurrentUser();

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {total} {total === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>
        {can("about.create") && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        )}
      </div>

      <div className="px-5 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pr-4 pl-10 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-180">
          <div className="mt-3 grid grid-cols-12 gap-4 border-y border-zinc-100 bg-zinc-50 px-5 py-3 text-xs font-bold tracking-wider text-zinc-500 uppercase dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
            {columns.map(({ label, span }) => (
              <div key={label} className={span}>
                {label}
              </div>
            ))}
          </div>

          {shown === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-400">
              <Icon className="h-8 w-8 opacity-20" />
              <p className="text-sm">{emptyLabel}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
        <p className="text-xs text-zinc-400">
          {shown} of {total} entries
        </p>
      </div>
    </div>
  );
}

export const ROW_CLASS =
  "grid cursor-pointer grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40";

/** Edit and delete buttons for a row. A click here doesn't open the row. */
export function RowActions({
  className,
  onEdit,
  onDelete,
}: {
  className: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { can } = useCurrentUser();

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {can("about.edit") && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-amber-50 hover:text-amber-600 dark:text-zinc-400 dark:hover:bg-amber-950 dark:hover:text-amber-400"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {can("about.delete") && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export const PERIOD_BADGE_CLASS =
  "rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";

/** Shape every About table's props share. */
export interface TableProps<T> {
  items: T[];
  onAdd: () => void;
  onOpen: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}
