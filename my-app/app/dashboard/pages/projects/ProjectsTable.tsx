"use client";

import { toast } from "sonner";
import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  ImageIcon,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { Project, Category } from "@/lib/types/project";
import { ProjectFormModal } from "./ProjectFormModal";
import { ConfirmDeleteModal, DeleteTarget } from "@/app/components/dashboard/ConfirmDeleteModal";
import { ProjectsStats } from "./ProjectsStats";
import { ProjectDrawer } from "./ProjectDrawer";
import {
  dashboardCreateProject,
  dashboardUpdateProject,
  dashboardDeleteProject,
  dashboardGetProjectsAll,
  dashboardGetProjectStats,
  type ProjectStats,
  type ProjectMedia,
} from "@/lib/services/project.service";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Pagination } from "@/app/components/dashboard/Pagination";
import {
  DASHBOARD_PAGE_SIZE,
  DASHBOARD_PAGE_SIZES,
} from "@/lib/constants/pagination";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { CategoryFilter } from "@/app/components/CategoryFilter";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "fullstack", label: "Full-Stack" },
  { value: "backend", label: "Backend" },
  { value: "mobile", label: "Mobile" },
  { value: "ai", label: "AI" },
  { value: "devops", label: "DevOps" },
];

const CATEGORY_COLORS: Record<string, string> = {
  frontend:
    "bg-amber-50  dark:bg-amber-950  text-amber-700  dark:text-amber-400",
  fullstack:
    "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
  backend: "bg-red-50    dark:bg-red-950    text-red-700    dark:text-red-400",
  mobile: "bg-pink-50   dark:bg-pink-950   text-pink-700   dark:text-pink-400",
  ai: "bg-purple-50   dark:bg-purple-950   text-purple-700   dark:text-purple-400",
  devops:
    "bg-green-50   dark:bg-green-950   text-green-700   dark:text-green-400",
};

type SortField = "title" | "category";

const EMPTY_STATS: ProjectStats = { total: 0, featured: 0, byCategory: {} };

export function ProjectsTable() {
  const { can } = useCurrentUser();
  const canDelete = can("projects.delete");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DASHBOARD_PAGE_SIZE);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);

  // The search box stays instant; the (server-side) query waits for a pause.
  const debouncedSearch = useDebouncedValue(search);

  // ── Data ──────────────────────────────────────────────────
  // Filtering AND sorting happen in the database: sorting only the rows of
  // the current page would order each page on its own.
  //
  // The first page + the stats are prefetched on the server and hydrated
  // into the cache by <HydrationBoundary>, so this query resolves instantly
  // on the first render. Later pages/searches hit the API.
  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      q: debouncedSearch,
      category,
      sort: sortField,
      dir: sortDir,
    }),
    [page, pageSize, debouncedSearch, category, sortField, sortDir],
  );

  const listQuery = useQuery({
    queryKey: ["projects", "list", listParams],
    queryFn: () => dashboardGetProjectsAll(listParams),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ["projects", "stats"],
    queryFn: () => dashboardGetProjectStats(),
  });

  const projects = listQuery.data?.projects ?? [];
  const total = listQuery.data?.total ?? 0;
  const stats = statsQuery.data ?? EMPTY_STATS;

  // ── Handlers ──────────────────────────────────────────────
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(value: Category | "all") {
    setCategory(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  // ── Sort toggle ───────────────────────────────────────────
  function toggleSort(field: SortField) {
    setPage(1);

    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-500" />
    );
  };

  async function handleSave(data: Omit<Project, "id">, media: ProjectMedia) {
    try {
      if (editProject) {
        await dashboardUpdateProject(editProject.id, data, media);
        toast.success("Project updated successfully");
      } else {
        await dashboardCreateProject(data, media);
        toast.success("Project created successfully");
      }
    } catch (error) {
      // The form stays open, so nothing typed is lost.
      toast.error(error instanceof Error ? error.message : "Could not save the project");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["projects"] });
    setShowForm(false);
    setEditProject(null);
  }

  async function handleDelete() {
    if (!deleteProject) return;
    const ok = await dashboardDeleteProject(deleteProject.id);
    if (ok) {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
    setDeleteProject(null);
  }

  // ── Open drawer ───────────────────────────────────────────
  function openDrawer(project: Project) {
    setDrawerProject(project);
  }

  // ── Open edit from drawer ─────────────────────────────────
  function handleDrawerEdit(project: Project) {
    setDrawerProject(null);
    setEditProject(project);
    setShowForm(true);
  }

  // ── Open delete from drawer ───────────────────────────────
  function handleDrawerDelete(project: Project) {
    setDrawerProject(null);
    setDeleteProject(project);
  }

  return (
    <>
      {/* ── Stats ── */}
      <ProjectsStats stats={stats} />

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search projects or tags..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       text-zinc-900 dark:text-white
                       placeholder:text-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2
                         p-1 rounded-md text-zinc-400 hover:text-zinc-700
                         hover:bg-zinc-100 dark:hover:bg-zinc-800
                         dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* All + category */}
        <CategoryFilter
          options={CATEGORIES.map((c) => ({
            ...c,
            count: stats.byCategory[c.value] ?? 0,
          }))}
          value={category === "all" ? null : category}
          onChange={(value) => handleCategoryChange((value ?? "all") as Category | "all")}
        />

        {/* Add project */}
        {can("projects.create") && (
        <button
          onClick={() => {
            setEditProject(null);
            setShowForm(true);
          }}
          className="flex h-11 items-center gap-2 px-4 rounded-xl
                     bg-indigo-600 hover:bg-indigo-700
                     text-white text-sm font-medium
                     transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
        )}
      </div>

      {/* ── Table ── */}
      <div
        className="mt-4 bg-white dark:bg-zinc-900
                      border border-zinc-200 dark:border-zinc-800
                      rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="min-w-180">
            {/* Table head */}
            <div
              className="grid grid-cols-12 gap-4 px-5 py-3
                            bg-zinc-50 dark:bg-zinc-800/50
                            border-b border-zinc-200 dark:border-zinc-800
                            text-xs font-bold text-zinc-500 dark:text-zinc-400
                            uppercase tracking-wider"
            >
              <div className="col-span-1">Image</div>
              <button
                className="col-span-4 flex items-center gap-1 text-left
                           hover:text-zinc-700 dark:hover:text-zinc-300
                           transition-colors"
                onClick={() => toggleSort("title")}
              >
                Title {renderSortIcon("title")}
              </button>
              <button
                className="col-span-2 flex items-center gap-1 text-left
                           hover:text-zinc-700 dark:hover:text-zinc-300
                           transition-colors"
                onClick={() => toggleSort("category")}
              >
                Category {renderSortIcon("category")}
              </button>
              <div className="col-span-3">Tags</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table body */}
            {listQuery.isPending ? (
              <div className="flex flex-col gap-px" aria-busy="true">
                {Array.from({ length: pageSize }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16.5 bg-zinc-100 dark:bg-zinc-800/60
                               animate-pulse"
                  />
                ))}
              </div>
            ) : listQuery.isError ? (
              <div
                className="flex flex-col items-center justify-center
                              gap-3 py-20 text-zinc-400"
              >
                <AlertCircle className="w-10 h-10 opacity-30 text-red-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    Could not load projects
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    The server did not respond. Please try again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => listQuery.refetch()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             text-xs font-semibold bg-indigo-600 text-white
                             hover:bg-indigo-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            ) : projects.length === 0 && !listQuery.isFetching ? (
              <div
                className="flex flex-col items-center justify-center
                              gap-3 py-20 text-zinc-400"
              >
                <Search className="w-10 h-10 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    No projects found
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Try adjusting your search or filter
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "divide-y divide-zinc-100 dark:divide-zinc-800 transition-opacity",
                  listQuery.isFetching && "opacity-60",
                )}
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => openDrawer(project)}
                    className="grid grid-cols-12 gap-4 px-5 py-4
                               items-center cursor-pointer
                               hover:bg-zinc-50 dark:hover:bg-zinc-800/40
                               transition-colors duration-150 group"
                  >
                    {/* Thumbnail */}
                    <div className="col-span-1">
                      <div
                        className="w-10 h-10 rounded-xl overflow-hidden shrink-0
                                      border border-zinc-200 dark:border-zinc-700
                                      bg-zinc-100 dark:bg-zinc-800
                                      flex items-center justify-center"
                      >
                        {project.thumbnail ? (
                          <Image
                            src={project.thumbnail}
                            alt={project.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold
                                      text-zinc-900 dark:text-white truncate
                                      group-hover:text-indigo-600
                                      dark:group-hover:text-indigo-400
                                      transition-colors"
                        >
                          {project.title}
                        </p>
                        {project.featured && (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
                          CATEGORY_COLORS[project.category],
                        )}
                      >
                        {project.category}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="col-span-3 flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-xs
                                     bg-zinc-100 dark:bg-zinc-800
                                     text-zinc-500 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 2 && (
                        <span
                          className="px-2 py-0.5 rounded-md text-xs
                                         text-zinc-400 dark:text-zinc-500"
                        >
                          +{project.tags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="View live"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                                   hover:text-indigo-600 dark:hover:text-indigo-400
                                   hover:bg-indigo-50 dark:hover:bg-indigo-950
                                   transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {can("projects.edit") && (
                      <button
                        title="Edit project"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditProject(project);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                                   hover:text-amber-600 dark:hover:text-amber-400
                                   hover:bg-amber-50 dark:hover:bg-amber-950
                                   transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      )}

                      {canDelete && (
                        <button
                          title="Delete project"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteProject(project);
                          }}
                          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                                     hover:text-red-600 dark:hover:text-red-400
                                     hover:bg-red-50 dark:hover:bg-red-950
                                     transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        itemLabel="projects"
        pageSizeOptions={DASHBOARD_PAGE_SIZES}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        busy={listQuery.isFetching}
      />

      {/* ── Toast notification ── */}

      {/* ── Project detail drawer ── */}
      <ProjectDrawer
        project={drawerProject}
        onClose={() => setDrawerProject(null)}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
      />

      {/* ── Add / Edit modal ── */}
      {showForm && (
        <ProjectFormModal
          key={editProject?.id ?? "new"}
          project={editProject}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditProject(null);
          }}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {deleteProject && (
        <ConfirmDeleteModal
          title="Confirm Deletion"
          onConfirm={handleDelete}
          onCancel={() => setDeleteProject(null)}
        >
          Are you sure you want to delete <DeleteTarget>{deleteProject.title}</DeleteTarget>? This
          action cannot be undone.
        </ConfirmDeleteModal>
      )}
    </>
  );
}
