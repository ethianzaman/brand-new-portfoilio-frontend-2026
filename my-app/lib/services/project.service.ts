import { dashboardApiUrl } from "@/lib/api/config";
import { DEMO_PROJECTS } from "@/lib/data/projects.demo";
import { buildQuery } from "@/lib/services/pagination";
import {
  Project,
  ProjectsParams,
  ProjectsResponse,
  Category,
} from "@/lib/types/project";

const API_BASE_URL = `${dashboardApiUrl()}/projects`;

// ── Internal: base fetch (used when API is ready) ─────────────────
async function fetchFromApi<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await fetch(`${dashboardApiUrl()}${path}${query}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 }, // ISR — change to cache:'no-store' for live data
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function fetchProjects(
  params: ProjectsParams
): Promise<ProjectsResponse> {
  try {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    });

    if (params.category !== "all") {
      query.append("category", params.category);
    }

    const res = await fetch(
      `${API_BASE_URL}?${query.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("API Error");
    }

    return await res.json();
  } catch (error) {
    console.error(error);

    return {
      projects: [],
      total: 0,
      hasMore: false,
    };
  }
}

// Get single project by ID
export async function fetchProjectById(id: string): Promise<Project | null> {
  // Backend: GET /projects/:id
  return fetchFromApi<Project>(`/projects/${id}`);
}

// In-memory store — simulates DB for demo
const store: Project[] = [...DEMO_PROJECTS];

// ── GET all ───────────────────────────────────────────────────
export async function dashboardGetProjects(): Promise<Project[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch projects.");
  }

  const json = await response.json();

  return json.projects;
}

// ── GET one ───────────────────────────────────────────────────
export async function dashboardGetProject(id: string): Promise<Project | null> {
  return store.find((p) => p.id === id) ?? null;
}

export async function dashboardCreateProject(
  data: Omit<Project, "id">,
  image?: File,
): Promise<Project> {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("liveUrl", data.liveUrl);
  formData.append("githubUrl", data.githubUrl);
  formData.append("color", data.color);
  formData.append("featured", String(data.featured));

  data.tags.forEach((tag) => {
    formData.append("tags", tag);
  });

  if (data.seo) {
    formData.append("seo", JSON.stringify(data.seo));
  }

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  const json = await response.json();

  return json.project;
}

export async function dashboardUpdateProject(
  id: string,
  data: Partial<Omit<Project, "id">>,
  image?: File,
): Promise<Project> {
  const formData = new FormData();

  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.category) formData.append("category", data.category);

  if (data.liveUrl) formData.append("liveUrl", data.liveUrl);

  if (data.githubUrl) formData.append("githubUrl", data.githubUrl);

  if (data.color) formData.append("color", data.color);

  if (data.featured !== undefined)
    formData.append("featured", String(data.featured));

  if (data.tags) {
    data.tags.forEach((tag) => formData.append("tags", tag));
  }

  if (data.seo) {
    formData.append("seo", JSON.stringify(data.seo));
  }

  if (image) {
    formData.append("image", image);
  }

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update project");
  }

  const json = await response.json();

  return json.project;
}

export async function dashboardDeleteProject(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete project");
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────
//  DASHBOARD LIST — paginated + searchable, resolved in the database.
//
//  GET /projects/all?page&pageSize&q&category&sort&dir
//    → { success, projects, total, hasMore, page, pageSize }
//
//  Sorting lives on the server too: sorting only the current page in the
//  browser would order each page independently and produce a nonsense
//  overall order.
// ─────────────────────────────────────────────────────────────────────────

export interface ProjectListQuery {
  page: number;
  pageSize: number;
  q?: string;
  category?: Category | "all";
  sort?: "title" | "category" | "createdAt" | "featured";
  dir?: "asc" | "desc";
}

export interface ProjectListResult {
  projects: Project[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

export interface ProjectStats {
  total: number;
  featured: number;
  byCategory: Record<string, number>;
}

export async function dashboardGetProjectsAll(
  params: ProjectListQuery,
  headers?: HeadersInit,
): Promise<ProjectListResult> {
  const page = params.page;
  const pageSize = params.pageSize;

  try {
    const query = buildQuery({
      page,
      pageSize,
      q: params.q?.trim(),
      category:
        params.category && params.category !== "all"
          ? params.category
          : undefined,
      sort: params.sort,
      dir: params.dir,
    });

    const res = await fetch(`${API_BASE_URL}/all?${query}`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Projects API failed: ${res.status}`);
    }

    const json = await res.json();

    const projects: Project[] = Array.isArray(json?.projects)
      ? json.projects
      : [];

    return {
      projects,
      total: json?.total ?? projects.length,
      hasMore: json?.hasMore ?? false,
      page: json?.page ?? page,
      pageSize: json?.pageSize ?? pageSize,
    };
  } catch (error) {
    console.error("Failed to load projects from dashboard API:", error);

    return {
      projects: [],
      total: 0,
      hasMore: false,
      page,
      pageSize,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  DASHBOARD STATS — the numbers on the stat cards.
// ─────────────────────────────────────────────────────────────────────────

export async function dashboardGetProjectStats(
  headers?: HeadersInit,
): Promise<ProjectStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/stats`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Project stats API failed: ${res.status}`);
    }

    const json = await res.json();

    return {
      total: json?.stats?.total ?? 0,
      featured: json?.stats?.featured ?? 0,
      byCategory: json?.stats?.byCategory ?? {},
    };
  } catch (error) {
    console.error("Failed to load project stats:", error);

    return { total: 0, featured: 0, byCategory: {} };
  }
}
