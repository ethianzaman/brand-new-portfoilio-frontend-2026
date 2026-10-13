import "server-only";

import { publicFetch, requireEnvelope } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEMO_PROJECTS } from "@/lib/data/projects.demo";
import { PAGE_SIZE } from "@/lib/constants/project";
import type {
  Category,
  Project,
  ProjectsParams,
  ProjectsResponse,
} from "@/lib/types/project";

/**
 * Build the query string the backend expects. `category: "all"` is omitted
 * rather than sent, matching the pre-refactor `fetchProjects` behaviour.
 */
function buildQuery(params: ProjectsParams): string {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  if (params.category !== "all") {
    query.append("category", params.category);
  }

  return query.toString();
}

/**
 * Build a `ProjectsResponse` out of the demo dataset, mirroring the backend's
 * pagination contract so `next build` renders a realistic first page.
 */
function demoResponse(params: ProjectsParams): ProjectsResponse {
  const filtered =
    params.category === "all"
      ? DEMO_PROJECTS
      : DEMO_PROJECTS.filter((p) => p.category === params.category);

  const start = (params.page - 1) * params.pageSize;

  return {
    projects: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
    hasMore: start + params.pageSize < filtered.length,
  };
}

/**
 * PUBLIC projects — paginated, filterable grid.
 *
 * Backend: `GET /projects?page&pageSize[&category]` → `{ projects, total, hasMore }`
 *
 * Two cache keys are in play, deliberately:
 *
 *   tag `projects`  → one `publishChange("projects")` from the backend
 *                     invalidates EVERY page/category combination at once.
 *   key             → distinct per query, because `publicFetch` keeps its
 *                     last-good payload per key. Sharing one key would let a
 *                     failed "category=mobile" request serve a stale
 *                     frontend-category payload (and vice versa).
 */
export async function getProjects(
  params: ProjectsParams = { category: "all", page: 1, pageSize: PAGE_SIZE },
): Promise<ProjectsResponse> {
  const fallback = demoResponse(params);
  const data = await publicFetch<Partial<ProjectsResponse>>(
    `/projects?${buildQuery(params)}`,
    {
      tag: TAGS.projects,
      key: `${TAGS.projects}:${params.category}:${params.page}:${params.pageSize}`,
      fallback,
      // A brand-new portfolio legitimately has zero projects; the page renders
      // an empty state rather than an error.
      allowEmpty: true,
    },
  );

  const projects = requireEnvelope<"projects", Project[]>(data, "projects");

  return {
    projects,
    total: data.total ?? projects.length,
    hasMore: data.hasMore ?? false,
  };
}

export type { Category, Project, ProjectsResponse };