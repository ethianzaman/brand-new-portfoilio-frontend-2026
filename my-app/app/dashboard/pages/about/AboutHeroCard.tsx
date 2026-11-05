"use client";

import { CheckCircle2, ImageIcon, Pencil, User } from "lucide-react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import type { AboutHero } from "@/lib/types/about";

export function AboutHeroCard({ hero, onEdit }: { hero: AboutHero; onEdit: () => void }) {
  const { can } = useCurrentUser();

  return (
    <div
      className="bg-white dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800
                    rounded-2xl overflow-hidden"
    >
      <div
    className="flex flex-wrap items-center justify-between gap-2 px-5 py-4
                      border-b border-zinc-100 dark:border-zinc-800
                      bg-zinc-50 dark:bg-zinc-800/50"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950
                          flex items-center justify-center"
          >
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Hero Section
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Name, title, bio, image
            </p>
          </div>
        </div>
        {can("about.edit") && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                     text-xs font-medium
                     border border-zinc-200 dark:border-zinc-700
                     text-zinc-700 dark:text-zinc-300
                     hover:border-indigo-300 dark:hover:border-indigo-700
                     hover:text-indigo-600 dark:hover:text-indigo-400
                     transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Hero
        </button>
        )}
      </div>

      {/* Hero preview */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden shrink-0
                          border-2 border-zinc-200 dark:border-zinc-700
                          bg-zinc-100 dark:bg-zinc-800
                          flex items-center justify-center"
          >
            {hero.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.image}
                alt={hero.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              {hero.name}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              {hero.title}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-400 mb-1">Tagline</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-1">
            {hero.subtitle}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-400 mb-1">Bio paragraphs</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {hero.bio.length} paragraph{hero.bio.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span>📍</span> {hero.location}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span>⏱</span> {hero.experience}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            {hero.resumeUrl}
          </div>
        </div>
      </div>
    </div>
  );
}
