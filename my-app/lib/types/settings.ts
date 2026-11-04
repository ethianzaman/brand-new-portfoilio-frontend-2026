import type { SocialPlacementMap } from "@/lib/socials";

export type SiteLogoType = "icon" | "image";

export interface SiteBrandLogo {
  type: SiteLogoType;
  /** Icon key rendered when `type === "icon"` (see `BrandMark`). */
  icon: string;
  /** Image URL rendered when `type === "image"`. */
  url: string;
}

export interface SiteBrand {
  name: string;
  tagline: string;
  logo: SiteBrandLogo;
}

export type SocialIconType = "icon" | "image";

export interface SiteSocial {
  /** Stable id that sections refer to. */
  id: string;
  label: string;
  href: string;
  /** Icon key rendered by `SocialIcon` (see `app/components/brand/SocialIcon`). */
  icon: string;
  iconType: SocialIconType;
  /** Cloudinary URL of the uploaded logo. Empty unless `iconType` is "image". */
  imageUrl: string;
  /** Optional one-liner, shown where a section has room for it. */
  description: string;
}

/**
 * Global SEO defaults managed in the dashboard (Site Settings → SEO).
 *
 * Mirrors the backend `ISiteSeo`. Every field is optional so a settings
 * document written before SEO existed still normalises cleanly.
 */
export interface SiteSeo {
  defaultMetaTitle?: string;
  defaultTitleTemplate?: string;
  defaultMetaDescription?: string;
  defaultOgImage?: string;
  twitterHandle?: string;
  siteUrl?: string;
}

/**
 * Global Site Settings — the shared brand identity consumed by both the
 * Navbar and the Footer. Sourced from `GET /api/settings`.
 */
export interface SiteSettings {
  id?: string;
  _id?: string;
  brand: SiteBrand;
  /** The social link library. Sections pick from it through `socialPlacements`. */
  socials: SiteSocial[];
  socialPlacements?: Partial<SocialPlacementMap>;
  /** False until the old per-section lists have been merged into the library. */
  socialsConfigured?: boolean;
  seo?: SiteSeo;
}
