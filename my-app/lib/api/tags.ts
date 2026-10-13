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
 *   blog post written     →  "blog"          (also drops the list page)
 *   one post, precisely   →  "blog-<slug>"   (e.g. "blog-my-first-post")
 *
 * Prefer `"blog"` on create/delete/status-change: those alter what the list
 * page renders, not just the detail page. Use `"blog-<slug>"` when only the
 * post body changed and the list is unaffected.
 */
export const TAGS = {
  home: "home",
  about: "about",
  contact: "contact",
  skills: "skills",
  services: "services",
  projects: "projects",
  blog: "blogs",
} as const;

export type StaticTag = (typeof TAGS)[keyof typeof TAGS];

/** Single-post pages also invalidate their own list + detail pair. */
export function blogTag(slug: string): string {
  return `${TAGS.blog}-${slug}`;
}

export function isStaticTag(value: string): value is StaticTag {
  return (Object.values(TAGS) as string[]).includes(value);
}