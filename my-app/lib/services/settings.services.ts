import { dashboardApiUrl } from "@/lib/api/config";
import type { SiteSeo, SiteSettings, SiteSocial } from "@/lib/types/settings";

/**
 * DASHBOARD access for the global site settings.
 *
 * Client-safe on purpose (imported by the CMS): no `server-only`. Bypasses the
 * public ISR cache with `cache: "no-store"`; the matching public read lives in
 * `lib/api/settings.ts`.
 */
const SETTINGS_URL = `${dashboardApiUrl()}/settings`;

export async function dashboardGetSettings(): Promise<SiteSettings> {
  const res = await fetch(SETTINGS_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch site settings");

  const data = await res.json();
  return data.settings as SiteSettings;
}

// ── BRAND (name + logo/icon — FormData so a logo file can be uploaded) ───────
export async function dashboardUpdateSettings(
  formData: FormData,
): Promise<SiteSettings> {
  const res = await fetch(`${SETTINGS_URL}/brand`, {
    method: "PUT",
    body: formData,
    // Content-Type omitted so the browser sets the multipart boundary.
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return data.settings as SiteSettings;
}

// ── SOCIALS (replace the whole list) ─────────────────────────────────────────
export async function dashboardUpdateSettingsSocials(
  socials: SiteSocial[],
): Promise<SiteSettings> {
  const res = await fetch(`${SETTINGS_URL}/socials`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ socials }),
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return data.settings as SiteSettings;
}

// ── SEO (global defaults) ────────────────────────────────────────────────────
export async function dashboardUpdateSettingsSeo(
  seo: SiteSeo,
): Promise<SiteSettings> {
  const res = await fetch(`${SETTINGS_URL}/seo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(seo),
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return data.settings as SiteSettings;
}

// ── Static-page SEO overrides ────────────────────────────────────────────────
export type PageSeoValue = {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
};

export type PageSeoMap = Record<string, PageSeoValue>;

export async function dashboardGetPageSeo(): Promise<PageSeoMap> {
  const res = await fetch(`${SETTINGS_URL}/pages/seo`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch page SEO");

  const data = await res.json();
  return (data.pages ?? {}) as PageSeoMap;
}

export async function dashboardUpdatePageSeo(
  page: string,
  seo: PageSeoValue,
): Promise<{ page: string; seo: PageSeoValue }> {
  const res = await fetch(`${SETTINGS_URL}/pages/seo/${page}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seo }),
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return { page: data.page, seo: data.seo };
}
