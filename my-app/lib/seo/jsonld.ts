import { absoluteUrl, resolveSiteOrigin, normalizeSiteSeo } from "@/lib/seo/metadata";
import { isProfileLink } from "@/lib/socials";

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

// What a brand-new About document is created with. It is not anyone's name.
const PLACEHOLDER_NAME = "Your Name";

/** The real name from the About page, or else the brand name. */
export function resolvePersonName(heroName?: string, brandName?: string): string {
  const name = heroName?.trim();
  return name && name !== PLACEHOLDER_NAME ? name : brandName?.trim() || "";
}

const personId = (origin: string) => `${origin}/#person`;

interface PersonInput {
  siteSeo?: unknown;
  brandName?: string;
  /** From the About page. */
  name?: string;
  jobTitle?: string;
  image?: string | null;
  /** Social/profile links from Site Settings. */
  socials?: { href: string }[];
}

/**
 * Person schema, since this is one person's portfolio. Emitted once, site-wide,
 * in the root layout, and everything comes from the real site content. `sameAs`
 * tells search engines these profiles are the same person, so it only lists
 * real profiles, not a link to a network's home page.
 */
export function personJsonLd(input: PersonInput) {
  const site = normalizeSiteSeo(input.siteSeo);
  const origin = resolveSiteOrigin(site.siteUrl);
  const name = resolvePersonName(input.name, input.brandName);

  if (!origin || !name) return null;

  const sameAs = [
    ...new Set((input.socials ?? []).map((s) => s.href).filter(isProfileLink)),
  ];
  const image = input.image ? absoluteUrl(origin, input.image) : "";
  const jobTitle = input.jobTitle?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId(origin),
    name,
    url: origin,
    ...(jobTitle ? { jobTitle } : {}),
    ...(image ? { image } : {}),
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
    publisher: { "@id": personId(origin) },
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
      ? { author: { "@type": "Person", name: authorName, url: origin } }
      : {}),
  };
}

interface DetailInput {
  title: string;
  description?: string;
  /** Path relative to the origin, e.g. `/projects/my-project`. */
  path: string;
  siteSeo?: unknown;
}

/** One piece of portfolio work, on its detail page. */
export function projectJsonLd(
  input: DetailInput & { image?: string; keywords?: string[] },
) {
  const origin = resolveSiteOrigin(normalizeSiteSeo(input.siteSeo).siteUrl);
  const url = absoluteUrl(origin, input.path);
  if (!url) return null;

  const image = input.image ? absoluteUrl(origin, input.image) : "";

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.title,
    description: input.description || undefined,
    url,
    author: { "@id": personId(origin) },
    ...(image ? { image } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
  };
}

/** A service on offer, on its detail page. */
export function serviceJsonLd(input: DetailInput) {
  const origin = resolveSiteOrigin(normalizeSiteSeo(input.siteSeo).siteUrl);
  const url = absoluteUrl(origin, input.path);
  if (!url) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.title,
    description: input.description || undefined,
    url,
    provider: { "@id": personId(origin) },
  };
}
