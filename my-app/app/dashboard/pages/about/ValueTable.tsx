"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import type { Value } from "@/lib/types/about";
import { AboutSection, ROW_CLASS, RowActions, type TableProps } from "./AboutSection";

const COLUMNS = [
  { label: "Icon", span: "col-span-2" },
  { label: "Title", span: "col-span-3" },
  { label: "Description", span: "col-span-6" },
  { label: "Actions", span: "col-span-1 text-right" },
];

export function ValueTable({ items, onAdd, onOpen, onEdit, onDelete }: TableProps<Value>) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (v) => v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <AboutSection
      icon={Heart}
      title="Values / How I Work"
      color="#f59e0b"
      addLabel="Add Value"
      onAdd={onAdd}
      searchPlaceholder="Search values..."
      search={search}
      onSearch={setSearch}
      columns={COLUMNS}
      emptyLabel="No values found"
      total={items.length}
      shown={filtered.length}
    >
      {filtered.map((val) => (
        <div key={val._id?.toString()} onClick={() => onOpen(val)} className={ROW_CLASS}>
          <div className="col-span-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {val.icon.slice(0, 2)}
              </span>
            </div>
          </div>

          <div className="col-span-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{val.title}</p>
          </div>

          <div className="col-span-6">
            <p className="line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">{val.desc}</p>
          </div>

          <RowActions className="col-span-1" onEdit={() => onEdit(val)} onDelete={() => onDelete(val)} />
        </div>
      ))}
    </AboutSection>
  );
}
