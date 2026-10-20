import type { SiteSettings } from "@/lib/types/settings";

/**
 * Neutral fallback for the global brand identity.
 *
 * Deliberately NOT demo content: the brand name/tagline and socials are empty
 * so a failed or unavailable settings API can never render fake brand content
 * on the public site. The Navbar/Footer render their logo mark alone until real
 * settings load. Used as the `publicFetch` build + runtime fallback.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: {
    name: "",
    tagline: "",
    logo: {
      type: "icon",
      icon: "zap",
      url: "",
    },
  },
  socials: [],
};
