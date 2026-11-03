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

export interface SiteSocial {
  label: string;
  href: string;
  /** Icon key rendered by `SocialIcon` (see `app/components/brand/SocialIcon`). */
  icon: string;
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
  socials: SiteSocial[];
  seo?: SiteSeo;
}
