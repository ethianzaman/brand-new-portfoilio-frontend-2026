"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import type { Education } from "@/lib/types/about";
import { AboutSection, PERIOD_BADGE_CLASS, ROW_CLASS, RowActions, type TableProps } from "./AboutSection";

const COLUMNS = [
  { label: "Degree", span: "col-span-4" },
  { label: "School", span: "col-span-4" },
  { label: "Period", span: "col-span-2" },
  { label: "Actions", span: "col-span-2 text-right" },
];

export function EducationTable({ items, onAdd, onOpen, onEdit, onDelete }: TableProps<Education>) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (e) => e.degree.toLowerCase().includes(q) || e.school.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <AboutSection
      icon={GraduationCap}
      title="Education"
      color="#10b981"
      addLabel="Add Education"
      onAdd={onAdd}
      searchPlaceholder="Search by degree or school..."
      search={search}
      onSearch={setSearch}
      columns={COLUMNS}
      emptyLabel="No education found"
      total={items.length}
      shown={filtered.length}
    >
      {filtered.map((edu) => (
        <div key={edu._id?.toString()} onClick={() => onOpen(edu)} className={ROW_CLASS}>
          <div className="col-span-4 min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{edu.degree}</p>
            {edu.grade && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-950/40 dark:text-green-400">
                {edu.grade}
              </span>
            )}
          </div>

          <div className="col-span-4 min-w-0">
            <p className="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">{edu.school}</p>
          </div>

          <div className="col-span-2">
            <span className={PERIOD_BADGE_CLASS}>{edu.period}</span>
          </div>

          <RowActions className="col-span-2" onEdit={() => onEdit(edu)} onDelete={() => onDelete(edu)} />
        </div>
      ))}
    </AboutSection>
  );
}
