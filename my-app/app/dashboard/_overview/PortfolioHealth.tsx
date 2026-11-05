import { Check, Plus, ShieldCheck } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Expandable } from "./Expandable";
import type { Health } from "./health";

const TONES = [
  { min: 80, color: "#10b981", label: "Excellent" },
  { min: 60, color: "#6366f1", label: "Good" },
  { min: 40, color: "#f59e0b", label: "Fair" },
  { min: 0, color: "#f43f5e", label: "Needs work" },
];

export function PortfolioHealth({ health }: { health: Health }) {
  const { items, done, score, incomplete } = health;
  const tone = TONES.find((t) => score >= t.min) ?? TONES[TONES.length - 1];

  const R = 54;
  const CIRC = 2 * Math.PI * R;

  return (
    <div id="portfolio-health" className="h-full scroll-mt-20">
    <SectionCard
      icon={ShieldCheck}
      title="Portfolio Health"
      subtitle="Overall content readiness"
      right={
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {done}/{items.length}
        </span>
      }
    >
      {/* Score */}
      <div className="flex items-center gap-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-3">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={R}
              fill="none"
              strokeWidth="13"
              className="stroke-zinc-200/80 dark:stroke-zinc-700/60"
            />
            <circle
              cx="64"
              cy="64"
              r={R}
              fill="none"
              strokeWidth="13"
              stroke={tone.color}
              strokeDasharray={`${(score / 100) * CIRC} ${CIRC}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums leading-none">
              {score}%
            </span>
            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mt-0.5">
              Health
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">
            {tone.label}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
            {done} of {items.length} checks pass{incomplete ? ". Some sections could not be loaded." : "."}
          </p>
          <span
            className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: `${tone.color}1a`, color: tone.color }}
          >
            {score === 100 ? "All set" : `${items.length - done} to go`}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-1.5">
        <Expandable
          collapsedHeight={196}
          fadeClassName="from-zinc-50 dark:from-zinc-800"
        >
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.label}>
                <a
                  href={item.to}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white dark:hover:bg-zinc-900"
                >
                  <item.icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                    {item.label}
                  </span>
                  <span className="ml-auto shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {item.detail}
                  </span>
                  {item.ok ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                      <Plus className="w-2.5 h-2.5" />
                      Add
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </Expandable>
      </div>
    </SectionCard>
    </div>
  );
}
