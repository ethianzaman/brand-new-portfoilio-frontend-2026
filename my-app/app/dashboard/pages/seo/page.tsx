"use client";

import { Search } from "lucide-react";
import { SeoSettings } from "../settings/SeoSettings";
import { PageSeoSettings } from "../settings/PageSeoSettings";

/**
 * SEO Management.
 *
 * Central home for every site-wide SEO control:
 *   • Global defaults — title template, description, OG image, canonical origin
 *   • Page SEO       — per-static-route metadata overrides
 *
 * Per-item overrides (blog posts, projects, services) live in their own
 * editors, where the content they describe is actually managed.
 */
export default function SeoPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            SEO
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Control how your site appears in search results and when shared on
            social media
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* ── Global SEO defaults (title, OG, canonical origin) ── */}
        <SeoSettings />

        {/* ── Per static-page SEO overrides ── */}
        <PageSeoSettings />
      </div>
    </div>
  );
}
