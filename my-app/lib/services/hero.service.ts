import { dashboardApiUrl } from "@/lib/api/config";
import type { HeroData, HeroContent, HeroStat } from "@/lib/types/hero";

/**
 * DASHBOARD access for the hero section.
 *
 * Client-safe on purpose: this module is imported by the CMS components, so it
 * must NOT pull in `lib/api/core.ts` (which is `server-only`). Every request
 * here bypasses the public ISR cache with `cache: "no-store"`.
 *
 * The matching public, server-rendered read lives in `lib/api/hero.ts`.
 */
const HERO_URL = `${dashboardApiUrl()}/hero`;

export async function dashboardGetHero(): Promise<HeroData> {
  const res = await fetch(HERO_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch hero data");
  const data = await res.json();
  return data.hero;
}

// ── HERO (with image & resume upload — FormData) ─────────────────────────
// Backend fields: name, title, bio, socials (JSON string), titles (JSON
// string), image (file OR url string), resume (file), resumeUrl (string)
export async function dashboardUpdateHero(
  formData: FormData,
): Promise<HeroContent> {
  const res = await fetch(HERO_URL, {
    method: "PUT",
    body: formData,
    // Content-Type is intentionally omitted so the browser can set the
    // multipart boundary itself.
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return data.hero;
}

// ── STATS (all stats are replaced at once) ──────────────────────────────
export async function dashboardUpdateHeroStats(
  stats: HeroStat[],
): Promise<HeroStat[]> {
  const res = await fetch(`${HERO_URL}/stats`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stats }),
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update stats");
  }

  const data = await res.json();
  return data.stats;
}
