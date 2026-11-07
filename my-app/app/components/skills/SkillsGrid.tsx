"use client";

import { useMemo } from "react";
import { SearchX } from "lucide-react";
import {
  CategoryFilter,
  setCategoryParam,
  useCategoryParam,
} from "@/app/components/CategoryFilter";
import Reveal from "@/app/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import type { Skill, SkillCategory } from "@/lib/types/skill";
import { SkillCard } from "./SkillCard";

/** The label reads well in a shared link, and the API keeps labels unique. */
const toValue = (label: string) => label.trim().toLowerCase();

/** A skill listed under two categories appears once. */
function uniqueByName(skills: Skill[]) {
  const seen = new Set<string>();
  return skills.filter(({ name }) => {
    const key = name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function SkillsGrid({ categories }: { categories: SkillCategory[] }) {
  const filled = useMemo(
    () => categories.filter((category) => category.skills.length > 0),
    [categories],
  );
  const options = useMemo(
    () =>
      filled.map(({ label, skills }) => ({
        value: toValue(label),
        label,
        count: uniqueByName(skills).length,
      })),
    [filled],
  );
  const allSkills = useMemo(
    () => uniqueByName(filled.flatMap((category) => category.skills)),
    [filled],
  );

  const urlCategory = useCategoryParam();
  const selected = filled.find((category) => toValue(category.label) === urlCategory);
  const skills = selected ? uniqueByName(selected.skills) : allSkills;

  return (
    <div className="flex flex-col gap-8">
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          options={options}
          value={selected ? toValue(selected.label) : null}
        />

        <p
          aria-live="polite"
          className="flex min-h-5 items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400"
        >
          <span>
            {skills.length} skill{skills.length !== 1 ? "s" : ""}
            {selected && (
              <>
                {" in "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  {selected.label}
                </span>
              </>
            )}
          </span>
        </p>
      </Reveal>

      {skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-20 text-zinc-400 dark:border-zinc-700">
          <SearchX className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No skills found
          </p>
          {selected && (
            <Button variant="outline" size="sm" onClick={() => setCategoryParam(null)}>
              Show all skills
            </Button>
          )}
        </div>
      ) : (
        <Reveal
          // A new key replays the entrance when the category changes.
          key={selected?.id ?? "all"}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
        >
          {skills.map((skill) => (
            <SkillCard key={skill.name} name={skill.name} icon={skill.icon} />
          ))}
        </Reveal>
      )}
    </div>
  );
}
