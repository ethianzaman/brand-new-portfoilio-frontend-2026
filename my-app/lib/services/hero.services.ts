import { apiUrl } from "@/lib/api/config";
import type { HomeData, HomeHero, HomeStat } from "@/lib/types/hero";

/**
 * DASHBOARD access for the home section.
 *
 * Client-safe on purpose: this module is imported by the CMS components, so it
 * must NOT pull in `lib/api/core.ts` (which is `server-only`). Every request
 * here bypasses the public ISR cache with `cache: "no-store"`.
 *
 * The matching public, server-rendered read lives in `lib/api/home.ts`.
 */
const HOME_URL = `${apiUrl()}/home`;

export async function dashboardGetHero(): Promise<HomeData> {
  const res = await fetch(HOME_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch home data");
  const data = await res.json();
  return data.home;
}

// ── HERO (with image & resume upload — FormData) ─────────────────────────
// Backend fields: name, title, bio, socials (JSON string), titles (JSON
// string), image (file OR url string), resume (file), resumeUrl (string)
export async function dashboardUpdateHero(
  formData: FormData,
): Promise<HomeHero> {
  const res = await fetch(`${HOME_URL}/hero`, {
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
  stats: HomeStat[],
): Promise<HomeStat[]> {
  const res = await fetch(`${HOME_URL}/stats`, {
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
