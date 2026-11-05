"use client";

import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import type { Experience } from "@/lib/types/about";
import { cn } from "@/lib/utils";
import { AboutSection, PERIOD_BADGE_CLASS, ROW_CLASS, RowActions, type TableProps } from "./AboutSection";

const COLUMNS = [
  { label: "Role", span: "col-span-3" },
  { label: "Company", span: "col-span-3" },
  { label: "Period", span: "col-span-2" },
  { label: "Tags", span: "col-span-3" },
  { label: "Actions", span: "col-span-1 text-right" },
];

export function ExperienceTable({ items, onAdd, onOpen, onEdit, onDelete }: TableProps<Experience>) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (e) =>
        e.role.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [items, search]);

  return (
    <AboutSection
      icon={Briefcase}
      title="Work Experience"
      color="#6366f1"
      addLabel="Add Experience"
      onAdd={onAdd}
      searchPlaceholder="Search by role, company or tag..."
      search={search}
      onSearch={setSearch}
      columns={COLUMNS}
      emptyLabel="No experience found"
      total={items.length}
      shown={filtered.length}
    >
      {filtered.map((exp) => (
        <div key={exp._id?.toString()} onClick={() => onOpen(exp)} className={ROW_CLASS}>
          <div className="col-span-3 flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                exp.current ? "animate-pulse bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600",
              )}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{exp.role}</p>
              {exp.current && <span className="text-xs font-medium text-indigo-500">Current</span>}
            </div>
          </div>

          <div className="col-span-3">
            <p className="truncate text-sm text-zinc-700 dark:text-zinc-300">{exp.company}</p>
            <p className="text-xs text-zinc-400">{exp.type}</p>
          </div>

          <div className="col-span-2">
            <span className={PERIOD_BADGE_CLASS}>{exp.period}</span>
          </div>

          <div className="col-span-3 flex flex-wrap gap-1">
            {exp.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
            {exp.tags.length > 2 && (
              <span className="text-xs text-zinc-400">+{exp.tags.length - 2}</span>
            )}
          </div>

          <RowActions className="col-span-1" onEdit={() => onEdit(exp)} onDelete={() => onDelete(exp)} />
        </div>
      ))}
    </AboutSection>
  );
}
