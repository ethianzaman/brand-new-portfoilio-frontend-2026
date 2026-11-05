import type { ComponentType } from "react";
import {
  Code2,
  Database,
  Globe,
  Terminal,
  Cpu,
  Smartphone,
  Layers,
} from "lucide-react";
import Reveal from "@/app/components/motion/Reveal";
import SpotlightCard from "@/app/components/motion/SpotlightCard";
import type { SkillCategory } from "@/lib/types/skill";

const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  frontend: Globe,
  backend: Code2,
  database: Database,
  devops: Terminal,
  mobile: Smartphone,
  "big data": Cpu,
};

export default function HeroSkills({
  categories,
}: {
  categories: SkillCategory[];
}) {
  const activeSkillCategories = categories.filter(
    (cat) => cat.skills && cat.skills.length > 0,
  );
  const allSkillNames = activeSkillCategories.flatMap((c) =>
    c.skills.map((s) => s.name),
  );

  return (
    <>
      {allSkillNames.length > 0 && (
        <div
          aria-hidden
          className="overflow-hidden border-b border-zinc-100 py-5 mask-[linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] dark:border-zinc-800"
        >
          <div className="animate-marquee flex w-max gap-3">
            {[...allSkillNames, ...allSkillNames].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <Reveal className="mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Toolbox
          </p>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
            What I work with
          </h2>
          <p className="max-w-xl text-zinc-500 dark:text-zinc-400">
            Technologies and tools I use to bring ideas to life.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {activeSkillCategories.map((category, i) => {
            const Icon = categoryIcons[category.label.toLowerCase()] ?? Layers;
            return (
              <Reveal key={category.id || category.label} delay={(i % 3) * 90}>
                <SpotlightCard className="h-full rounded-2xl border border-zinc-200 bg-white p-6 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 dark:bg-indigo-950 dark:text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {category.label}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skillItem, idx) => (
                      <span
                        key={`${category.id}-${skillItem.name}-${idx}`}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
                      >
                        {skillItem.name}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
