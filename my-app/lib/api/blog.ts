import "server-only";

import { publicFetch } from "@/lib/api/core";
import { TAGS, blogTag } from "@/lib/api/tags";
import { DEMO_BLOG_POSTS } from "@/lib/data/blog.demo";
import type { BlogPost } from "@/lib/types/blog";

type ApiPost = BlogPost & { _id?: string };

type BlogListResponse = { blogs?: ApiPost[] };
type BlogDetailResponse = { blog?: ApiPost | null };

function normalizePost(post: ApiPost): BlogPost {
  return { ...post, id: post._id ?? post.id };
}

function toPosts(data: BlogListResponse): BlogPost[] {
  // The backend has answered with both shapes over time — `{ blogs }` and a
  // bare array. Accept either rather than rendering an empty blog.
  const posts = Array.isArray(data?.blogs) ? data.blogs : [];
  return posts.map(normalizePost);
}

function isPublished(post: BlogPost): boolean {
  return post.status === "published";
}

/**
 * PUBLIC blog list — published posts only.
 *
 * ── Deliberate gate ──────────────────────────────────────────────────────
 * This fetches `/blogs/all`, which returns drafts AND published posts (the
 * dashboard needs the full set). The `status === "published"` filter lives
 * HERE, in one place, so it cannot be widened by a future edit to the list or
 * the grid.
 *
 * The dashboard keeps its own unfiltered read via
 * `dashboardGetBlogPosts()` in `lib/services/blog.services.ts` — that is
 * intentional and unchanged.
 *
 * Backend envelope: `{ blogs: BlogPost[] }`.
 */

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const data = await publicFetch<BlogListResponse>("/blogs/all", {
    tag: TAGS.blog,
    fallback: { blogs: DEMO_BLOG_POSTS.filter(isPublished) },
    // "No articles yet" is a real state — the blog page renders an EmptyState
    // for it, so an empty array must not be mistaken for an outage.
    allowEmpty: true,
  });

  return toPosts(data).filter(isPublished);
}

/**
 * PUBLIC single post, by slug.
 *
 * Backend envelope: `{ blog: BlogPost }` → `GET /blogs/slug/:slug`.
 *
 * Tagged with BOTH `blog-<slug>` and `blog`, so the backend can invalidate one
 * post precisely, or the whole blog at once (which is what a status flip or a
 * delete needs — those change what `/blogs/all` returns too).
 *
 * `allowEmpty` + a missing-blog `isEmpty` are inverted on purpose here: a slug
 * that genuinely has no post must resolve to `null` so the page can call
 * `notFound()`. Treating it as a failure would send it to the error boundary
 * instead of a proper 404.
 *
 * Two extra settings make that 404 actually reachable:
 *   `tolerateStatuses: [404]` — a backend 404 is a real answer ("no such
 *     post"), not an outage, so it is passed through instead of thrown.
 *   `runtimeFallback` — this route is dynamic (`ƒ`), so it has no prerendered
 *     build fallback to lean on. With the backend down it degrades to the demo
 *     post (or `null`), matching the pre-refactor behaviour.
 */

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const demoPost = DEMO_BLOG_POSTS.find(
    (p) => p.slug === slug && isPublished(p),
  );

  const data = await publicFetch<BlogDetailResponse>(
    `/blogs/slug/${encodeURIComponent(slug)}`,
    {
      tag: blogTag(slug),
      // Invalidate the detail page and the list together.
      tags: [TAGS.blog],
      fallback: { blog: demoPost ?? null },
      runtimeFallback: { blog: demoPost ?? null },
      tolerateStatuses: [404],
      allowEmpty: true,
    },
  );

  return data?.blog ? normalizePost(data.blog) : null;
}