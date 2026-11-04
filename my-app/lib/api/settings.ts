import "server-only";

import { publicFetch } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEFAULT_SITE_SETTINGS } from "@/lib/data/settings.default";
import { normalizeSiteSeo } from "@/lib/seo/metadata";
import { SOCIAL_PLACEMENTS, type SocialPlacementMap } from "@/lib/socials";
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
    socialPlacements: normalizePlacements(settings.socialPlacements),
    socialsConfigured: settings.socialsConfigured === true,
    seo: normalizeSiteSeo(settings.seo) as SiteSeo,
  };
}

function normalizeSocials(value: unknown): SiteSocial[] {
  if (!Array.isArray(value)) return [];

  const socials: SiteSocial[] = [];

  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") continue;

    const { id, label, href, icon, iconType, imageUrl, description } =
      item as SiteSocial;

    if (typeof label !== "string" || typeof href !== "string") continue;
    if (!label.trim() || !href.trim()) continue;

    const logo = iconType === "image" && typeof imageUrl === "string" ? imageUrl : "";

    socials.push({
      id: typeof id === "string" && id ? id : `legacy-${index}`,
      label,
      href,
      icon: typeof icon === "string" && icon ? icon : "link",
      iconType: logo ? "image" : "icon",
      imageUrl: logo,
      description: typeof description === "string" ? description : "",
    });
  }

  return socials;
}

function normalizePlacements(value: unknown): Partial<SocialPlacementMap> {
  if (!value || typeof value !== "object") return {};

  const placements: Partial<SocialPlacementMap> = {};

  for (const { key } of SOCIAL_PLACEMENTS) {
    const ids = (value as Record<string, unknown>)[key];
    if (Array.isArray(ids)) {
      placements[key] = ids.filter((id): id is string => typeof id === "string");
    }
  }

  return placements;
}
