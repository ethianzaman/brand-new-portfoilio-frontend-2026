import "server-only";

import { publicFetch } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { normalizeSeo, type SeoOverride } from "@/lib/seo/metadata";

const SEO_PAGE_KEYS = [
  "home",
  "about",
  "skills",
  "services",
  "projects",
  "blog",
  "contact",
] as const;

export type SeoPageKey = (typeof SEO_PAGE_KEYS)[number];

type PageSeoResponse = { pages?: Record<string, unknown> };

/**
 * PUBLIC static-page SEO overrides for `/settings/pages/seo`.
 *
 * Returns one normalised entry per known page key so a caller can hand the
 * result straight to `buildMetadata` without null checks. A missing or
 * malformed payload degrades to the neutral (empty) override — the page then
 * falls back to global defaults and its literal title.
 *
 * Backend envelope: `{ pages: { home: {...}, about: {...}, ... } }`.
 */
export async function getPageSeo(
  page: SeoPageKey,
): Promise<SeoOverride> {
  const data = await publicFetch<PageSeoResponse>("/settings/pages/seo", {
    tag: TAGS.seo,
    fallback: {},
    runtimeFallback: {},
    allowEmpty: true,
  });

  return normalizeSeo(data?.pages?.[page]);
}

export { SEO_PAGE_KEYS };
