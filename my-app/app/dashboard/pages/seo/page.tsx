"use client";

import { Search } from "lucide-react";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
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
      <PageHeader
        icon={Search}
        title="SEO"
        description="Control how your site appears in search results and when shared on social media"
        className="items-start"
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* ── Global SEO defaults (title, OG, canonical origin) ── */}
        <SeoSettings />

        {/* ── Per static-page SEO overrides ── */}
        <PageSeoSettings />
      </div>
    </div>
  );
}
