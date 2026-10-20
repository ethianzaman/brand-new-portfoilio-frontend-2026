import { dashboardApiUrl } from "@/lib/api/config";
import { BlogPost } from "@/lib/types/blog";
import { DEMO_BLOG_POSTS } from "@/lib/data/blog.demo";

const API_BASE_URL = `${dashboardApiUrl()}/blogs`;

type ApiPost = BlogPost & { _id?: string };

function normalizePost(post: ApiPost): BlogPost {
  return {
    ...post,
    id: post._id ?? post.id,
  };
}

// ── GET all (dashboard: draft + published) ───────────────────────
export async function dashboardGetBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/all`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Blog API failed: ${response.status}`);
    }

    const json = await response.json();

    const posts: ApiPost[] = Array.isArray(json?.blogs)
      ? json.blogs
      : Array.isArray(json)
        ? json
        : [];

    return posts.map(normalizePost);
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);

    return JSON.parse(JSON.stringify(DEMO_BLOG_POSTS.filter((p) => p.status === "published")));
  }
}

// ── GET one by slug (public detail page) ─────────────────────────
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(`Blog API failed: ${response.status}`);
    }

    const json = await response.json();

    return normalizePost(json.blog);
  } catch (error) {
    console.error("Failed to fetch blog post:", error);

    return (
      DEMO_BLOG_POSTS.find((p) => p.slug === slug && p.status === "published") ?? null
    );
  }
}

// ── CREATE ───────────────────────────────────────────────────────
export async function dashboardCreatePost(
  data: Omit<BlogPost, "id" | "createdAt" | "updatedAt"> & { readTime?: number },
  image?: File,
): Promise<BlogPost> {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("slug", data.slug);
  formData.append("excerpt", data.excerpt);
  formData.append("content", data.content);
  formData.append("category", data.category);
  formData.append("status", data.status);
  formData.append("featured", String(data.featured ?? false));

  data.tags.forEach((tag) => formData.append("tags", tag));

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message ?? `Failed to create post: ${response.status}`,
    );
  }

  const json = await response.json();

  if (!json?.blog) {
    throw new Error("Backend did not return the created post");
  }

  return normalizePost(json.blog);
}

// ── UPDATE ───────────────────────────────────────────────────────
export async function dashboardUpdatePost(
  id: string,
  data: Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "author">>,
  image?: File,
): Promise<BlogPost | null> {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.slug) formData.append("slug", data.slug);
  if (data.excerpt) formData.append("excerpt", data.excerpt);
  if (data.content) formData.append("content", data.content);
  if (data.category) formData.append("category", data.category);

  if (data.status) formData.append("status", data.status);

  if (data.featured !== undefined)
    formData.append("featured", String(data.featured));

  if (data.tags) {
    data.tags.forEach((tag) => formData.append("tags", tag));
  }

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message ?? `Failed to update post: ${response.status}`,
    );
  }

  const json = await response.json();

  return normalizePost(json.blog);
}

// ── DELETE ───────────────────────────────────────────────────────
export async function dashboardDeletePost(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  return response.ok;
}

// ── Helper: estimate reading time (shown live in the form) ───────
export function estimateReadTime(content: string): number {
  return Math.max(
    1,
    Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200),
  );
}
