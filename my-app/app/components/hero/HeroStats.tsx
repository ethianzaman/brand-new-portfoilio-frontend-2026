import CountUp from "@/app/components/motion/CountUp";
import Reveal from "@/app/components/motion/Reveal";
import type { HeroStat } from "@/lib/types/hero";

export default function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="flex flex-col items-center gap-1 text-center">
                <CountUp
                  value={value}
                  className="bg-linear-to-b from-indigo-600 to-indigo-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
                />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
