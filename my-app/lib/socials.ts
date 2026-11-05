import type { SiteSettings, SiteSocial } from "@/lib/types/settings";

/** Every place on the public site that can show social links. Mirrors the backend. */
export const SOCIAL_PLACEMENTS = [
  { key: "navbar", label: "Navbar", hint: "Top bar on desktop" },
  { key: "mobileMenu", label: "Mobile menu", hint: "Inside the phone menu" },
  { key: "footer", label: "Footer", hint: "Bottom of every public page" },
  { key: "homeHero", label: "Home hero", hint: "Beside “Find me on”" },
  { key: "about", label: "About", hint: "Under the About intro" },
  { key: "services", label: "Services", hint: "Under the section header" },
  { key: "projects", label: "Projects", hint: "Under the section header" },
  { key: "blog", label: "Blog", hint: "Under the section header" },
  { key: "skills", label: "Skills", hint: "Under the section header" },
  { key: "contact", label: "Contact", hint: "The “Find me on” card" },
] as const;

/** A link to the network itself ("https://linkedin.com") is not a profile. */
export function isProfileLink(href: string): boolean {
  try {
    const { protocol, pathname } = new URL(href);
    return /^https?:$/.test(protocol) && pathname !== "" && pathname !== "/";
  } catch {
    return false;
  }
}

export type SocialPlacement = (typeof SOCIAL_PLACEMENTS)[number]["key"];

export type SocialPlacementMap = Record<SocialPlacement, string[]>;

/** Before migration the old shared list still drives these three sections. */
const SHARED_BEFORE_MIGRATION: SocialPlacement[] = [
  "navbar",
  "mobileMenu",
  "footer",
];

/** The links a section shows, in the order chosen in the dashboard. */
export function resolveSocials(
  settings: Pick<
    SiteSettings,
    "socials" | "socialPlacements" | "socialsConfigured"
  >,
  placement: SocialPlacement,
): SiteSocial[] {
  if (!settings.socialsConfigured) {
    return SHARED_BEFORE_MIGRATION.includes(placement) ? settings.socials : [];
  }

  const byId = new Map(settings.socials.map((social) => [social.id, social]));

  return (settings.socialPlacements?.[placement] ?? []).flatMap((id) => {
    const social = byId.get(id);
    return social ? [social] : [];
  });
}

/** Shapes a link from the old Home Hero or Contact lists, used until migration. */
export function legacySocial(
  label: string,
  href: string,
  description = "",
): SiteSocial {
  return {
    id: `${label}-${href}`,
    label,
    href,
    icon: label.toLowerCase(),
    iconType: "icon",
    imageUrl: "",
    description,
  };
}

/** The first link for each name, ignoring case, in library order. */
export function uniqueByLabel(socials: SiteSocial[]): SiteSocial[] {
  const seen = new Set<string>();

  return socials.filter((social) => {
    const label = social.label.trim().toLowerCase();
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

/** A link's address without the protocol noise, so similar links can be told apart. */
export function displayHref(href: string): string {
  return href
    .replace(/^(https?:\/\/)?(www\.)?/i, "")
    .replace(/^mailto:|^tel:/i, "")
    .replace(/\/+$/, "");
}

const LOGO_PIXELS = 96;

/**
 * Asks Cloudinary for a small, modern-format copy of an uploaded logo, so a
 * large source file costs the page a few KB. Also turns SVGs into plain images,
 * which cannot run any script they contain.
 */
export function socialLogoUrl(url: string): string {
  return url.replace(
    /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)/,
    `$1f_auto,q_auto,c_limit,w_${LOGO_PIXELS},h_${LOGO_PIXELS}/`,
  );
}
