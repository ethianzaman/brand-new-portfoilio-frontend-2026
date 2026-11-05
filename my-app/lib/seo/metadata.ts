import type { Metadata } from "next";

/**
 * Per-item / per-page SEO overrides, mirroring the backend `ISeo` subdoc.
 *
 * Every field is optional: an item that has never been given SEO data simply
 * inherits the site defaults resolved in `buildMetadata`.
 */
export interface SeoOverride {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/** Global site-wide SEO defaults, mirroring the backend `ISiteSeo`. */
export interface SiteSeo {
  defaultMetaTitle?: string;
  defaultTitleTemplate?: string;
  defaultMetaDescription?: string;
  defaultOgImage?: string;
  twitterHandle?: string;
  siteUrl?: string;
}

/** The neutral shape used whenever the backend has no SEO data yet. */
export const EMPTY_SEO: Required<SeoOverride> = {
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  canonicalUrl: "",
  noindex: false,
  nofollow: false,
};

export const EMPTY_SITE_SEO: Required<SiteSeo> = {
  defaultMetaTitle: "",
  defaultTitleTemplate: "%s",
  defaultMetaDescription: "",
  defaultOgImage: "",
  twitterHandle: "",
  siteUrl: "",
};

/**
 * Normalise an unknown payload into a complete `SeoOverride`.
 *
 * Defensive on purpose: the value arrives over the wire and a malformed field
 * must never reach a `<link rel="canonical">` or an `og:image` tag.
 */
export function normalizeSeo(value: unknown): Required<SeoOverride> {
  if (!value || typeof value !== "object") return { ...EMPTY_SEO };

  const raw = value as Record<string, unknown>;
  const str = (key: string): string =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";

  return {
    metaTitle: str("metaTitle"),
    metaDescription: str("metaDescription"),
    ogImage: str("ogImage"),
    canonicalUrl: str("canonicalUrl"),
    noindex: raw.noindex === true,
    nofollow: raw.nofollow === true,
  };
}

/** Normalise an unknown payload into a complete `SiteSeo`. */
export function normalizeSiteSeo(value: unknown): Required<SiteSeo> {
  if (!value || typeof value !== "object") return { ...EMPTY_SITE_SEO };

  const raw = value as Record<string, unknown>;
  const str = (key: string): string =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";

  const template = str("defaultTitleTemplate");

  return {
    defaultMetaTitle: str("defaultMetaTitle"),
    defaultTitleTemplate: template || "%s",
    defaultMetaDescription: str("defaultMetaDescription"),
    defaultOgImage: str("defaultOgImage"),
    twitterHandle: str("twitterHandle"),
    siteUrl: str("siteUrl"),
  };
}

/** Inputs accepted by `buildMetadata`. */
export interface BuildMetadataInput {
  /** Path relative to the site origin, e.g. `/about`. */
  path: string;
  /** Human page title without any site suffix. */
  title: string;
  /** Fallback description when there is no SEO override. */
  description?: string;
  /** Per-page / per-item overrides. */
  seo?: unknown;
  /** Global defaults from Site Settings. */
  siteSeo?: unknown;
  /** Fallback OG image when neither override nor global default exists. */
  fallbackImage?: string;
  /** `article` for blog posts, `website` otherwise. */
  type?: "website" | "article";
}

/**
 * Resolve one page's metadata from (in order of precedence):
 *   1. the item/page SEO override,
 *   2. the global site SEO defaults,
 *   3. the caller's literal title/description,
 *   4. the absolute site origin.
 *
 * Only same-origin absolute URLs are emitted for canonical + OG, so a bad or
 * attacker-supplied value can never point crawlers off-site.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const seo = normalizeSeo(input.seo);
  const site = normalizeSiteSeo(input.siteSeo);

  const title = seo.metaTitle || input.title || site.defaultMetaTitle || "";
  const description =
    seo.metaDescription || input.description || site.defaultMetaDescription || "";

  const origin = resolveSiteOrigin(site.siteUrl);
  const canonical = seo.canonicalUrl || absoluteUrl(origin, input.path);

  // Without one of its own, a page shares the generated card with the real name.
  const image =
    seo.ogImage ||
    input.fallbackImage ||
    site.defaultOgImage ||
    "/og-image";

  const ogImageUrl = image ? absoluteUrl(origin, image) : "";

  // A usable template contains exactly one `%s`; anything else would duplicate
  // or drop the page title, so the raw title is used instead.
  const template = site.defaultTitleTemplate;
  const resolvedTitle =
    template && template.split("%s").length === 2
      ? template.replace("%s", title)
      : title;

  const robots =
    seo.noindex || seo.nofollow
      ? {
          index: !seo.noindex,
          follow: !seo.nofollow,
        }
      : undefined;

  return {
    title: resolvedTitle,
    description: description || undefined,
    alternates: canonical ? { canonical } : undefined,
    robots,
    openGraph: {
      title: resolvedTitle,
      description: description || undefined,
      url: canonical || undefined,
      siteName: site.defaultMetaTitle || undefined,
      type: input.type ?? "website",
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: description || undefined,
      images: ogImageUrl ? [ogImageUrl] : undefined,
      site: site.twitterHandle || undefined,
    },
  };
}

/**
 * The public site origin, in priority order:
 *   1. global `siteUrl` from Site Settings (dashboard-managed),
 *   2. `NEXT_PUBLIC_SITE_URL` / `SITE_URL` env,
 *   3. empty (relative URLs are then used).
 *
 * The env values are validated to be absolute https/http origins so a typo
 * cannot produce a malformed canonical.
 */
export function resolveSiteOrigin(siteUrl?: string): string {
  const fromSettings = normaliseOrigin(siteUrl);
  if (fromSettings) return fromSettings;

  return (
    normaliseOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    normaliseOrigin(process.env.SITE_URL) ||
    ""
  );
}

function normaliseOrigin(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.origin;
  } catch {
    return "";
  }
}

/** Join an origin and a path/image into an absolute URL (or return "" if no origin). */
export function absoluteUrl(origin: string, pathOrUrl: string): string {
  const value = pathOrUrl.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return value;
  if (!origin) return "";

  return `${origin}${value.startsWith("/") ? "" : "/"}${value}`;
}
