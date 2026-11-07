"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { ImageListField } from "@/app/components/dashboard/ImageListField";
import { FormSelect } from "@/app/components/dashboard/FormSelect";
import type { ImageItem } from "@/lib/media";
import type { ProjectStatus } from "@/lib/types/project";
import { cn } from "@/lib/utils";

/** Must match the backend limit. */
export const MAX_SCREENSHOTS = 8;

export interface CaseStudyValue {
  goal: string;
  /** One feature per line while editing. */
  features: string;
  approach: string;
  challenges: string;
  outcome: string;
  role: string;
  year: string;
  status: ProjectStatus;
  /** Screenshots, in order: saved ones and files waiting to upload. */
  gallery: ImageItem[];
}

const inputCls = cn(
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900",
  "placeholder:text-zinc-400 transition-colors",
  "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500",
  "dark:border-zinc-700 dark:bg-zinc-800 dark:text-white",
);
const STATUS_DOTS: Record<Exclude<ProjectStatus, "">, string> = {
  live: "bg-emerald-500",
  "in-progress": "bg-amber-500",
  archived: "bg-zinc-400",
};

const labelCls = "text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400";

const TEXT_SECTIONS: { key: "goal" | "approach" | "challenges" | "outcome"; label: string; placeholder: string }[] = [
  { key: "goal", label: "The goal", placeholder: "Why you built it and the problem it solves..." },
  { key: "approach", label: "How it's built", placeholder: "Architecture, the tools you chose and why..." },
  { key: "challenges", label: "Challenges & solutions", placeholder: "What was hard, and how you solved it..." },
  { key: "outcome", label: "Outcome", placeholder: "Results, numbers, what you learned..." },
];

interface Props {
  value: CaseStudyValue;
  onChange: (value: CaseStudyValue) => void;
  statusLabels: Record<Exclude<ProjectStatus, "">, string>;
}

/** The detail page's article. Every field is optional: empty ones stay hidden. */
export function CaseStudyFields({ value, onChange, statusLabels }: Props) {
  // Starts closed; the form stays short until the case study is wanted.
  const [open, setOpen] = useState(false);
  const set = <K extends keyof CaseStudyValue>(key: K, next: CaseStudyValue[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <BookOpen className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-zinc-900 dark:text-white">Case study</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              The story on the project&apos;s page. Empty sections are hidden.
            </span>
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-zinc-200 p-4 dark:border-zinc-700">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cs-role" className={labelCls}>My role</label>
              <input
                id="cs-role"
                maxLength={80}
                placeholder="Full-stack developer"
                value={value.role}
                onChange={(e) => set("role", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cs-year" className={labelCls}>Year</label>
              <input
                id="cs-year"
                maxLength={20}
                placeholder="2025"
                value={value.year}
                onChange={(e) => set("year", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cs-status" className={labelCls}>Status</label>
              <FormSelect
                id="cs-status"
                value={value.status}
                onChange={(next) => set("status", next as ProjectStatus)}
                options={[
                  { value: "", label: "Not shown" },
                  ...Object.entries(statusLabels).map(([key, label]) => ({
                    value: key,
                    label,
                    dot: STATUS_DOTS[key as Exclude<ProjectStatus, "">],
                  })),
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cs-goal" className={labelCls}>{TEXT_SECTIONS[0].label}</label>
            <textarea
              id="cs-goal"
              rows={3}
              maxLength={5000}
              placeholder={TEXT_SECTIONS[0].placeholder}
              value={value.goal}
              onChange={(e) => set("goal", e.target.value)}
              className={cn(inputCls, "resize-y")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cs-features" className={labelCls}>
              Key features
              <span className="ml-1 font-normal normal-case text-zinc-400">(one per line)</span>
            </label>
            <textarea
              id="cs-features"
              rows={4}
              placeholder={"Room search with filters\nStripe payments\nAdmin dashboard"}
              value={value.features}
              onChange={(e) => set("features", e.target.value)}
              className={cn(inputCls, "resize-y")}
            />
          </div>

          {TEXT_SECTIONS.slice(1).map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label htmlFor={`cs-${key}`} className={labelCls}>{label}</label>
              <textarea
                id={`cs-${key}`}
                rows={3}
                maxLength={5000}
                placeholder={placeholder}
                value={value[key]}
                onChange={(e) => set(key, e.target.value)}
                className={cn(inputCls, "resize-y")}
              />
            </div>
          ))}

          <ImageListField
            id="cs-gallery"
            label="Screenshots"
            hint="Shown in the Screenshots section of the project page."
            items={value.gallery}
            onChange={(gallery) => set("gallery", gallery)}
            max={MAX_SCREENSHOTS}
          />
        </div>
      )}
    </div>
  );
}
