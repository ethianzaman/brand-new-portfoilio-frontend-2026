import "server-only";

import { publicFetch } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEMO_SKILLS } from "@/lib/data/skills.demo";
import type { Skill, SkillCategory } from "@/lib/types/skill";

type SkillsApiResponse = {
  categories: Array<{
    id?: string;
    _id?: string;
    label: string;
    skills: Skill[];
  }>;
};

function normalizeSkills(data: SkillsApiResponse): SkillCategory[] {
  return data.categories.map((category) => ({
    id: category.id ?? category._id ?? "",
    label: category.label,
    skills: category.skills,
  }));
}

/**
 * PUBLIC skills — rendered by both `/skills` and the home page.
 *
 * Same one-file pattern as `lib/api/hero.ts`. Keeping this off
 * `cache: "no-store"` is what allows the home page to stay statically
 * prerendered instead of degrading to a per-request render.
 */
export async function getSkills(): Promise<SkillCategory[]> {
  const data = await publicFetch<SkillsApiResponse>("/skills", {
    tag: TAGS.skills,
    fallback: { categories: DEMO_SKILLS },
  });
  return normalizeSkills(data);
}
