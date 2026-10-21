// ─────────────────────────────────────────────
// Blog types — matches the backend exactly:
//
//   GET    /api/blogs            → { success, blogs, total, ... }  (public, published only)
//   GET    /api/blogs/all        → { success, blogs }               (dashboard: incl. drafts)
//   GET    /api/blogs/slug/:slug → { success, blog }
//   POST   /api/blogs/create     → { success, blog }  (multipart, optional cover image)
//   PUT    /api/blogs/:id        → { success, blog }
//   DELETE /api/blogs/:id        → { success, message }
// ─────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /**
   * The article body.
   *
   * Optional because LIST endpoints strip it — the public listing only needs
   * the excerpt, and shipping every article body with the index is the single
   * largest payload on the blog page. The detail endpoint (`/blogs/slug/:slug`)
   * and the dashboard list both include it.
   */
  content?: string;
  coverImage?: string | null;
  category: string;
  tags: string[];
  readTime: number; // minutes — computed by backend
  status: "draft" | "published";
  featured?: boolean;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}