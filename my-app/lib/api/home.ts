import "server-only";

import { publicFetch, requireEnvelope } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEMO_HOME } from "@/lib/data/home.demo";
import type { HomeData } from "@/lib/types/hero";

/**
 * PUBLIC home data — hero + stats.
 *
 * This is the whole pattern. A new public page needs one file like this,
 * one call at the top of `page.tsx`, and nothing else:
 *
 *   const data = await publicFetch<Shape>("/endpoint", {
 *     tag: "section",
 *     fallback: FALLBACK,
 *   });
 *
 * Cached 60s under tag `home`, hard 5s upstream timeout, last-good-on-failure,
 * and demo data during `next build` so a build never needs the API online.
 */
export async function getHeroData(): Promise<HomeData> {
  const data = await publicFetch<{ home?: HomeData }>("/home", {
    tag: TAGS.home,
    fallback: { home: DEMO_HOME },
  });
  return requireEnvelope<"home", HomeData>(data, "home");
}
