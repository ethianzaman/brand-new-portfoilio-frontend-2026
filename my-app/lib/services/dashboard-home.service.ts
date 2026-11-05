import "server-only";

import { apiUrl } from "@/lib/api/config";
import { backendAuthHeaders } from "@/lib/session";
import type { AboutData } from "@/lib/types/about";
import type { ContactMessage, InboxStats } from "@/lib/types/message";
import type { Project } from "@/lib/types/project";
import type { SiteSettings } from "@/lib/types/settings";
import type { SkillCategory } from "@/lib/types/skill";
import type { BlogStats } from "./blog.service";
import type { ProjectStats } from "./project.service";
import type { ServiceStats } from "./service.service";

/**
 * A section of the overview:
 *   value     — read from the database just now
 *   null      — the read failed, so nothing is known (never shown as 0)
 *   undefined — this account has no permission to see it
 *
 * Everything here reads the backend directly. The page must not use helpers
 * that fall back to demo data or to zeros: an analytics page may only show
 * what the database says.
 */
export type Section<T> = T | null | undefined;

export interface DashboardHomeData {
  projectStats: Section<ProjectStats>;
  recentProjects: Section<Project[]>;
  blogStats: Section<BlogStats>;
  serviceStats: Section<Pick<ServiceStats, "total">>;
  skills: Section<SkillCategory[]>;
  about: Section<AboutData>;
  faqs: Section<number>;
  inbox: Section<InboxStats>;
  recentMessages: Section<ContactMessage[]>;
  settings: Section<SiteSettings>;
}

const RECENT_LIMIT = 5;

export async function loadDashboardHome(
  permissions: string[],
): Promise<DashboardHomeData> {
  const headers = await backendAuthHeaders();

  async function read<T, R>(
    permission: string | string[],
    path: string,
    pick: (body: T) => R,
  ): Promise<Section<R>> {
    const needed = Array.isArray(permission) ? permission : [permission];
    if (!needed.some((p) => permissions.includes(p))) return undefined;
    try {
      const res = await fetch(`${apiUrl()}${path}`, {
        headers,
        cache: "no-store",
      });
      if (!res.ok) return null;
      return pick((await res.json()) as T) ?? null;
    } catch {
      return null;
    }
  }

  const [
    projectStats,
    recentProjects,
    blogStats,
    serviceStats,
    skills,
    about,
    faqs,
    inbox,
    recentMessages,
    settings,
  ] = await Promise.all([
    read("projects.view", "/projects/stats", (b: { stats: ProjectStats }) => b.stats),
    read(
      "projects.view",
      `/projects/all?page=1&pageSize=${RECENT_LIMIT}&sort=createdAt&dir=desc`,
      (b: { projects: Project[] }) => b.projects,
    ),
    read("blog.view", "/blogs/stats", (b: { stats: BlogStats }) => b.stats),
    read("services.view", "/services/stats", (b: { stats: { total: number } }) => b.stats),
    read("skills.view", "/skills", (b: { categories: SkillCategory[] }) => b.categories),
    read("about.view", "/about", (b: { about: AboutData }) => b.about),
    read(
      "contact.view",
      "/contact",
      (b: { contact: { faqs?: unknown[] } }) => b.contact.faqs?.length ?? 0,
    ),
    read("messages.view", "/messages/stats", (b: { stats: InboxStats }) => b.stats),
    read(
      "messages.view",
      `/messages?limit=${RECENT_LIMIT}`,
      (b: { messages: ContactMessage[] }) => b.messages,
    ),
    read(
      ["socialLinks.view", "seo.view"],
      "/settings",
      (b: { settings: SiteSettings }) => b.settings,
    ),
  ]);

  return {
    projectStats,
    recentProjects,
    blogStats,
    serviceStats,
    skills,
    about,
    faqs,
    inbox,
    recentMessages,
    settings,
  };
}
