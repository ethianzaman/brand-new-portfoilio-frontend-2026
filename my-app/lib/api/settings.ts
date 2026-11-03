import "server-only";

import { publicFetch } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEFAULT_SITE_SETTINGS } from "@/lib/data/settings.default";
import { normalizeSiteSeo } from "@/lib/seo/metadata";
import type { SiteSeo, SiteSettings, SiteSocial } from "@/lib/types/settings";

/**
 * PUBLIC global site settings — shared brand name + logo/icon.
 *
 * Read once by `app/(public)/layout.tsx` and passed as a prop to BOTH the
 * Navbar and the Footer, so a single cached request feeds both and they can
 * never drift apart.
 *
 * `runtimeFallback` keeps the whole public layout rendering (logo-only, no
 * fake brand) if the backend is unreachable, instead of throwing the entire
 * site into an error boundary.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await publicFetch<{ settings?: SiteSettings }>("/settings", {
    tag: TAGS.settings,
    fallback: { settings: DEFAULT_SITE_SETTINGS },
    runtimeFallback: { settings: DEFAULT_SITE_SETTINGS },
  });

  return normalizeSettings(data?.settings);
}

/** Defensive shape guard — never lets a malformed payload crash the layout. */
function normalizeSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== "object") return DEFAULT_SITE_SETTINGS;

  const settings = value as SiteSettings;
  const brand = settings.brand;

  if (!brand || typeof brand !== "object") return DEFAULT_SITE_SETTINGS;

  const logo = brand.logo;

  return {
    brand: {
      name: typeof brand.name === "string" ? brand.name : "",
      tagline: typeof brand.tagline === "string" ? brand.tagline : "",
      logo: {
        type: logo?.type === "image" ? "image" : "icon",
        icon: typeof logo?.icon === "string" && logo.icon ? logo.icon : "zap",
        url: typeof logo?.url === "string" ? logo.url : "",
      },
    },
    socials: normalizeSocials(settings.socials),
    seo: normalizeSiteSeo(settings.seo) as SiteSeo,
  };
}

function normalizeSocials(value: unknown): SiteSocial[] {
  if (!Array.isArray(value)) return [];

  const socials: SiteSocial[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const label = (item as SiteSocial).label;
    const href = (item as SiteSocial).href;
    const icon = (item as SiteSocial).icon;

    if (typeof label !== "string" || typeof href !== "string") continue;
    if (!label.trim() || !href.trim()) continue;

    socials.push({
      label,
      href,
      icon: typeof icon === "string" && icon ? icon : "link",
    });
  }

  return socials;
}
