import "server-only";

import { publicFetch, requireEnvelope } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEMO_ABOUT } from "@/lib/data/about.demo";
import type { AboutData } from "@/lib/types/about";

/**
 * PUBLIC about data — hero, experience, education, values.
 *
 * Backend envelope: `{ about: AboutData }`.
 */
export async function getAbout(): Promise<AboutData> {
  const data = await publicFetch<{ about?: AboutData }>("/about", {
    tag: TAGS.about,
    fallback: { about: DEMO_ABOUT },
  });
  return requireEnvelope<"about", AboutData>(data, "about");
}
