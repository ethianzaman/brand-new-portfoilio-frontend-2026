import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/api/settings";
import { getPublishedBlogPosts } from "@/lib/api/blog";
import { getProjects } from "@/lib/api/projects";
import { getServices } from "@/lib/api/services";
import { resolveSiteOrigin, absoluteUrl } from "@/lib/seo/metadata";

/**
 * Sitemap.
 *
 * Lists only the routes that actually render indexable content:
 *   • the public static pages
 *   • every PUBLISHED blog post (`getPublishedBlogPosts` filters drafts out)
 *   • every project and service with a page of its own, read from the database,
 *     so a new or removed one is reflected here without a code change
 *
 * `noindex` pages are also excluded? Not here: no public page is `noindex` by
 * default, and robots.txt governs crawling. Per-page `noindex` is expressed in
 * metadata, which crawlers honour over the sitemap hint.
 *
 * The origin comes from the dashboard `siteUrl` (or env fallback). With no
 * origin configured the sitemap degrades to relative-safe empty output rather
 * than emitting `undefined` URLs.
 */
/** Every project, across as many pages as the API needs. */
async function allProjects() {
  const pageSize = 100;
  const projects = [];
  for (let page = 1; ; page += 1) {
    const result = await getProjects({ category: "all", page, pageSize });
    projects.push(...result.projects);
    if (!result.hasMore || result.projects.length === 0) return projects;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const origin = resolveSiteOrigin(settings.seo?.siteUrl);

  const staticPaths: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/skills", changeFrequency: "monthly", priority: 0.7 },
    { path: "/services", changeFrequency: "monthly", priority: 0.8 },
    { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  ];

  const now = new Date();

  const entries: MetadataRoute.Sitemap = staticPaths
    .map(({ path, changeFrequency, priority }) => {
      const url = absoluteUrl(origin, path);
      if (!url) return null;
      return {
        url,
        lastModified: now,
        changeFrequency,
        priority,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // Published posts only. `getPublishedBlogPosts` already drops drafts.
  const posts = await getPublishedBlogPosts();

  for (const post of posts) {
    const url = absoluteUrl(origin, `/blog/${post.slug}`);
    if (!url) continue;
    entries.push({
      url,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  const [projects, services] = await Promise.all([allProjects(), getServices()]);

  for (const project of projects) {
    if (!project.slug || project.isPlaceholder || project.seo?.noindex) continue;
    const url = absoluteUrl(origin, `/projects/${project.slug}`);
    if (!url) continue;
    entries.push({
      url,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const service of services) {
    if (!service.slug || service.seo?.noindex) continue;
    const url = absoluteUrl(origin, `/services/${service.slug}`);
    if (!url) continue;
    entries.push({
      url,
      lastModified: service.updatedAt ? new Date(service.updatedAt) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
