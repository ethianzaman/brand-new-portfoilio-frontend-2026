/**
 * Cache tags. These strings MUST match exactly between
 *   - the frontend `publicFetch({ tag })` calls, and
 *   - the backend `publishChange(tag)` calls,
 * otherwise revalidation silently does nothing and public pages only pick up
 * edits when the 60s ISR window lapses.
 *
 * ── Backend contract ────────────────────────────────────────────────────
 * After any successful write, the backend POSTs to the frontend's
 * `/api/revalidate` endpoint:
 *
 *   POST {FRONTEND_URL}/api/revalidate
 *   headers: { "x-revalidate-secret": <REVALIDATE_SECRET> }
 *   body:    { "tag": "<one of the tags below>" }
 *
 * Tag to call for each section:
 *
 *   hero / stats written  →  "home"
 *   about section written →  "about"
 *   contact written       →  "contact"
 *   skills written        →  "skills"
 *   services written      →  "services"
 *   projects written      →  "projects"      (covers every page + category)
 *   settings written      →  "settings"      (global brand: Navbar + Footer)
 *   blog post written     →  "blogs"         (also drops the list page)
 *   seo written           →  "seo"           (global + static-page SEO defaults)
 *
 * Prefer `"blogs"` on create/delete/status-change: those alter what the list
 * page renders, not just the detail page.
 */
export const TAGS = {
  home: "home",
  about: "about",
  contact: "contact",
  skills: "skills",
  services: "services",
  projects: "projects",
  settings: "settings",
  blog: "blogs",
  seo: "seo",
} as const;

export type StaticTag = (typeof TAGS)[keyof typeof TAGS];

/** Single-post pages also invalidate their own list + detail pair. */
export function blogTag(slug: string): string {
  return `${TAGS.blog}-${slug}`;
}

export function isStaticTag(value: string): value is StaticTag {
  return (Object.values(TAGS) as string[]).includes(value);
}