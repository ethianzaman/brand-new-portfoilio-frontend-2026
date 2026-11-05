"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Reveal from "@/app/components/motion/Reveal";
import { ChevronDown, FolderSearch } from "lucide-react";
import {
  CategoryFilter,
  setCategoryParam,
  useCategoryParam,
} from "@/app/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./ProjectCard";
import { ProjectsSkeleton } from "./ProjectsSkeleton";
import { CATEGORIES, PAGE_SIZE } from "@/lib/constants/project";
import { Category, Project, ProjectsResponse } from "@/lib/types/project";
import { fetchProjects } from "@/lib/services/project.service";

interface Props {
  initialData: ProjectsResponse;
}

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.value !== "all");

export function ProjectsGrid({ initialData }: Props) {
  const urlCategory = useCategoryParam();
  const selected = CATEGORY_OPTIONS.find((c) => c.value === urlCategory);
  const category: Category = selected?.value ?? "all";

  // What is on screen, and which category it belongs to.
  const [loaded, setLoaded] = useState<Category>("all");
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [total, setTotal] = useState(initialData.total);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  // Only the newest request may fill the grid, whichever answers last.
  const latestRequest = useRef(0);

  /**
   * `router.refresh()` hands down a brand-new `initialData` object every time it
   * re-runs the server component — even when the payload is byte-identical — so
   * object identity cannot tell us "the visitor is now looking at new data".
   * Compare the payload itself.
   *
   * Only a genuine content change resets the grid, so a refresh triggered by an
   * unrelated dashboard edit leaves the pages the visitor expanded alone. The
   * category they picked stays in the URL and is loaded again below.
   */
  const signature = useMemo(() => JSON.stringify(initialData), [initialData]);
  const [syncedSignature, setSyncedSignature] = useState(signature);

  if (signature !== syncedSignature) {
    setSyncedSignature(signature);
    setLoaded("all");
    setPage(1);
    setProjects(initialData.projects);
    setTotal(initialData.total);
    setHasMore(initialData.hasMore);
  }

  // The URL decides the category: a click, the back button or a shared link.
  useEffect(() => {
    const request = ++latestRequest.current;
    if (category === loaded) return;

    startTransition(async () => {
      const res = await fetchProjects({
        category,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      if (request !== latestRequest.current) return;
      setLoaded(category);
      setPage(1);
      setProjects(res.projects);
      setTotal(res.total);
      setHasMore(res.hasMore);
    });
  }, [category, loaded]);

  const isSwitching = category !== loaded;
  const isLoading = isPending || isSwitching;

  function handleSeeMore() {
    const next = page + 1;
    const request = ++latestRequest.current;
    setPage(next);
    startTransition(async () => {
      const res = await fetchProjects({
        category,
        page: next,
        pageSize: PAGE_SIZE,
      });
      if (request !== latestRequest.current) return;
      setProjects((prev) => [...prev, ...res.projects]);
      setTotal(res.total);
      setHasMore(res.hasMore);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Filter section ── */}
      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter options={CATEGORY_OPTIONS} value={selected?.value ?? null} />

        <p
          aria-live="polite"
          className="flex min-h-5 items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400"
        >
          {isLoading ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              Loading...
            </>
          ) : (
            <span>
              {total} project{total !== 1 ? "s" : ""}
              {selected && (
                <>
                  {" in "}
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {selected.label}
                  </span>
                </>
              )}
            </span>
          )}
        </p>
      </Reveal>

      {/* ── Cards grid ── */}
      {isSwitching || (isPending && page === 1) ? (
        <ProjectsSkeleton />
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-20 text-zinc-400 dark:border-zinc-700">
          <FolderSearch className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No projects found
          </p>
          {selected && (
            <button
              type="button"
              onClick={() => setCategoryParam(null)}
              className="mt-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Show all projects
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 90}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}

      {/* ── See More ── */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSeeMore}
            disabled={isPending}
            className="gap-2 rounded-full px-8
                       border-zinc-200 dark:border-zinc-700
                       hover:border-indigo-400 dark:hover:border-indigo-500
                       hover:text-indigo-600 dark:hover:text-indigo-400
                       transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            See More Projects
          </Button>
        </div>
      )}

      {isPending && !isSwitching && page > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div
              className="w-4 h-4 rounded-full border-2 border-indigo-500
                            border-t-transparent animate-spin"
            />
            Loading more...
          </div>
        </div>
      )}

      {!hasMore && !isLoading && total > PAGE_SIZE && (
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
          All {total} projects shown
        </p>
      )}
    </div>
  );
}
