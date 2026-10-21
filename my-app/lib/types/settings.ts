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
 * Global Site Settings — the shared brand identity consumed by both the
 * Navbar and the Footer. Sourced from `GET /api/settings`.
 */
export interface SiteSettings {
  id?: string;
  _id?: string;
  brand: SiteBrand;
  socials: SiteSocial[];
}
