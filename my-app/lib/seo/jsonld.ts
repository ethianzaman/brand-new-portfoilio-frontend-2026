import { absoluteUrl, resolveSiteOrigin, normalizeSiteSeo } from "@/lib/seo/metadata";

/**
 * Typed JSON-LD builders + a safe serializer.
 *
 * `serializeJsonLd` escapes `<`, `>`, `&` and the JS line/paragraph separators
 * so a value that contains `</script>` (or a Unicode line break) cannot break
 * out of the surrounding `<script type="application/ld+json">` element — the
 * standard XSS guard for inline JSON-LD.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data ?? null)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

interface OrganizationInput {
  siteSeo?: unknown;
  /** Brand name from Site Settings, used when no SEO title is set. */
  brandName?: string;
  /** Social/profile links from Site Settings. */
  socials?: { href: string }[];
  /** Absolute or same-origin logo URL, when one exists. */
  logo?: string;
}

/**
 * Organization schema. Emitted once, site-wide, in the root layout.
 *
 * Everything is derived from real Site Settings — no fabricated address,
 * founding date or contact details.
 */
export function organizationJsonLd(input: OrganizationInput) {
  const site = normalizeSiteSeo(input.siteSeo);
  const origin = resolveSiteOrigin(site.siteUrl);
  const name = input.brandName || site.defaultMetaTitle || "";

  if (!origin || !name) return null;

  const sameAs = (input.socials ?? [])
    .map((s) => s.href)
    .filter((href): href is string => typeof href === "string" && /^https?:\/\//i.test(href));

  const logo = input.logo ? absoluteUrl(origin, input.logo) : "";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: origin,
    ...(logo ? { logo } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

interface WebsiteInput {
  siteSeo?: unknown;
  brandName?: string;
}

/**
 * WebSite schema. Emitted once, site-wide, in the root layout.
 *
 * No `SearchAction`: the site has no public search endpoint, and inventing one
 * would be fabricated markup that search engines flag as invalid.
 */
export function websiteJsonLd(input: WebsiteInput) {
  const site = normalizeSiteSeo(input.siteSeo);
  const origin = resolveSiteOrigin(site.siteUrl);
  const name = input.brandName || site.defaultMetaTitle || "";

  if (!origin || !name) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: origin,
  };
}

interface BlogPostingInput {
  title: string;
  description?: string;
  /** Path relative to the origin, e.g. `/blog/my-post`. */
  path: string;
  /** ISO date string. */
  datePublished?: string;
  dateModified?: string;
  image?: string;
  author?: string;
  siteSeo?: unknown;
  brandName?: string;
}

/** BlogPosting schema for a published post's detail page. */
export function blogPostingJsonLd(input: BlogPostingInput) {
  const site = normalizeSiteSeo(input.siteSeo);
  const origin = resolveSiteOrigin(site.siteUrl);
  const url = absoluteUrl(origin, input.path);

  if (!url) return null;

  const image = input.image ? absoluteUrl(origin, input.image) : "";
  const authorName = input.author || input.brandName || site.defaultMetaTitle || "";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(image ? { image: [image] } : {}),
    ...(authorName
      ? { author: { "@type": "Organization", name: authorName } }
      : {}),
  };
}
